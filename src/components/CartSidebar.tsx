import { useCart } from "../context/CartContext";
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2, FiUser, FiMail, FiPhone, FiCreditCard, FiSmartphone, FiCopy } from 'react-icons/fi';
import PayPalButton from './PayPalButton';
import { useState } from 'react';

export const CartSidebar = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    isCartOpen, 
    closeCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  const [currentStep, setCurrentStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'sinpe' | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Costa Rica'
  });
  const [sinpeCopied, setSinpeCopied] = useState(false);

  const total = getCartTotal();
  const itemCount = getCartCount();

  // Número SINPE de YeooLabs
  const SINPE_NUMBER = "87025190";

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const isCustomerInfoValid = () => {
    return customerInfo.name.trim() && customerInfo.email.trim() && customerInfo.phone.trim();
  };

  const copySinpeNumber = async () => {
    try {
      await navigator.clipboard.writeText(SINPE_NUMBER);
      setSinpeCopied(true);
      setTimeout(() => setSinpeCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const resetCart = () => {
    setCurrentStep('cart');
    setPaymentMethod(null);
    setCustomerInfo({ name: '', email: '', phone: '', country: 'Costa Rica' });
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => {
          closeCart();
          resetCart();
        }}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FiShoppingCart className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {currentStep === 'cart' && `Carrito (${itemCount})`}
                {currentStep === 'checkout' && 'Información del Cliente'}
                {currentStep === 'payment' && 'Método de Pago'}
              </h2>
            </div>
            <button
              onClick={() => {
                closeCart();
                resetCart();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 mb-6">
                  Añade algunos productos para empezar a comprar
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    resetCart();
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                {/* PASO 1: CARRITO */}
                {currentStep === 'cart' && (
                  <div className="p-6 space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex gap-4">
                          {/* Imagen */}
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                              alt={item.name_product}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {item.name_product}
                            </h3>
                            <p className="text-lg font-bold text-indigo-600 mt-1">
                              ${item.price_month.toLocaleString()}
                            </p>
                            
                            {/* Cantidad */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <FiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <FiPlus className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PASO 2: INFORMACIÓN DEL CLIENTE */}
                {currentStep === 'checkout' && (
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiUser className="inline w-4 h-4 mr-2" />
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMail className="inline w-4 h-4 mr-2" />
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiPhone className="inline w-4 h-4 mr-2" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+506 8888-8888"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <select
                        value={customerInfo.country}
                        onChange={(e) => handleCustomerInfoChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Guatemala">Guatemala</option>
                        <option value="Honduras">Honduras</option>
                        <option value="El Salvador">El Salvador</option>
                        <option value="Nicaragua">Nicaragua</option>
                        <option value="Panamá">Panamá</option>
                        <option value="México">México</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* PASO 3: MÉTODO DE PAGO */}
                {currentStep === 'payment' && (
                  <div className="p-6 space-y-6">
                    {/* Resumen del cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Información del cliente</h4>
                      <p className="text-sm text-gray-600">{customerInfo.name}</p>
                      <p className="text-sm text-gray-600">{customerInfo.email}</p>
                      <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                    </div>

                    {/* Opciones de pago */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Selecciona método de pago</h4>
                      
                      <div className="space-y-3">
                        {/* PayPal / Tarjeta */}
                        <button
                          onClick={() => setPaymentMethod('paypal')}
                          className={`w-full p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
                            paymentMethod === 'paypal' 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FiCreditCard className="w-5 h-5 text-indigo-600" />
                          <div className="text-left">
                            <div className="font-semibold">PayPal / Tarjeta</div>
                            <div className="text-sm text-gray-600">Pago seguro con PayPal o tarjeta de crédito</div>
                          </div>
                        </button>

                        {/* SINPE */}
                        <button
                          onClick={() => setPaymentMethod('sinpe')}
                          className={`w-full p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
                            paymentMethod === 'sinpe' 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FiSmartphone className="w-5 h-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-semibold">SINPE Móvil</div>
                            <div className="text-sm text-gray-600">Transferencia directa (Solo Costa Rica)</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Información SINPE */}
                    {paymentMethod === 'sinpe' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-3">
                          <FiSmartphone className="inline w-4 h-4 mr-2" />
                          Información para SINPE Móvil
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <div>
                              <p className="text-sm text-gray-600">Número SINPE:</p>
                              <p className="font-mono font-bold text-lg">{SINPE_NUMBER}</p>
                              <p className="text-sm text-gray-600">Software Yeoolabs</p>
                            </div>
                            <button
                              onClick={copySinpeNumber}
                              className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                            >
                              <FiCopy className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                          {sinpeCopied && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Número copiado al portapapeles
                            </p>
                          )}
                          <div className="text-sm text-green-700 space-y-1">
                            <p>• Realiza la transferencia por ${total.toLocaleString()}</p>
                            <p>• Envía el comprobante al WhatsApp: +506 87025190</p>
                            <p>• Recibe tu software por correo en 24 horas</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Button */}
                    {paymentMethod === 'paypal' && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Proceder con el pago
                        </h5>
                        <PayPalButton
                          price={total}
                          description={`Compra YeooLabs - ${itemCount} productos`}
                          productId={0}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer con total y botones */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">${total.toLocaleString()}</span>
                </div>
                
                {/* Botones de navegación */}
                <div className="flex gap-3">
                  {/* Botón Atrás */}
                  {currentStep !== 'cart' && (
                    <button
                      onClick={() => {
                        if (currentStep === 'checkout') setCurrentStep('cart');
                        if (currentStep === 'payment') setCurrentStep('checkout');
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      ← Atrás
                    </button>
                  )}
                  
                  {/* Botón principal */}
                  {currentStep === 'cart' && (
                    <>
                      <button
                        onClick={() => {
                          closeCart();
                          resetCart();
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        Continuar Comprando
                      </button>
                      <button
                        onClick={() => setCurrentStep('checkout')}
                        className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Proceder al Checkout
                      </button>
                    </>
                  )}
                  
                  {currentStep === 'checkout' && (
                    <button
                      onClick={() => setCurrentStep('payment')}
                      disabled={!isCustomerInfoValid()}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isCustomerInfoValid()
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Continuar al Pago →
                    </button>
                  )}
                  
                  {currentStep === 'payment' && paymentMethod === 'sinpe' && (
                    <button
                      onClick={() => {
                        alert('¡Perfecto! Realiza la transferencia SINPE y envía el comprobante. Recibirás tu software por correo en 24 horas.');
                        clearCart();
                        resetCart();
                        closeCart();
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Confirmar Pedido SINPE
                    </button>
                  )}

                  {/* Botón vaciar carrito solo en paso 1 */}
                  {currentStep === 'cart' && (
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                          clearCart();
                          resetCart();
                        }
                      }}
                      className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
