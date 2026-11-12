import { useEffect, useState } from 'react';

import { useConta } from '../../context/ContaContext.jsx';
import { ehDaEquipe } from '../../lib/feedback.js';

// A conta está na tabela equipe (RN27)? A resposta fica guardada por conta,
// para o menu não perguntar ao banco a cada tela.
const cache = new Map();

export function useEquipe() {
  const { modo, usuario } = useConta();
  const id = modo === 'conta' ? usuario?.id : null;
  const [equipe, setEquipe] = useState(() => (id ? cache.get(id) ?? null : false));

  useEffect(() => {
    if (!id) {
      setEquipe(false);
      return undefined;
    }
    if (cache.has(id)) {
      setEquipe(cache.get(id));
      return undefined;
    }
    let ativo = true;
    ehDaEquipe().then((sim) => {
      cache.set(id, sim);
      if (ativo) setEquipe(sim);
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  return equipe; // null enquanto pergunta
}
