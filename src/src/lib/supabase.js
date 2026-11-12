import { createClient } from '@supabase/supabase-js';

// Cliente do Supabase (banco de dados e login), criado a partir das variáveis
// de ambiente. Sem elas (por exemplo, rodando o projeto sem o arquivo .env),
// o sistema funciona só no modo de demonstração, com os dados no navegador.
//
// A chave aqui é a pública (anon/publishable): ela só dá o que as políticas
// de acesso do banco permitem. A chave secreta nunca vai para o navegador.
// Fora do Vite (nas verificações com Node) não há import.meta.env.
const env = import.meta.env ?? {};
const url = env.VITE_SUPABASE_URL;
const chave = env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && chave ? createClient(url, chave) : null;

export const temBanco = Boolean(supabase);
