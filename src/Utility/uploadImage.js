import { supabase, isSupabaseConfigured } from "./supabase";

export async function uploadProductImage(file, userId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Image upload is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `products/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from("vendor-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("vendor-images").getPublicUrl(path);
  return data.publicUrl;
}
