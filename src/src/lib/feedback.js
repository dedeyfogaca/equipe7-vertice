// Formulário anônimo de feedback dos usuários de teste (revisão de
// 06/11/2026). O link fica só aqui: a página inicial, o rodapé e o menu da
// conta leem desta constante.
//
// Se ficar vazio, os botões aparecem como "em breve".
export const LINK_FEEDBACK = 'https://forms.gle/QpAtRSGux4XKd67T6';

export const temFormularioFeedback = () => /^https:\/\//.test(LINK_FEEDBACK);
