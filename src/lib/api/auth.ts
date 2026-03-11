import type { ApiClient } from './client';
import type { AuthResponse, User } from '@/types';
import { API_CONFIG } from '@/constants';
import { parseApiError } from './client';

export async function register(
  _client: ApiClient,
  email: string,
  password: string
): Promise<{ id: string; email: string; created_at: string; updated_at: string }> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await parseApiError(res);
    if (res.status === 409) throw new Error('Email already registered');
    if (res.status === 429) throw new Error('Too many attempts. Wait 1 minute.');
    throw new Error(msg);
  }
  return res.json();
}

export async function login(client: ApiClient, email: string, password: string): Promise<AuthResponse> {
  const form = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) {
    const msg = await parseApiError(res);
    if (res.status === 401) throw new Error(msg !== 'Erro ao fazer login' ? msg : 'Invalid credentials');
    if (res.status === 429) throw new Error('Too many attempts. Wait 1 minute.');
    throw new Error(msg);
  }
  const token = await res.json();
  client.setTokens(token.access_token, token.refresh_token ?? null);
  let userId = '';
  try {
    const parts = token.access_token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      userId = payload.sub ?? '';
    }
  } catch {
    // ignore
  }
  const user: User = {
    id: userId,
    email,
    name: email.split('@')[0],
  };
  return {
    access_token: token.access_token,
    token_type: token.token_type,
    refresh_token: token.refresh_token,
    user,
  };
}
