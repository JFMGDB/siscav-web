import type { ApiClient } from "./client";
import type {
  AccountUser,
  AccountUserUpdate,
  PaginatedAccounts,
  UserStats,
} from "@/types/accounts";
import { API_CONFIG } from "@/constants";

const BASE = API_CONFIG.ENDPOINTS.USERS;

export async function getUserStats(client: ApiClient): Promise<UserStats> {
  return client.request<UserStats>(`${BASE}/stats`);
}

export async function getUsers(
  client: ApiClient,
  skip = 0,
  limit = 100,
): Promise<PaginatedAccounts> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  return client.request<PaginatedAccounts>(`${BASE}/?${params}`);
}

export async function updateUser(
  client: ApiClient,
  id: string,
  payload: AccountUserUpdate,
): Promise<AccountUser> {
  return client.request<AccountUser>(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(client: ApiClient, id: string): Promise<void> {
  await client.request<void>(`${BASE}/${id}`, { method: "DELETE" });
}
