"use client";
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function InviteCompanyPage() {
  const params = useParams();
  const companyId = params?.id as string;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // List of optional fields the user can choose to share. Required fields
  // (name, siren, siret, tva_number) are always shared.
  const OPTIONAL_FIELDS: { key: string; label: string }[] = [
    { key: 'address_number', label: 'Numéro de voie' },
    { key: 'address_street', label: 'Rue' },
    { key: 'address_postal_code', label: 'Code postal' },
    { key: 'address_city', label: 'Ville' },
    { key: 'address_country', label: 'Pays' },
    { key: 'admin_email', label: 'Email administratif' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'payment_terms', label: 'Conditions de paiement' },
    { key: 'kbis_url', label: 'KBIS' },
    { key: 'rib_url', label: 'RIB' },
    { key: 'cgv_url', label: 'CGV' },
  ];
  const [selectedFields, setSelectedFields] = useState<string[]>(
    OPTIONAL_FIELDS.map((f) => f.key)
  );

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setMessage("Vous devez être connecté pour envoyer une invitation.");
        return;
      }
      // Insert invitation with selected fields
      const { error } = await supabase.from('invites').insert({
        inviter_company_id: companyId,
        inviter_user_id: user.id,
        invitee_email: email,
        status: 'pending',
        created_at: new Date().toISOString(),
        fields: selectedFields,
      });
      if (error) throw error;
      // Fetch inviter company to include in email
      const { data: company, error: cError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
      if (cError) throw cError;
      // Send email invitation via internal API route
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          companyName: company?.name ?? 'Une entreprise',
          inviterEmail: user.email,
          fields: selectedFields,
        }),
      });
      setMessage('Invitation envoyée avec succès.');
      setEmail('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary mb-6">Inviter un partenaire</h1>
        <p className="mb-4 text-neutral-dark">
          Entrez l'adresse email d'une entreprise partenaire pour lui partager la fiche. Elle recevra
          une invitation à consulter cette fiche.
        </p>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-dark">
              Email du destinataire
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
            />
          </div>
        {/* Optional fields selector */}
        <div>
          <p className="text-sm font-medium text-neutral-dark mb-1">
            Sélectionnez les informations facultatives à partager :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTIONAL_FIELDS.map(({ key, label }) => (
              <label key={key} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedFields.includes(key)}
                  onChange={() => toggleField(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
          >
            {loading ? 'Envoi…' : 'Envoyer l\'invitation'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-neutral-dark">{message}</p>}
        <p className="mt-4">
          <Link href={`/company/${companyId}`} className="text-primary-light hover:underline">
            ← Retour à la fiche
          </Link>
        </p>
      </main>
    </div>
  );
}