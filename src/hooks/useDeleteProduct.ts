import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      // Primero eliminar las imágenes relacionadas
      const { error: imageError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      if (imageError) {
        throw new Error("Error al eliminar imágenes del producto");
      }

      // Luego eliminar el producto
      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (productError) {
        throw new Error("Error al eliminar producto");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado correctamente");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
