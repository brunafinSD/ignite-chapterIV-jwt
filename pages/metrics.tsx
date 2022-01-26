import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Página de métricas, somente acessível por usuários com permissão</h1>
    </>
  )
}

// método executado pelo lado do servidor quando o usuário acessar essa página
// Cada página exige permissions e roles diferentes
export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');
  console.log(response.data);

  return {
    props: {}
  }

}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
});