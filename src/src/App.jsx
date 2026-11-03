import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { RolarParaTopo } from './components/RolarParaTopo.jsx';
import { TransicaoGrupoProvider } from './components/layout/TransicaoGrupo.jsx';

import Inicio from './pages/publicas/Inicio.jsx';
import Sobre from './pages/publicas/Sobre.jsx';
import Entrar from './pages/publicas/Entrar.jsx';
import NaoEncontrada from './pages/publicas/NaoEncontrada.jsx';

import Painel from './pages/Painel.jsx';
import Calendario from './pages/Calendario.jsx';
import Disciplinas from './pages/Disciplinas.jsx';
import DisciplinaDetalhe from './pages/DisciplinaDetalhe.jsx';
import Atividades from './pages/Atividades.jsx';
import AtividadeForm from './pages/AtividadeForm.jsx';
import AtividadeDetalhe from './pages/AtividadeDetalhe.jsx';
import Membros from './pages/Membros.jsx';
import Conquistas from './pages/Conquistas.jsx';

// Mapa de rotas.
//
// Públicas: a página inicial, a história da equipe e a tela de acesso.
// Privadas: aninhadas em <ProtectedRoute> (que confere a sessão) e em
// <AppShell> (a barra do topo com o <Outlet /> das telas). A passagem do
// acesso para o painel (a marca rolando) fica por cima de todas as rotas.
export default function App() {
  return (
    <TransicaoGrupoProvider>
      <RolarParaTopo />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/entrar" element={<Entrar />} />
        {/* Endereço antigo da tela de acesso. */}
        <Route path="/login" element={<Navigate to="/entrar" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/painel" element={<Painel />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/disciplinas" element={<Disciplinas />} />
            <Route path="/disciplina/:id" element={<DisciplinaDetalhe />} />
            <Route path="/atividades" element={<Atividades />} />
            <Route path="/atividade/nova" element={<AtividadeForm />} />
            <Route path="/atividade/:id" element={<AtividadeDetalhe />} />
            <Route path="/atividade/:id/editar" element={<AtividadeForm />} />
            <Route path="/membros" element={<Membros />} />
            <Route path="/conquistas" element={<Conquistas />} />
          </Route>
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </TransicaoGrupoProvider>
  );
}
