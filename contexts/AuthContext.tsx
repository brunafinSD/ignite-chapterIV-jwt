import React, { createContext, ReactNode, useState } from 'react';
import { api } from '../services/api';
import Router from 'next/router';
import { setCookie } from 'nookies';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user?: User;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { token, refreshToken, permissions, roles } = response.data;

      // PARA ARMAZENAR O TOKEN E REFRESH TOKEN PODEMOS USAR:
      // sessionStorage - se fechar o navegador perde tudo
      // localStorage - não temos acesso do lado do servidor, apenas no browser
      // cookies - armazena informações do browser podendo ser acessado no browser e no servidor

      setCookie(undefined, 'jwt.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/'
      });
      setCookie(undefined, 'jwt.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/'
      });

      setUser({
        email,
        permissions,
        roles
      });

      Router.push('/dashboard');

    } catch (error) {
      console.log(error);
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}