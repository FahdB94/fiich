"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Company } from '@/types';
import EyeIcon from '@/components/icons/EyeIcon';

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error(userError);
        setCompanies([]);
        setLoading(false);
        return;
      }
      if (!user) {
        setCompanies([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) {
        setCompanies(data as Company[]);
      }
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Mes fiches</h1>
          <Link
            href="/company/new"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light"
          >
            Nouvelle fiche
          </Link>
        </div>
        {loading ? (
          <p>Chargement…</p>
        ) : companies.length === 0 ? (
          <p>Aucune fiche enregistrée. Cliquez sur « Nouvelle fiche » pour en créer une.</p>
        ) : (
          <ul className="space-y-4">
            {companies.map((company) => (
              <li key={company.id} className="border border-neutral-dark/10 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="font-semibold text-lg text-primary">{company.name}</h2>
                    <p className="text-sm text-neutral-dark">SIRET : {company.siret}</p>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Link
                      href={`/company/${company.id}/view`}
                      title="Voir la fiche"
                      className="text-primary-light hover:underline flex items-center"
                    >
                      <EyeIcon className="w-5 h-5 mr-1" /> Voir
                    </Link>
                    <Link
                      href={`/company/${company.id}`}
                      className="text-sm text-primary-light hover:underline"
                    >
                      Modifier
                    </Link>
                    <Link
                      href={`/company/${company.id}/invite`}
                      className="text-sm text-secondary hover:underline"
                    >
                      Inviter
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}