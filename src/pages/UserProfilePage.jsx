import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyProfile, updateMyProfile } from "@/lib/api";
import useAuthStore from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }).max(50, { message: "Le nom ne doit pas dépasser 50 caractères." }),
  prenom: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }).max(50, { message: "Le prénom ne doit pas dépasser 50 caractères." }),
  email: z.string().email({ message: "Adresse email invalide." }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string().min(6, { message: "La confirmation doit contenir au moins 6 caractères." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

function UserProfileContent({ user }) {
  const queryClient = useQueryClient();
  const updateUserInStore = useAuthStore((state) => state.updateUserProfile);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUserData) => {
      toast.success("Profil mis à jour avec succès.");
      queryClient.invalidateQueries(['myProfile']);
      updateUserInStore(updatedUserData);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      toast.success("Mot de passe mis à jour avec succès.");
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onProfileSubmit = (values) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values) => {
    updatePasswordMutation.mutate({ password: values.password });
  };

  return (
    <div className="grid gap-6">
      <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent "}>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour vos informations de profil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom" className="mb-1">Nom</Label>
                <Input id="nom" {...profileForm.register("nom")} className=" not-dark:bg-white" />
                {profileForm.formState.errors.nom && (
                  <p className="text-sm not-dark:bg-white text-red-500">{profileForm.formState.errors.nom.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="prenom" className="mb-1">Prénom</Label>
                <Input id="prenom" {...profileForm.register("prenom")} className=" not-dark:bg-white" />
                {profileForm.formState.errors.prenom && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.prenom.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="mb-1">Email</Label>
              <Input id="email" type="email" {...profileForm.register("email")} className=" not-dark:bg-white" />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label>Rôle:</Label>
              <Badge>{user.role}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label>Vérifié:</Label>
              <Badge variant={user.isVerified ? "default" : "outline"}>
                {user.isVerified ? "Oui" : "Non"}
              </Badge>
            </div>
            <Button type="submit" className="w-fit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les Modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent "}>
        <CardHeader>
          <CardTitle>Changer le Mot de Passe</CardTitle>
          <CardDescription>Mettez à jour votre mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4">
            <div>
              <Label htmlFor="password" className="mb-1">Nouveau mot de passe</Label>
              <Input id="password" type="password" {...passwordForm.register("password")} className=" not-dark:bg-white" />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="mb-1">Confirmer le nouveau mot de passe</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} className=" not-dark:bg-white" />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-fit" disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending ? "Enregistrement..." : "Changer le Mot de Passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserProfilePage() {
  const { data: currentUser, isLoading, isError } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 w-full space-y-6">
        <h1 className="text-2xl font-semibold">Mon Profil</h1>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 lg:p-6 w-full">Erreur lors du chargement du profil.</div>;
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      <h1 className="text-2xl font-semibold mb-6">Mon Profil</h1>
      {/* By giving the content a key, we force React to re-mount it when the user data changes,
          which is a robust way to reset all state and avoid infinite loops. */}
      {currentUser && <UserProfileContent key={currentUser._id} user={currentUser} />}
    </div>
  );
}
