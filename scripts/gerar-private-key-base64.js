// Converte o campo "private_key" do JSON de service account do Firebase
// para base64 — valor pronto pra colar em FIREBASE_PRIVATE_KEY_BASE64
// (local ou nas env vars da Vercel).
//
// Uso: node scripts/gerar-private-key-base64.js caminho/da/chave.json

const fs = require("fs");

const caminho = process.argv[2];
if (!caminho) {
  console.error("Uso: node scripts/gerar-private-key-base64.js caminho/da/chave.json");
  process.exit(1);
}

const { private_key: privateKey } = JSON.parse(fs.readFileSync(caminho, "utf-8"));
if (!privateKey) {
  console.error('Campo "private_key" não encontrado no arquivo informado.');
  process.exit(1);
}

console.log(Buffer.from(privateKey, "utf8").toString("base64"));
