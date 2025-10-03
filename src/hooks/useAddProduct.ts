import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "../supabaseClient";

export const useAddProduct = () => {
  const { user } = useAuth();

  async function addProduct(newProduct: {
    name_product: string;
    description?: string;
    price_month?: number;
    category?: string;
    discount?: number;
    stock?: number;
    content_url?: string;
  }) {
    const { error } = await supabase.from("products").insert([
      {
        name_product: newProduct.name_product,
        description: newProduct.description ?? "",
        price_month: newProduct.price_month ?? 0,
        category: newProduct.category ?? "",
        discount: newProduct.discount ?? 0,
        stock: newProduct.stock ?? 0,
        content_url: newProduct.content_url ?? "",
        user_id: user?.id ?? "",
      },
    ]);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  return useMutation({ mutationFn: addProduct });
};