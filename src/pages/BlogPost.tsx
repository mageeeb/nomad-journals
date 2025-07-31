import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowLeft, Share2 } from 'lucide-react';
import NavigationNew from '@/components/NavigationNew';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import CommentSection from '@/components/CommentSection';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  gallery_images: string[] | null;
  youtube_videos: string[] | null;
  location: string | null;
  country: string | null;
  reading_time: number;
  created_at: string;
  published: boolean;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const checkIfItinerary = async (postId: string) => {
    const { data } = await supabase
      .from('itinerary_steps')
      .select('id')
      .eq('post_id', postId)
      .limit(1);
    
    return data && data.length > 0;
  };

  const fetchPost = async (postSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError('Article introuvable');
        return;
      }

      // Vérifier si c'est un itinéraire
      const hasItinerary = await checkIfItinerary(data.id);
      if (hasItinerary) {
        // Rediriger vers la page d'itinéraire
        window.location.href = `/blog/itinerary/${postSlug}`;
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Erreur lors du chargement de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Simple formatage Markdown basique
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <NavigationNew />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <NavigationNew />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Article introuvable</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link to="/blog">
              <Button className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <NavigationNew />
      
      {/* Header de l'article */}
      <div className="relative">
        {post.image_url && (
          <div className="h-[60vh] relative overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto">
                <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Retour au blog
                </Link>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight font-playfair">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  {post.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}, {post.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.reading_time} min de lecture</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!post.image_url && (
          <div className="bg-gradient-to-r from-primary to-primary/80 py-20">
            <div className="container mx-auto px-4">
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Link>
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight font-playfair">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90">
                {post.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}, {post.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min de lecture</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenu de l'article */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Extrait */}
          <div className="mb-12">
            <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>
          </div>

          {/* Bouton de partage */}
          <div className="flex justify-center mb-12">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
            >
              <Share2 className="w-4 h-4" />
              Partager cet article
            </Button>
          </div>

          {/* Contenu principal */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-foreground leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ 
                __html: `<p>${formatContent(post.content)}</p>` 
              }}
            />
          </div>

          {/* Galerie d'images */}
          {post.gallery_images && post.gallery_images.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                Galerie du voyage
              </h3>
              <ImageGallery images={post.gallery_images} />
            </div>
          )}

          {/* Vidéos YouTube */}
          {post.youtube_videos && post.youtube_videos.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                Vidéos du voyage
              </h3>
              <div className="grid gap-8">
                {post.youtube_videos.map((video, index) => (
                  <div 
                    key={index}
                    className="aspect-video rounded-lg overflow-hidden shadow-lg bg-muted"
                    dangerouslySetInnerHTML={{ __html: video }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Commentaires */}
          <CommentSection postId={post.id} />

          {/* Navigation vers d'autres articles */}
          <div className="mt-20 pt-12 border-t border-border">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Découvrez d'autres aventures
              </h3>
              <Link to="/blog">
                <Button size="lg" className="flex items-center gap-2 mx-auto">
                  Voir tous les articles
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPostPage;