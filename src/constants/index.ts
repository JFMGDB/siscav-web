/**
 * Constantes da aplicação
 * Centraliza valores mágicos e configurações
 */

/**
 * Configurações da API
 * Base URL: `NEXT_PUBLIC_SISCAV_API_URL` (doc de integração) ou `NEXT_PUBLIC_API_URL` ou localhost.
 */
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_SISCAV_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/v1/register',
      LOGIN: '/api/v1/login/access-token',
      REFRESH: '/api/v1/login/refresh-token',
    },
    ML: {
      RECOGNIZE_PLATE: '/api/v1/ml/recognize-plate',
    },
    WHITELIST: '/api/v1/whitelist',
    LOGS: '/api/v1/access_logs',
    DEVICES: {
      SCAN: '/api/v1/devices/scan',
      CONNECT: '/api/v1/devices/connect',
      STATUS: '/api/v1/devices/status',
      DISCONNECT: '/api/v1/devices/disconnect',
      VIDEO_FRAME: '/api/v1/devices/video-frame',
    },
    GATE: {
      TRIGGER: '/api/v1/gate_control/trigger',
    },
    IMAGES: {
      BASE: '/api/v1/access_logs/images',
    },
  },
} as const;

/**
 * Configurações de autenticação
 */
export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user',
} as const;

/**
 * Configurações de UI
 */
export const UI_CONFIG = {
  SNACKBAR: {
    AUTO_HIDE_DURATION: 6000, // 6 segundos
    ANCHOR_ORIGIN: {
      vertical: 'bottom' as const,
      horizontal: 'right' as const,
    },
  },
  DRAWER: {
    WIDTH: 240,
  },
  POLLING: {
    CAPTURE_INTERVAL: 3000, // 3 segundos
  },
} as const;

/**
 * Rotas da aplicação
 */
export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    HOME: '/',
  },
  AUTH: {
    DASHBOARD: '/dashboard',
    MONITOR: '/monitor',
    CAMERA: '/camera',
    WHITELIST: '/whitelist',
    LOGS: '/logs',
    SETTINGS: '/settings',
  },
} as const;

/**
 * Mensagens do sistema
 */
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGIN_ERROR: 'Credenciais inválidas. Tente novamente.',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  },
  WHITELIST: {
    ADD_SUCCESS: 'Placa adicionada com sucesso!',
    ADD_ERROR: 'Erro ao adicionar placa.',
    REMOVE_SUCCESS: 'Placa removida com sucesso!',
    REMOVE_ERROR: 'Erro ao remover placa.',
    UPDATE_SUCCESS: 'Placa atualizada com sucesso!',
    UPDATE_ERROR: 'Erro ao atualizar placa.',
  },
  GATE: {
    OPEN_SUCCESS: 'Portão aberto com sucesso!',
    OPEN_ERROR: 'Erro ao abrir portão.',
  },
  DEVICE: {
    CONNECT_SUCCESS: 'Dispositivo conectado com sucesso!',
    CONNECT_ERROR: 'Erro ao conectar dispositivo.',
    DISCONNECT_SUCCESS: 'Dispositivo desconectado com sucesso!',
    DISCONNECT_ERROR: 'Erro ao desconectar dispositivo.',
    SCAN_ERROR: 'Erro ao escanear dispositivos.',
  },
} as const;

