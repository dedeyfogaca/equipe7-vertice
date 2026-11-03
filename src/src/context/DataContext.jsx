import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CHAVES, lerColecao, novoId, salvarColecao } from '../lib/storage.js';
import { COR_DISCIPLINA_PADRAO, normalizarPeso, PERFIL, STATUS } from '../lib/constants.js';
import {
  progressoAntesDe as calcularProgressoAntesDe,
  progressoDaDisciplina as calcularProgressoDaDisciplina,
  progressoDoConteudo as calcularProgressoDoConteudo,
} from '../lib/progresso.js';
import {
  conquistasAlcancadas,
  conquistasNovas,
  ofensivaDoMembro as calcularOfensiva,
  rankingDoGrupo as calcularRankingDoGrupo,
  ultimosDias as calcularUltimosDias,
  xpDoMembro as calcularXpDoMembro,
} from '../lib/gamificacao.js';
import { ESTILO_AVATAR_PADRAO, estiloAvatarValido, novaSeedAvatar } from '../lib/avatar.js';

// Guarda as coleções (grupos, membros, disciplinas, conteúdos, atividades e
// conquistas) e expõe as operações de cadastro, edição e exclusão. Tudo fica
// em useState e é espelhado no armazenamento do navegador por useEffect, então
// recarregar a página não perde nada.
//
// Esta é a camada que troca quando o sistema passar a ter banco de dados: as
// telas só conhecem estas funções, não o armazenamento.
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [grupos, setGrupos] = useState(() => lerColecao(CHAVES.grupos));
  const [membros, setMembros] = useState(() => lerColecao(CHAVES.membros));
  const [disciplinas, setDisciplinas] = useState(() => lerColecao(CHAVES.disciplinas));
  const [conteudos, setConteudos] = useState(() => lerColecao(CHAVES.conteudos));
  const [atividades, setAtividades] = useState(() => lerColecao(CHAVES.atividades));
  const [conquistas, setConquistas] = useState(() => lerColecao(CHAVES.conquistas));

  // D02 — gravação recusada pelo navegador (armazenamento cheio ou
  // bloqueado). Cada coleção responde por si: a casca do sistema mostra o
  // aviso enquanto alguma delas estiver sem conseguir gravar, e ele some
  // sozinho quando a gravação volta a funcionar.
  const [falhas, setFalhas] = useState(() => new Set());
  const gravar = useCallback((chave, valor) => {
    const ok = salvarColecao(chave, valor);
    setFalhas((atual) => {
      if (ok !== atual.has(chave)) return atual;
      const proximo = new Set(atual);
      if (ok) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }, []);

  useEffect(() => gravar(CHAVES.grupos, grupos), [grupos, gravar]);
  useEffect(() => gravar(CHAVES.membros, membros), [membros, gravar]);
  useEffect(() => gravar(CHAVES.disciplinas, disciplinas), [disciplinas, gravar]);
  useEffect(() => gravar(CHAVES.conteudos, conteudos), [conteudos, gravar]);
  useEffect(() => gravar(CHAVES.atividades, atividades), [atividades, gravar]);
  useEffect(() => gravar(CHAVES.conquistas, conquistas), [conquistas, gravar]);

  // ----- Seletores por grupo (cada grupo só enxerga o que é dele — RN01) -----
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
  // A atividade também não guarda grupoId: atividade -> conteudo -> disciplina -> grupo.
  const atividadesDoGrupo = useCallback(
    (grupoId) => {
      const idsDisciplinas = new Set(
        disciplinas.filter((d) => d.grupoId === grupoId).map((d) => d.id)
      );
      const idsConteudos = new Set(
        conteudos.filter((c) => idsDisciplinas.has(c.disciplinaId)).map((c) => c.id)
      );
      return atividades.filter((a) => idsConteudos.has(a.conteudoId));
    },
    [atividades, conteudos, disciplinas]
  );
  const atividadesDoConteudo = useCallback(
    (conteudoId) => atividades.filter((a) => a.conteudoId === conteudoId),
    [atividades]
  );
  const atividadesDaDisciplina = useCallback(
    (disciplinaId) => {
      const idsConteudos = new Set(
        conteudos.filter((c) => c.disciplinaId === disciplinaId).map((c) => c.id)
      );
      return atividades.filter((a) => idsConteudos.has(a.conteudoId));
    },
    [atividades, conteudos]
  );

  // ----- Grupos -----

  // RF01 — quem cria o grupo informa o próprio nome e vira o primeiro membro,
  // como organizador (RN07). O grupo nunca nasce sem ninguém para geri-lo.
  // A foto é opcional: sem ela, o grupo aparece com as iniciais do nome.
  const criarGrupo = useCallback(({ nome, descricao = '', criador = '', foto = '' }) => {
    const grupo = {
      id: novoId(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      foto: foto || '',
      criadoEm: new Date().toISOString(),
    };
    setGrupos((atual) => [...atual, grupo]);

    let membro = null;
    if (criador.trim()) {
      membro = {
        id: novoId(),
        nome: criador.trim(),
        grupoId: grupo.id,
        funcao: '',
        email: '',
        avatar: novaSeedAvatar(),
        estiloAvatar: ESTILO_AVATAR_PADRAO,
        foto: '',
        perfil: PERFIL.ORGANIZADOR,
      };
      setMembros((atual) => [...atual, membro]);
    }
    return { grupo, membro };
  }, []);

  // Nome, descrição e foto do grupo. Só o organizador chega aqui (RN07).
  const atualizarGrupo = useCallback((id, dados) => {
    setGrupos((atual) => atual.map((g) => (g.id === id ? { ...g, ...dados } : g)));
  }, []);

  // RN02 — exclui um grupo e, em cascata, disciplinas, conteúdos, atividades,
  // membros e as conquistas desses membros.
  const removerGrupo = useCallback(
    (id) => {
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
      setAtividades((atual) => atual.filter((a) => !idsConteudos.has(a.conteudoId)));
      setConquistas((atual) => atual.filter((c) => !idsMembros.has(c.membroId)));
    },
    [disciplinas, conteudos, membros]
  );

  // ----- Membros -----
  const criarMembro = useCallback(
    ({ nome, grupoId, funcao = '', email = '', avatar = '', estiloAvatar = '', foto = '', perfil }) => {
      // RN07 — o primeiro membro de um grupo vazio é sempre o organizador
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

  // RN02 (revisada) — como toda atividade precisa de responsável (RN06), as
  // atividades do membro removido passam para quem a pessoa escolher. As
  // conquistas dele saem junto (`membro_conquista` é ON DELETE CASCADE).
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

  // RN02 — excluir a disciplina leva junto seus conteúdos e as atividades deles.
  const removerDisciplina = useCallback(
    (id) => {
      const idsConteudos = new Set(
        conteudos.filter((c) => c.disciplinaId === id).map((c) => c.id)
      );
      setDisciplinas((atual) => atual.filter((d) => d.id !== id));
      setConteudos((atual) => atual.filter((c) => !idsConteudos.has(c.id)));
      setAtividades((atual) => atual.filter((a) => !idsConteudos.has(a.conteudoId)));
    },
    [conteudos]
  );

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

  // RN13 — não se exclui conteúdo deixando atividade solta.
  const removerConteudo = useCallback((id) => {
    setConteudos((atual) => atual.filter((c) => c.id !== id));
    setAtividades((atual) => atual.filter((a) => a.conteudoId !== id));
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
  const criarAtividade = useCallback((dados) => {
    const status = dados.status || STATUS.A_FAZER;
    const atividade = {
      id: novoId(),
      titulo: (dados.titulo || '').trim(),
      descricao: (dados.descricao || '').trim(),
      conteudoId: dados.conteudoId,
      prazo: dados.prazo || '',
      peso: normalizarPeso(dados.peso),
      status,
      prioridade: dados.prioridade || '',
      responsavelId: dados.responsavelId || '',
      criadaEm: new Date().toISOString(),
      dataConclusao: status === STATUS.CONCLUIDO ? new Date().toISOString() : null,
    };
    setAtividades((atual) => [...atual, atividade]);
    return atividade;
  }, []);

  const atualizarAtividade = useCallback((id, dados) => {
    setAtividades((atual) =>
      atual.map((a) => {
        if (a.id !== id) return a;

        const atualizada = { ...a, ...dados };
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
  }, []);

  const removerAtividade = useCallback((id) => {
    setAtividades((atual) => atual.filter((a) => a.id !== id));
  }, []);

  const obterAtividade = useCallback(
    (id) => atividades.find((a) => a.id === id) || null,
    [atividades]
  );

  // ----- Progresso (RN08, RN14) -----
  const progressoDoConteudo = useCallback(
    (conteudoId) =>
      calcularProgressoDoConteudo(atividades.filter((a) => a.conteudoId === conteudoId)),
    [atividades]
  );

  const progressoAntesDe = useCallback(
    (atividade) =>
      calcularProgressoAntesDe(
        atividades.filter((a) => a.conteudoId === atividade?.conteudoId),
        atividade?.id
      ),
    [atividades]
  );

  const progressoDaDisciplina = useCallback(
    (disciplinaId) => {
      const atividadesPorConteudo = conteudos
        .filter((c) => c.disciplinaId === disciplinaId)
        .map((c) => atividades.filter((a) => a.conteudoId === c.id));
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

  const rankingDoGrupo = useCallback(
    (grupoId) =>
      calcularRankingDoGrupo(membrosDoGrupo(grupoId), atividadesDoGrupo(grupoId)).map((linha) => ({
        ...linha,
        ofensiva: calcularOfensiva(linha.membro.id, atividadesDoGrupo(grupoId)),
        conquistas: conquistas.filter((c) => c.membroId === linha.membro.id),
      })),
    [membrosDoGrupo, atividadesDoGrupo, conquistas]
  );

  // RN12 — concessão das conquistas. A cada mudança nas atividades, confere
  // os marcos de cada membro e grava o que ainda não tinha sido concedido.
  // Nada é retirado depois: concluir e desmarcar não revoga a conquista.
  //
  // As concessões feitas por ações da pessoa vão para `novasConquistas`, que
  // a casca do sistema transforma em aviso. As da carga inicial (abrir o
  // sistema, importar o exemplo) entram em silêncio.
  const silenciar = useRef(true);
  const [novasConquistas, setNovasConquistas] = useState([]);

  // Conquistas já concedidas. Fica num ref, atualizado na hora, para a mesma
  // conquista nunca ser concedida duas vezes — nem quando o React roda o
  // efeito em dobro no modo de desenvolvimento.
  const concedidas = useRef(null);
  if (concedidas.current === null) {
    concedidas.current = conquistas.map(({ membroId, codigo }) => ({ membroId, codigo }));
  }

  useEffect(() => {
    const alcancadas = [];
    grupos.forEach((grupo) => {
      const doGrupo = { atividades: atividadesDoGrupo(grupo.id), conteudos: conteudosDoGrupo(grupo.id) };
      membrosDoGrupo(grupo.id).forEach((membro) => {
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

  const falhaGravacao = falhas.size > 0;

  // Sobe a cadeia a partir da atividade.
  const trilhaDaAtividade = useCallback(
    (atividade) => {
      const conteudo = conteudos.find((c) => c.id === atividade?.conteudoId) || null;
      const disciplina = conteudo
        ? disciplinas.find((d) => d.id === conteudo.disciplinaId) || null
        : null;
      return { conteudo, disciplina };
    },
    [conteudos, disciplinas]
  );

  // Importa um pacote pronto (os dados de exemplo da tela de acesso).
  const importarExemplo = useCallback(
    ({ grupo, membros: ms, disciplinas: ds = [], conteudos: cs = [], atividades: ts }) => {
      silenciar.current = true;
      setGrupos((atual) => [...atual, grupo]);
      setMembros((atual) => [...atual, ...ms]);
      setDisciplinas((atual) => [...atual, ...ds]);
      setConteudos((atual) => [...atual, ...cs]);
      setAtividades((atual) => [...atual, ...ts]);
      return grupo;
    },
    []
  );

  const valor = useMemo(
    () => ({
      grupos,
      membros,
      disciplinas,
      conteudos,
      atividades,
      conquistas,
      falhaGravacao,
      criarGrupo,
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
      atualizarAtividade,
      removerAtividade,
      obterAtividade,
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
      rankingDoGrupo,
      novasConquistas,
      consumirNovasConquistas,
      importarExemplo,
    }),
    [
      grupos,
      membros,
      disciplinas,
      conteudos,
      atividades,
      conquistas,
      falhaGravacao,
      criarGrupo,
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
      atualizarAtividade,
      removerAtividade,
      obterAtividade,
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
      rankingDoGrupo,
      novasConquistas,
      consumirNovasConquistas,
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
