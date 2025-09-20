import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-9xl font-bold text-red-500">403</h1>
      <h2 className="text-2xl font-semibold mb-4">Accès Refusé</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <Link to="/login">
        <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Retour à la connexion
        </button>
      </Link>
    </div>
  );
}
