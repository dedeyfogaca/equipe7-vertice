import { hojeISO } from '../lib/datas.js';
import { ddmm } from '../lib/formatos.js';
import { cn } from '../lib/utils.js';

// Próximos feriados nacionais (BrasilAPI, com a Nager.Date de reserva).
export function ProximosFeriados({ feriados = [], carregando, erro, limite = 3, className }) {
  const hoje = hojeISO();
  const vistos = new Set();
  const proximos = feriados
    .filter((f) => f.date >= hoje && !vistos.has(f.date) && vistos.add(f.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limite);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-[13px] text-sutil">Próximos feriados</span>
      {carregando && proximos.length === 0 && (
        <span className="text-sm text-sutil">Carregando feriados…</span>
      )}
      {!carregando && erro && proximos.length === 0 && (
        <span className="text-sm text-sutil">Não foi possível carregar os feriados agora.</span>
      )}
      {!carregando && !erro && proximos.length === 0 && (
        <span className="text-sm text-sutil">Nenhum feriado nacional por perto.</span>
      )}
      {proximos.map((f) => (
        <span key={f.date} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-texto">{f.name}</span>
          <span className="numero shrink-0 text-[13px] text-sutil">{ddmm(f.date)}</span>
        </span>
      ))}
    </div>
  );
}
