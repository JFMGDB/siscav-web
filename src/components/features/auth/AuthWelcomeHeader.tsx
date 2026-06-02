"use client";

import { Typography } from "@mui/material";
import { MESSAGES } from "@/constants";
import type { AuthFormMode } from "@/lib/auth-form";

const displayFont = 'var(--font-auth-display), "Inter", sans-serif';

function copyForMode(mode: AuthFormMode) {
  if (mode === "register") {
    return {
      eyebrow: MESSAGES.AUTH.REGISTER_EYEBROW,
      title: MESSAGES.AUTH.REGISTER_TITLE,
      subtitle: MESSAGES.AUTH.REGISTER_SUBTITLE,
    };
  }
  return {
    eyebrow: MESSAGES.AUTH.LOGIN_EYEBROW,
    title: MESSAGES.AUTH.LOGIN_TITLE,
    subtitle: MESSAGES.AUTH.LOGIN_SUBTITLE,
  };
}

export default function AuthWelcomeHeader({ mode }: { mode: AuthFormMode }) {
  const { eyebrow, title, subtitle } = copyForMode(mode);

  return (
    <header>
      {eyebrow ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: { xs: "1.75rem", sm: "2rem" },
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "text.primary",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>
    </header>
  );
}
