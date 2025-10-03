import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useGetProducts } from "../hooks/useGetProducts";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { supabase } from "../supabaseClient";
import { useState } from "react";

type ProductFormInput = {
  name_product: string;
  description: string;
  price_month: number;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<ProductFormInput>();
  const { data, isLoading, refetch } = useGetProducts();
  const { mutate: handleDeleteProduct } = useDeleteProduct();
  const [files, setFiles] = useState<FileList | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const deleteOldImages = async (productId: number) => {
    const { data: oldImages, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId);

    if (error || !oldImages) return;

    // Eliminar del storage
    for (const image of oldImages) {
      const path = image.image_url.split("/storage/v1/object/public/images/")[1];
      if (path) {
        await supabase.storage.from("images").remove([path]);
      }
    }

    // Eliminar de la base de datos
    await supabase.from("product_images").delete().eq("product_id", productId);
  };

  const onSubmit = async (formData: ProductFormInput) => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    const { name_product, description, price_month } = formData;

    if (editingProductId) {
      // Actualizar datos del producto
      const { error } = await supabase
        .from("products")
        .update({ name_product, description, price_month })
        .eq("id", editingProductId);

      if (error) {
        toast.error("Error al actualizar producto");
        return;
      }

      // Si se subieron nuevas imágenes
      if (files && files.length > 0) {
        await deleteOldImages(editingProductId); // 👈 Borrar anteriores

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) {
            toast.error(`Error al subir imagen ${file.name}`);
            continue;
          }

          const imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl;

          const { error: insertImageError } = await supabase.from("product_images").insert([
            {
              product_id: editingProductId,
              image_url: imageUrl,
              position: i + 1,
            },
          ]);

          if (insertImageError) {
            toast.error(`Error al guardar imagen ${file.name}`);
          }
        }
      }

      toast.success("Producto actualizado");
      setEditingProductId(null);
    } else {
      // Crear producto nuevo
      const { data: product, error: errorProduct } = await supabase
        .from("products")
        .insert([{ name_product, description, price_month, user_id: user.id }])
        .select()
        .single();

      if (errorProduct || !product) {
        toast.error("Error al agregar producto");
        return;
      }

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) {
            toast.error(`Error al subir imagen ${file.name}`);
            continue;
          }

          const imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl;

          const { error: insertImageError } = await supabase.from("product_images").insert([
            {
              product_id: product.id,
              image_url: imageUrl,
              position: i + 1,
            },
          ]);

          if (insertImageError) {
            toast.error(`Error al guardar la imagen ${file.name}`);
          }
        }
      }

      toast.success("Producto agregado correctamente");
    }

    reset();
    setFiles(null);
    refetch();
    setPreviewUrls([]);

  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Mis Productos</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
          <input
            {...register("name_product", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Nombre del producto"
          />
          <textarea
            {...register("description", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Descripción del producto"
          />
          <input
            type="number"
            step="0.01"
            {...register("price_month", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Precio"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const selectedFiles = e.target.files;
              if (!selectedFiles) return;
              setFiles(selectedFiles);

              const urls = Array.from(selectedFiles).map((file) => URL.createObjectURL(file));
              setPreviewUrls(urls);
            }}
            className="w-full border p-3 rounded"
          />

          <button className="bg-indigo-600 text-white px-5 py-3 rounded hover:bg-indigo-700 w-full">
            {editingProductId ? "Actualizar producto" : "Agregar producto"}
          </button>

          {previewUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-gray-700">Previsualización:</h4>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
   


        </form>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando productos...</p>
        ) : data?.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl shadow hover:shadow-lg transition duration-300 p-4 bg-white flex flex-col justify-between"
              >
                {/* Imagen principal */}
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden mb-3">
                  <img
                    src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                    alt={item.name_product}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {item.name_product}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                <p className="text-indigo-700 font-bold mt-2 text-lg">
                  ${Number(item.price_month).toLocaleString("en-US")}
                </p>

                {/* Miniaturas */}
                {item.product_images?.length > 1 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {item.product_images.slice(1).map((img) => (
                      <img
                        key={img.image_url}
                        src={img.image_url}
                        className="w-10 h-10 rounded border object-cover"
                        alt="Extra"
                      />
                    ))}
                  </div>
                )}

                {/* Botones */}
                <div className="mt-4 flex justify-between items-center text-sm">
                  <button
                    onClick={() => {
                      setEditingProductId(item.id);
                      reset({
                        name_product: item.name_product,
                        description: item.description,
                        price_month: item.price_month,
                      });
                      setFiles(null);
                      setPreviewUrls([]);

                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(item.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
