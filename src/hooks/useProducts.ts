import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "../supabaseClient";

export const useProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
