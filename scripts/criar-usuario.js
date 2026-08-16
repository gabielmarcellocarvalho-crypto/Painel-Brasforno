// Cria (ou redefine a senha de) um usuário direto pela linha de comando.
// Útil para o primeiro administrador e para recuperar acesso perdido.
//
//   node scripts/criar-usuario.js "Maria Silva" maria@brasforno.com.br senha12345 admin
//
// Papéis: admin | gestor | representante (padrão: representante)

const { randomBytes, scryptSync } = require("node:crypto");
const { conectar } = require("./firestore");

const PAPEIS = ["admin", "gestor", "representante"];

function gerarHashSenha(senha) {
  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function main() {
  const [nome, login, senha, papel = "representante"] = process.argv.slice(2);

  if (!nome || !login || !senha) {
    console.error(
      '\nUso: node scripts/criar-usuario.js "Nome Completo" login senha [papel]\n' +
        `Papéis disponíveis: ${PAPEIS.join(" | ")}\n`
    );
    process.exit(1);
  }
  if (senha.length < 8) {
    console.error("\n✖ A senha precisa ter pelo menos 8 caracteres.\n");
    process.exit(1);
  }
  if (!PAPEIS.includes(papel)) {
    console.error(`\n✖ Papel inválido: "${papel}". Use ${PAPEIS.join(", ")}.\n`);
    process.exit(1);
  }

  const db = conectar();
  const usuarios = db.collection("usuarios");
  const loginNormalizado = login.trim().toLowerCase();

  const existente = await usuarios.where("login", "==", loginNormalizado).limit(1).get();

  if (!existente.empty) {
    const doc = existente.docs[0];
    await doc.ref.update({
      nome: nome.trim(),
      senhaHash: gerarHashSenha(senha),
      papel,
      ativo: true,
    });
    console.log(`\n✔ Usuário "${loginNormalizado}" já existia — senha e papel atualizados.`);
    console.log(`  Papel: ${papel}\n`);
    return;
  }

  const docRef = usuarios.doc();
  await docRef.set({
    id: docRef.id,
    nome: nome.trim(),
    login: loginNormalizado,
    senhaHash: gerarHashSenha(senha),
    papel,
    telefone: "",
    ativo: true,
    criadoEm: new Date().toISOString(),
  });

  console.log(`\n✔ Usuário criado com sucesso.`);
  console.log(`  Nome:  ${nome}`);
  console.log(`  Login: ${loginNormalizado}`);
  console.log(`  Papel: ${papel}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\n✖ Erro:", e.message, "\n");
    process.exit(1);
  });
