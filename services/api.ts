import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';


let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined){
  let cookies = parseCookies(ctx);
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['jwt.token']}`
    }
  });
  
  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies(ctx);
  
        const { 'jwt.refreshToken': refreshToken } = cookies;
  
        const originalConfig = error.config;
  
        if(!isRefreshing){
          isRefreshing = true;
  
          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data
            
            setCookie(ctx, 'jwt.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 dias
              path: '/'
            });
            setCookie(ctx, 'jwt.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 dias
              path: '/'
            });
            
            api.defaults.headers['Authorization'] = `Bearer ${token}`
  
            failedRequestQueue.forEach(request => request.onSuccess(token));
            failedRequestQueue = [];
  
          }).catch(error => {
            failedRequestQueue.forEach(request => request.onFailure(error));
            failedRequestQueue = [];
  
            // executar somente se estiver no lado do cliente
            if(process.browser){
              signOut();
            }
  
          }).finally(() => {
            isRefreshing = false;
          })
        }
  
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              resolve(api(originalConfig));
            },
            onFailure: (error: AxiosError) => {
              reject(error);
            }
          })
        });
      } else {
        if(process.browser){
          signOut();
        }
      }
    }
  
    return Promise.reject(error);
  });

  return api;
}