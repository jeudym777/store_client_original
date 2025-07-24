// src/hooks/useGetPublicProducts.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabaseClient";

export const useGetPublicProducts = () => {
  return useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_product, description, price, product_images (image_url, position)")
        .order("id", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
