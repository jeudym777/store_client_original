-- Create a table for the tasks
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  text TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create a table for products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  price_month NUMERIC,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name_product TEXT NOT NULL,
  category TEXT,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  content_url TEXT
);

-- Create a table for product images
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT,
  position INTEGER DEFAULT 0
);

-- Add Row Level Security (RLS) for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Add Row Level Security (RLS) for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add Row Level Security (RLS) for product images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Users can see their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for products (allow public read access for store functionality)
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for product images (allow public read access)
CREATE POLICY "Everyone can view product images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Users can create images for their own products" ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their own products" ON product_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their own products" ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );