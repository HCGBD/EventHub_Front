import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Eye, Pencil, Trash2, Users, Briefcase, User, XCircle } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getUsers, updateUserRole, deleteUser } from "@/lib/api";

const roleMapping = {
  admin: { label: "Admin", variant: "destructive" },
  organizer: { label: "Organisateur", variant: "default" },
  participant: { label: "Participant", variant: "secondary" },
};

const UserRoleModal = ({ user, open, onOpenChange, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = React.useState(user?.role);

  React.useEffect(() => {
    setSelectedRole(user?.role);
  }, [user]);

  const handleSave = () => {
    if (user && selectedRole) {
      onRoleChange({ id: user._id, role: selectedRole });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rôle de {user?.prenom} {user?.nom}</DialogTitle>
          <DialogDescription>
            Sélectionnez un nouveau rôle pour cet utilisateur. Il sera notifié du changement.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="role-select">Rôle de l'utilisateur</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger id="role-select">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleMapping).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  const { data: usersData, isLoading, isError } = useQuery({ 
    queryKey: ['users'], 
    queryFn: getUsers 
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      toast.success("Rôle de l'utilisateur mis à jour avec succès.");
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès (soft delete).");
      queryClient.invalidateQueries(['users']);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
      setIsDeleteDialogOpen(false);
    },
  });

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const columns = React.useMemo(() => [
    {
      accessorKey: "nom",
      header: "Nom",
      cell: ({ row }) => <div className="font-medium">{`${row.original.prenom} ${row.original.nom}`}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("role");
        const { label, variant } = roleMapping[role] || { label: role, variant: "outline" };
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "isVerified",
      header: "Vérifié",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isVerified") ? "default" : "outline"}>
          {row.getValue("isVerified") ? "Oui" : "Non"}
        </Badge>
      ),
    },
    {
      accessorKey: "deleted",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.original.deleted ? "destructive" : "default"}>
          {row.original.deleted ? "Supprimé" : "Actif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert(`Voir profil de ${user.email}`)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Voir le profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenModal(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Modifier le rôle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => openDeleteDialog(user)}
                disabled={deleteUserMutation.isPending || user.deleted}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [deleteUserMutation]);

  const table = useReactTable({
    data: usersData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const userCardsData = React.useMemo(() => {
    const total = usersData?.length || 0;
    const organizers = usersData?.filter(u => u.role === 'organizer').length || 0;
    const participants = usersData?.filter(u => u.role === 'participant').length || 0;
    const unverified = usersData?.filter(u => !u.isVerified).length || 0;
    return [
      { title: "Total des Utilisateurs", value: total, Icon: Users },
      { title: "Organisateurs", value: organizers, Icon: Briefcase },
      { title: "Participants", value: participants, Icon: User },
      { title: "Non Vérifiés", value: unverified, Icon: XCircle },
    ];
  }, [usersData]);

  return (
    <div className="p-4 lg:p-6 w-full">
      <UserRoleModal 
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRoleChange={updateUserRoleMutation.mutate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action effectuera une "suppression douce" (soft delete). L'utilisateur sera marqué comme supprimé mais restera dans la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs et leurs rôles.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {userCardsData.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filtrer par email..."
          value={(table.getColumn("email")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn("role")?.getFilterValue() ?? "all")}
          onValueChange={(value) => {
            const isAll = value === "all";
            table.getColumn("role")?.setFilterValue(isAll ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {Object.entries(roleMapping).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-gray-300  dark:bg-accent">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Chargement...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Erreur lors de la récupération des données.</TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.original.deleted && "deleted"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Aucun utilisateur trouvé.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
