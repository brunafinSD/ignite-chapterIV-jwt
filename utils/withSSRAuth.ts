// em páginas que só podem ser acessadas por usuários logados

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { redirect } from "next/dist/server/api-utils";
import { parseCookies } from "nookies";

/*
Higher-order function
uma função de ordem superior é uma função que faz pelo menos uma das seguintes opções:
- leva uma ou mais funções como argumentos
- retorna uma função como seu resultado.
*/

// se tiver cookie redireciona para o dashboard se não executa a função recebida no parametro
export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps{
  return async(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if(!cookies['jwt.token']){
      return{
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    return await fn(ctx);
  }
}