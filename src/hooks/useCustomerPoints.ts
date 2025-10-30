import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
import type { CustomerPoints } from "../types/customer";

// Hook para obtener el resumen de puntos del cliente actual
export const useCustomerPointsSummary = () => {
  return useQuery({
    queryKey: ["customer-points-summary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('clients')
        .select('puntos_acumulados, nombre, apellidos, id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No hay registros, retornar valores por defecto
          return {
            customer_id: '',
            user_id: user.id,
            first_name: '',
            last_name: '',
            total_earned: 0,
            total_used: 0,
            current_balance: 0,
          };
        }
        throw error;
      }

      return {
        customer_id: data.id,
        user_id: user.id,
        first_name: data.nombre,
        last_name: data.apellidos,
        total_earned: data.puntos_acumulados,
        total_used: 0,
        current_balance: data.puntos_acumulados,
      };
    },
    enabled: true,
  });
};

// Hook para obtener el historial de puntos del cliente
export const useCustomerPointsHistory = () => {
  return useQuery({
    queryKey: ["customer-points-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      // Primero obtener el customer_id
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('customer_points')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomerPoints[];
    },
    enabled: true,
  });
};

// Función helper para otorgar puntos (para uso interno del sistema)
export const awardPoints = async (
  customer_id: string,
  points: number,
  description: string,
  transaction_reference?: string
) => {
  const { data, error } = await supabase
    .from('customer_points')
    .insert({
      customer_id,
      points_earned: points,
      points_used: 0,
      transaction_type: 'earned',
      description,
      transaction_reference,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Función helper para redimir puntos
export const redeemPoints = async (
  customer_id: string,
  points: number,
  description: string,
  transaction_reference?: string
) => {
  // Verificar que el cliente tenga suficientes puntos
  const { data: summary } = await supabase
    .from('customer_points_summary')
    .select('current_balance')
    .eq('customer_id', customer_id)
    .single();

  if (!summary || summary.current_balance < points) {
    throw new Error('Puntos insuficientes');
  }

  const { data, error } = await supabase
    .from('customer_points')
    .insert({
      customer_id,
      points_earned: 0,
      points_used: points,
      transaction_type: 'redeemed',
      description,
      transaction_reference,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};