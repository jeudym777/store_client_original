import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
import type { CustomerRegistrationForm, CustomerProfile, CustomerLoginForm } from "../types/customer";
import { toast } from "react-toastify";

// Hook para registrar un nuevo cliente
export const useCustomerRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CustomerRegistrationForm) => {
      // 1. Crear cuenta de usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'customer', // Identificar como cliente
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            telefono: formData.telefono || null,
            cumpleanos_dia: formData.cumpleanos_dia || null,
            cumpleanos_mes: formData.cumpleanos_mes || null,
            tipo_identificacion: formData.tipo_identificacion,
            numero_identificacion: formData.numero_identificacion,
            recibir_promociones: formData.recibir_promociones || false,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear la cuenta");

      console.log("Usuario creado en auth:", authData.user.id);

      // Verificar si tenemos una sesión activa tras el registro
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sesión tras signUp:", sessionData?.session ? 'ACTIVA' : 'NO ACTIVA');
      // Nota: Si las confirmaciones de email están habilitadas en Supabase,
      // es probable que NO haya sesión activa aún y cualquier inserción que dependa
      // de auth.uid() fallará por RLS. En ese caso, crea el perfil después del login
      // o desactiva temporalmente las confirmaciones de email para desarrollo.

      // Esperar un momento para asegurar que el usuario esté completamente creado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Crear perfil SOLO si ya existe una sesión válida (sin confirmación de email)
      let profileData2: any = null;
      if (sessionData?.session) {
        const clientData = {
          user_id: authData.user.id,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono || null,
          cumpleanos_dia: formData.cumpleanos_dia || null,
          cumpleanos_mes: formData.cumpleanos_mes || null,
          tipo_identificacion: formData.tipo_identificacion,
          numero_identificacion: formData.numero_identificacion,
          recibir_promociones: formData.recibir_promociones || false,
          puntos_acumulados: 100, // Puntos de bienvenida
          nivel_fidelidad: 'bronce',
          qr_code: `CLIENT_${authData.user.id}_${Date.now()}`, // QR único con timestamp
          fecha_ultimo_punto: new Date().toISOString(),
        };

        console.log("Datos del cliente a insertar:", clientData);

        const { data, error: profileError } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();
        profileData2 = data;

        if (profileError) {
          console.error("Error al crear perfil:", profileError);
          // Mensaje más claro cuando falla por RLS o sesión inexistente
          const msg = profileError.message?.includes('row-level security')
            ? 'No se pudo crear el perfil por políticas RLS. Verifica que las políticas en la tabla "clients" permitan INSERT con auth.uid() = user_id y que exista una sesión activa tras el registro.'
            : profileError.message;
          // Intentar eliminar la cuenta de auth si falla crear el perfil
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error("Error al limpiar sesión:", error);
          }
          throw new Error(`Error al crear perfil: ${msg}`);
        }
      } else {
        // Sin sesión activa: flujo de confirmación de email. No intentamos insertar.
        toast.info('Te hemos enviado un correo para confirmar tu cuenta. Valida tu email y luego inicia sesión para completar tu perfil.');
      }

      if (profileData2) {
        console.log("Cliente creado exitosamente:", profileData2);
        // Los puntos ya están incluidos en la tabla clients (puntos_acumulados: 100)
        // Opcionalmente crear registro en loyalty_transactions para el historial
        try {
          await supabase
            .from('loyalty_transactions')
            .insert({
              client_id: profileData2.id,
              user_id: authData.user.id,
              puntos_otorgados: 100,
              motivo: 'Registro de bienvenida',
              descripcion: 'Puntos otorgados por registrarse en YeooLabs Store'
            });
        } catch (error) {
          console.error("Error al crear transacción de bienvenida:", error);
          // No fallar por esto, solo log del error
        }
      }

      return { user: authData.user, profile: profileData2 };
    },
    onSuccess: (result) => {
      if (result?.profile) {
        toast.success("¡Registro exitoso! Bienvenido a YeooLabs Store");
      } else {
        toast.info("Te enviamos un correo para confirmar tu cuenta. Después de confirmar, inicia sesión para completar tu perfil.");
      }
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
    onError: (error: Error) => {
      toast.error(`Error en el registro: ${error.message}`);
    },
  });
};

// Hook para login de cliente
export const useCustomerLogin = () => {
  return useMutation({
    mutationFn: async (formData: CustomerLoginForm) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      // Verificar que el usuario tenga un perfil de cliente
      const { data: profile, error: profileError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', data.user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      let ensuredProfile = profile;
      if (!profile) {
        // Intentar crearlo con metadatos del usuario (flujo de confirmación email)
        const u = data.user!;
        const md = (u.user_metadata || {}) as any;
        const numero_identificacion = md.numero_identificacion;
        if (!numero_identificacion) {
          // No contamos con datos mínimos para crear perfil automáticamente
          await supabase.auth.signOut();
          throw new Error("Tu cuenta se confirmó, pero falta completar datos de registro. Inicia el proceso de registro nuevamente para finalizar tu perfil.");
        }

        const insertPayload = {
          user_id: u.id,
          nombre: md.nombre || 'Usuario',
          apellidos: md.apellidos || '',
          email: u.email,
          telefono: md.telefono || null,
          cumpleanos_dia: md.cumpleanos_dia || null,
          cumpleanos_mes: md.cumpleanos_mes || null,
          tipo_identificacion: md.tipo_identificacion || 'cedula',
          numero_identificacion,
          recibir_promociones: !!md.recibir_promociones,
          puntos_acumulados: 100,
          nivel_fidelidad: 'bronce',
          qr_code: `CLIENT_${u.id}_${Date.now()}`,
          fecha_ultimo_punto: new Date().toISOString(),
        };

        const { data: created, error: createErr } = await supabase
          .from('clients')
          .insert(insertPayload)
          .select()
          .single();

        if (createErr) throw createErr;
        ensuredProfile = created as any;
      }

      return { user: data.user, profile: ensuredProfile };
    },
    onSuccess: () => {
      toast.success("¡Bienvenido de vuelta!");
    },
    onError: (error: Error) => {
      toast.error(`Error en el login: ${error.message}`);
    },
  });
};

// Hook para obtener el perfil del cliente actual
export const useCustomerProfile = () => {
  return useQuery({
    queryKey: ["customer-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No profile found
        throw error;
      }

      return data as CustomerProfile;
    },
    enabled: true,
  });
};

// Hook para actualizar el perfil del cliente
export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Partial<CustomerProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from('clients')
        .update(formData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar perfil: ${error.message}`);
    },
  });
};

// Hook para logout de cliente
export const useCustomerLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sesión cerrada exitosamente");
      queryClient.clear(); // Limpiar toda la caché
    },
    onError: (error: Error) => {
      toast.error(`Error al cerrar sesión: ${error.message}`);
    },
  });
};