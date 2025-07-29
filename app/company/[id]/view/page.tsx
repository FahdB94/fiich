"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FilePreview from '@/components/FilePreview';
import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types';

export default function CompanyViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError(error.message);
      } else if (data) {
        setCompany(data as Company);
      }
      setLoading(false);
    };
    if (id) fetchCompany();
  }, [id]);

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto p-4">
        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !company ? (
          <p>Fiche introuvable.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-primary">{company.name}</h1>
            <p><strong>SIREN :</strong> {company.siren}</p>
            <p><strong>SIRET :</strong> {company.siret}</p>
            <p><strong>Numéro de TVA :</strong> {company.tva_number}</p>
            {company.address_street && (
              <p>
                <strong>Adresse :</strong> {company.address_number} {company.address_street}, {company.address_postal_code}{' '}
                {company.address_city}, {company.address_country}
              </p>
            )}
            {company.admin_email && (
              <p><strong>Email administratif :</strong> {company.admin_email}</p>
            )}
            {company.phone && <p><strong>Téléphone :</strong> {company.phone}</p>}
            {company.payment_terms && (
              <div>
                <strong>Conditions de paiement :</strong>
                <p>{company.payment_terms}</p>
              </div>
            )}
            {/* Documents preview */}
            {company.kbis_url && <FilePreview url={company.kbis_url} label="KBIS" />}
            {company.rib_url && <FilePreview url={company.rib_url} label="RIB" />}
            {company.cgv_url && <FilePreview url={company.cgv_url} label="CGV" />}
          </div>
        )}
      </main>
    </div>
  );
}