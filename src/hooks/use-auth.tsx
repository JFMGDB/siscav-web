'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User, AuthContextType } from '@/types';
import { useRouter } from 'next/navigation';
import { AUTH_CONFIG, ROUTES } from '@/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Tokens are in cookies (apiClient reads them)
        const accessToken = apiClient.getAccessToken();
        const refreshToken = apiClient.getRefreshToken();
        const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

        if (accessToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse stored user', error);
                localStorage.removeItem(AUTH_CONFIG.USER_KEY);
                apiClient.clearTokens();
            }
        } else if (refreshToken && !accessToken) {
            apiClient.refreshTokens().catch(() => {
                apiClient.clearTokens();
                localStorage.removeItem(AUTH_CONFIG.USER_KEY);
            });
        }

        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);
            // Os tokens já são armazenados pelo apiClient
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.user));
            setUser(response.user);
            router.push(ROUTES.AUTH.DASHBOARD);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (email: string, password: string) => {
        try {
            await apiClient.register(email, password);
            // Após registro bem-sucedido, fazer login automaticamente
            await login(email, password);
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const logout = () => {
        apiClient.clearTokens();
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
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
