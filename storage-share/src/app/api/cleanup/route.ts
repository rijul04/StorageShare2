import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET() {
  const now = new Date().toISOString();

  // 1. Find expired shares
  const { data: expiredShares, error: selectError } = await supabase
    .from("shares")
    .select("*")
    .lt("expires_at", now);

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const failedDeletes: string[] = [];

  for (const share of expiredShares) {
    const filePaths = share.file_urls.map((url: string) => {
      const [, bucket, ...pathParts] = new URL(url).pathname.split("/");
      return pathParts.join("/");
    });

    // 2. Delete files from storage
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove(filePaths);

    if (storageError) {
      failedDeletes.push(share.id);
      continue;
    }

    // 3. Delete row from DB
    await supabase.from("shares").delete().eq("id", share.id);
  }

  return NextResponse.json({
    deleted: expiredShares.length - failedDeletes.length,
    failed: failedDeletes,
  });
}
