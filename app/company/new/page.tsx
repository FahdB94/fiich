"use client";
import Navbar from '@/components/Navbar';
import CompanyForm from '@/components/CompanyForm';

export default function NewCompanyPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary mb-6">Créer une nouvelle fiche</h1>
        <CompanyForm />
      </main>
    </div>
  );
}