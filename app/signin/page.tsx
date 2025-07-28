import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function SigninPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-primary">Se connecter</h1>
        <AuthForm mode="signin" />
        <p className="text-center text-sm">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-primary-light hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}