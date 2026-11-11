import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useConta } from '../context/ContaContext.jsx';
import { TelaCarregando } from '../components/TelaCarregando.jsx';

// Rota privada via Context: só deixa passar com um grupo na sessão e com a
// pessoa identificada dentro dele. Sem isso, vai para /entrar, guardando de
// onde ela veio para voltar depois.
//
// A identificação é exigida por causa do RN07: as telas mudam conforme o
// perfil, então entrar sem saber quem é a pessoa não serve.
//
// Com conta, os dados vêm do banco: enquanto chegam, a tela espera em vez de
// mandar a pessoa de volta para o acesso.
export function ProtectedRoute() {
  const { autenticado, precisaIdentificar, precisaPerfil, carregando } = useAuth();
  const { verificando } = useConta();
  const location = useLocation();

  if (verificando || carregando) return <TelaCarregando />;

  if (!autenticado || precisaIdentificar || precisaPerfil) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
