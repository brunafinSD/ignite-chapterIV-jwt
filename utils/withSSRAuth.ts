// em páginas que só podem ser acessadas por usuários logados

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

/*
Higher-order function
uma função de ordem superior é uma função que faz pelo menos uma das seguintes opções:
- leva uma ou mais funções como argumentos
- retorna uma função como seu resultado.
*/
export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    const token = cookies['jwt.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { permissions, roles } = options;
      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      });

      if(!userHasValidPermissions){
        return{
          redirect:{
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'jwt.token');
        destroyCookie(ctx, 'jwt.refreshToken');
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}