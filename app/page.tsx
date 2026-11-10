import Studio from "@/components/studio";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="shell stack">
    <header className="top"><h2>GeniusPorn</h2><span className="muted small">CREATIVE AI STUDIO</span></header>
    <section className="card stack">
      <p className="muted small">FICTIONAL CHARACTER ART · 18+</p>
      <h1>Твори визуальные истории.</h1>
      <p className="muted">Войди по электронной почте, чтобы создавать и сохранять художественные иллюстрации совершеннолетних вымышленных персонажей.</p>
      <Link className="primary" href="/login" style={{textAlign:"center",textDecoration:"none"}}>Войти / зарегистрироваться</Link>
    </section>
  </main>;
  return <Studio email={user.email ?? ""} />;
}
