const LOCAL_DEV_API_URL = "http://localhost:8000";
export const PRODUCTION_API_URL = "https://siscav-api.onrender.com";

function trimApiUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}

/** Resolves API base URL at runtime when NEXT_PUBLIC_* is missing from the Vercel build. */
export function getApiBaseUrl(): string {
  const fromEnv = trimApiUrl(
    process.env.NEXT_PUBLIC_MANTIS_API_URL ||
      process.env.NEXT_PUBLIC_SISCAV_API_URL ||
      process.env.NEXT_PUBLIC_API_URL,
  );
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname.endsWith(".vercel.app")) {
      return PRODUCTION_API_URL;
    }
  }

  if (process.env.VERCEL === "1") {
    return PRODUCTION_API_URL;
  }

  return LOCAL_DEV_API_URL;
}

export const API_CONFIG = {
  get BASE_URL() {
    return getApiBaseUrl();
  },
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/v1/register",
      LOGIN: "/api/v1/login/access-token",
      REFRESH: "/api/v1/login/refresh-token",
      ME: "/api/v1/users/me",
    },
    ML: {
      RECOGNIZE_PLATE: "/api/v1/ml/recognize-plate",
      CLASSIFY_VEHICLE: "/api/v1/ml/classify-vehicle",
    },
    USERS: "/api/v1/users",
    WHITELIST: "/api/v1/whitelist",
    LOGS: "/api/v1/access_logs",
    METRICS: "/api/v1/dashboard/metrics",
    GATE: {
      TRIGGER: "/api/v1/gate_control/trigger",
    },
    IMAGES: {
      BASE: "/api/v1/access_logs/images",
    },
  },
  REQUEST_TIMEOUT_MS: 30_000,
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
    HOME: "/",
  },
  AUTH: {
    DASHBOARD: "/dashboard",
    MONITOR: "/monitor",
    CAMERA: "/camera",
    WHITELIST: "/whitelist",
    LOGS: "/logs",
    ML_PLAYGROUND: "/ml-playground",
    SETTINGS: "/settings",
    USERS_CREATE: "/users/create",
  },
} as const;

export const MESSAGES = {
  COMMON: {
    NETWORK_ERROR: "Não foi possível conectar ao servidor. Verifique sua conexão.",
    SESSION_EXPIRED: "Sessão expirada. Faça login novamente.",
    UNAUTHORIZED: "Não foi possível validar as credenciais.",
    FORBIDDEN: "Você não tem permissão para esta ação.",
    NOT_FOUND: "Recurso não encontrado.",
    CONFLICT: "Conflito com dados existentes.",
    VALIDATION_ERROR: "Dados inválidos. Verifique os campos informados.",
    RATE_LIMIT: "Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.",
    PAYLOAD_TOO_LARGE: "Arquivo ou dados muito grandes.",
    SERVICE_UNAVAILABLE: "Serviço temporariamente indisponível.",
    UNEXPECTED_ERROR: "Erro inesperado. Tente novamente.",
    LOAD_ERROR: "Falha ao carregar dados.",
    REQUEST_TIMEOUT: "A requisição demorou demais. Tente novamente.",
    RETRY: "Tentar novamente",
  },
  AUTH: {
    LOGIN_EYEBROW: "",
    LOGIN_TITLE: "Bem-vindo de volta",
    LOGIN_SUBTITLE: "Informe suas credenciais para acessar o painel.",
    REGISTER_EYEBROW: "Comece sua jornada",
    REGISTER_TITLE: "Crie sua conta",
    REGISTER_SUBTITLE:
      "Preencha os dados para criar uma conta de acesso ao Mantis.",
    CREATE_USER_TITLE: "Criar usuário",
    CREATE_USER_SUBTITLE:
      "Cadastre um administrador do cliente (opera o estacionamento no Mantis). Apenas superadministradores Mantis podem usar esta função.",
    CREATE_USER_SUCCESS: "Usuário criado com sucesso.",
    CREATE_USER_FORBIDDEN:
      "Sem permissão para criar usuários. Apenas superadministradores Mantis.",
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
    AUTO_OPEN_SUCCESS: "Acesso autorizado e cancela acionada.",
    AUTO_OPEN_SIMULATED:
      "Acesso autorizado. Atuador não configurado (modo simulado).",
    AUTO_OPEN_HARDWARE_ERROR:
      "Acesso autorizado, mas a cancela não respondeu ({reason}).",
    AMBULANCE_AUTO_AUTHORIZED:
      "Ambulância detectada — acesso autorizado automaticamente.",
  },
  ACCOUNTS: {
    HUB_TITLE: "Gestão de contas",
    HUB_SUBTITLE: "Crie e administre contas de acesso ao sistema.",
    ROLE_SUPERADMIN: "Superadministrador Mantis",
    ROLE_CLIENT_ADMIN: "Admin cliente",
    ROLE_SUPERADMIN_SHORT: "Superadmin",
    CREATE_PRIMARY: "Criar conta de acesso",
    CREATE_BUTTON: "Criar administrador",
    BACK_TO_HUB: "Voltar para gestão de contas",
    INFO_SEPARATION:
      "Superadministradores gerenciam contas. Administradores do cliente operam o estacionamento (painel, monitor, whitelist e histórico).",
    CLIENT_ADMIN_BULLETS: [
      "Painel de controle e métricas operacionais",
      "Monitoramento ao vivo e pré-visualização de câmara",
      "Veículos autorizados e histórico de acesso",
    ],
    TABLE_TITLE: "Contas cadastradas",
    EMPTY:
      "Nenhuma conta cadastrada. Crie o primeiro administrador do cliente.",
    UPDATE_SUCCESS: "Conta atualizada com sucesso.",
    UPDATE_ERROR: "Erro ao atualizar conta.",
    DELETE_SUCCESS: "Conta removida com sucesso.",
    DELETE_ERROR: "Erro ao remover conta.",
    DELETE_CONFIRM: "Tem certeza que deseja remover esta conta?",
    EDIT_EMAIL: "Editar e-mail",
    STATS_TOTAL: "Total de contas",
    STATS_CLIENT_ADMINS: "Administradores do cliente",
    STATS_SUPERADMINS: "Superadministradores",
    STATS_LOAD_ERROR: "Falha ao carregar estatísticas.",
    LIST_LOAD_ERROR: "Falha ao carregar contas.",
    RETRY: "Tentar novamente",
  },
} as const;
