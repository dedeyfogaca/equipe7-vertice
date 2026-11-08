import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

import { useData } from '../../context/DataContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { completarHistorico, reconstruirHistorico } from '../../lib/historico.js';
import { GraficoProgresso } from './GraficoProgresso.jsx';

// RF12: como o progresso da disciplina andou nos últimos dias.
export function HistoricoProgresso({ disciplina, percentualAtual }) {
  const { modo, atividadesDaDisciplina } = useData();
  const comConta = modo === 'conta';
  const [fotos, setFotos] = useState(null);

  useEffect(() => {
    if (!comConta) return undefined;
    let ativo = true;
    supabase
      .from('progresso_historico')
      .select('data_registro, percentual')
      .eq('id_disciplina', disciplina.id)
      .then(({ data, error }) => {
        if (ativo) setFotos(error ? [] : (data || []).map((r) => ({ data: r.data_registro, percentual: r.percentual })));
      });
    return () => {
      ativo = false;
    };
    // O valor de hoje vem da tela; as fotos dos outros dias não mudam.
  }, [comConta, disciplina.id]);

  const pontos = comConta
    ? completarHistorico(fotos || [], percentualAtual)
    : reconstruirHistorico(atividadesDaDisciplina(disciplina.id));

  if (comConta && fotos === null) return null;

  return (
    <div className="mt-5 border-t border-divisor pt-5">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-forte">
        <TrendingUp className="size-4 text-sutil" aria-hidden="true" />
        Evolução
      </h2>
      {pontos.length < 2 ? (
        <p className="text-[14px] text-sutil">
          A linha da evolução aparece a partir do segundo dia de atividades nesta disciplina.
        </p>
      ) : (
        <GraficoProgresso pontos={pontos} cor={disciplina.cor} nome={disciplina.nome} />
      )}
    </div>
  );
}
