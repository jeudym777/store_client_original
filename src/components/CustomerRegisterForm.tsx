import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard } from "react-icons/fi";
import { useCustomerRegister } from "../hooks/useCustomer";
import type { CustomerRegistrationForm } from "../types/customer";

interface CustomerRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function CustomerRegisterForm({ onSuccess, onSwitchToLogin }: CustomerRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { mutate: registerCustomer, isPending } = useCustomerRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerRegistrationForm>({
    defaultValues: {
      tipo_identificacion: 'cedula',
      recibir_promociones: true,
      terms_accepted: false,
    }
  });

  const password = watch("password");

  const onSubmit = (data: CustomerRegistrationForm) => {
    registerCustomer(data, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white text-center">Crear Cuenta Cliente</h2>
        <p className="text-indigo-100 text-center mt-1">Únete a YeooLabs Store</p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step
                  ? 'bg-white text-indigo-600'
                  : 'bg-indigo-500 text-indigo-200'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Paso 1: Información de cuenta */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMail className="text-indigo-600" />
              Información de Cuenta
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres"
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5 text-gray-400" /> : <FiEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (value) => value === password || "Las contraseñas no coinciden"
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff className="h-5 w-5 text-gray-400" /> : <FiEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        )}

        {/* Paso 2: Información personal */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-indigo-600" />
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Juan"
                  {...register("nombre", { required: "El nombre es requerido" })}
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Pérez González"
                  {...register("apellidos", { required: "Los apellidos son requeridos" })}
                />
                {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiPhone className="inline w-4 h-4 mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+57 300 123 4567"
                  {...register("telefono")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Día de Cumpleaños
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="15"
                  {...register("cumpleanos_dia", { 
                    min: { value: 1, message: "Día inválido" },
                    max: { value: 31, message: "Día inválido" }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes de Cumpleaños
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  {...register("cumpleanos_mes")}
                >
                  <option value="">Seleccionar mes</option>
                  <option value="Enero">Enero</option>
                  <option value="Febrero">Febrero</option>
                  <option value="Marzo">Marzo</option>
                  <option value="Abril">Abril</option>
                  <option value="Mayo">Mayo</option>
                  <option value="Junio">Junio</option>
                  <option value="Julio">Julio</option>
                  <option value="Agosto">Agosto</option>
                  <option value="Septiembre">Septiembre</option>
                  <option value="Octubre">Octubre</option>
                  <option value="Noviembre">Noviembre</option>
                  <option value="Diciembre">Diciembre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiCreditCard className="inline w-4 h-4 mr-1" />
                  Tipo de Documento *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  {...register("tipo_identificacion", { required: "Selecciona un tipo de documento" })}
                >
                  <option value="cedula">Cédula de Ciudadanía</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="licencia">Licencia de Conducir</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.tipo_identificacion && <p className="text-red-500 text-sm mt-1">{errors.tipo_identificacion.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Número de documento"
                {...register("numero_identificacion", { required: "El número de documento es requerido" })}
              />
              {errors.numero_identificacion && <p className="text-red-500 text-sm mt-1">{errors.numero_identificacion.message}</p>}
            </div>
          </div>
        )}

        {/* Paso 3: Preferencias */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-indigo-600" />
              Preferencias
            </h3>

            {/* Preferencias */}
            <div className="space-y-3 pt-4">
              <h4 className="font-medium text-gray-900">Configuración de cuenta</h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  {...register("recibir_promociones")}
                />
                <span className="ml-2 text-sm text-gray-700">Recibir promociones y ofertas especiales</span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                  {...register("terms_accepted", { required: "Debes aceptar los términos y condiciones" })}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Acepto los <a href="#" className="text-indigo-600 hover:text-indigo-700">términos y condiciones</a> y la <a href="#" className="text-indigo-600 hover:text-indigo-700">política de privacidad</a> *
                </span>
              </label>
              {errors.terms_accepted && <p className="text-red-500 text-sm">{errors.terms_accepted.message}</p>}
            </div>

            {/* Información sobre puntos */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-2">🎁 ¡Bienvenido a YeooLabs!</h4>
              <p className="text-sm text-indigo-700">
                Al registrarte recibirás <strong>100 puntos de bienvenida</strong> que podrás usar para descuentos en futuras compras.
              </p>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6 mt-6 border-t">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {onSwitchToLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="px-6 py-2 text-gray-600 hover:text-indigo-600"
              >
                ¿Ya tienes cuenta?
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}