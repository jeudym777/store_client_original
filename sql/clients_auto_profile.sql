-- Auto-create a row in public.clients when a new user is created in auth.users
-- Run this in Supabase SQL Editor with a service role (default SQL editor is fine)
-- Safe to re-run: drops the trigger if it exists

-- 1) Function: SECURITY DEFINER so it runs with owner privileges and bypasses RLS
create or replace function public.create_client_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a client profile using auth.users data + raw_user_meta_data
  insert into public.clients (
    user_id,
    nombre,
    apellidos,
    email,
    telefono,
    cumpleanos_dia,
    cumpleanos_mes,
    tipo_identificacion,
    numero_identificacion,
    recibir_promociones,
    puntos_acumulados,
    nivel_fidelidad,
    qr_code,
    fecha_ultimo_punto
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'telefono', ''),
    nullif((new.raw_user_meta_data->>'cumpleanos_dia')::int, 0),
    nullif(new.raw_user_meta_data->>'cumpleanos_mes', ''),
    coalesce(new.raw_user_meta_data->>'tipo_identificacion', 'cedula'),
    coalesce(new.raw_user_meta_data->>'numero_identificacion', 'N/A'),
    coalesce((new.raw_user_meta_data->>'recibir_promociones')::boolean, false),
    100, -- puntos de bienvenida
    'bronce',
    'CLIENT_' || new.id || '_' || extract(epoch from now())::bigint,
    now()
  )
  on conflict (email) do nothing; -- evita error si se reintenta

  return new;
end;
$$;

-- 2) Trigger: after insert on auth.users
 drop trigger if exists create_client_on_signup on auth.users;
create trigger create_client_on_signup
  after insert on auth.users
  for each row execute function public.create_client_on_signup();

-- 3) Optional: grant execute just in case (not strictly needed for trigger)
-- grant execute on function public.create_client_on_signup() to authenticated;

-- Verification (run separately):
-- select * from public.clients order by created_at desc limit 5;