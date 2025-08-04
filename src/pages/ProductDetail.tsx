// src/pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { Swiper, SwiperSlide } from "swiper/react";
import PayPalButton from "@/components/PayPalButton";

type Product = {
  id: number;
  name_product: string;
  description: string;
  price: number;
  content_url?: string;
  product_images: { image_url: string }[];
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_product, description, price, content_url, product_images(image_url)")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/"); // Redirige si falla
      } else {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Cargando producto...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">{product.name_product}</h1>

      <Swiper spaceBetween={10} slidesPerView={1} className="rounded overflow-hidden mb-6">
        {product.product_images.map((img, index) => (
          <SwiperSlide key={index}>
            <img src={img.image_url} alt={`Imagen ${index + 1}`} className="w-full h-[400px] object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>

      <p className="text-lg text-gray-700 mb-2">{product.description}</p>
      <p className="text-xl font-bold text-indigo-600 mb-4">₡{Number(product.price).toLocaleString("es-CR")}</p>

      {!showPayPal ? (
        <button
          onClick={() => setShowPayPal(true)}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          📦 Comprar y descargar
        </button>
      ) : (
        <div className="mt-4">
          <PayPalButton
            price={product.price}
            description={product.name_product}
            productId={product.id}
          />
        </div>
      )}

    </div>
  );
}
