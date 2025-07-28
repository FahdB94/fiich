"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user on mount
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <nav className="w-full bg-white shadow-sm py-3 px-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-xl font-bold text-primary">
        Fiich
      </Link>
      {user && (
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm text-neutral-dark hover:text-primary">
            Mes fiches
          </Link>
          <Link href="/received" className="text-sm text-neutral-dark hover:text-primary">
            Fiches reçues
          </Link>
          <Link href="/invites" className="text-sm text-neutral-dark hover:text-primary">
            Invitations
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-neutral-dark hover:text-primary focus:outline-none"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </nav>
  );
}