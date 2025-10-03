export type Product = {
  id: number;
  created_at: string;
  description: string;
  price_month: number;
  user_id: string;
  name_product: string;
  category: string;
  discount: number;
  stock: number;
  content_url: string;
};

export type ProductImage = {
  id: number;
  created_at: string;
  product_id: number;
  image_url: string;
  position: number;
};

export type Task = {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
};