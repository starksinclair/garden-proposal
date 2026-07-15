"use client";

import { useEffect, useState, FormEvent } from "react";

export default function GardenGate() {
  const [claimed, setClaimed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setClaimed(!!d.claimed))
      .catch(() => setClaimed(false));
  }, []);

  async function enter(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimed ? { password } : { email, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "The garden stayed closed... try again 🌱");
        setBusy(false);
        return;
      }
      // let the game know she's allowed in (and how to reach her later)
      sessionStorage.setItem("garden_authed", "1");
      if (!claimed && data.email) sessionStorage.setItem("garden_email", data.email);
      window.location.href = "/game.html";
    } catch {
      setError("The garden couldn't hear you... check your connection 🍃");
      setBusy(false);
    }
  }

  const loading = claimed === null;

  return (
    <main className="gate">
      <div className="gateCard">
        <span className="corner tl">🌿</span>
        <span className="corner br">🌿</span>

        <h1 className="gateTitle">
          Welcome to this{" "}
          <span className={`stateWord ${claimed ? "claimed" : ""}`}>
            {loading ? "..." : claimed ? "claimed" : "unclaimed"}
          </span>{" "}
          garden
        </h1>
        <div className="vineLine" />

        <p className="gateSub">
          {loading
            ? "listening to the leaves..."
            : claimed
            ? "You've been here before. The garden remembers you. 💚"
            : "Something has been planted here, waiting for the right person to find it."}
        </p>

        {!loading && (
          <form className="gateForm" onSubmit={enter}>
            {!claimed && (
              <div className="field">
                <label htmlFor="email">Your email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="so the garden can write to you"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="password">The key</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="hint">hint: a very special birthday 🎂</div>
            </div>

            <div className="gateError" key={error}>
              {error}
            </div>

            <button className="enterBtn" type="submit" disabled={busy}>
              {busy ? "opening the gate..." : claimed ? "Return to the garden 🌿" : "Enter the garden 🌱"}
            </button>
          </form>
        )}

        <div className="gateFoot">grown, not built 🌿</div>
      </div>
    </main>
  );
}
