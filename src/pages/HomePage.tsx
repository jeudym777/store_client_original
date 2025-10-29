import { useGetPublicProducts } from "../hooks/useGetPublicProducts";
import { useGetProductsByCategory } from "../hooks/useGetProductsByCategory";
import { useCategory } from "../context/CategoryContext";
import Layout from "./Layout";
import { Link } from "react-router-dom";
import { FiStar, FiShoppingBag, FiTruck, FiShield, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const { data: allProducts, isLoading: loadingAll } = useGetPublicProducts();
  const { data: filteredProducts, isLoading: loadingFiltered } = useGetProductsByCategory(selectedCategory);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Usar productos filtrados si hay una categoría seleccionada, sino todos los productos
  const products = selectedCategory ? filteredProducts : allProducts;
  const isLoading = selectedCategory ? loadingFiltered : loadingAll;

  // Agrupar productos por categoría cuando no hay categoría seleccionada
  const groupedProducts = !selectedCategory && allProducts 
    ? allProducts.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as Record<string, typeof allProducts>)
    : null;

  const featuredProducts = products?.slice(0, 6) || [];
  
  // Auto-scroll para el carousel
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 3));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredProducts.length / 3)) % Math.ceil(featuredProducts.length / 3));
  };

  return (
    <Layout>
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              YeooLabs Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Soluciones de software personalizadas para transformar tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                Explorar Productos
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all">
                Conocer Más
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* PRODUCTOS DESTACADOS CAROUSEL */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
              <p className="text-xl text-gray-600">Los favoritos de nuestros clientes</p>
            </div>
            
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredProducts.length / 3) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                        {featuredProducts.slice(slideIndex * 3, (slideIndex + 1) * 3).map((item: any) => (
                          <Link to={`/producto/${item.id}`} key={item.id}>
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                              <div className="relative overflow-hidden">
                                <img
                                  src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                                  alt={item.name_product}
                                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <FiStar className="w-4 h-4" />
                                  Destacado
                                </div>
                              </div>
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                  {item.name_product}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-indigo-600">
                                    ${Number(item.price_month).toLocaleString("en-US")}
                                  </span>
                                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    <FiShoppingBag className="w-4 h-4" />
                                    Ver
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {Math.ceil(featuredProducts.length / 3) > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                  >
                    <FiChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                  >
                    <FiChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </>
              )}

              {/* Pagination Dots */}
              {Math.ceil(featuredProducts.length / 3) > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: Math.ceil(featuredProducts.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestras Especialidades</h2>
            <p className="text-xl text-gray-600">Soluciones tecnológicas personalizadas para cada necesidad</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              className="group cursor-pointer"
              onClick={() => setSelectedCategory('Software Solutions')}
            >
              <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                selectedCategory === 'Software Solutions' ? 'ring-2 ring-blue-500 shadow-xl' : ''
              }`}>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Software Solutions</h3>
                <p className="text-gray-600 text-sm mb-4">Aplicaciones web y móviles personalizadas</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {products?.filter(p => p.category === 'Software Solutions').length || 0} productos
                </span>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => setSelectedCategory('AI Solutions (ML/DL)')}
            >
              <div className={`bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                selectedCategory === 'AI Solutions (ML/DL)' ? 'ring-2 ring-purple-500 shadow-xl' : ''
              }`}>
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Solutions (ML/DL)</h3>
                <p className="text-gray-600 text-sm mb-4">Inteligencia artificial y machine learning</p>
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                  {allProducts?.filter(p => p.category === 'AI Solutions (ML/DL)').length || 0} productos
                </span>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => setSelectedCategory('Custom Videogames')}
            >
              <div className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                selectedCategory === 'Custom Videogames' ? 'ring-2 ring-green-500 shadow-xl' : ''
              }`}>
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 10h.01M12 17h.01M17 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Videogames</h3>
                <p className="text-gray-600 text-sm mb-4">Videojuegos personalizados y únicos</p>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  {allProducts?.filter(p => p.category === 'Custom Videogames').length || 0} productos
                </span>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => setSelectedCategory('Computer Vision Solutions')}
            >
              <div className={`bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                selectedCategory === 'Computer Vision Solutions' ? 'ring-2 ring-orange-500 shadow-xl' : ''
              }`}>
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-700 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Computer Vision</h3>
                <p className="text-gray-600 text-sm mb-4">Visión por computadora y reconocimiento</p>
                <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                  {allProducts?.filter(p => p.category === 'Computer Vision Solutions').length || 0} productos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Desarrollo Rápido</h3>
              <p className="text-gray-600">Entregamos soluciones de software en tiempo récord con metodologías ágiles</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Código Seguro</h3>
              <p className="text-gray-600">Desarrollamos con las mejores prácticas de seguridad y calidad de código</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Soporte Premium</h3>
              <p className="text-gray-600">Soporte técnico completo y actualizaciones constantes para tus proyectos</p>
            </div>
          </div>
        </div>
      </section>

      {/* TODOS LOS PRODUCTOS */}
      {isLoading ? (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <div className="h-48 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : selectedCategory && products && products.length > 0 ? (
        // Vista de productos filtrados por categoría específica
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedCategory}
              </h2>
              <p className="text-xl text-gray-600">
                Productos especializados en {selectedCategory.toLowerCase()}
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Mostrar todos los productos
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item: any, index: number) => (
                <Link
                  to={`/producto/${item.id}`}
                  key={item.id}
                  className="group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                        alt={item.name_product}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          -{item.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.name_product}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-indigo-600">
                          ${Number(item.price_month).toLocaleString("en-US")}
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : groupedProducts && Object.keys(groupedProducts).length > 0 ? (
        // Vista de productos agrupados por categorías (cuando no hay categoría seleccionada)
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Todos Nuestros Productos
              </h2>
              <p className="text-xl text-gray-600">
                Explora nuestra colección completa organizizada por categorías
              </p>
            </div>
            
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="mb-16">
                {/* Subtítulo de categoría */}
                <div className="flex items-center mb-8">
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                  <div className="px-6">
                    <h3 className="text-2xl font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded-full border-2 border-indigo-200">
                      {category}
                    </h3>
                  </div>
                  <div className="flex-grow h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                </div>
                
                {/* Grid de productos de la categoría */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryProducts.map((item: any, index: number) => (
                    <Link
                      to={`/producto/${item.id}`}
                      key={item.id}
                      className="group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
                        <div className="relative overflow-hidden">
                          <img
                            src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                            alt={item.name_product}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                              -{item.discount}%
                            </div>
                          )}
                          {/* Badge de categoría */}
                          <div className="absolute bottom-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            {category}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                            {item.name_product}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-indigo-600">
                              ${Number(item.price_month).toLocaleString("en-US")}
                            </span>
                            <span className="text-sm text-gray-500">
                              Stock: {item.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg">
              <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay productos disponibles</h3>
              <p className="text-gray-500">Estamos trabajando para traerte los mejores productos. ¡Vuelve pronto!</p>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
