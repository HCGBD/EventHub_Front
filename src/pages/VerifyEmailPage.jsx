import React from 'react';
import AuthLayout from '@/layouts/AuthLayout';

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Vérifiez votre e-mail</h2>
        <p className="mt-4 text-muted-foreground">
          Merci pour votre inscription ! Un e-mail de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien dans l'e-mail pour activer votre compte.
        </p>
      </div>
    </AuthLayout>
  );
}
