import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Pencil, Trash2, ThumbsUp, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  reactions?: {
    likes: number;
    hearts: number;
    user_liked: boolean;
    user_hearted: boolean;
  };
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast.error('Erreur lors du chargement des commentaires');
        return;
      }

      // Fetch reactions for each comment
      const commentsWithReactions = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: reactions } = await supabase
            .from('comment_reactions')
            .select('reaction_type, user_id')
            .eq('comment_id', comment.id);

          const likes = reactions?.filter(r => r.reaction_type === 'like').length || 0;
          const hearts = reactions?.filter(r => r.reaction_type === 'heart').length || 0;
          const user_liked = user ? reactions?.some(r => r.reaction_type === 'like' && r.user_id === user.id) || false : false;
          const user_hearted = user ? reactions?.some(r => r.reaction_type === 'heart' && r.user_id === user.id) || false : false;

          return {
            ...comment,
            reactions: { likes, hearts, user_liked, user_hearted }
          };
        })
      );

      setComments(commentsWithReactions);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) {
        console.error('Error submitting comment:', error);
        toast.error('Erreur lors de l\'ajout du commentaire');
        return;
      }

      setNewComment('');
      toast.success('Commentaire ajouté avec succès !');
      fetchComments();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating comment:', error);
        toast.error('Erreur lors de la modification du commentaire');
        return;
      }

      setEditingId(null);
      setEditContent('');
      toast.success('Commentaire modifié avec succès !');
      fetchComments();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la modification du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting comment:', error);
        toast.error('Erreur lors de la suppression du commentaire');
        return;
      }

      toast.success('Commentaire supprimé avec succès !');
      fetchComments();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  const getAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `https://pgenjoqbpjbdmwgmkaoi.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`;
  };

  const getUserInitials = (username: string | null, fullName: string | null) => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'AN';
  };

  const handleReaction = async (commentId: string, reactionType: 'like' | 'heart') => {
    if (!user) {
      toast.error('Connectez-vous pour réagir aux commentaires');
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      const isCurrentlyReacted = reactionType === 'like' ? comment?.reactions?.user_liked : comment?.reactions?.user_hearted;

      if (isCurrentlyReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;
      }

      fetchComments(); // Refresh to get updated counts
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Erreur lors de la réaction');
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-2xl font-bold font-playfair">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre avis sur ce voyage..."
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || isSubmitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Publication...' : 'Publier'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour laisser un commentaire
            </p>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun commentaire pour le moment. Soyez le premier à partager votre avis !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getAvatarUrl(comment.profiles?.avatar_url)} />
                    <AvatarFallback>
                      {getUserInitials(comment.profiles?.username, comment.profiles?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {comment.profiles?.full_name || comment.profiles?.username || 'Utilisateur'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(comment.created_at), 'PPp', { locale: fr })}
                      </Badge>
                      {comment.created_at !== comment.updated_at && (
                        <Badge variant="secondary" className="text-xs">
                          modifié
                        </Badge>
                      )}
                    </div>
                    
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editContent.trim()}
                          >
                            Sauvegarder
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingId(null);
                              setEditContent('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        
                        {/* Reaction buttons */}
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(comment.id, 'like')}
                              className={`gap-1 text-xs hover:bg-primary/10 ${
                                comment.reactions?.user_liked ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              {comment.reactions?.likes || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(comment.id, 'heart')}
                              className={`gap-1 text-xs hover:bg-red-50 ${
                                comment.reactions?.user_hearted ? 'text-red-500 bg-red-50' : 'text-muted-foreground'
                              }`}
                            >
                              <Heart className="w-4 h-4" />
                              {comment.reactions?.hearts || 0}
                            </Button>
                          </div>
                        </div>
                        
                        {user?.id === comment.user_id && (
                          <div className="flex gap-2 pt-2 border-t border-border/50 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(comment.id);
                                setEditContent(comment.content);
                              }}
                              className="gap-1 text-xs"
                            >
                              <Pencil className="w-3 h-3" />
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="gap-1 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                              Supprimer
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;