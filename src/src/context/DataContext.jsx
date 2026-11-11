import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CHAVES, USUARIO_DEMO, lerColecao, novoId, salvarColecao } from '../lib/storage.js';
import { COR_DISCIPLINA_PADRAO, normalizarPeso, PERFIL, STATUS, TIPO_EVENTO, tipoEventoValido } from '../lib/constants.js';
import {
  progressoAntesDe as calcularProgressoAntesDe,
  progressoDaDisciplina as calcularProgressoDaDisciplina,
  progressoDoConteudo as calcularProgressoDoConteudo,
} from '../lib/progresso.js';
import {
  concluidasPorMembro,
  conquistasAlcancadas,
  conquistasNovas,
  conquistasPerdidas,
  ofensivaDoMembro as calcularOfensiva,
  rankingDoGrupo as calcularRankingDoGrupo,
  ultimosDias as calcularUltimosDias,
  xpDoMembro as calcularXpDoMembro,
} from '../lib/gamificacao.js';
import { ESTILO_AVATAR_PADRAO, estiloAvatarValido, novaSeedAvatar } from '../lib/avatar.js';
import { aplicar, carregarTudo, diferenca, garantirEspacoPessoal, mensagemDoErro, semMudancas } from '../lib/remoto.js';
import { supabase } from '../lib/supabase.js';
import { ehFotoNova, separarFotos, subirFoto } from '../lib/fotosRemotas.js';
import { toast } from 'sonner';
import { useConta } from './ContaContext.jsx';

// Guarda as coleções (grupos, perfis, membros, disciplinas, conteúdos,
// atividades, eventos e conquistas) e expõe as operações de cadastro, edição
// e exclusão.
// Tudo fica em useState; cada mudança é espelhada por useEffect:
//   * com conta, no banco de dados (Supabase), por lib/remoto.js;
//   * no modo de demonstração, no armazenamento do navegador.
// As telas só conhecem estas funções, não o lugar onde os dados ficam.
//
// O provider é montado de novo quando o modo ou a conta mudam (ver main.jsx),
// então cada sessão começa com as coleções certas.
const DataContext = createContext(null);

// Id que representa "a conta inteira" nas contas de experiência e ofensiva
// do espaço pessoal, que somam as atividades da pessoa em todos os grupos.
const EU = '__conta__';

