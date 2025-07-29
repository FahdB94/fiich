"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { Company, Share } from '@/types';
import Link from 'next/link';

export default function ReceivedPage() {
  const [shares, setShares] = useState<(Share & { company: Company })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchShares = async () => {
      setLoading(true);
      setError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setShares([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('shares')
        .select('*, company:companies(*)')
        .eq('recipient_user_id', user.id)
        .eq('accepted', true);
      if (error) {
        setError(error.message);
      } else if (data) {
        setShares(data as any);
      }
      setLoading(false);
    };
    fetchShares();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary mb-6">Fiches reçues</h1>
        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par partenaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-dark/20 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : shares.length === 0 ? (
          <p>Vous n'avez reçu aucune fiche.</p>
        ) : (
          <ul className="space-y-4">
            {shares
              .filter((share) => {
                const term = searchTerm.toLowerCase();
                const name = share.company?.name ?? '';
                return !term || name.toLowerCase().includes(term);
              })
              .map((share) => (
                <li key={share.id} className="border border-neutral-dark/10 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-lg text-primary">{share.company?.name}</h2>
                      <p className="text-sm text-neutral-dark">SIRET : {share.company?.siret}</p>
                    </div>
                    <Link
                      href={`/received/${share.id}`}
                      className="text-sm text-primary-light hover:underline"
                    >
                      Voir
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </main>
    </div>
  );
}