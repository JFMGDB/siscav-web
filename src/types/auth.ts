/**
 * Tipos relacionados à autenticação e autorização
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