export function DataProvider({ children }) {
  const { modo, usuario } = useConta();
  const remoto = modo === 'conta';
  // Na tela de login (sem conta e fora da demonstração) não há dados.
  const inicial = (chave) => (modo === 'demo' ? lerColecao(chave) : []);

  const [grupos, setGrupos] = useState(() => inicial(CHAVES.grupos));
  const [perfis, setPerfis] = useState(() => inicial(CHAVES.perfis));
  const [membros, setMembros] = useState(() => inicial(CHAVES.membros));
  const [disciplinas, setDisciplinas] = useState(() => inicial(CHAVES.disciplinas));
  const [conteudos, setConteudos] = useState(() => inicial(CHAVES.conteudos));
  const [atividades, setAtividades] = useState(() => inicial(CHAVES.atividades));
  const [conquistas, setConquistas] = useState(() => inicial(CHAVES.conquistas));
  const [eventos, setEventos] = useState(() => inicial(CHAVES.eventos));
  const definir = useRef(null);
  definir.current = {
    grupos: setGrupos,
    perfis: setPerfis,
    membros: setMembros,
    disciplinas: setDisciplinas,
    conteudos: setConteudos,
    atividades: setAtividades,
    conquistas: setConquistas,
    eventos: setEventos,
  };

  // Conquistas: quem já recebeu o quê, e se a próxima concessão avisa ou não
  // (detalhes mais abaixo, na concessão).
  const silenciar = useRef(true);
  const concedidas = useRef(null);

  // ----- Com conta: o banco de dados -----
  // `servidor` é a última versão que o banco confirmou. Cada mudança nas
  // coleções entra num lote; o lote vai para o banco como diferença em
  // relação a `servidor`, um de cada vez, na ordem em que aconteceram.
  const [carregando, setCarregando] = useState(remoto);
  const servidor = useRef(null);
  const lote = useRef({});
  const agendado = useRef(false);
  const fila = useRef(Promise.resolve());

  const falhouCarga = useRef(false);
  const espacoGarantido = useRef(false);
  const recarregar = useCallback(async () => {
    if (!remoto) return;
    try {
      // RF34 e RF35: no primeiro acesso, o banco cria o espaço pessoal e o
      // perfil da conta (quem já tinha conta ganha os dois agora).
      if (!espacoGarantido.current) {
        await garantirEspacoPessoal(supabase);
        espacoGarantido.current = true;
      }
      const dados = await carregarTudo(supabase);
      servidor.current = dados;
      falhouCarga.current = false;
      concedidas.current = dados.conquistas.map(({ membroId, codigo }) => ({ membroId, codigo }));
      silenciar.current = true;
      Object.entries(dados).forEach(([chave, valor]) => definir.current[chave](valor));
      return dados;
    } catch (erro) {
      falhouCarga.current = true;
      toast.error('Não foi possível carregar os dados', { description: mensagemDoErro(erro) });
    } finally {
      setCarregando(false);
    }
  }, [remoto]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // Volta para a aba: busca o que o resto do grupo mudou nesse meio-tempo.
  useEffect(() => {
    if (!remoto) return undefined;
    const aoVoltar = () => {
      if (document.visibilityState !== 'visible') return;
      fila.current = fila.current.then(recarregar);
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, [remoto, recarregar]);

  const enviar = useCallback(
    async (pacote) => {
      // Fotos novas sobem depois de a linha existir (ver lib/fotosRemotas.js).
      const { semFotos, fotos } = separarFotos(pacote, servidor.current);
      const mudancas = diferenca(servidor.current, semFotos);
      try {
        if (!semMudancas(mudancas)) {
          await aplicar(supabase, mudancas);
          servidor.current = { ...servidor.current, ...semFotos };
        }
      } catch (erro) {
        // Algo foi recusado: avisa e volta tudo ao que está no banco.
        toast.error('Não foi possível salvar', { description: mensagemDoErro(erro) });
        await recarregar();
        return;
      }
      for (const foto of fotos) {
        let endereco = null;
        try {
          endereco = await subirFoto(supabase, foto);
        } catch {
          toast.error('Não foi possível enviar a foto', { description: 'Confira a internet e tente de novo.' });
        }
        // Com a foto no Storage, o endereço entra no lugar da imagem e segue
        // para o banco na próxima gravação. Se a subida falhou, volta a foto
        // que estava no banco.
        const antiga = (servidor.current[foto.chave] || []).find((o) => o.id === foto.id)?.foto || '';
        definir.current[foto.chave]((atual) =>
          atual.map((o) => (o.id === foto.id && o.foto === foto.dataUrl ? { ...o, foto: endereco ?? antiga } : o))
        );
      }
    },
    [recarregar]
  );

  // Fechar a aba com alteração ainda a caminho do banco perderia essa
  // alteração: o navegador pergunta antes.
  const pendentes = useRef(0);
  useEffect(() => {
    if (!remoto) return undefined;
    const antesDeSair = (evento) => {
      if (pendentes.current > 0 || agendado.current) {
        evento.preventDefault();
        evento.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', antesDeSair);
    return () => window.removeEventListener('beforeunload', antesDeSair);
  }, [remoto]);

  // Espera o que ainda está indo para o banco (antes de sair, por exemplo).
  const aguardarGravacao = useCallback(
    () => new Promise((ok) => setTimeout(() => fila.current.then(ok), 0)),
    []
  );

  // D02: gravação recusada pelo navegador (armazenamento cheio ou
  // bloqueado). Cada coleção responde por si: a casca do sistema mostra o
  // aviso enquanto alguma delas estiver sem conseguir gravar, e ele some
  // sozinho quando a gravação volta a funcionar.
  const [falhas, setFalhas] = useState(() => new Set());
  const gravar = useCallback((chave, valor) => {
    if (remoto) {
      if (!servidor.current) {
        // Sem a primeira leitura do banco não dá para saber o que mudou: em
        // vez de perder a alteração calado, avisa.
        if (falhouCarga.current && !silenciar.current) {
          toast.error('Não foi possível salvar', { id: 'sem-carga', description: 'Os dados do banco não carregaram. Recarregue a página.' });
        }
        return;
      }
      // No navegador as conquistas ficam em "conquistasMembro"; no banco, a
      // coleção se chama "conquistas" (ver lib/remoto.js).
      lote.current[chave === CHAVES.conquistas ? 'conquistas' : chave] = valor;
      if (!agendado.current) {
        agendado.current = true;
        // Junta as coleções que mudaram na mesma ação (uma exclusão em
        // cascata mexe em várias) e manda tudo de uma vez.
        setTimeout(() => {
          agendado.current = false;
          const pacote = lote.current;
          lote.current = {};
          pendentes.current += 1;
          fila.current = fila.current.then(() => enviar(pacote)).finally(() => {
            pendentes.current -= 1;
          });
        }, 0);
      }
      return;
    }
    // Na tela de login (sem conta e fora da demonstração) não há o que gravar.
    if (!modo) return;
    const ok = salvarColecao(chave, valor);
    setFalhas((atual) => {
      if (ok !== atual.has(chave)) return atual;
      const proximo = new Set(atual);
      if (ok) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }, [remoto, modo, enviar]);

  useEffect(() => gravar(CHAVES.grupos, grupos), [grupos, gravar]);
  useEffect(() => gravar(CHAVES.perfis, perfis), [perfis, gravar]);
  useEffect(() => gravar(CHAVES.membros, membros), [membros, gravar]);
  useEffect(() => gravar(CHAVES.disciplinas, disciplinas), [disciplinas, gravar]);
  useEffect(() => gravar(CHAVES.conteudos, conteudos), [conteudos, gravar]);
  useEffect(() => gravar(CHAVES.atividades, atividades), [atividades, gravar]);
  useEffect(() => gravar(CHAVES.conquistas, conquistas), [conquistas, gravar]);
  useEffect(() => gravar(CHAVES.eventos, eventos), [eventos, gravar]);

  // ----- A pessoa: perfil, espaço pessoal e os membros dela nos grupos -----
  // Com conta, a pessoa é a conta; na demonstração, o usuário fixo "demo".
  const meuUsuarioId = remoto ? usuario?.id || '' : USUARIO_DEMO;
  const perfil = useMemo(() => perfis.find((p) => p.id === meuUsuarioId) || null, [perfis, meuUsuarioId]);
  const meusMembros = useMemo(
    () => (meuUsuarioId ? membros.filter((m) => m.usuarioId === meuUsuarioId) : []),
    [membros, meuUsuarioId]
  );
  const meuMembroEm = useCallback(
    (grupoId) => meusMembros.find((m) => m.grupoId === grupoId) || null,
    [meusMembros]
  );
  // RF34: o espaço pessoal é um grupo só da pessoa (`pessoal`).
  const espacoPessoal = useMemo(() => {
    const ligado = perfil?.grupoPessoalId && grupos.find((g) => g.id === perfil.grupoPessoalId && g.pessoal);
    if (ligado) return ligado;
    const meus = new Set(meusMembros.map((m) => m.grupoId));
    return grupos.find((g) => g.pessoal && meus.has(g.id)) || null;
  }, [grupos, perfil, meusMembros]);
  const ehPessoal = useCallback((grupoId) => Boolean(grupos.find((g) => g.id === grupoId)?.pessoal), [grupos]);

  // RF35: o nome, o avatar e a foto do perfil valem em todos os grupos. Os
  // membros da pessoa acompanham o perfil; com conta, a foto nova só segue
  // para os grupos depois de subir para o Storage (até lá, é uma imagem
  // `data:` que só o perfil guarda).
  useEffect(() => {
    if (!perfil) return;
    const fotoPronta = !(remoto && ehFotoNova(perfil.foto));
    const diferente = (m) =>
      m.usuarioId === meuUsuarioId &&
      (m.nome !== perfil.nome ||
        (m.avatar || '') !== (perfil.avatar || '') ||
        m.estiloAvatar !== perfil.estiloAvatar ||
        (fotoPronta && (m.foto || '') !== (perfil.foto || '')));
    if (!membros.some(diferente)) return;
    setMembros((atual) =>
      atual.map((m) =>
        diferente(m)
          ? {
              ...m,
              nome: perfil.nome,
              avatar: perfil.avatar,
              estiloAvatar: perfil.estiloAvatar,
              ...(fotoPronta ? { foto: perfil.foto || '' } : {}),
            }
          : m
      )
    );
  }, [perfil, membros, meuUsuarioId, remoto]);

  // ----- Seletores por grupo (cada grupo só enxerga o que é dele, RN01) -----
  const membrosDoGrupo = useCallback(
    (grupoId) => membros.filter((m) => m.grupoId === grupoId),
    [membros]
  );
  const disciplinasDoGrupo = useCallback(
    (grupoId) => disciplinas.filter((d) => d.grupoId === grupoId),
    [disciplinas]
  );
  const conteudosDaDisciplina = useCallback(
    (disciplinaId) =>
      conteudos
        .filter((c) => c.disciplinaId === disciplinaId)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [conteudos]
  );
  // O conteúdo não guarda grupoId: o filtro atravessa conteudo -> disciplina -> grupo.
  const conteudosDoGrupo = useCallback(
    (grupoId) => {
      const idsDisciplinas = new Set(
        disciplinas.filter((d) => d.grupoId === grupoId).map((d) => d.id)
      );
      return conteudos.filter((c) => idsDisciplinas.has(c.disciplinaId));
    },
    [conteudos, disciplinas]
  );
  // Desde 11/11/2026 a atividade guarda o grupo (`grupoId`): no espaço
  // pessoal ela pode não ter disciplina (RN24).
  const atividadesDoGrupo = useCallback(
    (grupoId) => atividades.filter((a) => a.grupoId === grupoId),
    [atividades]
  );

  // RF34: o espaço pessoal mostra as atividades pessoais e as dos grupos que
  // estão com a pessoa ("só as minhas"); os eventos, os do espaço e os de
  // todos os grupos dela. Num grupo, só o que é do grupo.
  const atividadesDoEspaco = useCallback(
    (grupoId) => {
      if (!ehPessoal(grupoId)) return atividades.filter((a) => a.grupoId === grupoId);
      const meus = new Set(meusMembros.map((m) => m.id));
      return atividades.filter((a) => a.grupoId === grupoId || meus.has(a.responsavelId));
    },
    [atividades, ehPessoal, meusMembros]
  );
  const gruposDoEspaco = useCallback(
    (grupoId) => {
      if (!ehPessoal(grupoId)) return new Set([grupoId]);
      return new Set([grupoId, ...meusMembros.map((m) => m.grupoId)]);
    },
    [ehPessoal, meusMembros]
  );
  // As disciplinas que aparecem nos filtros do espaço (no pessoal, também as
  // dos grupos da pessoa, porque as atividades e os eventos deles aparecem lá).
  const disciplinasDoEspaco = useCallback(
    (grupoId) => {
      const ids = gruposDoEspaco(grupoId);
      return disciplinas.filter((d) => ids.has(d.grupoId));
    },
    [disciplinas, gruposDoEspaco]
  );
  const atividadesDoConteudo = useCallback(
    (conteudoId) => atividades.filter((a) => a.conteudoId === conteudoId),
    [atividades]
  );
  const atividadesDaDisciplina = useCallback(
    (disciplinaId) => atividades.filter((a) => a.disciplinaId === disciplinaId),
    [atividades]
  );
  // Atividades da disciplina que não estão em conteúdo nenhum.
  const atividadesSemConteudo = useCallback(
    (disciplinaId) => atividades.filter((a) => a.disciplinaId === disciplinaId && !a.conteudoId),
    [atividades]
  );
  const ordenarEventos = (lista) =>
    lista.sort((a, b) => `${a.data} ${a.horaInicio || ''}`.localeCompare(`${b.data} ${b.horaInicio || ''}`));
  const eventosDoGrupo = useCallback(
    (grupoId) => ordenarEventos(eventos.filter((e) => e.grupoId === grupoId)),
    [eventos]
  );
  const eventosDoEspaco = useCallback(
    (grupoId) => {
      const ids = gruposDoEspaco(grupoId);
      return ordenarEventos(eventos.filter((e) => ids.has(e.grupoId)));
    },
    [eventos, gruposDoEspaco]
  );

  // ----- Grupos -----

  // RF01: quem cria o grupo vira o primeiro membro, como organizador (RN07).
  // O grupo nunca nasce sem ninguém para geri-lo. O nome, o avatar e a foto
  // desse membro são os do perfil (RF35); sem perfil, vem o nome informado.
  // A foto do grupo é opcional: sem ela, ele aparece com as iniciais do nome.
  const criarGrupo = useCallback(({ nome, descricao = '', criador = '', foto = '' }) => {
    const grupo = {
      id: novoId(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      foto: foto || '',
      pessoal: false,
      criadoEm: new Date().toISOString(),
    };
    setGrupos((atual) => [...atual, grupo]);

    let membro = null;
    const nomeDoCriador = perfil?.nome || criador.trim();
    if (nomeDoCriador) {
      membro = {
        id: novoId(),
        nome: nomeDoCriador,
        grupoId: grupo.id,
        // Quem cria fica ligado ao grupo pela própria conta (RF27).
        usuarioId: meuUsuarioId,
        funcao: '',
        email: usuario?.email || '',
        avatar: perfil?.avatar || novaSeedAvatar(),
        estiloAvatar: perfil?.estiloAvatar || ESTILO_AVATAR_PADRAO,
        foto: perfil && !(remoto && ehFotoNova(perfil.foto)) ? perfil.foto || '' : '',
        perfil: PERFIL.ORGANIZADOR,
      };
      setMembros((atual) => [...atual, membro]);
    }
    return { grupo, membro };
  }, [usuario, perfil, meuUsuarioId, remoto]);

  // RF34, no modo de demonstração: o espaço pessoal e o perfil nascem aqui
  // (com conta, quem cria os dois é o banco).
  const criarEspacoPessoal = useCallback(
    ({ nome }) => {
      const grupo = { id: novoId(), nome: 'Pessoal', descricao: '', foto: '', pessoal: true, criadoEm: new Date().toISOString() };
      const membro = {
        id: novoId(),
        nome: nome.trim(),
        grupoId: grupo.id,
        usuarioId: meuUsuarioId,
        funcao: '',
        email: '',
        avatar: novaSeedAvatar(),
        estiloAvatar: ESTILO_AVATAR_PADRAO,
        foto: '',
        perfil: PERFIL.ORGANIZADOR,
      };
      const novoPerfil = {
        id: meuUsuarioId,
        nome: membro.nome,
        avatar: membro.avatar,
        estiloAvatar: membro.estiloAvatar,
        foto: '',
        lembreteEmail: false,
        grupoPessoalId: grupo.id,
      };
      setGrupos((atual) => [...atual, grupo]);
      setMembros((atual) => [...atual, membro]);
      setPerfis([novoPerfil]);
      return { grupo, membro };
    },
    [meuUsuarioId]
  );

  // RF35: nome, avatar, foto e lembrete por e-mail.
  const salvarPerfil = useCallback(
    (dados) => {
      setPerfis((atual) => atual.map((p) => (p.id === meuUsuarioId ? { ...p, ...dados } : p)));
    },
    [meuUsuarioId]
  );

  // Demonstração: "Quem é você?" marca o membro escolhido como a pessoa (e
  // desmarca quem estava marcado antes no mesmo grupo).
  const vincularMembro = useCallback(
    (membroId) => {
      setMembros((atual) => {
        const alvo = atual.find((m) => m.id === membroId);
        if (!alvo) return atual;
        return atual.map((m) => {
          if (m.id === membroId) return { ...m, usuarioId: meuUsuarioId };
          if (m.grupoId === alvo.grupoId && m.usuarioId === meuUsuarioId) return { ...m, usuarioId: '' };
          return m;
        });
      });
    },
    [meuUsuarioId]
  );

  // Nome, descrição e foto do grupo. Só o organizador chega aqui (RN07).
  const atualizarGrupo = useCallback((id, dados) => {
    setGrupos((atual) => atual.map((g) => (g.id === id ? { ...g, ...dados } : g)));
  }, []);

  // RN02: exclui um grupo e, em cascata, disciplinas, conteúdos, atividades,
  // eventos, membros e as conquistas desses membros.
  const removerGrupo = useCallback(
    (id) => {
      if (grupos.find((g) => g.id === id)?.pessoal) return;
      const idsDisciplinas = new Set(
        disciplinas.filter((d) => d.grupoId === id).map((d) => d.id)
      );
      const idsConteudos = new Set(
        conteudos.filter((c) => idsDisciplinas.has(c.disciplinaId)).map((c) => c.id)
      );
      const idsMembros = new Set(membros.filter((m) => m.grupoId === id).map((m) => m.id));

      setGrupos((atual) => atual.filter((g) => g.id !== id));
      setMembros((atual) => atual.filter((m) => m.grupoId !== id));
      setDisciplinas((atual) => atual.filter((d) => !idsDisciplinas.has(d.id)));
      setConteudos((atual) => atual.filter((c) => !idsConteudos.has(c.id)));
      setAtividades((atual) => atual.filter((a) => a.grupoId !== id && !idsDisciplinas.has(a.disciplinaId)));
      setEventos((atual) => atual.filter((e) => e.grupoId !== id));
      setConquistas((atual) => atual.filter((c) => !idsMembros.has(c.membroId)));
    },
    [grupos, disciplinas, conteudos, membros]
  );

  // ----- Membros -----
  const criarMembro = useCallback(
    ({ nome, grupoId, funcao = '', email = '', avatar = '', estiloAvatar = '', foto = '', perfil }) => {
      // RN07: o primeiro membro de um grupo vazio é sempre o organizador
      // (defeito D01). Os seguintes entram com o perfil escolhido.
      const primeiroDoGrupo = !membros.some((m) => m.grupoId === grupoId);

      const membro = {
        id: novoId(),
        nome: nome.trim(),
        grupoId,
        funcao: funcao.trim(),
        email: email.trim(),
        avatar: (avatar || novaSeedAvatar()).trim(),
        estiloAvatar: estiloAvatarValido(estiloAvatar) ? estiloAvatar : ESTILO_AVATAR_PADRAO,
        foto: foto || '',
        perfil: primeiroDoGrupo ? PERFIL.ORGANIZADOR : perfil || PERFIL.PARTICIPANTE,
      };
      setMembros((atual) => [...atual, membro]);
      return membro;
    },
    [membros]
  );

  const atualizarMembro = useCallback((id, dados) => {
    setMembros((atual) => atual.map((m) => (m.id === id ? { ...m, ...dados } : m)));
  }, []);

  // RN02 (revisada): as atividades do membro removido passam para quem a
  // pessoa escolher. As conquistas dele saem junto (`membro_conquista` é
  // ON DELETE CASCADE).
  const removerMembro = useCallback((id, novoResponsavelId = '') => {
    setMembros((atual) => atual.filter((m) => m.id !== id));
    setAtividades((atual) =>
      atual.map((a) => (a.responsavelId === id ? { ...a, responsavelId: novoResponsavelId } : a))
    );
    setConquistas((atual) => atual.filter((c) => c.membroId !== id));
  }, []);

  // ----- Disciplinas -----
  const criarDisciplina = useCallback(({ nome, grupoId, cor = COR_DISCIPLINA_PADRAO }) => {
    const disciplina = {
      id: novoId(),
      nome: (nome || '').trim(),
      cor: cor || COR_DISCIPLINA_PADRAO,
      grupoId,
      criadaEm: new Date().toISOString(),
    };
    setDisciplinas((atual) => [...atual, disciplina]);
    return disciplina;
  }, []);

  const atualizarDisciplina = useCallback((id, dados) => {
    setDisciplinas((atual) => atual.map((d) => (d.id === id ? { ...d, ...dados } : d)));
  }, []);

  // RN02: excluir a disciplina leva junto seus conteúdos e atividades. Os
  // eventos ligados a ela continuam, só que sem disciplina: uma prova
  // marcada não deixa de existir porque a disciplina saiu do grupo.
  const removerDisciplina = useCallback((id) => {
    setDisciplinas((atual) => atual.filter((d) => d.id !== id));
    setConteudos((atual) => atual.filter((c) => c.disciplinaId !== id));
    setAtividades((atual) => atual.filter((a) => a.disciplinaId !== id));
    setEventos((atual) => atual.map((e) => (e.disciplinaId === id ? { ...e, disciplinaId: '' } : e)));
  }, []);

  const obterDisciplina = useCallback(
    (id) => disciplinas.find((d) => d.id === id) || null,
    [disciplinas]
  );

  // ----- Conteúdos -----
  const criarConteudo = useCallback(
    ({ nome, descricao = '', disciplinaId }) => {
      const ultimaOrdem = conteudos
        .filter((c) => c.disciplinaId === disciplinaId)
        .reduce((maior, c) => Math.max(maior, c.ordem ?? 0), -1);

      const conteudo = {
        id: novoId(),
        nome: (nome || '').trim(),
        descricao: (descricao || '').trim(),
        disciplinaId,
        ordem: ultimaOrdem + 1,
      };
      setConteudos((atual) => [...atual, conteudo]);
      return conteudo;
    },
    [conteudos]
  );

  const atualizarConteudo = useCallback((id, dados) => {
    setConteudos((atual) => atual.map((c) => (c.id === id ? { ...c, ...dados } : c)));
  }, []);

  // RN13 (revisada em 06/11/2026): o conteúdo é opcional: excluir um
  // conteúdo não apaga as atividades dele, elas ficam direto na disciplina.
  const removerConteudo = useCallback((id) => {
    setConteudos((atual) => atual.filter((c) => c.id !== id));
    setAtividades((atual) => atual.map((a) => (a.conteudoId === id ? { ...a, conteudoId: '' } : a)));
  }, []);

  const obterConteudo = useCallback(
    (id) => conteudos.find((c) => c.id === id) || null,
    [conteudos]
  );

  const moverConteudo = useCallback((id, direcao) => {
    setConteudos((atual) => {
      const alvo = atual.find((c) => c.id === id);
      if (!alvo) return atual;

      const irmaos = atual
        .filter((c) => c.disciplinaId === alvo.disciplinaId)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

      const posicao = irmaos.findIndex((c) => c.id === id);
      const vizinho = irmaos[posicao + (direcao === 'cima' ? -1 : 1)];
      if (!vizinho) return atual;

      return atual.map((c) => {
        if (c.id === alvo.id) return { ...c, ordem: vizinho.ordem };
        if (c.id === vizinho.id) return { ...c, ordem: alvo.ordem };
        return c;
      });
    });
  }, []);

  // ----- Atividades -----
  // A disciplina é obrigatória nos grupos e opcional no espaço pessoal
  // (RN24); o conteúdo, sempre opcional. Se vier só o conteúdo, a disciplina
  // sai dele; se vier só a disciplina, o grupo sai dela.
  const disciplinaDe = useCallback(
    (dados) => dados.disciplinaId || conteudos.find((c) => c.id === dados.conteudoId)?.disciplinaId || '',
    [conteudos]
  );

  const montarAtividade = useCallback(
    (dados) => {
      const disciplinaId = disciplinaDe(dados);
      const grupoId = dados.grupoId || disciplinas.find((d) => d.id === disciplinaId)?.grupoId || '';
      const pessoal = grupos.find((g) => g.id === grupoId)?.pessoal;
      // No espaço pessoal, a atividade é sempre da própria pessoa.
      const responsavelId = pessoal ? meuMembroEm(grupoId)?.id || '' : dados.responsavelId || '';
      // RN06: sem responsável, a atividade fica em "a fazer".
      const status = responsavelId ? dados.status || STATUS.A_FAZER : STATUS.A_FAZER;
      return {
        id: novoId(),
        grupoId,
        titulo: (dados.titulo || '').trim(),
        descricao: (dados.descricao || '').trim(),
        disciplinaId,
        conteudoId: dados.conteudoId || '',
        prazo: dados.prazo || '',
        peso: normalizarPeso(dados.peso),
        status,
        prioridade: dados.prioridade || '',
        responsavelId,
        criadaEm: new Date().toISOString(),
        dataConclusao: status === STATUS.CONCLUIDO ? new Date().toISOString() : null,
      };
    },
    [disciplinaDe, disciplinas, grupos, meuMembroEm]
  );

  const criarAtividade = useCallback(
    (dados) => {
      const atividade = montarAtividade(dados);
      setAtividades((atual) => [...atual, atividade]);
      return atividade;
    },
    [montarAtividade]
  );

  // RF37: várias atividades de uma vez (cadastro em lote).
  const criarAtividades = useCallback(
    (lista) => {
      const novas = lista.map(montarAtividade);
      setAtividades((atual) => [...atual, ...novas]);
      return novas;
    },
    [montarAtividade]
  );

  // RF37: troca o responsável de várias atividades de uma vez. As concluídas
  // ficam como estão (a experiência é de quem fez, RN10); "A definir" só vale
  // para as que ainda estão em "a fazer" (RN06). Devolve quantas mudaram.
  const definirResponsavel = useCallback((ids, responsavelId) => {
    const alvo = new Set(ids);
    const podeMudar = (a) =>
      alvo.has(a.id) &&
      a.status !== STATUS.CONCLUIDO &&
      (responsavelId || a.status === STATUS.A_FAZER) &&
      a.responsavelId !== responsavelId;
    const mudam = atividades.filter(podeMudar).length;
    setAtividades((atual) => atual.map((a) => (podeMudar(a) ? { ...a, responsavelId } : a)));
    return mudam;
  }, [atividades]);

  // RF38: assumir uma atividade "A definir" (RN06).
  const assumirAtividade = useCallback(
    (id) => {
      const atividade = atividades.find((a) => a.id === id);
      const eu = atividade && meuMembroEm(atividade.grupoId);
      if (!eu || atividade.responsavelId) return false;
      setAtividades((atual) => atual.map((a) => (a.id === id && !a.responsavelId ? { ...a, responsavelId: eu.id } : a)));
      return true;
    },
    [atividades, meuMembroEm]
  );

  const atualizarAtividade = useCallback((id, dados) => {
    const pessoais = new Set(grupos.filter((g) => g.pessoal).map((g) => g.id));
    const disciplinaNova = dados.conteudoId !== undefined || dados.disciplinaId !== undefined ? disciplinaDe(dados) : null;
    setAtividades((atual) =>
      atual.map((a) => {
        if (a.id !== id) return a;

        const atualizada = { ...a, ...dados, grupoId: a.grupoId };
        // No espaço pessoal, a responsável é sempre a dona do espaço (RN24).
        if (pessoais.has(a.grupoId)) atualizada.responsavelId = a.responsavelId;
        if (dados.disciplinaId !== undefined || dados.conteudoId !== undefined) atualizada.disciplinaId = disciplinaNova || '';
        if (dados.conteudoId !== undefined) atualizada.conteudoId = dados.conteudoId || '';
        if (dados.peso !== undefined) {
          atualizada.peso = normalizarPeso(dados.peso);
        }

        // `dataConclusao` acompanha o status: é gravada quando a atividade
        // passa a concluída e apagada quando deixa de ser. É dela que sai a
        // ofensiva (RN11).
        const eraConcluida = a.status === STATUS.CONCLUIDO;
        const ficouConcluida = atualizada.status === STATUS.CONCLUIDO;
        if (!eraConcluida && ficouConcluida) {
          atualizada.dataConclusao = new Date().toISOString();
        } else if (eraConcluida && !ficouConcluida) {
          atualizada.dataConclusao = null;
        }

        return atualizada;
      })
    );
  }, [disciplinaDe, grupos]);

  const removerAtividade = useCallback((id) => {
    setAtividades((atual) => atual.filter((a) => a.id !== id));
  }, []);

  const obterAtividade = useCallback(
    (id) => atividades.find((a) => a.id === id) || null,
    [atividades]
  );

  // ----- Eventos (RF31) -----
  const montarEvento = (dados) => ({
    titulo: (dados.titulo || '').trim(),
    tipo: tipoEventoValido(dados.tipo) ? dados.tipo : TIPO_EVENTO.OUTRO,
    data: dados.data || '',
    // Evento de vários dias: o último dia. Vazio (ou igual ao primeiro) = um dia só.
    dataFim: dados.dataFim && dados.dataFim > (dados.data || '') ? dados.dataFim : '',
    // Sem horário = o dia todo.
    horaInicio: dados.horaInicio || '',
    horaFim: dados.horaInicio ? dados.horaFim || '' : '',
    local: (dados.local || '').trim(),
    disciplinaId: dados.disciplinaId || '',
    descricao: (dados.descricao || '').trim(),
  });

  const criarEvento = useCallback((dados) => {
    const evento = {
      id: novoId(),
      grupoId: dados.grupoId,
      ...montarEvento(dados),
      criadoPor: dados.criadoPor || '',
      criadoEm: new Date().toISOString(),
    };
    setEventos((atual) => [...atual, evento]);
    return evento;
  }, []);

  const atualizarEvento = useCallback((id, dados) => {
    setEventos((atual) => atual.map((e) => (e.id === id ? { ...e, ...montarEvento({ ...e, ...dados }) } : e)));
  }, []);

  const removerEvento = useCallback((id) => {
    setEventos((atual) => atual.filter((e) => e.id !== id));
  }, []);

  const obterEvento = useCallback((id) => eventos.find((e) => e.id === id) || null, [eventos]);

  // ----- Progresso (RN08, RN14) -----
  const progressoDoConteudo = useCallback(
    (conteudoId) =>
      calcularProgressoDoConteudo(atividades.filter((a) => a.conteudoId === conteudoId)),
    [atividades]
  );

  // O progresso de onde a atividade está: o conteúdo, se ela tiver um, ou a
  // disciplina, se não tiver.
  const progressoAntesDe = useCallback(
    (atividade) =>
      calcularProgressoAntesDe(
        atividade?.conteudoId
          ? atividades.filter((a) => a.conteudoId === atividade.conteudoId)
          : atividades.filter((a) => a.disciplinaId === atividade?.disciplinaId),
        atividade?.id
      ),
    [atividades]
  );

  // RN14: soma os pesos de todas as atividades da disciplina, estejam ou não
  // num conteúdo. As sem conteúdo entram como mais um bloco da soma.
  const progressoDaDisciplina = useCallback(
    (disciplinaId) => {
      const daDisciplina = atividades.filter((a) => a.disciplinaId === disciplinaId);
      const atividadesPorConteudo = conteudos
        .filter((c) => c.disciplinaId === disciplinaId)
        .map((c) => daDisciplina.filter((a) => a.conteudoId === c.id));
      atividadesPorConteudo.push(daDisciplina.filter((a) => !a.conteudoId));
      return calcularProgressoDaDisciplina(atividadesPorConteudo);
    },
    [atividades, conteudos]
  );

  // ----- Experiência, ofensiva e conquistas (RN10, RN11, RN12) -----
  const grupoDoMembro = useCallback(
    (membroId) => membros.find((m) => m.id === membroId)?.grupoId ?? null,
    [membros]
  );

  const xpDoMembro = useCallback(
    (membroId) => {
      const grupoId = grupoDoMembro(membroId);
      return grupoId ? calcularXpDoMembro(membroId, atividadesDoGrupo(grupoId)) : 0;
    },
    [grupoDoMembro, atividadesDoGrupo]
  );

  const ofensivaDoMembro = useCallback(
    (membroId) => {
      const grupoId = grupoDoMembro(membroId);
      return grupoId ? calcularOfensiva(membroId, atividadesDoGrupo(grupoId)) : 0;
    },
    [grupoDoMembro, atividadesDoGrupo]
  );

  const ultimosDiasDoMembro = useCallback(
    (membroId, quantidade = 7) => {
      const grupoId = grupoDoMembro(membroId);
      return calcularUltimosDias(membroId, grupoId ? atividadesDoGrupo(grupoId) : [], quantidade);
    },
    [grupoDoMembro, atividadesDoGrupo]
  );

  const conquistasDoMembro = useCallback(
    (membroId) =>
      conquistas
        .filter((c) => c.membroId === membroId)
        .sort((a, b) => String(b.obtidaEm).localeCompare(String(a.obtidaEm))),
    [conquistas]
  );

  // RF34: no espaço pessoal, a experiência, a ofensiva e as conquistas são
  // da pessoa em todos os grupos: as atividades dos membros dela contam como
  // de uma pessoa só.
  const atividadesDaConta = useMemo(() => {
    const meus = new Set(meusMembros.map((m) => m.id));
    return atividades.filter((a) => meus.has(a.responsavelId)).map((a) => ({ ...a, responsavelId: EU }));
  }, [atividades, meusMembros]);
  const xpDaConta = useMemo(() => calcularXpDoMembro(EU, atividadesDaConta), [atividadesDaConta]);
  const ofensivaDaConta = useMemo(() => calcularOfensiva(EU, atividadesDaConta), [atividadesDaConta]);
  const ultimosDiasDaConta = useCallback(
    (quantidade = 7) => calcularUltimosDias(EU, atividadesDaConta, quantidade),
    [atividadesDaConta]
  );
  // Cada conquista uma vez só, com a data da primeira vez que saiu.
  const conquistasDaConta = useMemo(() => {
    const meus = new Set(meusMembros.map((m) => m.id));
    const porCodigo = new Map();
    conquistas
      .filter((c) => meus.has(c.membroId))
      .forEach((c) => {
        const atual = porCodigo.get(c.codigo);
        if (!atual || String(c.obtidaEm) < String(atual.obtidaEm)) porCodigo.set(c.codigo, c);
      });
    return [...porCodigo.values()].sort((a, b) => String(b.obtidaEm).localeCompare(String(a.obtidaEm)));
  }, [conquistas, meusMembros]);

  const rankingDoGrupo = useCallback(
    (grupoId) =>
      calcularRankingDoGrupo(membrosDoGrupo(grupoId), atividadesDoGrupo(grupoId)).map((linha) => ({
        ...linha,
        ofensiva: calcularOfensiva(linha.membro.id, atividadesDoGrupo(grupoId)),
        conquistas: conquistas.filter((c) => c.membroId === linha.membro.id),
      })),
    [membrosDoGrupo, atividadesDoGrupo, conquistas]
  );

  // RN12: concessão e retirada das conquistas. A cada mudança nas
  // atividades, confere os marcos de cada membro, grava o que ainda não
  // tinha sido concedido e retira o que a pessoa perdeu junto com a
  // experiência (revisão de 11/11/2026): concluir por engano e desfazer não
  // deixa a conquista para trás.
  //
  // As mudanças feitas por ações da pessoa vão para `novasConquistas` e
  // `conquistasRetiradas`, que a casca do sistema transforma em aviso. As da
  // carga inicial (abrir o sistema, importar o exemplo) entram em silêncio.
  const [novasConquistas, setNovasConquistas] = useState([]);
  const [conquistasRetiradas, setConquistasRetiradas] = useState([]);

  // Conquistas já concedidas. Fica num ref, atualizado na hora, para a mesma
  // conquista nunca ser concedida duas vezes, nem quando o React roda o
  // efeito em dobro no modo de desenvolvimento.
  if (concedidas.current === null) {
    concedidas.current = conquistas.map(({ membroId, codigo }) => ({ membroId, codigo }));
  }
  // As atividades da conferência anterior, para saber quem perdeu conclusão.
  const anteriores = useRef(null);

  useEffect(() => {
    const contexto = (grupoId, lista) => ({
      atividades: lista.filter((a) => a.grupoId === grupoId),
      conteudos: conteudosDoGrupo(grupoId),
    });
    // Com conta, cada pessoa grava só as próprias conquistas (o banco não
    // deixa gravar nem apagar a de outro membro). As dos colegas aparecem
    // quando eles abrem o sistema e o mesmo cálculo roda para eles.
    const minhas = remoto ? new Set(meusMembros.map((m) => m.id)) : null;
    const conta = (membroId) => !minhas || minhas.has(membroId);
    const grupoDe = new Map(membros.map((m) => [m.id, m.grupoId]));

    // Retirada: quem perdeu alguma conclusão desde a última conferência.
    const retiradas = [];
    if (anteriores.current) {
      const antes = concluidasPorMembro(anteriores.current);
      const agora = concluidasPorMembro(atividades);
      antes.forEach((ids, membroId) => {
        const grupoId = grupoDe.get(membroId);
        if (!grupoId || !conta(membroId)) return;
        const continua = agora.get(membroId) || new Set();
        if ([...ids].every((id) => continua.has(id))) return;
        conquistasPerdidas(membroId, contexto(grupoId, anteriores.current), contexto(grupoId, atividades)).forEach(
          (codigo) => {
            if (concedidas.current.some((c) => c.membroId === membroId && c.codigo === codigo)) {
              retiradas.push({ membroId, codigo });
            }
          }
        );
      });
    }
    anteriores.current = atividades;
    if (retiradas.length > 0) {
      const sai = (c) => retiradas.some((r) => r.membroId === c.membroId && r.codigo === c.codigo);
      concedidas.current = concedidas.current.filter((c) => !sai(c));
      setConquistas((atual) => atual.filter((c) => !sai(c)));
      if (!silenciar.current) setConquistasRetiradas((fila) => [...fila, ...retiradas]);
    }

    // Concessão.
    const alcancadas = [];
    grupos.forEach((grupo) => {
      const doGrupo = contexto(grupo.id, atividades);
      membrosDoGrupo(grupo.id).forEach((membro) => {
        if (!conta(membro.id)) return;
        alcancadas.push({ membroId: membro.id, codigos: conquistasAlcancadas(membro.id, doGrupo) });
      });
    });
    const novas = conquistasNovas(concedidas.current, alcancadas);
    concedidas.current.push(...novas);

    if (novas.length > 0) {
      setConquistas((atual) => [...atual, ...novas]);
      if (!silenciar.current) setNovasConquistas((fila) => [...fila, ...novas]);
    }
    silenciar.current = false;
    // Os seletores mudam junto com as coleções listadas: a conferência roda
    // quando atividades, membros ou grupos mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atividades, membros, grupos]);

  const consumirNovasConquistas = useCallback(() => setNovasConquistas([]), []);
  const consumirConquistasRetiradas = useCallback(() => setConquistasRetiradas([]), []);

  const falhaGravacao = falhas.size > 0;

  // Disciplina e conteúdo (se houver) da atividade.
  const trilhaDaAtividade = useCallback(
    (atividade) => {
      const conteudo = (atividade?.conteudoId && conteudos.find((c) => c.id === atividade.conteudoId)) || null;
      const disciplinaId = atividade?.disciplinaId || conteudo?.disciplinaId;
      const disciplina = disciplinas.find((d) => d.id === disciplinaId) || null;
      return { conteudo, disciplina };
    },
    [conteudos, disciplinas]
  );

  // Importa um pacote pronto (os dados de exemplo da demonstração). O grupo
  // é opcional: as atividades do dia a dia vão para o espaço pessoal.
  const importarExemplo = useCallback(
    ({ grupo = null, membros: ms = [], disciplinas: ds = [], conteudos: cs = [], atividades: ts = [], eventos: es = [] }) => {
      silenciar.current = true;
      if (grupo) setGrupos((atual) => [...atual, grupo]);
      setMembros((atual) => [...atual, ...ms]);
      setDisciplinas((atual) => [...atual, ...ds]);
      setConteudos((atual) => [...atual, ...cs]);
      setAtividades((atual) => [...atual, ...ts]);
      setEventos((atual) => [...atual, ...es]);
      return grupo;
    },
    []
  );

  const valor = useMemo(
    () => ({
      modo,
      carregando,
      recarregar,
      aguardarGravacao,
      grupos,
      perfis,
      perfil,
      meuUsuarioId,
      meusMembros,
      meuMembroEm,
      espacoPessoal,
      ehPessoal,
      membros,
      disciplinas,
      conteudos,
      atividades,
      eventos,
      conquistas,
      falhaGravacao,
      criarGrupo,
      criarEspacoPessoal,
      salvarPerfil,
      vincularMembro,
      atualizarGrupo,
      removerGrupo,
      criarMembro,
      atualizarMembro,
      removerMembro,
      criarDisciplina,
      atualizarDisciplina,
      removerDisciplina,
      obterDisciplina,
      criarConteudo,
      atualizarConteudo,
      removerConteudo,
      obterConteudo,
      moverConteudo,
      criarAtividade,
      criarAtividades,
      definirResponsavel,
      assumirAtividade,
      atualizarAtividade,
      removerAtividade,
      obterAtividade,
      criarEvento,
      atualizarEvento,
      removerEvento,
      obterEvento,
      eventosDoGrupo,
      eventosDoEspaco,
      atividadesDoEspaco,
      disciplinasDoEspaco,
      atividadesSemConteudo,
      membrosDoGrupo,
      disciplinasDoGrupo,
      conteudosDaDisciplina,
      conteudosDoGrupo,
      atividadesDoGrupo,
      atividadesDoConteudo,
      atividadesDaDisciplina,
      trilhaDaAtividade,
      progressoDoConteudo,
      progressoDaDisciplina,
      progressoAntesDe,
      xpDoMembro,
      ofensivaDoMembro,
      ultimosDiasDoMembro,
      conquistasDoMembro,
      xpDaConta,
      ofensivaDaConta,
      ultimosDiasDaConta,
      conquistasDaConta,
      rankingDoGrupo,
      novasConquistas,
      consumirNovasConquistas,
      conquistasRetiradas,
      consumirConquistasRetiradas,
      importarExemplo,
    }),
    [
      modo,
      carregando,
      recarregar,
      aguardarGravacao,
      grupos,
      perfis,
      perfil,
      meuUsuarioId,
      meusMembros,
      meuMembroEm,
      espacoPessoal,
      ehPessoal,
      membros,
      disciplinas,
      conteudos,
      atividades,
      eventos,
      conquistas,
      falhaGravacao,
      criarGrupo,
      criarEspacoPessoal,
      salvarPerfil,
      vincularMembro,
      atualizarGrupo,
      removerGrupo,
      criarMembro,
      atualizarMembro,
      removerMembro,
      criarDisciplina,
      atualizarDisciplina,
      removerDisciplina,
      obterDisciplina,
      criarConteudo,
      atualizarConteudo,
      removerConteudo,
      obterConteudo,
      moverConteudo,
      criarAtividade,
      criarAtividades,
      definirResponsavel,
      assumirAtividade,
      atualizarAtividade,
      removerAtividade,
      obterAtividade,
      criarEvento,
      atualizarEvento,
      removerEvento,
      obterEvento,
      eventosDoGrupo,
      eventosDoEspaco,
      atividadesDoEspaco,
      disciplinasDoEspaco,
      atividadesSemConteudo,
      membrosDoGrupo,
      disciplinasDoGrupo,
      conteudosDaDisciplina,
      conteudosDoGrupo,
      atividadesDoGrupo,
      atividadesDoConteudo,
      atividadesDaDisciplina,
      trilhaDaAtividade,
      progressoDoConteudo,
      progressoDaDisciplina,
      progressoAntesDe,
      xpDoMembro,
      ofensivaDoMembro,
      ultimosDiasDoMembro,
      conquistasDoMembro,
      xpDaConta,
      ofensivaDaConta,
      ultimosDiasDaConta,
      conquistasDaConta,
      rankingDoGrupo,
      novasConquistas,
      consumirNovasConquistas,
      conquistasRetiradas,
      consumirConquistasRetiradas,
      importarExemplo,
    ]
  );

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData precisa ser usado dentro de <DataProvider>.');
  }
  return ctx;
}
