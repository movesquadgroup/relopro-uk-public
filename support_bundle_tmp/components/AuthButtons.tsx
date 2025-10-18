import React from "react";
import { getFirebase } from "../lib/firebase";

const AuthButtons: React.FC = () => {
  const [busy, setBusy] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    let unsub: any;
    (async () => {
      const { auth } = await getFirebase();
      const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
      unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email ?? null));
    })();
    return () => unsub && unsub();
  }, []);

  const signIn = async () => {
    setBusy(true);
    try {
      const { auth } = await getFirebase();
      const { GoogleAuthProvider, signInWithPopup } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      const { auth } = await getFirebase();
      const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
      await signOut(auth);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-x-2">
      {userEmail ? (
        <>
          <span className="text-sm text-gray-600">Signed in as <strong>{userEmail}</strong></span>
          <button disabled={busy} onClick={signOut} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Sign out</button>
        </>
      ) : (
        <button disabled={busy} onClick={signIn} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Sign in with Google</button>
      )}
    </div>
  );
};

export default AuthButtons;
