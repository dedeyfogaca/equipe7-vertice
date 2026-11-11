import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTitulo } from '../../hooks/useTitulo.js';
import { LayoutPublico } from '../../components/layout/LayoutPublico.jsx';
import { Button } from '../../components/ui/botao.jsx';

export default function NaoEncontrada() {
  useTitulo('Página não encontrada');
  const { autenticado, precisaIdentificar, precisaPerfil } = useAuth();
  const logado = autenticado && !precisaIdentificar && !precisaPerfil;

  return (
    <LayoutPublico>
      <section className="mx-auto flex max-w-[640px] flex-col items-center gap-5 px-6 py-28 text-center">
        <span className="numero text-[clamp(72px,12vw,128px)] font-bold leading-none tracking-[-0.06em] text-primaria">
          404
        </span>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.04em] text-forte">
          Página não encontrada
        </h1>
        <p className="text-[17px] leading-relaxed text-sutil">
          O endereço que você tentou abrir não existe. Talvez o link esteja errado ou a página tenha sido removida.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {logado && (
            <Button asChild>
              <Link to="/painel">Ir para o painel</Link>
            </Button>
          )}
          <Button asChild variante={logado ? 'secundaria' : 'primaria'}>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </section>
    </LayoutPublico>
  );
}
