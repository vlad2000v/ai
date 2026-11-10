 "use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email,setEmail] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithOtp({
      email,
      options:{ emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    setMessage(error ? error.message : "Проверь почту: мы отправили ссылку для входа.");
    setBusy(false);
  }
  return <main className="shell"><section className="card stack" style={{maxWidth:480,margin:"50px auto"}}>
    <h1>Вход в GeniusPorn</h1><p className="muted">Введи почту — пришлём безопасную ссылку для входа.</p>
    <form className="stack" onSubmit={submit}>
      <input className="field" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
      <button className="primary" disabled={busy}>{busy?"Отправляем…":"Получить ссылку для входа"}</button>
    </form><p className="muted small" aria-live="polite">{message}</p>
  </section></main>;
}
