import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-primary">Créer un compte</h1>
        <AuthForm mode="signup" />
        <p className="text-center text-sm">
          Vous avez déjà un compte ?{' '}
          <Link href="/signin" className="text-primary-light hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}