import { Toaster } from 'sonner';
import { useTema } from '../context/TemaContext.jsx';

// Avisos rápidos que aparecem no canto da tela (atividade concluída,
// conquista nova, falha ao salvar). As cores vêm dos mesmos tokens do resto
// do sistema, para o aviso acompanhar o tema.
export function Avisos() {
  const { modo } = useTema();
  return (
    <Toaster
      theme={modo}
      position="bottom-right"
      closeButton
      offset={20}
      style={{
        '--normal-bg': 'var(--superficie)',
        '--normal-border': 'var(--borda-forte)',
        '--normal-text': 'var(--texto)',
        '--border-radius': '16px',
      }}
      toastOptions={{
        classNames: {
          toast: 'font-sans !shadow-flutuante !gap-3 !px-4 !py-3.5',
          title: '!text-[14px] !font-semibold !text-forte',
          description: '!text-[13px] !text-sutil',
          actionButton: '!rounded-full !bg-primaria !px-3 !font-semibold !text-primaria-fg',
        },
      }}
    />
  );
}
