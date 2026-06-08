"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import { ApiHttpError, resolveApiError } from "@/lib/api/errors";
import * as mlApi from "@/lib/api/ml";
import * as logsApi from "@/lib/api/logs";
import * as whitelistApi from "@/lib/api/whitelist";
import * as gateApi from "@/lib/api/gate";
import { useMonitorFrameCapture } from "@/contexts/monitor-frame-capture-context";
import { useSnackbar } from "@/hooks/use-snackbar";
import { normalizePlate } from "@/lib/plate";
import { getAccessLogToast } from "@/lib/gate-trigger-toast";
import { UI_CONFIG } from "@/constants";
import type { PendingUnknownPlate } from "@/components/features/monitor/PlateAccessConfirmDialogs";
import type { VehicleClassificationResult } from "@/types";

const DEDUPE_MS = 45_000;
export const STABLE_READS_REQUIRED = 2;
const EMPTY_CAPTURE_WARN_EVERY = 6;
const EMPTY_OCR_WARN_EVERY = 4;

const WHITELIST_QUERY_KEY = ["whitelist", "monitor"] as const;
const {
  PRESENCE_SAMPLE_MS,
  MOTION_THRESHOLD,
  MOTION_RESET_THRESHOLD,
  MOTION_WARMUP_TICKS,
  MOTION_CONSECUTIVE_SAMPLES,
  INITIAL_PRESENCE_DELAY_MS,
  PIPELINE_REARM_MS,
  OCR_RETRY_MS,
  STABLE_RECHECK_MS,
  MIN_OCR_CONFIDENCE,
  AMBULANCE_CONFIDENCE_THRESHOLD,
  AMBULANCE_PLATE_SENTINEL,
} = UI_CONFIG.MONITOR;

export type OcrLoopPhase =
  | "idle"
  | "capturing"
  | "recognizing"
  | "matched"
  | "no_match"
  | "error";

export type OcrLoopStatus = {
  phase: OcrLoopPhase;
  lastPlate: string | null;
  lastAt: number | null;
  stableCount: number;
  errorMessage: string | null;
};

const INITIAL_OCR_STATUS: OcrLoopStatus = {
  phase: "idle",
  lastPlate: null,
  lastAt: null,
  stableCount: 0,
  errorMessage: null,
};

type UseMonitorPlateOrchestrationOptions = {
  enabled?: boolean;
  onAccessLogRegistered?: () => void;
};

function isAmbulanceClassification(
  result: VehicleClassificationResult,
): boolean {
  return (
    result.predicted_category === "ambulance" &&
    result.confidence >= AMBULANCE_CONFIDENCE_THRESHOLD
  );
}

