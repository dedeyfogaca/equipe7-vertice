import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { guardarConvitePendente } from '../../lib/convite.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Link do convite (/convite/CODIGO): guarda o código e leva à tela de
// acesso, que o usa assim que a pessoa entra na conta (RF28).
export default function Convite() {
  const { codigo = '' } = useParams();
  const { sair } = useAuth();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    guardarConvitePendente(codigo.toUpperCase());
    // Quem já estava dentro de outro grupo sai dele para usar o convite.
    sair();
    setPronto(true);
  }, [codigo, sair]);

  return pronto ? <Navigate to="/entrar" replace /> : null;
}
