"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CompanyForm from '@/components/CompanyForm';
import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types';

export default function EditCompanyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
      if (!error) {
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
        <h1 className="text-2xl font-bold text-primary mb-6">Modifier la fiche</h1>
        {loading ? (
          <p>Chargement…</p>
        ) : company ? (
          <CompanyForm company={company} />
        ) : (
          <p>Fiche introuvable.</p>
        )}
      </main>
    </div>
  );
}