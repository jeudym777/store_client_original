// src/pages/Gracias.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function Gracias() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("producto");

    const fetchUrl = async () => {
      if (!productId) return setError("No se encontró el ID del producto.");

      // Obtener el content_url del producto desde Supabase
      const { data, error } = await supabase
        .from("products")
        .select("content_url")
        .eq("id", productId)
        .single();

      if (error || !data?.content_url) {
        setError("No se encontró el archivo para este producto.");
      } else {
        setUrl(data.content_url);
      }
    };

    fetchUrl();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 ¡Gracias por tu compra!</h1>
      <p className="text-lg text-gray-700 mb-6">Tu archivo está listo para descargar:</p>

      {url ? (
        <a
          href={url}
          download
          target="_blank"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          📥 Descargar ahora
        </a>
      ) : (
        <p className="text-red-500">{error}</p>
      )}
    </div>
  );
}
