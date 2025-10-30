import { FiMenu, FiX, FiShoppingCart, FiChevronDown, FiUser, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCategory } from '../context/CategoryContext';
import { useGetCategoriesWithCount } from '../hooks/useGetProductsByCategory';
import { CartSidebar } from '../components/CartSidebar';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCustomerPointsSummary } from '../hooks/useCustomerPoints';
import CustomerAuthModal from '../components/CustomerAuthModal';
import yeoobackground from '../ImagenesYeooLABS/YEOO.png';

// Componente del dropdown de categorías
const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, setSelectedCategory } = useCategory();
  const { data: categories = [] } = useGetCategoriesWithCount();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-colors py-2 ${
          selectedCategory ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
        }`}
      >
        {selectedCategory || 'Categorías'}
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              {categories.map((category: any, index: number) => (
                <button
                  key={index}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                    selectedCategory === category.name ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedCategory(category.name);
                  }}
                >
                  <span className={`group-hover:text-indigo-600 ${
                    selectedCategory === category.name ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 ${
                    selectedCategory === category.name 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-100 p-2">
              <button
                className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded-lg transition-colors ${
                  selectedCategory === null ? 'text-indigo-700 bg-indigo-50' : 'text-indigo-600'
                }`}
                onClick={() => {
                  setIsOpen(false);
                  setSelectedCategory(null);
                }}
              >
                {selectedCategory ? 'Mostrar todos los productos' : 'Todos los productos'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { getCartCount, openCart } = useCart();
  const { user, profile, isCustomer } = useCustomerAuth();
  const { data: pointsSummary } = useCustomerPointsSummary();

  const cartCount = getCartCount();

  const openLoginModal = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={yeoobackground} alt="YeooLabs" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-gray-900">YeooLabs Store</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Inicio
              </Link>
              <CategoryDropdown />
              
              {/* Customer Auth Section */}
              {isCustomer ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{profile?.first_name}</p>
                      <div className="flex items-center text-xs text-indigo-600">
                        <FiStar className="w-3 h-3 mr-1" />
                        {pointsSummary?.current_balance || 0} pts
                      </div>
                    </div>
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-200">
                          <p className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <div className="flex items-center mt-1 text-sm text-indigo-600">
                            <FiStar className="w-4 h-4 mr-1" />
                            {pointsSummary?.current_balance || 0} puntos disponibles
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/perfil"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Mi Perfil
                          </Link>
                          <Link
                            to="/mis-puntos"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Mis Puntos
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openLoginModal}
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                
                {/* Categorías en móvil */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Categorías</span>
                  <div className="pl-4 space-y-2">
                    <button className="block text-gray-700 hover:text-indigo-600 transition-colors text-left">
                      Software Solutions
                    </button>
                    <button className="block text-gray-700 hover:text-indigo-600 transition-colors text-left">
                      AI Solutions (ML/DL)
                    </button>
                    <button className="block text-gray-700 hover:text-indigo-600 transition-colors text-left">
                      Custom Videogames
                    </button>
                    <button className="block text-gray-700 hover:text-indigo-600 transition-colors text-left">
                      Computer Vision
                    </button>
                  </div>
                </div>

                {/* Auth Section Mobile */}
                <div className="pt-4 border-t border-gray-200">
                  {isCustomer ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{profile?.first_name}</p>
                          <div className="flex items-center text-sm text-indigo-600">
                            <FiStar className="w-4 h-4 mr-1" />
                            {pointsSummary?.current_balance || 0} puntos
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/perfil"
                        className="block text-gray-700 hover:text-indigo-600 transition-colors pl-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        to="/mis-puntos"
                        className="block text-gray-700 hover:text-indigo-600 transition-colors pl-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mis Puntos
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          openLoginModal();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left text-gray-700 hover:text-indigo-600 transition-colors pl-3 font-medium"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        onClick={() => {
                          openRegisterModal();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Registrarse
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={yeoobackground} alt="YeooLabs" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold">YeooLabs Store</span>
              </div>
              <p className="text-gray-400">Tu destino para productos excepcionales y una experiencia de compra única.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                <li><a href="#productos" className="text-gray-400 hover:text-white transition-colors">Productos</a></li>
                <li><a href="#contacto" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ayuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 YeooLabs Store. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <button
        onClick={openCart}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40"
      >
        <FiShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {/* CARRITO LATERAL */}
      <CartSidebar />

      {/* MODAL DE AUTENTICACIÓN */}
      <CustomerAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
