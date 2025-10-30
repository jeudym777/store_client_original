import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import CustomerLoginForm from "./CustomerLoginForm";
import CustomerRegisterForm from "./CustomerRegisterForm";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function CustomerAuthModal({ isOpen, onClose, defaultTab = 'login' }: CustomerAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Resetear tab cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50 rounded-t-xl">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'login'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'register'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'login' ? (
              <CustomerLoginForm 
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            ) : (
              <CustomerRegisterForm 
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}