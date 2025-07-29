"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Company, Document } from '@/types';
import FilePreview from './FilePreview';
import { useRouter } from 'next/navigation';

interface CompanyFormProps {
  company?: Company;
}

const initialState = (company?: Company) => ({
  name: company?.name ?? '',
  siren: company?.siren ?? '',
  siret: company?.siret ?? '',
  tva_number: company?.tva_number ?? '',
  address_number: company?.address_number ?? '',
  address_street: company?.address_street ?? '',
  address_postal_code: company?.address_postal_code ?? '',
  address_city: company?.address_city ?? '',
  address_country: company?.address_country ?? '',
  admin_email: company?.admin_email ?? '',
  phone: company?.phone ?? '',
  payment_terms: company?.payment_terms ?? '',
  kbis_url: company?.kbis_url ?? '',
  rib_url: company?.rib_url ?? '',
  cgv_url: company?.cgv_url ?? '',
});

export default function CompanyForm({ company }: CompanyFormProps) {
  const [values, setValues] = useState(initialState(company));
  const [error, setError] = useState<string | null>(null);
  const [uploadingKbis, setUploadingKbis] = useState(false);
  const [uploadingRib, setUploadingRib] = useState(false);
  const [uploadingCgv, setUploadingCgv] = useState(false);
  // Option allowing the user to store the uploaded documents with the company
const [includeDocs, setIncludeDocs] = useState(true);

  const saveDocuments = async (companyId: string) => {
    const docs = [
      { url: values.kbis_url, type: 'kbis', name: 'KBIS' },
      { url: values.rib_url, type: 'rib', name: 'RIB' },
      { url: values.cgv_url, type: 'cgv', name: 'CGV' },
    ].filter((d) => d.url);
    for (const doc of docs) {
      const { error } = await supabase
        .from('documents')
        .upsert(
          { company_id: companyId, name: doc.name, type: doc.type, url: doc.url },
          { onConflict: 'company_id,type' }
        );
      if (error) throw error;
    }
  };

  // Handle uploading of files to Supabase Storage. `field` corresponds to the
  // property name on the company (kbis_url, rib_url, cgv_url).
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'kbis_url' | 'rib_url' | 'cgv_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (field === 'kbis_url') setUploadingKbis(true);
      if (field === 'rib_url') setUploadingRib(true);
      if (field === 'cgv_url') setUploadingCgv(true);
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error(userError);
        setError(userError.message);
        return;
      }
      const userId = user?.id;
      if (!userId) {
        setError("Vous devez être connecté pour téléverser un fichier.");
        return;
      }
      // Determine bucket and path
      const bucket = 'public';
      const folder = field.replace('_url', ''); // kbis, rib, cgv
      const path = `${folder}/${userId}/${file.name}`;
      // Upload file. `upsert: true` allows overwriting existing files with the same name.
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });
      if (uploadError) {
        console.error(uploadError);
        setError(uploadError.message);
        return;
      }
      // Retrieve the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);
      setValues((prev) => ({ ...prev, [field]: publicUrl }));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      if (field === 'kbis_url') setUploadingKbis(false);
      if (field === 'rib_url') setUploadingRib(false);
      if (field === 'cgv_url') setUploadingCgv(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!/^\d{9}$/.test(values.siren)) {
      return 'Le SIREN doit contenir 9 chiffres.';
    }
    if (!/^\d{14}$/.test(values.siret)) {
      return 'Le SIRET doit contenir 14 chiffres.';
    }
    if (!/^.{13}$/.test(values.tva_number)) {
      return 'Le numéro de TVA doit contenir 13 caractères.';
    }
    if (!values.name) return "Le nom de l'entreprise est obligatoire.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Prepare payload and optionally strip document URLs
      const payload = { ...values } as any;
      if (!includeDocs) {
        payload.kbis_url = null;
        payload.rib_url = null;
        payload.cgv_url = null;
      }
      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', company.id);
        if (error) throw error;
        if (includeDocs) await saveDocuments(company.id);
      } else {
        // Insert new company
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        if (!user) {
          throw new Error("Vous devez être connecté pour créer une fiche.");
        }
        const { data: inserted, error } = await supabase
          .from('companies')
          .insert({
            ...payload,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (error) throw error;
        if (includeDocs && inserted) await saveDocuments(inserted.id);
      }
      // Après création ou mise à jour, redirige vers le tableau de bord et force un rafraîchissement.
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">
          Nom de l'entreprise
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* SIREN */}
      <div>
        <label htmlFor="siren" className="block text-sm font-medium text-neutral-dark">
          SIREN
        </label>
        <input
          type="text"
          id="siren"
          name="siren"
          value={values.siren}
          onChange={handleChange}
          required
          pattern="\d{9}"
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* SIRET */}
      <div>
        <label htmlFor="siret" className="block text-sm font-medium text-neutral-dark">
          SIRET
        </label>
        <input
          type="text"
          id="siret"
          name="siret"
          value={values.siret}
          onChange={handleChange}
          required
          pattern="\d{14}"
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* TVA */}
      <div>
        <label htmlFor="tva_number" className="block text-sm font-medium text-neutral-dark">
          Numéro de TVA
        </label>
        <input
          type="text"
          id="tva_number"
          name="tva_number"
          value={values.tva_number}
          onChange={handleChange}
          required
          pattern=".{13}"
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* Adresse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="address_number" className="block text-sm font-medium text-neutral-dark">
            N°
          </label>
          <input
            type="text"
            id="address_number"
            name="address_number"
            value={values.address_number}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="address_street" className="block text-sm font-medium text-neutral-dark">
            Rue
          </label>
          <input
            type="text"
            id="address_street"
            name="address_street"
            value={values.address_street}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="address_postal_code" className="block text-sm font-medium text-neutral-dark">
            Code postal
          </label>
          <input
            type="text"
            id="address_postal_code"
            name="address_postal_code"
            value={values.address_postal_code}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="address_city" className="block text-sm font-medium text-neutral-dark">
            Ville
          </label>
          <input
            type="text"
            id="address_city"
            name="address_city"
            value={values.address_city}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="address_country" className="block text-sm font-medium text-neutral-dark">
            Pays
          </label>
          <input
            type="text"
            id="address_country"
            name="address_country"
            value={values.address_country}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
          />
        </div>
      </div>
      {/* Email administratif */}
      <div>
        <label htmlFor="admin_email" className="block text-sm font-medium text-neutral-dark">
          Email administratif
        </label>
        <input
          type="email"
          id="admin_email"
          name="admin_email"
          value={values.admin_email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-dark">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        />
      </div>
      {/* Conditions de paiement */}
      <div>
        <label htmlFor="payment_terms" className="block text-sm font-medium text-neutral-dark">
          Conditions de paiement
        </label>
        <textarea
          id="payment_terms"
          name="payment_terms"
          value={values.payment_terms}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-neutral-dark/20 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary"
        ></textarea>
      </div>
      {/* Toggle documents */}
      <div className="flex items-center">
        <input
          id="includeDocs"
          type="checkbox"
          className="mr-2"
          checked={includeDocs}
          onChange={(e) => setIncludeDocs(e.target.checked)}
        />
        <label htmlFor="includeDocs" className="text-sm font-medium text-neutral-dark">
          Joindre des documents (KBIS, RIB, CGV)
        </label>
      </div>
      {/* Fichiers justificatifs: KBIS, RIB, CGV */}
      {includeDocs && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KBIS */}
        <div>
          <label htmlFor="kbis_file" className="block text-sm font-medium text-neutral-dark">
            KBIS (PDF)
          </label>
          <input
            type="file"
            id="kbis_file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, 'kbis_url')}
            className="mt-1 block w-full text-sm"
          />
          {uploadingKbis && <p className="text-xs text-neutral-dark">Téléversement en cours…</p>}
          {values.kbis_url && <FilePreview url={values.kbis_url} />}
        </div>
        {/* RIB */}
        <div>
          <label htmlFor="rib_file" className="block text-sm font-medium text-neutral-dark">
            RIB (PDF)
          </label>
          <input
            type="file"
            id="rib_file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, 'rib_url')}
            className="mt-1 block w-full text-sm"
          />
          {uploadingRib && <p className="text-xs text-neutral-dark">Téléversement en cours…</p>}
          {values.rib_url && <FilePreview url={values.rib_url} />}
        </div>
        {/* CGV */}
        <div>
          <label htmlFor="cgv_file" className="block text-sm font-medium text-neutral-dark">
            CGV (PDF)
          </label>
          <input
            type="file"
            id="cgv_file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, 'cgv_url')}
            className="mt-1 block w-full text-sm"
          />
          {uploadingCgv && <p className="text-xs text-neutral-dark">Téléversement en cours…</p>}
          {values.cgv_url && <FilePreview url={values.cgv_url} />}
        </div>
      </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light"
      >
        {loading ? 'Enregistrement…' : company ? 'Mettre à jour' : 'Créer'}
      </button>
    </form>
  );
}