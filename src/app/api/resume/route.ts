import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    const userId = form.get("userId") as string | null;

    if (!file) return new NextResponse("No file", { status: 400 });

    const supabase = await createClient();

    // Optionally re-validate auth here if you want:
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const uid = userId || user?.id;
    if (!uid)
      return new NextResponse("Authentication required", { status: 401 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${uid}_${Date.now()}_${originalName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(key, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      return new NextResponse(`Upload error: ${uploadError.message}`, {
        status: 500,
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(key);

    return NextResponse.json({ publicUrl });
  } catch (e) {
    return new NextResponse("Upload failed unexpectedly", { status: 500 });
  }
}
