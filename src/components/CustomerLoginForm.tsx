import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { useCustomerLogin } from "../hooks/useCustomer";
import type { CustomerLoginForm } from "../types/customer";

interface CustomerLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function CustomerLoginForm({ onSuccess, onSwitchToRegister }: CustomerLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const { mutate: loginCustomer, isPending } = useCustomerLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginForm>();

  const onSubmit = (data: CustomerLoginForm) => {
    loginCustomer(data, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
          <p className="text-indigo-100 mt-1">Inicia sesión en tu cuenta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiMail className="inline w-4 h-4 mr-2" />
            Correo Electrónico
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="tu@email.com"
            {...register("email", {
              required: "El email es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido"
              }
            })}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiLock className="inline w-4 h-4 mr-2" />
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              {...register("password", {
                required: "La contraseña es requerida"
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              {...register("remember_me")}
            />
            <span className="ml-2 text-sm text-gray-700">Recordarme</span>
          </label>
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Register link */}
        {onSwitchToRegister && (
          <div className="text-center">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Regístrate aquí
            </button>
          </div>
        )}

        {/* Guest shopping */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">¿Solo quieres navegar?</p>
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            onClick={() => onSuccess?.()} // Cerrar modal sin autenticar
          >
            Continuar sin cuenta
          </button>
        </div>
      </form>
    </div>
  );
}