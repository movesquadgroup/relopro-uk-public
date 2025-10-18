/**
 * Cloud self-tests:
 * 1) Firestore write/read to diagnostics/ping (proves DB access)
 */
import { getFirebase } from "./firebase";

export async function runFirestorePing() {
  const { db } = await getFirebase();
  const { doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const ref = doc(db, "diagnostics", "ping");
  const payload = {
    ok: true,
    now: new Date().toISOString(),
    ts: serverTimestamp(),
    source: "cloud-self-test",
  };

  await setDoc(ref, payload, { merge: true });
  const snap = await getDoc(ref);
  return {
    wrote: payload,
    readBack: snap.exists() ? snap.data() : null,
    id: snap.id,
    path: ref.path,
  };
}
