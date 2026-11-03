import { useEffect } from 'react';

// Título da aba do navegador. Ajuda quem tem várias abas abertas e quem usa
// leitor de tela, que anuncia o título ao trocar de página.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Vértice` : 'Vértice';
  }, [titulo]);
}
