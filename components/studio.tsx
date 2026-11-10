"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Artwork={id:string;prompt:string;storage_path:string;image_url:string;created_at:string};
export default function Studio({email}:{email:string}) {
  const [prompt,setPrompt]=useState("");
  const [style,setStyle]=useState("Anime");
  const [size,setSize]=useState("portrait");
  const [quality,setQuality]=useState("medium");
  const [items,setItems]=useState<Artwork[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const supabase=createClient();

  async function load() {
    const {data,error}=await supabase.from("artworks").select("id,prompt,storage_path,created_at").order("created_at",{ascending:false}).limit(30);
    if(!error && data) {
      const withUrls = await Promise.all(data.map(async (item) => {
        const { data: signed } = await supabase.storage.from("artworks").createSignedUrl(item.storage_path, 3600);
        return { ...item, image_url: signed?.signedUrl ?? "" };
      }));
      setItems(withUrls.filter(item => item.image_url) as Artwork[]);
    }
  }
  useEffect(()=>{load();},[]);

  async function generate(e:React.FormEvent) {
    e.preventDefault(); setBusy(true);setMessage("Создаём иллюстрацию…");
    try {
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,style,size,quality})});
      const body=await res.json();
      if(!res.ok) throw new Error(body.error||"Ошибка генерации");
      setMessage("Готово! Изображение сохранено в галерее.");
      setPrompt(""); await load();
    } catch(err) {setMessage(err instanceof Error?err.message:"Не удалось выполнить запрос");}
    finally{setBusy(false);}
  }
  async function signOut(){await supabase.auth.signOut();location.reload();}
  return <main className="shell stack">
    <header className="top"><div><h2 style={{margin:"0 0 4px"}}>GeniusPorn</h2><span className="muted small">CREATIVE AI STUDIO</span></div><div className="small">{email}<button className="pill" onClick={signOut} style={{marginLeft:8}}>Выйти</button></div></header>
    <section className="card stack">
      <div><span className="muted small">ВАША AI-СТУДИЯ</span><h1 style={{margin:"8px 0"}}>Создай свою историю.</h1><p className="muted">Иллюстрации для фанфиков и новелл с вымышленными совершеннолетними персонажами.</p></div>
      <form className="stack" onSubmit={generate}>
        <label>Описание сцены<textarea className="field" rows={5} maxLength={1200} required value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Опиши персонажа, одежду, настроение, локацию и композицию…"/></label>
        <div className="grid">
          <label>Стиль<select className="field" value={style} onChange={e=>setStyle(e.target.value)}>{["Anime","Manhwa","Realistic portrait","Fantasy","Cinematic","Dark romance"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Формат<select className="field" value={size} onChange={e=>setSize(e.target.value)}><option value="portrait">Портрет</option><option value="square">Квадрат</option><option value="landscape">Альбом</option></select></label>
          <label>Качество<select className="field" value={quality} onChange={e=>setQuality(e.target.value)}><option value="medium">Medium</option><option value="high">High</option></select></label>
        </div>
        <button className="primary" disabled={busy}>{busy?"Генерируем…":"✦ Создать иллюстрацию"}</button>
        <p className="muted small" aria-live="polite">{message}</p>
      </form>
    </section>
    <section className="stack"><div className="top"><h2>Моя галерея</h2><span className="muted small">{items.length} работ</span></div>
      {items.length===0?<div className="card muted">Пока нет изображений. Создай первую иллюстрацию.</div>:<div className="grid">{items.map(x=><article className="card stack" key={x.id}><img className="image" src={x.image_url} alt="AI artwork"/><p className="small">{x.prompt}</p><span className="muted small">{new Date(x.created_at).toLocaleString("ru-RU")}</span></article>)}</div>}
    </section>
    <p className="muted small">18+. Только вымышленные совершеннолетние персонажи. Запросы и результаты проходят модерацию.</p>
  </main>;
}
