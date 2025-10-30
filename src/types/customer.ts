// Customer types (usando la tabla 'clients')
export interface CustomerProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Personal Information 
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  cumpleanos_dia?: number;
  cumpleanos_mes?: string;
  
  // Identification
  tipo_identificacion: 'cedula' | 'pasaporte' | 'licencia' | 'otro';
  numero_identificacion: string;
  
  // Preferences
  recibir_promociones: boolean;
  
  // Loyalty
  puntos_acumulados: number;
  nivel_fidelidad: 'bronce' | 'plata' | 'oro' | 'platino';
  fecha_ultimo_punto?: string;
  qr_code: string;
}

export interface CustomerPoints {
  id: string;
  customer_id: string;
  created_at: string;
  
  points_earned: number;
  points_used: number;
  current_balance: number;
  
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  transaction_reference?: string;
  description?: string;
  expiry_date?: string;
}

export interface CustomerPointsSummary {
  customer_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  total_earned: number;
  total_used: number;
  current_balance: number;
}

// Form types
export interface CustomerRegistrationForm {
  // Auth fields
  email: string;
  password: string;
  confirmPassword: string;
  
  // Profile fields (adaptado a tabla 'clients')
  nombre: string;
  apellidos: string;
  telefono?: string;
  cumpleanos_dia?: number;
  cumpleanos_mes?: string;
  
  // ID fields
  tipo_identificacion: 'cedula' | 'licencia' | 'pasaporte' | 'otro';
  numero_identificacion: string;
  
  // Preferences
  recibir_promociones: boolean;
  terms_accepted: boolean;
}

export interface CustomerLoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface UpdateCustomerProfileForm {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  
  id_document_type: 'cedula' | 'licencia' | 'pasaporte' | 'prefer_not_to_say';
  id_document_number?: string;
  
  marketing_emails: boolean;
  notifications: boolean;
}