import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Handshake, Compass, Sparkles } from 'lucide-react';
import meImg from '../assets/img/meTo.jpg' // This will be replaced by settings.founderImage
import { useQuery } from '@tanstack/react-query';
import { IMAGE_BASE_URL } from '@/lib/config';
import { getSettings } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

// Animation Variants (reused from HomePage)
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

// Map icon names to actual components
const iconMap = {
  Users: Users,
  Lightbulb: Lightbulb,
  Handshake: Handshake,
  Compass: Compass,
  Sparkles: Sparkles,
  // Add other icons from lucide-react as needed, e.g., 'Activity': Activity
};

export default function AboutPage() {
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['appSettings'],
    queryFn: getSettings,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError || !settings) {
    return <div className="container mx-auto py-10 text-red-500">Erreur lors du chargement des informations de la page "À propos".</div>;
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Introduction Section */}
      <motion.section
        className="text-center mb-16"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold mb-4 text-primary">
          À propos d'EventHub
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {settings.aboutText}
        </motion.p>
      </motion.section>

      {/* Our Values Section */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-10 text-secondary-foreground">
          Nos Valeurs
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {settings.values?.map((value, index) => {
            const IconComponent = iconMap[value.icon]; // Get the icon component from the map
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center p-6 bg-card shadow-lg rounded-lg h-full flex flex-col justify-center items-center">
                  {IconComponent && <IconComponent className="h-12 w-12 mb-4" />} {/* Render icon if found */}
                  <CardTitle className="text-xl font-semibold mb-2">{value.title}</CardTitle>
                  <CardContent className="p-0 ">
                    {value.description}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* The Founder Section */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-10 text-secondary-foreground">
          Le Fondateur
          
        </motion.h2>
        <div className="flex justify-center">
          <motion.div variants={itemVariants} className="max-w-md">
            <Card className="text-center p-6 bg-card shadow-xl rounded-lg">
              <img src={`${IMAGE_BASE_URL}/${settings.founderImage}`} alt={settings.founderName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary" />
              <CardTitle className="text-2xl font-semibold mb-2">{settings.founderName}</CardTitle>
              <p className="mb-2">{settings.founderRole}</p>
              <CardContent className="p-0 text-gray-100">
                {settings.founderBio}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        className="text-center py-16 bg-gray-400 dark:bg-gray-900/20 not-dark:text-gray-900 rounded-lg shadow-xl"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold mb-6">
          Prêt à explorer ?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg mb-8 max-w-2xl mx-auto">
          {settings.callToActionText}
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/events">
            <Button size="lg" className="not-dark:text-white text-gray-900 hover:bg-green-500/90 hover:text-xl transition-all duration-300 hover:scale-105">
              Explorer les Événements <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}