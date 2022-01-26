// quando criamos uma classe de erro é possível diferenciar os erros
export class AuthTokenError extends Error{
  constructor(){
    super('Error with authentication token.');
  }
}