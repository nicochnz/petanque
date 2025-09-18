'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
}

interface TerrainCommentsProps {
  terrainId: string;
  terrainName: string;
}

export default function TerrainComments({ terrainId, terrainName }: TerrainCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetchComments();
  }, [terrainId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/terrains/${terrainId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/terrains/${terrainId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/terrains/${terrainId}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || !session) return;

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'terrain',
          targetId: terrainId,
          reason: reportReason,
          description: reportDescription.trim()
        })
      });

      if (response.ok) {
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        alert('Signalement envoyé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="w-80 max-h-96 overflow-y-auto p-4">
        <div className="text-center text-gray-500">Chargement des commentaires...</div>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg mb-2">Commentaires - {terrainName}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
          >
            🚩 Signaler ce terrain
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <Image
                  src={comment.userImage}
                  alt={comment.userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {session?.user?.email === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {session && (
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{newComment.length}/500</span>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="font-semibold text-lg mb-4">Signaler ce terrain</h3>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Raison du signalement</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="offensive">Contenu offensant</option>
                  <option value="fake">Faux terrain</option>
                  <option value="duplicate">Terrain en double</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optionnelle)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  maxLength={200}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!reportReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  Signaler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
