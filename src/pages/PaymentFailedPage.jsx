import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailedPage() {
    const location = useLocation();
    const { eventId } = location.state || {}; // Get eventId if passed during navigation

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-red-100 rounded-full h-20 w-20 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Échec du Paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>La simulation du paiement a échoué. Aucune somme n'a été débitée.</p>
                    <p>Veuillez réessayer.</p>
                    <div className="flex justify-center space-x-4 mt-6">
                        {eventId ? (
                            <Button asChild>
                                <Link to={`/events/${eventId}/simulate-payment`}>Réessayer le paiement</Link>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link to="/events">Retour aux événements</Link>
                            </Button>
                        )}
                        <Button asChild variant="outline">
                            <Link to="/contact">Contacter le support</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
