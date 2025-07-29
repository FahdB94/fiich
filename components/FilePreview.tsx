import React from 'react';

interface FilePreviewProps {
  url: string;
  label?: string;
}

export default function FilePreview({ url, label }: FilePreviewProps) {
  const extension = url.split('.').pop()?.toLowerCase();

  if (extension && ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
    return (
      <div className="mt-1">
        {label && <div className="font-medium">{label}</div>}
        <img src={url} alt={label ?? 'Fichier'} className="w-full h-auto mt-2" />
      </div>
    );
  }

  if (extension === 'pdf') {
    return (
      <div className="mt-1">
        {label && <div className="font-medium">{label}</div>}
        <iframe src={url} className="w-full h-64 mt-2" />
      </div>
    );
  }

  // Fallback: just provide a download link
  return (
    <div className="mt-1">
      {label && <div className="font-medium">{label}</div>}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-light underline"
      >
        Télécharger le fichier
      </a>
    </div>
  );
}
