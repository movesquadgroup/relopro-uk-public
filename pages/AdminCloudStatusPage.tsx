import React, { useEffect, useMemo, useState } from "react";
import { app } from "../lib/firebase";

// Firebase SDK (use the initialized app)
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  orderBy,
  limit,
  query,
  Timestamp,
} from "firebase/firestore";

type PingResult =
  | { wrote: any; readBack: any; id: string; path: string }
  | { error: string };

export default function AdminCloudStatusPage() {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [ping, setPing] = useState<PingResult | null>(null);
  const [clients, setClients] = useState<
    { id: string; name: string; createdAt?: Timestamp | null }[]
  >([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, [auth]);

  const isInit = !!app;
  const projectId = (app?.options as any)?.projectId || "(unknown)";
  const bucket = (app?.options as any)?.storageBucket || "(unknown)";

  async function handleGoogleSignIn() {
    setBusy(true);
    setMessage("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setMessage("Signed in successfully.");
    } catch (e: any) {
      setMessage(`Sign-in failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setMessage("");
    try {
      await signOut(auth);
      setMessage("Signed out.");
    } catch (e: any) {
      setMessage(`Sign-out failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function runFirestorePing() {
    setBusy(true);
    setMessage("");
    try {
      const id = "ping";
      const path = `diagnostics/${id}`;
      const ref = doc(db, "diagnostics", id);
      const payload = {
        ok: true,
        now: new Date().toISOString(),
        source: "cloud-self-test",
        ts: serverTimestamp(),
      };
      await setDoc(ref, payload, { merge: true });
      const snap = await getDoc(ref);
      setPing({
        wrote: { ok: true, now: payload.now, source: payload.source },
        readBack: snap.exists() ? snap.data() : {},
        id,
        path,
      });
      setMessage("Firestore ping OK.");
    } catch (e: any) {
      setPing({ error: e?.message || String(e) });
      setMessage("Firestore ping failed.");
    } finally {
      setBusy(false);
    }
  }

  async function createSampleClient() {
    setBusy(true);
    setMessage("");
    try {
      const ref = collection(db, "clients");
      const docRef = await addDoc(ref, {
        name: "Sample Client " + new Date().toLocaleString("en-GB"),
        createdAt: serverTimestamp(),
        createdBy: user ? user.uid : "anonymous",
        source: "admin-cloud-status",
      });
      setMessage(`Client created: ${docRef.id}`);
      await listRecentClients(); // refresh list
    } catch (e: any) {
      setMessage(`Create failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function listRecentClients() {
    setBusy(true);
    setMessage("");
    try {
      const ref = collection(db, "clients");
      const q = query(ref, orderBy("createdAt", "desc"), limit(5));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setClients(rows);
      setMessage(`Loaded ${rows.length} client(s).`);
    } catch (e: any) {
      setMessage(`List failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cloud Status</h1>

      <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
        <p className="font-semibold">
          Firebase: {isInit ? "Initialised ✅" : "Not initialised ❌"}
        </p>
        <ul className="text-sm mt-2 text-gray-600 dark:text-gray-300">
          <li>Project: {projectId}</li>
          <li>Storage Bucket: {bucket}</li>
        </ul>
      </div>

      {/* Auth */}
      <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 space-y-2">
        <h2 className="font-semibold">Authentication</h2>
        <p className="text-sm">
          {user ? `Signed in as ${user.email || user.uid}` : "Not signed in"}
        </p>
        <div className="flex gap-2">
          {!user ? (
            <button
              disabled={busy}
              onClick={handleGoogleSignIn}
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {/* Firestore */}
      <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 space-y-3">
        <h2 className="font-semibold">Firestore Test</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            disabled={busy}
            onClick={runFirestorePing}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Run Firestore ping
          </button>
          <button
            disabled={busy || !user}
            onClick={createSampleClient}
            className="px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-secondary disabled:opacity-50"
            title={!user ? "Sign in first" : ""}
          >
            Create sample client
          </button>
          <button
            disabled={busy}
            onClick={listRecentClients}
            className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            List last 5 clients
          </button>
        </div>

        {ping && (
          <div className="mt-3 text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 border">
            <div className="font-semibold mb-1">Ping Result</div>
            <pre className="whitespace-pre-wrap break-words">
{JSON.stringify(ping, null, 2)}
            </pre>
          </div>
        )}

        {clients.length > 0 && (
          <div className="mt-3 text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 border">
            <div className="font-semibold mb-1">Recent Clients</div>
            <ul className="list-disc ml-5">
              {clients.map((c) => (
                <li key={c.id}>
                  <span className="font-mono">{c.id}</span>{" "}
                  — {c.name || "(no name)"}{" "}
                  {c.createdAt?.toDate
                    ? "· " + c.createdAt.toDate().toLocaleString("en-GB")
                    : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!!message && (
        <div className="p-3 rounded bg-yellow-50 border text-yellow-800 text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