export function useMonitorPlateOrchestration({
  enabled = true,
  onAccessLogRegistered,
}: UseMonitorPlateOrchestrationOptions = {}) {
  const { captureFrame, sampleMotion, tryBeginOcr, endOcr } =
    useMonitorFrameCapture();
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const client = getClientApiClient();

  const lastHandledPlate = useRef<string | null>(null);
  const lastHandledAt = useRef(0);
  const consecutivePlate = useRef<string | null>(null);
  const consecutiveCount = useRef(0);
  const emptyCaptureStreak = useRef(0);
  const emptyOcrStreak = useRef(0);
  const pendingBlobRef = useRef<Blob | null>(null);
  const lastPipelineAt = useRef(0);
  const motionStreakRef = useRef(0);
  const motionArmedRef = useRef(true);
  const warmupTicksRef = useRef(0);
  const stableRecheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const ocrRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runPipelineRef = useRef<() => Promise<void>>(async () => {});

  const clearScheduledPipeline = useCallback(() => {
    if (stableRecheckTimerRef.current) {
      clearTimeout(stableRecheckTimerRef.current);
      stableRecheckTimerRef.current = null;
    }
    if (ocrRetryTimerRef.current) {
      clearTimeout(ocrRetryTimerRef.current);
      ocrRetryTimerRef.current = null;
    }
  }, []);

  const schedulePipelineRetry = useCallback((delayMs: number) => {
    if (ocrRetryTimerRef.current || stableRecheckTimerRef.current) return;
    ocrRetryTimerRef.current = setTimeout(() => {
      ocrRetryTimerRef.current = null;
      motionArmedRef.current = true;
      void runPipelineRef.current();
    }, delayMs);
  }, []);

  const [authorizeOpen, setAuthorizeOpen] = useState(false);
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [pending, setPending] = useState<PendingUnknownPlate | null>(null);
  const [busy, setBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<OcrLoopStatus>(INITIAL_OCR_STATUS);

  const whitelistQuery = useQuery({
    queryKey: WHITELIST_QUERY_KEY,
    queryFn: () => whitelistApi.getWhitelist(client, 0, 100),
    enabled,
  });

  const whitelistSet = useCallback((): Set<string> => {
    const items = whitelistQuery.data?.items ?? [];
    return new Set(
      items.map((p) => p.normalized_plate ?? normalizePlate(p.plate)),
    );
  }, [whitelistQuery.data]);

  const shouldSkipPlate = useCallback((normalized: string) => {
    const now = Date.now();
    if (
      lastHandledPlate.current === normalized &&
      now - lastHandledAt.current < DEDUPE_MS
    ) {
      return true;
    }
    return false;
  }, []);

  const markHandled = useCallback((normalized: string) => {
    lastHandledPlate.current = normalized;
    lastHandledAt.current = Date.now();
    consecutivePlate.current = null;
    consecutiveCount.current = 0;
  }, []);

  const processAuthorized = useCallback(
    async (plate: string, blob: Blob) => {
      const normalized = normalizePlate(plate);
      if (shouldSkipPlate(normalized)) return;

      setBusy(true);
      try {
        const log = await logsApi.createAccessLog(
          client,
          plate,
          blob,
          "monitor-auto.jpg",
        );
        markHandled(normalized);
        const toast = getAccessLogToast(
          log.plate_string_detected,
          log.status,
          log.gate_trigger,
          log.vehicle_classification,
        );
        showMessage(toast.message, toast.severity);
        onAccessLogRegistered?.();
        void queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
      } catch (e) {
        showMessage(
          resolveApiError(e, "Erro ao registrar acesso autorizado."),
          "error",
        );
      } finally {
        setBusy(false);
      }
    },
    [
      client,
      markHandled,
      onAccessLogRegistered,
      queryClient,
      shouldSkipPlate,
      showMessage,
    ],
  );

  const processAmbulanceAccess = useCallback(
    async (blob: Blob) => {
      const sentinel = AMBULANCE_PLATE_SENTINEL;
      if (shouldSkipPlate(sentinel)) return;

      setBusy(true);
      try {
        const log = await logsApi.createAccessLog(
          client,
          sentinel,
          blob,
          "monitor-ambulance.jpg",
        );
        markHandled(sentinel);
        const toast = getAccessLogToast(
          log.plate_string_detected,
          log.status,
          log.gate_trigger,
          log.vehicle_classification,
        );
        showMessage(toast.message, toast.severity);
        onAccessLogRegistered?.();
      } catch (e) {
        showMessage(
          resolveApiError(e, "Erro ao registrar acesso de ambulância."),
          "error",
        );
      } finally {
        setBusy(false);
      }
    },
    [client, markHandled, onAccessLogRegistered, shouldSkipPlate, showMessage],
  );

  const openUnknownDialog = useCallback(
    (plate: string, blob: Blob) => {
      const normalized = normalizePlate(plate);
      if (shouldSkipPlate(normalized) || authorizeOpen || whitelistOpen) return;
      pendingBlobRef.current = blob;
      setPending({ plate });
      setAuthorizeOpen(true);
    },
    [authorizeOpen, shouldSkipPlate, whitelistOpen],
  );

  const handleStablePlate = useCallback(
    async (plate: string, blob: Blob) => {
      const normalized = normalizePlate(plate);
      if (shouldSkipPlate(normalized)) return;

      if (whitelistSet().has(normalized)) {
        await processAuthorized(plate, blob);
        return;
      }
      openUnknownDialog(plate, blob);
    },
    [openUnknownDialog, processAuthorized, shouldSkipPlate, whitelistSet],
  );

  const runPipeline = useCallback(async () => {
    if (!enabled || busy || authorizeOpen || whitelistOpen) return;
    if (!tryBeginOcr()) return;

    lastPipelineAt.current = Date.now();
    setOcrStatus((prev) => ({
      ...prev,
      phase: "capturing",
      errorMessage: null,
    }));

    try {
      const blob = await captureFrame();
      if (!blob || blob.size === 0) {
        emptyCaptureStreak.current += 1;
        const msg =
          "Sem frame da câmera. Verifique a pré-visualização ou autorize a webcam.";
        setOcrStatus((prev) => ({
          ...prev,
          phase: "error",
          errorMessage: msg,
          lastAt: Date.now(),
        }));
        if (emptyCaptureStreak.current === EMPTY_CAPTURE_WARN_EVERY) {
          showMessage(
            "Câmera sem frame: configure USB em Pré-visualização ou aguarde o vídeo ao vivo.",
            "warning",
          );
          emptyCaptureStreak.current = 0;
        }
        return;
      }
      emptyCaptureStreak.current = 0;
      setOcrStatus((prev) => ({ ...prev, phase: "recognizing" }));

      const ocrAbort = new AbortController();
      const isConfirmationRead = consecutiveCount.current >= 1;
      const ocrPromise = mlApi.recognizePlate(
        client,
        blob,
        "monitor-auto.jpg",
        ocrAbort.signal,
      );

      if (!isConfirmationRead) {
        const classification = await mlApi
          .classifyVehicle(client, blob, "monitor-auto.jpg")
          .catch(() => null);

        if (classification && isAmbulanceClassification(classification)) {
          ocrAbort.abort();
          void ocrPromise.catch(() => undefined);
          await processAmbulanceAccess(blob);
          setOcrStatus({
            phase: "matched",
            lastPlate: AMBULANCE_PLATE_SENTINEL,
            lastAt: Date.now(),
            stableCount: STABLE_READS_REQUIRED,
            errorMessage: null,
          });
          return;
        }
      }

      const res = await ocrPromise;

      if (res.candidates.length === 0) {
        emptyOcrStreak.current += 1;
        setOcrStatus((prev) => ({
          ...prev,
          phase: "no_match",
          lastAt: Date.now(),
          errorMessage: null,
        }));
        if (emptyOcrStreak.current === EMPTY_OCR_WARN_EVERY) {
          showMessage(
            "OCR ativo, mas nenhuma placa válida neste frame. Aproxime a placa e melhore a iluminação.",
            "info",
          );
          emptyOcrStreak.current = 0;
        }
        schedulePipelineRetry(OCR_RETRY_MS);
        return;
      }

      const confidentCandidates = res.candidates.filter(
        (candidate) => (candidate.confidence ?? 0) >= MIN_OCR_CONFIDENCE,
      );
      if (confidentCandidates.length === 0) {
        setOcrStatus((prev) => ({
          ...prev,
          phase: "no_match",
          lastAt: Date.now(),
          errorMessage: null,
        }));
        schedulePipelineRetry(OCR_RETRY_MS);
        return;
      }

      emptyOcrStreak.current = 0;

      const top = (() => {
        const set = whitelistSet();
        const whitelisted = confidentCandidates.find((c) =>
          set.has(normalizePlate(c.normalized_plate || c.plate_raw)),
        );
        return whitelisted ?? confidentCandidates[0];
      })();
      const plate = top.normalized_plate || top.plate_raw;
      const normalized = normalizePlate(plate);

      if (consecutivePlate.current === normalized) {
        consecutiveCount.current += 1;
      } else {
        consecutivePlate.current = normalized;
        consecutiveCount.current = 1;
      }

      setOcrStatus((prev) => ({
        phase: "matched",
        lastPlate: normalized,
        lastAt: Date.now(),
        stableCount: consecutiveCount.current,
        errorMessage: null,
      }));

      if (consecutiveCount.current >= STABLE_READS_REQUIRED) {
        clearScheduledPipeline();
        await handleStablePlate(plate, blob);
      } else if (consecutiveCount.current === 1) {
        clearScheduledPipeline();
        stableRecheckTimerRef.current = setTimeout(() => {
          stableRecheckTimerRef.current = null;
          motionArmedRef.current = true;
          void runPipelineRef.current();
        }, STABLE_RECHECK_MS);
      }
    } catch (e) {
      let errorMessage = "Falha ao executar OCR.";
      if (e instanceof ApiHttpError && e.status === 503) {
        errorMessage =
          typeof e.message === "string" && e.message.length > 0
            ? e.message
            : "OCR indisponível no servidor (503).";
        showMessage(errorMessage, "error");
      } else if (e instanceof ApiHttpError && e.status === 0) {
        errorMessage = "OCR demorou demais (timeout).";
        showMessage(
          "OCR demorou demais. Aguarde o carregamento inicial do EasyOCR na API e tente novamente.",
          "warning",
        );
      }
      setOcrStatus((prev) => ({
        ...prev,
        phase: "error",
        errorMessage,
        lastAt: Date.now(),
      }));
    } finally {
      endOcr();
      window.setTimeout(() => {
        motionArmedRef.current = true;
      }, PIPELINE_REARM_MS);
    }
  }, [
    authorizeOpen,
    busy,
    captureFrame,
    clearScheduledPipeline,
    client,
    enabled,
    endOcr,
    handleStablePlate,
    processAmbulanceAccess,
    schedulePipelineRetry,
    showMessage,
    tryBeginOcr,
    whitelistOpen,
    whitelistSet,
  ]);

  runPipelineRef.current = runPipeline;

  useEffect(() => {
    if (!enabled) return;

    warmupTicksRef.current = 0;
    motionStreakRef.current = 0;
    motionArmedRef.current = true;

    const tick = () => {
      if (warmupTicksRef.current < MOTION_WARMUP_TICKS) {
        warmupTicksRef.current += 1;
        sampleMotion();
        return;
      }

      const motionScore = sampleMotion();
      const aboveThreshold = motionScore >= MOTION_THRESHOLD;

      if (aboveThreshold) {
        motionStreakRef.current += 1;
      } else if (motionScore <= MOTION_RESET_THRESHOLD) {
        motionStreakRef.current = 0;
        motionArmedRef.current = true;
      }

      const motionTrigger =
        motionArmedRef.current &&
        motionStreakRef.current >= MOTION_CONSECUTIVE_SAMPLES;

      if (motionTrigger) {
        motionArmedRef.current = false;
        motionStreakRef.current = 0;
        void runPipelineRef.current();
      }
    };

    const bootTimer = window.setTimeout(() => {
      const motionScore = sampleMotion();
      if (motionScore >= MOTION_THRESHOLD && motionArmedRef.current) {
        motionArmedRef.current = false;
        void runPipelineRef.current();
      }
    }, INITIAL_PRESENCE_DELAY_MS);

    const id = window.setInterval(tick, PRESENCE_SAMPLE_MS);
    return () => {
      clearInterval(id);
      clearTimeout(bootTimer);
      clearScheduledPipeline();
    };
  }, [clearScheduledPipeline, enabled, sampleMotion]);

  const handleDeny = useCallback(() => {
    if (pending) {
      markHandled(normalizePlate(pending.plate));
    }
    setAuthorizeOpen(false);
    setPending(null);
    pendingBlobRef.current = null;
  }, [markHandled, pending]);

  const handleAuthorize = useCallback(async () => {
    if (!pending) return;
    const blob = pendingBlobRef.current;
    if (!blob || blob.size === 0) {
      showMessage(
        "Frame indisponível. Aponte a câmera e tente novamente.",
        "warning",
      );
      return;
    }

    setBusy(true);
    try {
      const log = await logsApi.createAccessLog(
        client,
        pending.plate,
        blob,
        "monitor-override.jpg",
        { operatorOverride: true },
      );
      markHandled(normalizePlate(pending.plate));
      setAuthorizeOpen(false);
      try {
        await gateApi.openGate(client);
        showMessage(
          `Acesso autorizado pelo operador. Placa ${log.plate_string_detected}. Portão acionado.`,
          "success",
        );
      } catch (gateErr) {
        showMessage(
          `${resolveApiError(gateErr, "Acesso autorizado, mas falha ao acionar portão.")} Placa ${log.plate_string_detected}.`,
          "warning",
        );
      }
      onAccessLogRegistered?.();
      setPending({ plate: pending.plate, logId: log.id });
      setWhitelistOpen(true);
    } catch (e) {
      showMessage(resolveApiError(e, "Erro ao autorizar acesso."), "error");
    } finally {
      setBusy(false);
    }
  }, [client, markHandled, onAccessLogRegistered, pending, showMessage]);

  const handleAddToWhitelist = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.logId) {
        await logsApi.whitelistFromDeniedLog(client, pending.logId);
      } else {
        await whitelistApi.addPlate(client, pending.plate);
      }
      showMessage(`Placa ${pending.plate} cadastrada na whitelist.`, "success");
      void queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
      setWhitelistOpen(false);
      setPending(null);
      pendingBlobRef.current = null;
    } catch (e) {
      showMessage(resolveApiError(e, "Erro ao cadastrar placa."), "error");
    } finally {
      setBusy(false);
    }
  }, [client, pending, queryClient, showMessage]);

  const handleSkipWhitelist = useCallback(() => {
    setWhitelistOpen(false);
    setPending(null);
    pendingBlobRef.current = null;
  }, []);

  return {
    authorizeOpen,
    whitelistOpen,
    pending,
    busy,
    ocrStatus,
    handleAuthorize,
    handleDeny,
    handleAddToWhitelist,
    handleSkipWhitelist,
  };
}
