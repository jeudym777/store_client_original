import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

export const useGetProductsByCategory = (category?: string | null) => {
  return useQuery({
    queryKey: ["products-by-category", category],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name_product, description, price_month, category, discount, stock, product_images (image_url, position)")
        .order("id", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useGetCategoriesWithCount = () => {
  return useQuery({
    queryKey: ["categories-with-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      // Contar productos por categoría
      const categoryCount = data.reduce((acc: Record<string, number>, product) => {
        const category = product.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count
      }));
    },
  });
};