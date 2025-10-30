-- Habilitar RLS en la tabla clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view their own client profile" ON clients
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear su propio perfil
CREATE POLICY "Users can create their own client profile" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update their own client profile" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Opcional: Política para eliminar (generalmente no se permite)
-- CREATE POLICY "Users can delete their own client profile" ON clients
--   FOR DELETE USING (auth.uid() = user_id);