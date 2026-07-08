// Migração única: lê data/propostas.json e grava tudo no Firestore.
// Rode com: node scripts/migrar-para-firestore.js
// Requer .env.local preenchido com as credenciais do service account.

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Credenciais ausentes. Preencha FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY em .env.local."
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

async function main() {
  const arquivo = path.join(__dirname, "..", "data", "propostas.json");
  if (!fs.existsSync(arquivo)) {
    console.log("Nenhum data/propostas.json encontrado — nada para migrar.");
    return;
  }

  const { seq, propostas } = JSON.parse(fs.readFileSync(arquivo, "utf-8"));

  const batch = db.batch();
  for (const p of propostas) {
    batch.set(db.collection("propostas").doc(p.id), p);
  }
  batch.set(db.collection("contadores").doc("propostas"), { seq }, { merge: true });
  await batch.commit();

  console.log(`Migradas ${propostas.length} proposta(s). Contador definido em ${seq}.`);
}

main().catch((err) => {
  console.error("Falha na migração:", err);
  process.exit(1);
});
