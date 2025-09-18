'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface EditUsernameProps {
  currentName: string;
  currentImage: string;
  onUpdate: (newName: string) => void;
}

export default function EditUsername({ currentName, currentImage, onUpdate }: EditUsernameProps) {
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!newName.trim()) {
      setError('Le nom ne peut pas être vide');
      return;
    }

    if (newName.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        await update({ name: newName.trim() });
        onUpdate(newName.trim());
        setIsEditing(false);
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName(currentName);
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
        <Image
          src={currentImage}
          alt={`Avatar de ${currentName}`}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nouveau nom d'utilisateur"
              maxLength={50}
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary text-white px-4 py-1 rounded text-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-1">
              {currentName}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary hover:text-primary-dark text-sm cursor-pointer"
            >
              Modifier le nom
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
