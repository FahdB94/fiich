"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { Invite, Company } from '@/types';

export default function InvitesPage() {
  const [invites, setInvites] = useState<(Invite & { company: Company })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);
      setError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setInvites([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('invites')
        .select('*, company:companies(*)')
        .or(`invitee_user_id.eq.${user.id},invitee_email.eq.${user.email}`);
      if (error) {
        setError(error.message);
      } else if (data) {
        setInvites(data as any);
      }
      setLoading(false);
    };
    fetchInvites();
  }, []);

  const acceptInvite = async (inviteId: string, companyId: string) => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      // Retrieve invite to get selected fields
      const { data: inviteData, error: inviteError } = await supabase
        .from('invites')
        .select('fields')
        .eq('id', inviteId)
        .single();
      if (inviteError) {
        throw inviteError;
      }
      const fields = inviteData?.fields ?? null;
      // update invite status and set invitee_user_id
      await supabase
        .from('invites')
        .update({ status: 'accepted', invitee_user_id: user.id })
        .eq('id', inviteId);
      // create share entry with shared_fields copied from invite
      await supabase.from('shares').insert({
        company_id: companyId,
        recipient_user_id: user.id,
        accepted: true,
        shared_fields: fields,
        created_at: new Date().toISOString(),
      });
      // refresh invites in state
      setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, status: 'accepted' } : i)));
    } finally {
      setLoading(false);
    }
  };

  const declineInvite = async (inviteId: string) => {
    setLoading(true);
    try {
      await supabase.from('invites').update({ status: 'declined' }).eq('id', inviteId);
      setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, status: 'declined' } : i)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary mb-6">Invitations</h1>
        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : invites.length === 0 ? (
          <p>Aucune invitation.</p>
        ) : (
          <ul className="space-y-4">
            {invites.map((invite) => (
              <li key={invite.id} className="border border-neutral-dark/10 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-dark">
                      {invite.company?.name || 'Entreprise inconnue'} vous a invité à consulter sa fiche.
                    </p>
                    <p className="text-sm text-neutral-dark">
                      Statut: <span className="capitalize">{invite.status}</span>
                    </p>
                  </div>
                  {invite.status === 'pending' && (
                    <div className="mt-2 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => acceptInvite(invite.id, invite.inviter_company_id)}
                        className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary-light"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => declineInvite(invite.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}