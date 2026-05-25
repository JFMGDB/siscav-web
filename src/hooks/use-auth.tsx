"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getClientApiClient,
  readBrowserAccessToken,
  readBrowserRefreshToken,
} from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import type { User, AuthContextType } from "@/types";
import { useRouter } from "next/navigation";
import { AUTH_CONFIG, ROUTES } from "@/constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getApi() {
  return getClientApiClient();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const accessToken = readBrowserAccessToken();
        const refreshToken = readBrowserRefreshToken();
        const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

        if (accessToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (!cancelled) setUser(parsedUser);
          } catch (error) {
            console.error("Failed to parse stored user", error);
            localStorage.removeItem(AUTH_CONFIG.USER_KEY);
            getApi().clearTokens();
          }
        } else if (refreshToken && !accessToken) {
          try {
            await getApi().refreshTokens();
            if (cancelled) return;
            const newAccess = readBrowserAccessToken();
            const userJson = localStorage.getItem(AUTH_CONFIG.USER_KEY);
            if (newAccess && userJson) {
              try {
                const parsedUser = JSON.parse(userJson);
                if (!cancelled) setUser(parsedUser);
              } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem(AUTH_CONFIG.USER_KEY);
                getApi().clearTokens();
              }
            }
          } catch {
            getApi().clearTokens();
            localStorage.removeItem(AUTH_CONFIG.USER_KEY);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(getApi(), email, password);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
      router.push(ROUTES.AUTH.DASHBOARD);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authApi.register(getApi(), email, password);
      await login(email, password);
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = () => {
    getApi().clearTokens();
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    setUser(null);
    router.push(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
