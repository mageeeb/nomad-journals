import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Send, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PhotoComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface PhotoCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: string;
  photoUrl: string;
  caption?: string;
}

const PhotoCommentModal: React.FC<PhotoCommentModalProps> = ({
  isOpen,
  onClose,
  photoId,
  photoUrl,
  caption
}) => {
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!photoId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photo_comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = data?.map(comment => comment.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine comments with profiles
      const commentsWithProfiles = data?.map(comment => ({
        ...comment,
        profiles: profiles?.find(profile => profile.user_id === comment.user_id) || {
          full_name: 'Utilisateur',
          avatar_url: null
        }
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('photo_comments')
        .insert({
          photo_id: photoId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      ?.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  useEffect(() => {
    if (isOpen && photoId) {
      fetchComments();
    }
  }, [isOpen, photoId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background">
        <div className="flex h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={photoUrl}
              alt="Photo"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Comments Section */}
          <div className="w-96 flex flex-col border-l">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Commentaires</h3>
              </div>
              {caption && (
                <p className="text-sm text-muted-foreground mt-2">{caption}</p>
              )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground">
                  Chargement des commentaires...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Aucun commentaire pour le moment. Soyez le premier à commenter !
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(comment.profiles?.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name || 'Utilisateur'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'd MMM yyyy à HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 break-words">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t">
              {user ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ajoutez un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Publication...' : 'Publier'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Connectez-vous pour commenter cette photo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCommentModal;