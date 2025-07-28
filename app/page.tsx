import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="flex justify-center">
          {/* Logo */}
          <img src="/fiich-logo.png" alt="Fiich logo" className="h-16 w-auto" />
        </div>
        <h1 className="text-4xl font-extrabold text-primary">Fiich</h1>
        <p className="text-lg text-neutral-dark">
          Centralisez et partagez votre fiche d'entreprise en toute simplicité. Gérez vos documents
          administratifs (KBIS, RIB, TVA) et partagez-les avec vos partenaires en quelques clics.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/signup"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md shadow hover:bg-primary-light transition"
          >
            Créer mon compte
          </Link>
          <Link
            href="/signin"
            className="inline-block bg-secondary text-white px-6 py-3 rounded-md shadow hover:bg-secondary-light transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}