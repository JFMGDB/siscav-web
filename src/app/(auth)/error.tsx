"use client";

import { MESSAGES } from "@/constants";
import { Alert, Box, Button } from "@mui/material";
import { useEffect } from "react";

export default function AuthRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={reset}>
            {MESSAGES.COMMON.RETRY}
          </Button>
        }
      >
        {MESSAGES.COMMON.LOAD_ERROR}
      </Alert>
    </Box>
  );
}
