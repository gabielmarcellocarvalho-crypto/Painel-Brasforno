// Conexão com o Firestore para os scripts de linha de comando.
// Mesmas credenciais usadas pela aplicação (.env.local).

require("dotenv").config({ path: ".env.local" });

const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function lerPrivateKey() {
  const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64) return Buffer.from(base64, "base64").toString("utf8");
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function conectar() {
  if (getApps().length > 0) return getFirestore();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = lerPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "\n✖ Credenciais do Firebase ausentes.\n" +
        "  Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e\n" +
        "  FIREBASE_PRIVATE_KEY_BASE64 em .env.local (veja .env.local.example).\n"
    );
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getFirestore();
}

module.exports = { conectar };
