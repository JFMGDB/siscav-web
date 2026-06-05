import type { PaginatedResponse } from "./whitelist";

export interface AccountUser {
  id: string;
  email: string;
  is_admin: boolean;
  is_superadmin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_accounts: number;
  client_admin_count: number;
  superadmin_count: number;
}

export interface AccountUserUpdate {
  email?: string;
  password?: string;
}

export type PaginatedAccounts = PaginatedResponse<AccountUser>;
