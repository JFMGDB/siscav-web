export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_MANTIS_API_URL ||
    process.env.NEXT_PUBLIC_SISCAV_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000",
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/v1/register",
      LOGIN: "/api/v1/login/access-token",
      REFRESH: "/api/v1/login/refresh-token",
      ME: "/api/v1/users/me",
    },
    ML: {
      RECOGNIZE_PLATE: "/api/v1/ml/recognize-plate",
    },
    WHITELIST: "/api/v1/whitelist",
    LOGS: "/api/v1/access_logs",
    GATE: {
      TRIGGER: "/api/v1/gate_control/trigger",
    },
    IMAGES: {
      BASE: "/api/v1/access_logs/images",
    },
  },
} as const;

export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: "access_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  USER_KEY: "user",
} as const;

export const UI_CONFIG = {
  SNACKBAR: {
    AUTO_HIDE_DURATION: 6000,
    ANCHOR_ORIGIN: {
      vertical: "bottom" as const,
      horizontal: "right" as const,
    },
  },
  DRAWER: {
    WIDTH: 240,
  },
  POLLING: {
    CAPTURE_INTERVAL: 3000,
  },
} as const;

export const ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/register",
    HOME: "/",
  },
  AUTH: {
    DASHBOARD: "/dashboard",
    MONITOR: "/monitor",
    CAMERA: "/camera",
    WHITELIST: "/whitelist",
    LOGS: "/logs",
    SETTINGS: "/settings",
  },
} as const;

export const MESSAGES = {
  AUTH: {
    LOGIN_EYEBROW: "",
    LOGIN_TITLE: "Bem-vindo de volta",
    LOGIN_SUBTITLE: "Informe suas credenciais para acessar o painel.",
    REGISTER_EYEBROW: "Comece sua jornada",
    REGISTER_TITLE: "Crie sua conta",
    REGISTER_SUBTITLE:
      "Preencha seus dados para gerenciar o acesso de veículos no Mantis.",
    FOOTER_NO_ACCOUNT: "Não tem conta?",
    FOOTER_HAS_ACCOUNT: "Já tem conta?",
    LINK_CREATE_ACCOUNT: "Criar conta",
    LINK_SIGN_IN: "Entrar",
  },
  WHITELIST: {
    ADD_SUCCESS: "Placa adicionada com sucesso!",
    ADD_ERROR: "Erro ao adicionar placa.",
    REMOVE_SUCCESS: "Placa removida com sucesso!",
    REMOVE_ERROR: "Erro ao remover placa.",
    UPDATE_SUCCESS: "Placa atualizada com sucesso!",
    UPDATE_ERROR: "Erro ao atualizar placa.",
  },
  GATE: {
    OPEN_SUCCESS: "Portão aberto com sucesso!",
    OPEN_ERROR: "Erro ao abrir portão.",
  },
} as const;
