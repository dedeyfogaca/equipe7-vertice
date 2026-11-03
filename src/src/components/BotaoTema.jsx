import { Moon, Sun } from 'lucide-react';
import { useTema } from '../context/TemaContext.jsx';
import { Button } from './ui/botao.jsx';

/** Troca entre o tema escuro e o claro. Vale para o sistema inteiro. */
export function BotaoTema({ className, comTexto = false }) {
  const { modo, alternarTema } = useTema();
  const proximo = modo === 'dark' ? 'claro' : 'escuro';
  const Icone = modo === 'dark' ? Sun : Moon;

  if (comTexto) {
    return (
      <button
        type="button"
        onClick={alternarTema}
        className={className}
        aria-label={`Mudar para o tema ${proximo}`}
      >
        <Icone className="size-[18px] shrink-0" aria-hidden="true" />
        Tema {proximo}
      </button>
    );
  }

  return (
    <Button
      variante="fantasma"
      tamanho="icone"
      className={className}
      aria-label={`Mudar para o tema ${proximo}`}
      title={`Tema ${proximo}`}
      onClick={alternarTema}
    >
      <Icone className="!size-[18px]" />
    </Button>
  );
}
