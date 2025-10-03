// src/components/ProductCard.jsx
import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-xl shadow hover:shadow-xl transition duration-300 p-4 bg-white flex flex-col">
      {/* Imagen del producto */}
      <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-100 mb-3">
        <img
          src={product.image_urls?.[0] || "/placeholder.jpg"}
          alt={product.name_product}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>

      {/* Nombre y descripción */}
      <h2 className="font-semibold text-lg text-gray-800 truncate">
        {product.name_product}
      </h2>
      <p className="text-gray-500 text-sm line-clamp-2">
        {product.description}
      </p>

      {/* Precio */}
      <div className="mt-2 font-bold text-indigo-600 text-lg">
        ${Number(product.price_month).toLocaleString("en-US")}
      </div>

      {/* Galería miniatura (opcional) */}
      {product.image_urls?.length > 1 && (
        <div className="flex gap-2 mt-3">
          {product.image_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              className="w-10 h-10 rounded border object-cover"
              alt={`Extra ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
