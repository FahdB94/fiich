"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types';

export default function ReceivedDetailPage() {
  const params = useParams();
  const shareId = params?.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [fields, setFields] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('shares')
        .select('shared_fields, company:companies(*)')
        .eq('id', shareId)
        .single();
      if (error) {
        setError(error.message);
      } else if (data) {
        setFields(data.shared_fields as any);
        setCompany(data.company as Company);
      }
      setLoading(false);
    };
    if (shareId) fetchShare();
  }, [shareId]);

  const isFieldVisible = (key: string) => {
    if (!company) return false;
    // Always show required fields
    const required = ['name', 'siren', 'siret', 'tva_number'];
    if (required.includes(key)) return true;
    if (!fields || fields.length === 0) return true;
    return fields.includes(key);
  };

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
            {isFieldVisible('siren') && (
              <p><strong>SIREN :</strong> {company.siren}</p>
            )}
            {isFieldVisible('siret') && (
              <p><strong>SIRET :</strong> {company.siret}</p>
            )}
            {isFieldVisible('tva_number') && (
              <p><strong>Numéro de TVA :</strong> {company.tva_number}</p>
            )}
            {isFieldVisible('address_number') && company.address_number && (
              <p><strong>Adresse :</strong> {company.address_number} {company.address_street}, {company.address_postal_code} {company.address_city}, {company.address_country}</p>
            )}
            {isFieldVisible('admin_email') && company.admin_email && (
              <p><strong>Email administratif :</strong> {company.admin_email}</p>
            )}
            {isFieldVisible('phone') && company.phone && (
              <p><strong>Téléphone :</strong> {company.phone}</p>
            )}
            {isFieldVisible('payment_terms') && company.payment_terms && (
              <div>
                <strong>Conditions de paiement :</strong>
                <p>{company.payment_terms}</p>
              </div>
            )}
            {/* Documents */}
            {isFieldVisible('kbis_url') && company.kbis_url && (
              <div>
                <strong>KBIS :</strong>
                <div className="mt-1">
                  <a href={company.kbis_url} target="_blank" rel="noopener noreferrer" className="text-primary-light underline">
                    Télécharger le KBIS
                  </a>
                  {/* PDF preview */}
                  <iframe src={company.kbis_url} className="w-full h-64 mt-2" />
                </div>
              </div>
            )}
            {isFieldVisible('rib_url') && company.rib_url && (
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
            {isFieldVisible('cgv_url') && company.cgv_url && (
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