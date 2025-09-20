import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { getEventById, simulatePaymentForEvent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock } from 'lucide-react';

// --- Custom Logo Components ---
const VisaLogo = () => (
    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" className="h-8 w-auto">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#498BCB"/>
        <path d="M22.6 14.3L21.7 8.1h-2.1l.9 6.2H22.6zM17.1 8.1h-2.1l-2.8 6.2h2.1l.4-1h2.3l.2 1h2.1L17.1 8.1zm-1.5 4.2l.6-2.1.5 2.1h-1.1zM10.1 8.1H8.2L7 14.3h2.1l.4-1.1h2.3l.2 1.1H14l-2.8-6.2zm-1.5 4.2l.6-2.1.5 2.1h-1.1zM25.9 8.1h-2.1L23 11.4c0 .6.4.8.8.9.5.1.9-.1 1.3-.4l.2 1.1c-.4.3-1.1.5-1.9.5-1.3 0-2.1-.7-2.1-2.1V8.1h-2.1v6.2h2.1v-2.1c0-.6.4-.8.8-.9.5-.1.9.1 1.3-.4l.2-1.1c-.4-.3-1.1-.5-1.9-.5-1.3 0-2.1-.7-2.1-2.1V8.1h-1.2v6.2h2.1v-1.6l1.4 1.6h1.6l-1.9-2.3 1.6-3.9z" fill="#fff"/>
    </svg>
);

const OrangeMoneyLogo = () => (
    <div className="flex items-center justify-center h-8 space-x-1">
        <div className="bg-orange-500 text-white font-bold text-sm w-8 h-8 flex items-center justify-center rounded-md">OM</div>
        <span className="font-semibold text-sm">Orange Money</span>
    </div>
);

const MtnMomoLogo = () => (
    <div className="flex items-center justify-center h-8 space-x-1">
        <div className="bg-yellow-400 w-8 h-8 flex items-center justify-center rounded-full">
            <div className="bg-blue-900 text-white font-bold text-xs w-6 h-4 flex items-center justify-center rounded-sm">MTN</div>
        </div>
        <span className="font-semibold text-sm">Mobile Money</span>
    </div>
);


export default function PaymentSimulationPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: event, isLoading, isError } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEventById(eventId),
    });

    const mutation = useMutation({
        mutationFn: () => simulatePaymentForEvent(eventId),
        onSuccess: (data) => {
            toast.success(data.message || 'Paiement simulé avec succès !');
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            navigate('/payment/success');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'La simulation du paiement a échoué.');
            navigate('/payment/failed', { state: { eventId: eventId } });
        },
    });

    const handleSimulateSuccess = () => {
        mutation.mutate();
    };

    if (isLoading) {
        return <div className="container mx-auto py-10">Chargement...</div>;
    }

    if (isError || !event) {
        return <div className="container mx-auto py-10">Erreur de chargement de l'événement.</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Side: Payment Form */}
                <div>
                    <h1 className="text-2xl font-bold mb-6">Paiement Sécurisé</h1>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-base font-semibold">Choisissez votre méthode de paiement</Label>
                            <div className="mt-2 grid grid-cols-1 gap-3">
                                {/* Credit Card Option (Active) */}
                                <div className="cursor-pointer rounded-lg border-2 border-primary bg-primary/10 p-3 flex items-center">
                                    <VisaLogo />
                                </div>
                                {/* Orange Money (Inactive) */}
                                <div className="cursor-not-allowed rounded-lg border bg-muted/50 p-3 flex items-center opacity-60">
                                    <OrangeMoneyLogo />
                                </div>
                                {/* Mobile Money (Inactive) */}
                                <div className="cursor-not-allowed rounded-lg border bg-muted/50 p-3 flex items-center opacity-60">
                                    <MtnMomoLogo />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <Label htmlFor="card-number">Numéro de carte</Label>
                            <Input id="card-number" placeholder="49XX XXXX XXXX XXXX" className="bg-gray-100 dark:bg-gray-800" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Date d'expiration</Label>
                                <Input id="expiry" placeholder="MM/AA" className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nom sur la carte</Label>
                            <Input id="name" placeholder="M. John Doe" className="bg-gray-100 dark:bg-gray-800" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Événement :</p>
                            <p className="font-medium">{event.name}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Billet :</p>
                            <p className="font-medium">1 x Adulte</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <p>Total à payer :</p>
                            <p>{event.price.toFixed(2)} €</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                         <Button onClick={handleSimulateSuccess} disabled={mutation.isPending} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                            <Lock className="mr-2 h-4 w-4" />
                            {mutation.isPending ? 'Traitement...' : `Payer ${event.price.toFixed(2)} €`}
                        </Button>
                    </div>
                     <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground flex items-center justify-center">
                            <Lock className="mr-1 h-3 w-3" /> Paiement 100% sécurisé.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}