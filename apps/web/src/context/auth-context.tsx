import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authControllerDirectLogin, authControllerLogout, authControllerMe } from '../lib/api-client';
import type { AuthMeResponseDto, LoginRequestDto, ProblemDetailsDto, SafeUserProfileDto } from '../lib/api-client/models';

interface AuthContextType {
  user: SafeUserProfileDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequestDto) => Promise<SafeUserProfileDto>;
  loginFederated: (returnTo?: string) => void;
  logout: () => Promise<void>;
  manageAccount: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authControllerMe();
      if (res && res.status === 200 && 'user' in (res.data as AuthMeResponseDto)) {
        setUser((res.data as AuthMeResponseDto).user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(async (credentials: LoginRequestDto): Promise<SafeUserProfileDto> => {
    const res = await authControllerDirectLogin(credentials);
    if (res && res.status === 200 && 'user' in (res.data as AuthMeResponseDto)) {
      const loggedUser = (res.data as AuthMeResponseDto).user;
      setUser(loggedUser);
      return loggedUser;
    }
    const problem = res.data as ProblemDetailsDto;
    throw new Error(problem?.detail || 'Não foi possível autenticar com as credenciais informadas.');
  }, []);

  const loginFederated = useCallback((returnTo?: string) => {
    const searchParams = new URLSearchParams();
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      searchParams.set('returnTo', returnTo);
    }
    const query = searchParams.toString();
    const loginUrl = `/api/v1/auth/login${query ? `?${query}` : ''}`;
    window.location.href = loginUrl;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authControllerLogout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  const manageAccount = useCallback(() => {
    window.location.href = '/api/v1/auth/account';
  }, []);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        loginFederated,
        logout,
        manageAccount,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
}
