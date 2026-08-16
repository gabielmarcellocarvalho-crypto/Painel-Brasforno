// Gera o AUTH_SECRET usado para assinar os cookies de sessão.
//
//   npm run gerar:secret
//
// Copie o valor para AUTH_SECRET no .env.local (dev) e nas variáveis de
// ambiente da hospedagem (produção). Trocar o segredo derruba todas as
// sessões ativas — o que é exatamente o que se quer se ele vazar.

const { randomBytes } = require("node:crypto");

console.log(`\nAUTH_SECRET=${randomBytes(48).toString("base64url")}\n`);
