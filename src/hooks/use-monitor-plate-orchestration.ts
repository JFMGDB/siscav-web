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
import type { PendingUnknownPlate } from "@/components/features/monitor/PlateAccessConfirmDialogs";

const AUTO_OCR_INTERVAL_MS = 6000;
const DEDUPE_MS = 45_000;
export const STABLE_READS_REQUIRED = 2;
const EMPTY_CAPTURE_WARN_EVERY = 6;
const EMPTY_OCR_WARN_EVERY = 4;

const WHITELIST_QUERY_KEY = ["whitelist", "monitor"] as const;

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

export function useMonitorPlateOrchestration({
  enabled = true,
  onAccessLogRegistered,
}: UseMonitorPlateOrchestrationOptions = {}) {
  const { captureFrame, tryBeginOcr, endOcr } = useMonitorFrameCapture();
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const client = getClientApiClient();

  const ocrInFlight = useRef(false);
  const lastHandledPlate = useRef<string | null>(null);
  const lastHandledAt = useRef(0);
  const consecutivePlate = useRef<string | null>(null);
  const consecutiveCount = useRef(0);
  const emptyCaptureStreak = useRef(0);
  const emptyOcrStreak = useRef(0);
  const pendingBlobRef = useRef<Blob | null>(null);

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
    return new Set(items.map((p) => p.normalized_plate ?? normalizePlate(p.plate)));
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

  const runAutoCycle = useCallback(async () => {
    if (!enabled || busy || authorizeOpen || whitelistOpen) {
      return;
    }
    if (!tryBeginOcr()) {
      return;
    }
    ocrInFlight.current = true;
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
          "Sem frame da câmara. Verifique a pré-visualização ou autorize a webcam.";
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

      const res = await mlApi.recognizePlate(client, blob, "monitor-auto.jpg");
      if (res.candidates.length === 0) {
        consecutivePlate.current = null;
        consecutiveCount.current = 0;
        emptyOcrStreak.current += 1;
        setOcrStatus({
          phase: "no_match",
          lastPlate: null,
          lastAt: Date.now(),
          stableCount: 0,
          errorMessage: null,
        });
        if (emptyOcrStreak.current === EMPTY_OCR_WARN_EVERY) {
          showMessage(
            "OCR ativo, mas nenhuma placa válida neste frame. Aproxime a placa e melhore a iluminação.",
            "info",
          );
          emptyOcrStreak.current = 0;
        }
        return;
      }
      emptyOcrStreak.current = 0;

      const top = (() => {
        const set = whitelistSet();
        const whitelisted = res.candidates.find((c) =>
          set.has(normalizePlate(c.normalized_plate || c.plate_raw)),
        );
        return whitelisted ?? res.candidates[0];
      })();
      const plate = top.normalized_plate || top.plate_raw;
      const normalized = normalizePlate(plate);

      if (consecutivePlate.current === normalized) {
        consecutiveCount.current += 1;
      } else {
        consecutivePlate.current = normalized;
        consecutiveCount.current = 1;
      }

      setOcrStatus({
        phase: "matched",
        lastPlate: normalized,
        lastAt: Date.now(),
        stableCount: consecutiveCount.current,
        errorMessage: null,
      });

      if (consecutiveCount.current >= STABLE_READS_REQUIRED) {
        await handleStablePlate(plate, blob);
      }
    } catch (e) {
      let errorMessage = "Falha ao executar OCR.";
      if (e instanceof ApiHttpError && e.status === 503) {
        errorMessage = "OCR indisponível no servidor (503).";
        showMessage(
          "OCR indisponível no servidor. Verifique dependências ML na API.",
          "error",
        );
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
      ocrInFlight.current = false;
      endOcr();
    }
  }, [
    authorizeOpen,
    busy,
    captureFrame,
    client,
    enabled,
    endOcr,
    handleStablePlate,
    showMessage,
    tryBeginOcr,
    whitelistOpen,
    whitelistSet,
  ]);

  useEffect(() => {
    if (!enabled) return;
    const kickoff = window.setTimeout(() => void runAutoCycle(), 1500);
    const id = window.setInterval(() => void runAutoCycle(), AUTO_OCR_INTERVAL_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [enabled, runAutoCycle]);

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
      showMessage("Frame indisponível. Aponte a câmera e tente novamente.", "warning");
      return;
    }

    setBusy(true);
    try {
      const log = await logsApi.createAccessLog(
        client,
        pending.plate,
        blob,
        "monitor-override.jpg",
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
