import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Paiement Réussi !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Votre billet a été généré avec succès et vous a été envoyé par e-mail.</p>
                    <p>Vous pouvez retrouver tous vos billets dans votre espace personnel.</p>
                    <div className="flex justify-center space-x-4 mt-6">
                        <Button asChild>
                            <Link to="/participant/my-tickets">Voir mes billets</Link> 
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/events">Explorer d'autres événements</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
