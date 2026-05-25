"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";
import type { MessageType, Message } from "@/types";
import { UI_CONFIG } from "@/constants";

interface SnackbarContextValue {
  message: Message | null;
  showMessage: (text: string, type?: MessageType) => void;
  hideMessage: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined,
);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback(
    (text: string, type: MessageType = "info") => {
      setMessage({ text, type });
    },
    [],
  );

  const hideMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <SnackbarContext.Provider value={{ message, showMessage, hideMessage }}>
      {children}
      <Snackbar
        open={!!message}
        autoHideDuration={UI_CONFIG.SNACKBAR.AUTO_HIDE_DURATION}
        onClose={hideMessage}
        anchorOrigin={UI_CONFIG.SNACKBAR.ANCHOR_ORIGIN}
      >
        <Alert
          onClose={hideMessage}
          severity={(message?.type ?? "info") as AlertColor}
          sx={{ width: "100%" }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}
