import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCategory, updateCategory } from '@/lib/api';

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }).max(50, { message: "Le nom ne doit pas dépasser 50 caractères." }),
  description: z.string().max(200, { message: "La description ne doit pas dépasser 200 caractères." }).optional(),
});

export function CategoryForm({ open, onOpenChange, initialData }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: "", description: "" },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "", description: "" });
      }
    }
  }, [initialData, open, form]);

  const mutation = useMutation({
    mutationFn: (values) => 
      initialData 
        ? updateCategory(initialData._id, values) 
        : createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success(initialData ? "Catégorie modifiée avec succès !" : "Catégorie créée avec succès !");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier la Catégorie" : "Ajouter une Nouvelle Catégorie"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modifiez les détails de la catégorie." : "Ajoutez une nouvelle catégorie d'événement."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="col-span-3"
              disabled={mutation.isPending}
            />
            {form.formState.errors.name && (
              <p className="col-span-4 text-right text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              {...form.register("description")}
              className="col-span-3"
              disabled={mutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="col-span-4 text-right text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending 
              ? "Enregistrement..." 
              : initialData ? "Enregistrer les Modifications" : "Ajouter la Catégorie"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
