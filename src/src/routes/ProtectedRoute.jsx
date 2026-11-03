import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Rota privada via Context: só deixa passar com um grupo na sessão e com a
// pessoa identificada dentro dele. Sem isso, vai para /entrar, guardando de
// onde ela veio para voltar depois.
//
// A identificação é exigida por causa do RN07: as telas mudam conforme o
// perfil, então entrar sem saber quem é a pessoa não serve.
export function ProtectedRoute() {
  const { autenticado, precisaIdentificar } = useAuth();
  const location = useLocation();

  if (!autenticado || precisaIdentificar) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
