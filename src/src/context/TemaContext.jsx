import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

// Modo de cor do sistema (escuro ou claro). A escolha fica gravada no
// navegador e vale para todas as telas, públicas e internas. É aplicada pela
// classe `dark` no <html> — é dela que saem as variáveis de cor de
// `index.css`.
const TemaContext = createContext(null);
const CHAVE = 'tema';
const COR_DA_BARRA = { dark: '#07090f', light: '#f5f7fb' };

function lerModoSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo === 'light' || salvo === 'dark' ? salvo : 'dark';
  } catch {
    return 'dark';
  }
}

export function TemaProvider({ children }) {
  const [modo, setModo] = useState(lerModoSalvo);

  // Antes de pintar, para a tela não piscar no tema errado.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', modo === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_DA_BARRA[modo]);
  }, [modo]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, modo);
    } catch {
      /* armazenamento indisponível: o tema só não fica lembrado */
    }
  }, [modo]);

  const alternarTema = useCallback(() => {
    setModo((atual) => (atual === 'dark' ? 'light' : 'dark'));
  }, []);

  const valor = useMemo(() => ({ modo, alternarTema }), [modo, alternarTema]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) {
    throw new Error('useTema precisa ser usado dentro de <TemaProvider>.');
  }
  return ctx;
}
