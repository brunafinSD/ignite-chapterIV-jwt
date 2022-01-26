import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { setupAPIClient } from '../services/api';
import Router from 'next/router';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { api } from '../services/apiClient';

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

export function signOut(){
  destroyCookie(undefined, 'jwt.token');
  destroyCookie(undefined, 'jwt.refreshToken');

  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'jwt.token': token} = parseCookies();

    if(token){
      api.get('/me').then(response => {
      const {email, permissions, roles} = response.data;

      setUser({email, permissions, roles});
      })
      .catch(() => {
        signOut();
      })
    }

  },[]);

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

      api.defaults.headers['Authorization'] = `Bearer ${token}`

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