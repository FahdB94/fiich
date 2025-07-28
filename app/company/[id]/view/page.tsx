"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
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
            {company.kbis_url && (
              <div>
                <strong>KBIS :</strong>
                <div className="mt-1">
                  <a href={company.kbis_url} target="_blank" rel="noopener noreferrer" className="text-primary-light underline">
                    Télécharger le KBIS
                  </a>
                  <iframe src={company.kbis_url} className="w-full h-64 mt-2" />
                </div>
              </div>
            )}
            {company.rib_url && (
              <div>
                <strong>RIB :</strong>
                <div className="mt-1">
                  <a href={company.rib_url} target="_blank" rel="noopener noreferrer" className="text-primary-light underline">
                    Télécharger le RIB
                  </a>
                  <iframe src={company.rib_url} className="w-full h-64 mt-2" />
                </div>
              </div>
            )}
            {company.cgv_url && (
              <div>
                <strong>CGV :</strong>
                <div className="mt-1">
                  <a href={company.cgv_url} target="_blank" rel="noopener noreferrer" className="text-primary-light underline">
                    Télécharger les CGV
                  </a>
                  <iframe src={company.cgv_url} className="w-full h-64 mt-2" />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}