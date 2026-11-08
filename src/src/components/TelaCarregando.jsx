import { SimboloVertice } from './ui/marca.jsx';

// Espera enquanto a conta é conferida e os dados chegam do banco.
export function TelaCarregando({ texto = 'Carregando seus grupos…' }) {
  return (
    <div role="status" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fundo text-sutil">
      <SimboloVertice tamanho={40} className="animate-pulse text-primaria motion-reduce:animate-none" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}
