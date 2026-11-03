import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Aviso } from './ui/basicos.jsx';

// RN07 — mostra o conteúdo só para o organizador do grupo. Para o
// participante, mostra o aviso (se houver) no lugar.
export function SomenteOrganizador({ children, aviso }) {
  const { ehOrganizador } = useAuth();
  if (ehOrganizador) return children;
  return aviso ? <Aviso icone={Lock}>{aviso}</Aviso> : null;
}
