import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { sendContactMessage } from '@/lib/api';

// Animation Variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

// Zod Schema for validation
const contactSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  subject: z.string().min(5, { message: 'Le sujet doit contenir au moins 5 caractères.' }),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères.' }),
});

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      toast.success('Votre message a été envoyé avec succès !');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Une erreur est survenue.");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <motion.section
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold mb-4 text-primary">
          Contactez-nous
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Nous sommes là pour répondre à toutes vos questions. N'hésitez pas à nous envoyer un message ou à utiliser les informations ci-dessous.
        </motion.p>
      </motion.section>

      {/* Main Content: Form and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <motion.div
          className="border p-8 rounded-lg shadow-lg"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-6 text-secondary-foreground">Envoyez-nous un message</motion.h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" {...register('name')} className="mt-1 bg-white border-2" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="email">Adresse Email</Label>
              <Input id="email" type="email" {...register('email')} className="mt-1 bg-white border-2" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input id="subject" {...register('subject')} className="mt-1 bg-white border-2" />
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="message">Votre Message</Label>
              <Textarea id="message" {...register('message')} rows="5" className="mt-1 bg-white border-2 dark:bg-accent" />
              {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full py-3 text-lg" disabled={mutation.isPending}>
                {mutation.isPending ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="border p-8 rounded-lg shadow-lg"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-6 text-secondary-foreground">Nos Coordonnées</motion.h2>
          <div className="space-y-6 mb-8">
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">eventhub.gn@gmail.com</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Téléphone</h3>
                <p className="text-muted-foreground">+224 661 403 066</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Adresse</h3>
                <p className="text-muted-foreground"> Guinée </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}