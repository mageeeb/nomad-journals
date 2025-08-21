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
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          
          {/* Fil d'Ariane */}
          <nav className="mb-8">
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-gray-700">{post.title}</span>
            </div>
          </nav>

          {/* En-tête de l'article */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-8">
              <time className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.created_at)}
              </time>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.reading_time} min de lecture
              </span>
              {post.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {post.location}
                </span>
              )}
            </div>

            {/* Image principale */}
            {post.image_url && (
              <div className="mb-12">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full max-w-3xl mx-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  onClick={() => {
                    // Ouvrir l'image en lightbox
                    const lightbox = document.createElement('div');
                    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer';
                    lightbox.innerHTML = `
                      <img src="${post.image_url}" alt="${post.title}" class="max-w-full max-h-full object-contain">
                      <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">&times;</button>
                    `;
                    lightbox.onclick = () => document.body.removeChild(lightbox);
                    document.body.appendChild(lightbox);
                  }}
                />
              </div>
            )}
          </header>

          {/* Extrait/Introduction */}
          {post.excerpt && (
            <div className="mb-12">
              <div className="text-xl text-gray-700 leading-relaxed bg-gray-50 p-8 rounded-lg border-l-4 border-primary">
                {post.excerpt}
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <article className="prose prose-lg prose-gray max-w-none mb-16">
            <div 
              className="text-gray-800 leading-relaxed space-y-8 [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-8 [&>h3]:mb-4"
              dangerouslySetInnerHTML={{ 
                __html: `<p>${formatContent(post.content)}</p>` 
              }}
            />
          </article>

          {/* Galerie d'images */}
          {post.gallery_images && post.gallery_images.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Galerie Photos
              </h2>
              
              {/* Grille d'images responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {post.gallery_images.map((image, index) => (
                  <div 
                    key={index}
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      // Ouvrir l'image en lightbox avec navigation
                      const lightbox = document.createElement('div');
                      lightbox.className = 'fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50';
                      lightbox.innerHTML = `
                        <div class="relative max-w-full max-h-full flex items-center justify-center">
                          <img src="${image}" alt="Photo ${index + 1}" class="max-w-full max-h-full object-contain">
                          <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">&times;</button>
                          ${index > 0 ? `<button class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">‹</button>` : ''}
                          ${index < post.gallery_images!.length - 1 ? `<button class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center">›</button>` : ''}
                          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">${index + 1} / ${post.gallery_images!.length}</div>
                        </div>
                      `;
                      
                      // Gérer la navigation et fermeture
                      lightbox.onclick = (e) => {
                        if (e.target === lightbox || (e.target as Element).textContent === '×') {
                          document.body.removeChild(lightbox);
                        }
                      };
                      
                      document.body.appendChild(lightbox);
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                        Cliquer pour agrandir
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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