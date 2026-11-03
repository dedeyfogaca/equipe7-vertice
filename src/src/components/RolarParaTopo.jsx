import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ao trocar de página, volta ao topo — o navegador não faz isso sozinho numa
// aplicação de página única. Com âncora no endereço (#perguntas), rola até
// ela.
export function RolarParaTopo() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const alvo = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (alvo) {
        alvo.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
