import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { id, passcode } = await request.json();

  if (!id || !passcode) {
    return NextResponse.json(
      { error: "Missing ID or passcode" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("shares")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const now = new Date();
  const expired = new Date(data.expires_at) < now;

  if (expired) {
    return NextResponse.json(
      { error: "This link has expired" },
      { status: 403 }
    );
  }

  const match = await bcrypt.compare(passcode, data.passcode_hash);

  if (!match) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  return NextResponse.json({ fileUrls: data.file_urls });
}
