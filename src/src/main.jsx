import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// Fontes servidas junto com o sistema (sem depender do Google Fonts).
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/jetbrains-mono';
import './index.css';

import App from './App.jsx';
import { TemaProvider } from './context/TemaContext.jsx';
import { ContaProvider, useConta } from './context/ContaContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProvedorDicas } from './components/ui/flutuantes.jsx';
import { Avisos } from './components/Avisos.jsx';
import { migrarDados } from './lib/migracao.js';

// Migra o que estiver gravado no formato antigo ANTES de qualquer provider
// ler as coleções. Roda uma vez só: o marcador de versão barra a segunda.
const migracao = migrarDados();

// Os dados e a sessão dependem da conta (e do modo de demonstração): quando
// a pessoa entra, sai ou troca de conta, tudo isso é montado de novo, e as
// coleções da conta anterior não vazam para a próxima.
function DadosDaConta({ children }) {
  const { modo, usuario } = useConta();
  return (
    <DataProvider key={`${modo}:${usuario?.id || ''}`}>
      <AuthProvider>{children}</AuthProvider>
    </DataProvider>
  );
}

// Ponto de entrada da aplicação.
// TemaProvider aplica o tema (escuro/claro). ContaProvider sabe quem entrou
// (ou se é a demonstração). DataProvider guarda as coleções, e o
// AuthProvider (sessão) as lê para resolver quem está usando o sistema.
//
// useTransitions={false}: a partir do React Router 7, cada troca de endereço
// vira uma transição do React e chega à tela um instante depois. Os filtros
// da lista de atividades moram no endereço e a busca é digitada ali, então
// o endereço precisa ser atualizado na hora, como era no React Router 6.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TemaProvider>
      <ContaProvider>
        <DadosDaConta>
          <BrowserRouter useTransitions={false}>
            <ProvedorDicas delayDuration={300}>
              <App />
              <Avisos />
            </ProvedorDicas>
          </BrowserRouter>
        </DadosDaConta>
      </ContaProvider>
    </TemaProvider>
  </React.StrictMode>
);

// Atividade da versão antiga cujo grupo não existe mais não tem onde morar:
// a migração não a converte, mas também não a apaga. A pessoa é avisada uma
// vez, na abertura em que a migração rodou.
if (migracao.orfas > 0) {
  setTimeout(() => {
    toast.warning(
      migracao.orfas === 1
        ? 'Uma atividade antiga ficou sem grupo'
        : `${migracao.orfas} atividades antigas ficaram sem grupo`,
      {
        description:
          'O grupo delas não existe mais neste navegador. Elas não aparecem nas listas, mas continuam guardadas.',
        duration: 12000,
      }
    );
  }, 600);
}
