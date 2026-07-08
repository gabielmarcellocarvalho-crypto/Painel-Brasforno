import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Credenciais de service account — nunca expor no cliente.
// Configure em .env.local (dev) e nas env vars do provedor de hospedagem (produção).
//
// FIREBASE_PRIVATE_KEY_BASE64 é a forma preferida: a chave inteira em base64,
// numa única linha sem aspas — evita que painéis como o da Vercel corrompam as
// quebras de linha (\n) ou as aspas ao colar o valor. FIREBASE_PRIVATE_KEY (PEM
// cru, com \n escapado) continua funcionando como alternativa para dev local.
function lerPrivateKey(): string | undefined {
  const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64) return Buffer.from(base64, "base64").toString("utf8");
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function criarApp() {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = lerPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Credenciais do Firebase ausentes. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY_BASE64 em .env.local."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const db = getFirestore(criarApp());
