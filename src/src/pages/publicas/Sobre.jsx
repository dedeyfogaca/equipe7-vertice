import { useTitulo } from '../../hooks/useTitulo.js';
import { LayoutPublico } from '../../components/layout/LayoutPublico.jsx';
import { cn } from '../../lib/utils.js';
import avatarAndrey from '../../assets/avatar-andrey.webp';
import avatarMatheus from '../../assets/avatar-matheus.webp';

// Sobre nós (pública): quem fez o Vértice.

// Marca do GitHub (o ícone saiu do pacote de ícones, que não traz mais
// marcas de empresas).
function IconeGithub() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

const PESSOAS = [
  {
    nome: 'Andrey Fogaça',
    sobretitulo: 'Designer gráfico · Acessibilidade',
    paragrafos: [
      'Designer gráfico e estudante de Análise e Desenvolvimento de Sistemas na UniCesumar, em Ponta Grossa (PR).',
      'Pesquisador voltado para acessibilidade e inclusão de pessoas surdas. Reforça que uma boa interface é aquela que qualquer pessoa consegue usar.',
    ],
    frase: 'Design que exclui não é design, é barreira.',
    github: 'dedeyfogaca',
    avatar: avatarAndrey,
    alt: 'Avatar em pixel art do Andrey, de camiseta azul e braços cruzados',
    // O fundo do retrato acompanha o tema: tom claro no claro, escuro no escuro.
    fundo: 'bg-[#cdeff6] dark:bg-[#0e2a33]',
    acento: 'rgb(34 211 238 / 0.6)',
    borda: 'rgb(34 211 238 / 0.28)',
  },
  {
    nome: 'Matheus Saraiva Faustin',
    sobretitulo: 'Analista e desenvolvedor de sistemas',
    paragrafos: [
      'Estudante de Análise e Desenvolvimento de Sistemas na UniCesumar, em Ponta Grossa (PR), em transição de carreira para a tecnologia.',
      'Estuda Python, Java, HTML, CSS e JavaScript e busca sempre aplicar o que aprende em projetos reais.',
    ],
    frase:
      'Código não se trata apenas de resolver problemas. Trata-se de construir soluções que sejam escaláveis, duradouras e gerem valor real.',
    github: 'MatheusSaraiv-a',
    avatar: avatarMatheus,
    alt: 'Avatar em pixel art do Matheus, de boné, óculos e camiseta verde',
    fundo: 'bg-[#e0efc9] dark:bg-[#18240f]',
    acento: 'rgb(132 204 22 / 0.6)',
    borda: 'rgb(132 204 22 / 0.28)',
  },
];

function Pessoa({ pessoa, invertido }) {
  return (
    <section aria-label={pessoa.nome} className="mx-auto max-w-[1200px] px-6 py-4 sm:py-8">
      <div
        className={cn(
          'flex flex-wrap items-start gap-10 rounded-[28px] border border-borda bg-superficie p-7 sm:p-10',
          invertido && 'flex-wrap-reverse'
        )}
      >
        {!invertido && <Retrato pessoa={pessoa} />}
        <div className="flex min-w-[260px] flex-1 flex-col gap-4">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sutil">
            {pessoa.sobretitulo}
          </span>
          <h2 className="text-[clamp(30px,3.4vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] text-forte">
            {pessoa.nome}
          </h2>
          {pessoa.paragrafos.map((p) => (
            <p key={p} className="text-[17px] leading-[1.7] text-suave">
              {p}
            </p>
          ))}
          <blockquote
            className="mt-1 border-l-2 py-1 pl-[18px] text-base italic leading-relaxed text-texto"
            style={{ borderLeftColor: pessoa.acento }}
          >
            “{pessoa.frase}”
          </blockquote>
          <div className="mt-1 flex flex-wrap gap-2.5">
            <a
              href={`https://github.com/${pessoa.github}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-borda-forte px-4 py-2.5 text-sm font-medium text-texto transition-colors hover:border-primaria hover:text-primaria"
            >
              <IconeGithub />@{pessoa.github}
              <span className="sr-only">(GitHub, abre em nova aba)</span>
            </a>
          </div>
        </div>
        {invertido && <Retrato pessoa={pessoa} />}
      </div>
    </section>
  );
}

function Retrato({ pessoa }) {
  return (
    <div
      className={cn(
        'flex h-[300px] w-full max-w-[280px] shrink-0 items-end justify-center overflow-hidden rounded-3xl border',
        pessoa.fundo
      )}
      style={{ borderColor: pessoa.borda }}
    >
      <img src={pessoa.avatar} alt={pessoa.alt} width="290" height="290" className="size-[290px] max-w-none object-contain" />
    </div>
  );
}

export default function Sobre() {
  useTitulo('Sobre nós');

  return (
    <LayoutPublico>
      <section className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 pb-12 pt-20 sm:pb-16 sm:pt-24">
        <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-primaria">Sobre nós</span>
        <h1 className="max-w-[900px] text-[clamp(40px,6vw,80px)] font-semibold leading-[1.02] tracking-[-0.045em] text-forte">
          Dois estudantes, um problema que a gente conhecia de perto.
        </h1>
        <p className="max-w-[680px] text-[17px] leading-relaxed text-suave sm:text-[19px]">
          O Vértice começou como um trabalho da disciplina de Projeto de Software e virou a ferramenta que a gente
          queria ter usado desde o primeiro semestre: uma forma de ver o quanto já avançamos, e não só o que falta.
        </p>
      </section>

      <div className="pb-16 sm:pb-24">
        {PESSOAS.map((pessoa, i) => (
          <Pessoa key={pessoa.nome} pessoa={pessoa} invertido={i % 2 === 1} />
        ))}
      </div>
    </LayoutPublico>
  );
}
