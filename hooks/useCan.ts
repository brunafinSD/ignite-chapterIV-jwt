import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

type useCanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({permissions, roles}: useCanParams){
  const { user, isAuthenticated } = useContext(AuthContext);

  // se o usuário não está autenticado
  if(!isAuthenticated){
    return false;
  }

  // se tiver algo dentro de permissions, verifica se tem todas as permissões do array
  if(permissions?.length > 0){
    const hasAllPermissions = permissions.every(permission => {
      // verifica se as permissões do usuário inclui a permissão que temos
      return user.permissions.includes(permission);
    });

    if(!hasAllPermissions){
      // se não tem TODAS as permissões
      return false;
    }
  }

  // se tiver algo dentro de roles, verifica se tem alguma role do array
  if(roles?.length > 0){
    const hasSomeRoles = roles.some(role => {
      // verifica se alguma role do usuário está inclusa nas roles que temos
      return user.roles.includes(role);
    });

    if(!hasSomeRoles){
      // se não tem role
      return false;
    }
  }

  return true;
}