# Comprendre le Tableau des Événements dans Event.jsx

Dans le fichier `Event.jsx`, le tableau qui affiche la liste de vos événements est bien plus qu'un simple tableau HTML. Il utilise une bibliothèque React très puissante appelée **`TanStack Table`** (anciennement `React Table`) pour gérer des fonctionnalités avancées comme le tri, le filtrage et la pagination, sans que vous ayez à tout coder manuellement.

Comparons-le à un tableau HTML classique pour mieux comprendre.

---

## 1. Le Tableau HTML Classique (Rappel)

Un tableau HTML que vous connaissez se construit directement avec des balises :

```html
<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Date</th>
      <th>Lieu</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Conférence Tech</td>
      <td>15/10/2025</td>
      <td>Paris</td>
    </tr>
    <tr>
      <td>Marathon</td>
      <td>22/09/2025</td>
      <td>Centre-ville</td>
    </tr>
  </tbody>
</table>
```

*   **Structure fixe :** Vous définissez les lignes et les colonnes directement dans le HTML.
*   **Contenu statique :** Le contenu est soit écrit en dur, soit généré par une simple boucle.
*   **Pas de fonctionnalités :** Pour trier, filtrer ou paginer, il faudrait écrire beaucoup de code JavaScript complexe à la main.

---

## 2. Le Tableau dans Event.jsx (avec TanStack Table)

Dans `Event.jsx`, le tableau est construit de manière dynamique et intelligente.

### Pourquoi pas un simple tableau HTML ?

Pour une application comme EventHub, vous avez besoin de :
*   **Trier** les événements par nom, date, etc.
*   **Filtrer** les événements par nom, statut, plage de dates.
*   **Paginer** les événements pour n'afficher qu'un certain nombre par page.
*   **Sélectionner** des lignes.

Faire tout cela avec un tableau HTML classique serait extrêmement long et complexe à maintenir.
`TanStack Table` simplifie énormément cette tâche.

### Les Composants React du Tableau

Vous voyez des balises comme `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`, `<TableHead>`. Ce ne sont pas les balises HTML natives, mais des **composants React** fournis par `shadcn/ui` (qui sont eux-mêmes des wrappers autour des balises HTML). Ils vous aident à construire le tableau avec un style cohérent.

### Le Cœur : `useReactTable` (Le Cerveau du Tableau)

C'est le hook principal de `TanStack Table`. Il est le "cerveau" qui gère toute la logique complexe du tableau.

```javascript
const table = useReactTable({
  data, // Vos données d'événements
  columns, // La définition de vos colonnes (expliqué ci-dessous)
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(), // Active la pagination
  getSortedRowModel: getSortedRowModel(),       // Active le tri
  getFilteredRowModel: getFilteredRowModel(),     // Active le filtrage
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onRowSelectionChange: setRowSelection,
  state: {
    sorting,
    columnFilters,
    rowSelection,
  },
});
```

*   Il prend en entrée vos `data` (les événements) et la définition de vos `columns`.
*   Il gère l'état interne du tableau : quelle colonne est triée, quels filtres sont actifs, quelle page est affichée.
*   Il vous fournit un objet `table` (ici, la constante `table`) qui contient toutes les fonctions et informations nécessaires pour afficher et interagir avec le tableau.

### La Définition des Colonnes (`columns`)

C'est un tableau d'objets JavaScript qui décrit chaque colonne de votre tableau :

```javascript
export const columns = [
  {
    accessorKey: "nom", // La clé pour accéder au nom de l'événement dans vos données
    header: "Nom de l'événement", // Le titre de la colonne
    cell: ({ row }) => <div className="font-medium">{row.getValue("nom")}</div>, // Comment afficher le contenu de la cellule
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => { /* ... */ },
    filterFn: dateRangeFilterFn, // La fonction de filtrage pour cette colonne
  },
  // ... autres colonnes
];
```

*   `accessorKey` : Indique à `TanStack Table` quelle propriété de votre objet événement correspond à cette colonne (par exemple, `nom` pour le nom de l'événement).
*   `header` : Le texte qui s'affiche dans l'en-tête de la colonne.
*   `cell` : Une fonction qui définit comment le contenu de chaque cellule de cette colonne doit être rendu. C'est ici que vous pouvez formater les dates, ajouter des badges de statut, ou des boutons d'action.
*   `filterFn` : Pour les colonnes filtrables (comme la date), c'est la fonction qui contient la logique de filtrage.

### Le Rendu Dynamique (`flexRender`)

Au lieu d'écrire `<td>{evenement.nom}</td>`, vous utilisez `flexRender(cell.column.columnDef.cell, cell.getContext())`.
*   `flexRender` est une fonction de `TanStack Table` qui prend la définition de votre colonne et les données de la cellule pour afficher le contenu correctement, en tenant compte du tri, du filtrage, etc.

### L'Interaction (Tri, Filtre, Pagination)

Les champs de saisie pour le nom, le statut, la plage de dates, et les boutons "Précédent"/"Suivant" n'agissent pas directement sur le tableau HTML. Ils interagissent avec l'objet `table` retourné par `useReactTable` :

*   `table.getColumn("nom")?.setFilterValue(event.target.value)` : Met à jour la valeur du filtre pour la colonne "nom".
*   `table.previousPage()` / `table.nextPage()` : Demande à `table` de passer à la page précédente/suivante.

Lorsque ces fonctions sont appelées, `table` recalcule quelles lignes doivent être affichées en fonction des filtres, du tri et de la pagination actifs, et met à jour l'affichage.

---

**En résumé :**

Le tableau dans `Event.jsx` est un système sophistiqué qui sépare la **définition** du tableau (dans `columns`) de sa **logique** (dans `useReactTable`) et de son **affichage** (avec les composants React et `flexRender`). Cela le rend beaucoup plus puissant, flexible et facile à maintenir qu'un simple tableau HTML, surtout pour des données dynamiques et interactives.
