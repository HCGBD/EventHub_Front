import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

import { getMyTickets } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';

import { IMAGE_BASE_URL } from '@/lib/config';

export default function MyTicketsPage() {
  const { data: tickets, isLoading, isError, error } = useQuery({
    queryKey: ['myTickets'],
    queryFn: getMyTickets,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement de vos billets.');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[150px] w-full mb-4" />
        <Skeleton className="h-[150px] w-full mb-4" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger vos billets. Veuillez réessayer.</p>
            <p className="text-red-500 text-sm">{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link to="/" className="mb-6 inline-block">
        <Button variant="ghost" className="font-bold bg-red-400 hover:bg-red-500 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Mes Billets</h1>

      {tickets && tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket._id} className="flex flex-col h-full overflow-hidden rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex-grow text-center px-4 pt-4">
                <CardTitle className="text-xl  font-bold">{ticket.event.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col p-4">
                <div className="text-sm mt-4 space-y-1">
                  <p>
                    <Calendar className="inline-block mr-2 h-4 w-4" />
                    {new Date(ticket.event.startDate).toLocaleDateString('fr-FR', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p>
                    <MapPin className="inline-block mr-2 h-4 w-4" />
                    {ticket.event.isOnline ? 'En ligne' : (ticket.event.location?.name || 'N/A')}
                  </p>
                  <p>
                    <TicketIcon className="inline-block mr-2 h-4 w-4" />
                    Billet N°: {ticket.ticketNumber}
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  <QRCode value={ticket.qrCodeData} size={128} level="H" />
                </div>
                <div className="w-full mt-4">
                  <Link to={`/events/${ticket.event._id}`}>
                    <Button variant="outline" className="w-full not-dark:text-gray-950">Voir les détails de l'événement</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500">Vous n'avez aucun billet pour le moment.</p>
            <Link to="/events">
              <Button className="mt-4">Découvrir des événements</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
