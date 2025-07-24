import { useGetPublicProducts } from "@/hooks/useGetPublicProducts";
import Layout from "./Layout";
import { IoMdGlobe } from "react-icons/io";
import { TbCheckupList } from "react-icons/tb";
import { FiClock } from "react-icons/fi";

export default function HomePage() {
  const { data: products, isLoading } = useGetPublicProducts();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-6">
          Bienvenido estimado CLIENTE a YEOOSTORE
        </h1>

        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-700 mb-8">
            Mira nuestros productos disponibles sin necesidad de registrarte. Simple, rápido y eficiente como nos gusta.
          </p>
        </div>

        {/* PRODUCTOS */}
        {isLoading ? (
          <p className="text-gray-500">Cargando productos...</p>
        ) : !products || products.length === 0 ? (
          <p className="text-gray-400">No hay productos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-4">
            {products.map((item: any) => (
              <div
                key={item.id}
                className="border rounded-xl shadow hover:shadow-lg transition duration-300 p-4 bg-white"
              >
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden mb-3">
                  <img
                    src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                    alt={item.name_product}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {item.name_product}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                <p className="text-indigo-700 font-bold mt-2 text-lg">
                  ₡{Number(item.price).toLocaleString("es-CR")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FEATURES */}
        
      </div>
    </Layout>
  );
}
