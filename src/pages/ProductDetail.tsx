import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import type { Product, ProductImage } from '../types';

interface ProductWithImages extends Product {
  product_images: ProductImage[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .eq('id', id)
        .single();

      if (productError) throw productError;
      
      // Ordenar imágenes por posición
      if (productData.product_images) {
        productData.product_images.sort((a: ProductImage, b: ProductImage) => a.position - b.position);
      }
      
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const nextImage = () => {
    if (product?.product_images) {
      setCurrentImageIndex((prev) => 
        prev === product.product_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.product_images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.product_images.length - 1 : prev - 1
      );
    }
  };

  const isInCart = product ? cartItems.some(item => item.id === product.id) : false;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-96 bg-gray-300 rounded-2xl"></div>
                <div className="flex gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-6 bg-gray-300 rounded w-32"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </Layout>
    );
  }

  const images = product.product_images || [];
  const hasMultipleImages = images.length > 1;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={images[currentImageIndex]?.image_url || '/placeholder.jpg'}
                alt={product.name_product}
                className="w-full h-96 object-cover"
              />
              
              {/* Navegación de imágenes */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Miniaturas */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name_product} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y precio */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name_product}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-indigo-600">
                  ${product.price_month.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
              

            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock disponible:</span>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">#{product.id}</span>
              </div>
            </div>

            {/* Selector de cantidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Total: ${(product.price_month * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addedToCart}
                  className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addedToCart
                      ? 'bg-green-600 text-white'
                      : isInCart
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-105'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-5 h-5" />
                      {isInCart ? 'Agregar más' : 'Agregar al carrito'}
                    </>
                  )}
                </button>
                
                <button className="px-4 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <FiHeart className="w-5 h-5" />
                </button>
                
                <button className="px-4 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Garantías */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Garantías</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  Garantía de satisfacción 30 días
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  Envío gratuito en compras superiores a $50
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  Soporte técnico incluido
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
