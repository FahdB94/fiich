export interface Company {
  id: string;
  user_id: string;
  name: string;
  siren: string;
  siret: string;
  tva_number: string;
  address_number: string;
  address_street: string;
  address_postal_code: string;
  address_city: string;
  address_country: string;
  admin_email: string;
  phone: string;
  payment_terms: string;
  kbis_url?: string;
  rib_url?: string;
  cgv_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  inviter_company_id: string;
  inviter_user_id: string;
  invitee_email: string;
  invitee_user_id?: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Share {
  id: string;
  company_id: string;
  recipient_user_id: string;
  accepted: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}
