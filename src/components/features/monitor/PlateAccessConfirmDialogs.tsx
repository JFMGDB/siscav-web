"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export type PendingUnknownPlate = {
  plate: string;
  logId?: string;
};

type Props = {
  authorizeOpen: boolean;
  whitelistOpen: boolean;
  pending: PendingUnknownPlate | null;
  busy: boolean;
  onAuthorize: () => void;
  onDeny: () => void;
  onAddToWhitelist: () => void;
  onSkipWhitelist: () => void;
};

export default function PlateAccessConfirmDialogs({
  authorizeOpen,
  whitelistOpen,
  pending,
  busy,
  onAuthorize,
  onDeny,
  onAddToWhitelist,
  onSkipWhitelist,
}: Props) {
  const plateLabel = pending?.plate ?? "";

  return (
    <>
      <Dialog open={authorizeOpen} onClose={busy ? undefined : onDeny}>
        <DialogTitle>Nova placa detectada</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Placa lida:{" "}
            <Typography
              component="span"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {plateLabel}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta placa não está na whitelist. Autorizar o acesso agora?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onDeny} disabled={busy}>
            Não
          </Button>
          <Button variant="contained" onClick={onAuthorize} disabled={busy}>
            {busy ? "Processando…" : "Autorizar acesso"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={whitelistOpen} onClose={busy ? undefined : onSkipWhitelist}>
        <DialogTitle>Cadastrar placa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Deseja adicionar{" "}
            <Typography
              component="span"
              sx={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              {plateLabel}
            </Typography>{" "}
            à whitelist para autorizar passagens futuras?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onSkipWhitelist} disabled={busy}>
            Agora não
          </Button>
          <Button
            variant="contained"
            onClick={onAddToWhitelist}
            disabled={busy}
          >
            {busy ? "Cadastrando…" : "Cadastrar na whitelist"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
