import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useGetProducts } from "../hooks/useGetProducts";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { supabase } from "../supabaseClient";
import { useState } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiImage, FiDollarSign, FiFileText, FiX } from 'react-icons/fi';

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
  const [showForm, setShowForm] = useState(false);

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

      toast.success("Producto actualizado exitosamente");
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
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setShowForm(false);
    reset();
    setFiles(null);
    setPreviewUrls([]);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
              <p className="text-gray-600">Administra tu inventario de manera profesional</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {editingProductId ? <FiEdit3 className="w-6 h-6" /> : <FiPlus className="w-6 h-6" />}
                {editingProductId ? "Editar Producto" : "Agregar Nuevo Producto"}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4" />
                    Nombre del Producto
                  </label>
                  <input
                    {...register("name_product", { required: true })}
                    className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Ingresa el nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price_month", { required: true })}
                    className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register("description", { required: true })}
                  rows={4}
                  className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe tu producto detalladamente..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4" />
                  Imágenes del Producto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
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
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Haz clic para seleccionar imágenes</p>
                    <p className="text-sm text-gray-400">PNG, JPG hasta 10MB cada una</p>
                  </label>
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-gray-700">Previsualización:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-medium">Imagen {index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 font-semibold"
                >
                  {editingProductId ? "Actualizar Producto" : "Crear Producto"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Productos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : data?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay productos aún</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primer producto para empezar a vender</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <FiPlus className="w-5 h-5" />
              Agregar Primer Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Imagen principal */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                    alt={item.name_product}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                    ID: {item.id}
                  </div>
                </div>

                <div className="p-6">
                  {/* Info del producto */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {item.name_product}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${Number(item.price_month).toLocaleString("en-US")}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Stock: {item.stock || 0}
                    </span>
                  </div>

                  {/* Miniaturas */}
                  {item.product_images?.length > 1 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {item.product_images.slice(1, 5).map((img, imgIndex) => (
                        <img
                          key={img.image_url}
                          src={img.image_url}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 object-cover hover:border-indigo-400 transition-colors"
                          alt={`Extra ${imgIndex + 1}`}
                        />
                      ))}
                      {item.product_images.length > 5 && (
                        <div className="w-12 h-12 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{item.product_images.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingProductId(item.id);
                        setShowForm(true);
                        reset({
                          name_product: item.name_product,
                          description: item.description,
                          price_month: item.price_month,
                        });
                        setFiles(null);
                        setPreviewUrls([]);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                          handleDeleteProduct(item.id);
                        }
                      }}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
