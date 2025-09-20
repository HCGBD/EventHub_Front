import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  role: z.enum(["admin", "organizer", "participant"], { message: "Rôle invalide." }),
});

export function UserRoleForm({ open, onOpenChange, initialData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { role: "participant" },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ role: "participant" });
    }
  }, [initialData, form]);

  const onSubmit = (values) => {
    console.log("Form submitted:", values);
    // Ici, vous intégreriez l'appel API pour modifier le rôle de l'utilisateur
    onOpenChange(false); // Fermer la modale après soumission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le Rôle de l'Utilisateur</DialogTitle>
          <DialogDescription>
            Sélectionnez le nouveau rôle pour cet utilisateur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rôle
            </Label>
            <Select
              onValueChange={(value) => form.setValue("role", value)}
              value={form.watch("role")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organizer">Organisateur</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="col-span-4 text-right text-sm text-red-500">{form.formState.errors.role.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Enregistrer le Rôle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
