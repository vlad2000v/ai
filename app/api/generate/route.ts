import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error:"Требуется вход"},{status:401});

    const body = await req.json();
    const prompt = body.prompt;
    const styles = ["Anime","Manhwa","Realistic portrait","Fantasy","Cinematic","Dark romance"];
    const sizes: Record<string,string> = {portrait:"1024x1536",square:"1024x1024",landscape:"1536x1024"};
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 1200)
      return NextResponse.json({error:"Некорректное описание"},{status:400});
    if (!styles.includes(body.style) || !sizes[body.size] || !["medium","high"].includes(body.quality))
      return NextResponse.json({error:"Недопустимые настройки"},{status:400});

    const result = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
      prompt: `Create a polished, non-explicit literary illustration for a visual novel. Depict only fictional adults aged 18 or older. No nudity or explicit sexual content. Style: ${body.style}. Scene description: ${prompt}`,
      size: sizes[body.size] as "1024x1536" | "1024x1024" | "1536x1024",
      quality: body.quality as "medium" | "high",
      n: 1
    });
    const encoded = result.data?.[0]?.b64_json;
    if (!encoded) throw new Error("Image response was empty");

    const bytes = Buffer.from(encoded,"base64");
    const filePath = `${user.id}/${crypto.randomUUID()}.png`;
    const {error:uploadError}=await supabase.storage.from("artworks").upload(filePath,bytes,{contentType:"image/png",upsert:false});
    if(uploadError) throw uploadError;

    const {error:dbError}=await supabase.from("artworks").insert({
      user_id:user.id,prompt,storage_path:filePath,style:body.style
    });
    if(dbError) {
      await supabase.storage.from("artworks").remove([filePath]);
      throw dbError;
    }
    return NextResponse.json({success:true});
  } catch(error) {
    console.error("generation_failed",error);
    return NextResponse.json({error:"Генерация не удалась. Проверь настройки API и лимиты аккаунта."},{status:500});
  }
}
