import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiCreditCard, 
  FiStar, 
  FiEdit3, 
  FiSave, 
  FiX,
  FiGift,
  FiTrendingUp,
  FiAward
} from "react-icons/fi";
import Layout from "./Layout";
import { useCustomerProfile, useUpdateCustomerProfile, useCustomerLogout } from "../hooks/useCustomer";
import { useCustomerPointsSummary, useCustomerPointsHistory } from "../hooks/useCustomerPoints";
import type { UpdateCustomerProfileForm } from "../types/customer";

export default function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'points'>('profile');
  
  const { data: profile, isLoading: profileLoading } = useCustomerProfile();
  const { data: pointsSummary } = useCustomerPointsSummary();
  const { data: pointsHistory } = useCustomerPointsHistory();
  const { mutate: updateProfile, isPending: updating } = useUpdateCustomerProfile();
  const { mutate: logout } = useCustomerLogout();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCustomerProfileForm>();

  // Cargar datos del perfil en el formulario cuando cambie
  useState(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country,
        id_document_type: profile.id_document_type,
        id_document_number: profile.id_document_number || '',
        marketing_emails: profile.marketing_emails,
        notifications: profile.notifications,
      });
    }
  });

  const onSubmit = (data: UpdateCustomerProfileForm) => {
    updateProfile(data, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const cancelEdit = () => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country,
        id_document_type: profile.id_document_type,
        id_document_number: profile.id_document_number || '',
        marketing_emails: profile.marketing_emails,
        notifications: profile.notifications,
      });
    }
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No se encontró el perfil</h2>
            <p className="text-gray-500">Por favor, inicia sesión nuevamente</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header del perfil */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <FiUser className="w-10 h-10 text-indigo-600" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-indigo-100">Cliente YeooLabs Store</p>
                  </div>
                </div>
                
                <div className="text-right text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <FiStar className="w-5 h-5" />
                    <span className="text-2xl font-bold">
                      {pointsSummary?.current_balance || 0}
                    </span>
                  </div>
                  <p className="text-indigo-100">Puntos disponibles</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiUser className="inline w-4 h-4 mr-2" />
                  Mi Perfil
                </button>
                <button
                  onClick={() => setActiveTab('points')}
                  className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === 'points'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiGift className="inline w-4 h-4 mr-2" />
                  Mis Puntos
                </button>
              </div>
            </div>
          </div>

          {/* Contenido de las tabs */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {updating ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información personal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FiUser className="text-indigo-600" />
                      Datos Básicos
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("first_name", { required: "El nombre es requerido" })}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.first_name}</p>
                      )}
                      {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("last_name", { required: "El apellido es requerido" })}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.last_name}</p>
                      )}
                      {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline w-4 h-4 mr-1" />
                        Teléfono
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("phone")}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.phone || 'No especificado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiCalendar className="inline w-4 h-4 mr-1" />
                        Fecha de Nacimiento
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("date_of_birth")}
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile.date_of_birth 
                            ? new Date(profile.date_of_birth).toLocaleDateString() 
                            : 'No especificado'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FiMapPin className="text-indigo-600" />
                      Dirección
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Principal</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("address_line1")}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.address_line1 || 'No especificado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          {...register("city")}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.city || 'No especificado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiCreditCard className="inline w-4 h-4 mr-1" />
                        Documento de Identidad
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            {...register("id_document_type")}
                          >
                            <option value="prefer_not_to_say">Prefiero no decirlo</option>
                            <option value="cedula">Cédula de Ciudadanía</option>
                            <option value="licencia">Licencia de Conducir</option>
                            <option value="pasaporte">Pasaporte</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Número de documento"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            {...register("id_document_number")}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {profile.id_document_type === 'prefer_not_to_say' 
                            ? 'Prefiero no decirlo' 
                            : `${profile.id_document_type}: ${profile.id_document_number || 'No especificado'}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">Preferencias</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          {...register("marketing_emails")}
                        />
                        <span className="ml-2 text-sm text-gray-700">Recibir emails promocionales</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          {...register("notifications")}
                        />
                        <span className="ml-2 text-sm text-gray-700">Recibir notificaciones</span>
                      </label>
                    </div>
                  </div>
                )}
              </form>

              {/* Botón de logout */}
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}

          {/* Tab de puntos */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              {/* Resumen de puntos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <FiTrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Puntos Ganados</p>
                      <p className="text-2xl font-bold text-green-900">{pointsSummary?.total_earned || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <FiGift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Puntos Usados</p>
                      <p className="text-2xl font-bold text-blue-900">{pointsSummary?.total_used || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <FiAward className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">Balance Actual</p>
                      <p className="text-2xl font-bold text-purple-900">{pointsSummary?.current_balance || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de puntos */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Puntos</h3>
                
                {pointsHistory && pointsHistory.length > 0 ? (
                  <div className="space-y-4">
                    {pointsHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'earned' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.transaction_type === 'earned' ? (
                              <FiTrendingUp className="w-5 h-5" />
                            ) : (
                              <FiGift className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                              {transaction.transaction_reference && ` • ${transaction.transaction_reference}`}
                            </p>
                          </div>
                        </div>
                        <div className={`text-right ${
                          transaction.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <p className="font-bold">
                            {transaction.transaction_type === 'earned' ? '+' : '-'}
                            {transaction.transaction_type === 'earned' ? transaction.points_earned : transaction.points_used} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiGift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no tienes transacciones de puntos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}