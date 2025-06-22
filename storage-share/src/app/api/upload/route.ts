import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const passcode = formData.get("passcode")?.toString();

  if (!files || files.length === 0 || !passcode) {
    return NextResponse.json(
      { error: "Missing files or passcode" },
      { status: 400 }
    );
  }

  const fileUrls: string[] = [];
  const linkId = uuidv4();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const filePath = `${linkId}/${file.name}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from("uploads").getPublicUrl(filePath)
      .data.publicUrl;
    fileUrls.push(publicUrl);
  }

  const passcodeHash = await bcrypt.hash(passcode, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

  const { error: dbError, data: inserted } = await supabase
    .from("shares")
    .insert({
      id: linkId,
      passcode_hash: passcodeHash,
      file_urls: fileUrls,
      expires_at: expiresAt.toISOString(),
    })
    .select();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: linkId });
}
