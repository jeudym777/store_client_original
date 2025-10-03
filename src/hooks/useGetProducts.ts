// src/hooks/useGetProducts.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
 
export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_product,
      description,
      price_month,
      category,
      discount,
      stock,
      content_url,
      product_images (
        id,
        image_url,
        position
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export function useGetProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
