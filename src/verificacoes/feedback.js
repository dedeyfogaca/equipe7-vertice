// Verificação do feedback dos usuários de teste (RF32, RN27), de 12/11/2026.
//
// Roda com `npm run verificar`, sem banco: confere a validação da resposta,
// o resumo das notas da tela "Respostas do feedback" e a planilha (CSV).
// Quem lê e quem grava é conferido no banco, em 05-verificacoes.sql.

import { LIMITE_CONTATO, LIMITE_TEXTO, enviouHaPouco, feedbackEmCsv, resumirFeedback, validarFeedback } from '../src/lib/feedback.js';

let falhas = 0;
function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome} -> ${JSON.stringify(real)}${ok ? '' : `   (esperado ${JSON.stringify(esperado)})`}`);
}

// Validação
checar('sem nota, pede a nota', Object.keys(validarFeedback({ nota: null })), ['nota']);
checar('nota fora de 1 a 5 é recusada', Object.keys(validarFeedback({ nota: 6 })), ['nota']);
checar('só a nota já basta', validarFeedback({ nota: 4, funcionou: '', travou: '', faltou: '', contato: '' }), {});
checar('texto acima do limite é recusado', Object.keys(validarFeedback({ nota: 3, travou: 'x'.repeat(LIMITE_TEXTO + 1) })), ['travou']);
checar('contato acima do limite é recusado', Object.keys(validarFeedback({ nota: 3, contato: 'x'.repeat(LIMITE_CONTATO + 1) })), ['contato']);
checar('no limite exato, passa', validarFeedback({ nota: 5, faltou: 'x'.repeat(LIMITE_TEXTO), contato: 'x'.repeat(LIMITE_CONTATO) }), {});

// Sem armazenamento no navegador, a espera de 2 minutos não trava ninguém
checar('sem localStorage, não acusa envio recente', enviouHaPouco(), false);

// Resumo
const lista = [
  { id: 'a', nota: 4, funcionou: 'O calendário', travou: '', faltou: 'Celular', contato: '@turma', origem: 'visitante', lida: false, dataEnvio: '2026-11-12T12:17:00Z' },
  { id: 'b', nota: 2, funcionou: '', travou: 'A "foto" do grupo', faltou: '', contato: '', origem: 'conta', lida: true, dataEnvio: '2026-11-12T12:18:00Z' },
  { id: 'c', nota: 5, funcionou: '', travou: '', faltou: '', contato: '', origem: 'demonstracao', lida: false, dataEnvio: '2026-11-12T12:19:00Z' },
];
const r = resumirFeedback(lista);
checar('total e não lidas', [r.total, r.naoLidas], [3, 2]);
checar('média das notas', Number(r.media.toFixed(2)), 3.67);
checar('quantas de cada nota, de 1 a 5', r.porNota, [0, 1, 0, 1, 1]);
checar('sem respostas, média zero', resumirFeedback([]), { total: 0, media: 0, porNota: [0, 0, 0, 0, 0], naoLidas: 0 });

// Planilha
const csv = feedbackEmCsv(lista);
const linhas = csv.split('\r\n');
checar('começa com a marca que faz o Excel ler os acentos', csv.charCodeAt(0), 0xfeff);
checar('cabeçalho e uma linha por resposta', linhas.length, 4);
checar('separador ponto e vírgula', linhas[0].slice(1).split(';').length, 8);
checar('aspas do texto são dobradas', linhas[2].includes('"A ""foto"" do grupo"'), true);
checar('data no horário de Brasília', linhas[1].startsWith('"12/11/2026, 09:17'), true);
checar('origem e lida por extenso', [linhas[2].includes('"Com conta";"Sim"'), linhas[3].includes('"Demonstração";"Não"')], [true, true]);

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
if (falhas) process.exit(1);
