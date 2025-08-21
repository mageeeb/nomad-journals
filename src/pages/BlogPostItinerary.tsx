import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationNew from "@/components/NavigationNew";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import ImageGallery from "@/components/ImageGallery";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Camera,
  Navigation as NavigationIcon,
  DollarSign,
  Lightbulb,
  Share2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  gallery_images: string[];
  youtube_videos: string[];
  location: string;
  country: string;
  reading_time: number;
  created_at: string;
  published: boolean;
  practical_info?: string;
  budget_info?: string;
  transport_info?: string;
}

interface ItineraryStep {
  id: string;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  images: string[];
  location: string;
  budget?: number;
  tips: string;
}

const BlogPostItinerary: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [steps, setSteps] = useState<ItineraryStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'article
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (postError) {
        if (postError.code === 'PGRST116') {
          setError('Article non trouvé');
        } else {
          throw postError;
        }
        return;
      }

      const formattedPost = {
        ...postData,
        practical_info: typeof postData.practical_info === 'string' ? postData.practical_info : '',
        budget_info: typeof postData.budget_info === 'string' ? postData.budget_info : '',
        transport_info: typeof postData.transport_info === 'string' ? postData.transport_info : ''
      };
      setPost(formattedPost);

      // Récupérer les étapes d'itinéraire
      const { data: stepsData, error: stepsError } = await supabase
        .from('itinerary_steps')
        .select('*')
        .eq('post_id', postData.id)
        .order('day_number');

      if (stepsError) throw stepsError;

      const formattedSteps = stepsData?.map(step => ({
        ...step,
        activities: Array.isArray(step.activities) ? step.activities.map(a => String(a)) : [],
        images: step.images || []
      })) || [];

      setSteps(formattedSteps);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'article:', err);
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
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  const shareArticle = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationNew />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationNew />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Article non trouvé'}
            </h1>
            <p className="text-muted-foreground mb-4">
              L'article que vous recherchez n'existe pas ou n'est pas publié.
            </p>
            <Button onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationNew />
      
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-sm text-muted-foreground">
          <span>Destinations</span> / <span>{post.country}</span> / <span className="text-primary font-medium">{post.location}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex justify-center items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.reading_time} min de lecture
            </span>
          </div>
        </div>

        {post.image_url && (
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-[60vh] object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <Button onClick={shareArticle} variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        )}

        {/* Introduction */}
        <div className="prose prose-lg mx-auto mb-12">
          <p className="lead text-xl text-muted-foreground">
            {post.excerpt}
          </p>
          <div 
            className="mt-6"
            dangerouslySetInnerHTML={{ __html: `<p>${formatContent(post.content)}</p>` }}
          />
        </div>

        {/* Table des matières */}
        {steps.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Itinéraire détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <Badge variant="outline">Jour {step.day_number}</Badge>
                    <span className="text-sm">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Étapes détaillées */}
      <div className="max-w-4xl mx-auto px-4 space-y-12 mb-12">
        {steps.map((step, index) => (
          <Card key={step.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Jour {step.day_number}: {step.title}
                  </CardTitle>
                  {step.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{step.location}</span>
                    </div>
                  )}
                </div>
                {step.budget && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {step.budget}€
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step.description && (
                <p className="text-muted-foreground">{step.description}</p>
              )}

              {/* Activités */}
              {step.activities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <NavigationIcon className="w-4 h-4" />
                    Activités du jour
                  </h4>
                  <ul className="space-y-2">
                    {step.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Images de l'étape */}
              {step.images && step.images.length > 0 && (
                <div className="my-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Camera className="w-4 h-4" />
                    Photos du jour
                  </h4>
                  <div className="relative">
                    <Carousel
                      opts={{ loop: true, align: "start", containScroll: "trimSnaps" }}
                      className="w-full"
                    >
                      <CarouselContent
                        viewportClassName="h-[50vh] md:h-[60vh] lg:h-[70vh] w-full bg-transparent"
                        className="h-full"
                      >
                        {step.images.map((image, imageIndex) => (
                          <CarouselItem key={imageIndex} className="basis-full min-w-0 shrink-0 grow-0">
                            <div className="flex items-center justify-center h-full w-full bg-transparent">
                              <img
                                src={image}
                                alt={`Photo ${imageIndex + 1} - Jour ${step.day_number}`}
                                className="block w-full h-full object-cover object-center select-none"
                                draggable="false"
                                loading="lazy"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious aria-label="Photo précédente" />
                      <CarouselNext aria-label="Photo suivante" />
                    </Carousel>
                  </div>
                </div>
              )}

              {/* Conseils */}
              {step.tips && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Conseils pratiques
                  </h4>
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: step.tips }}
                  />
                </div>
              )}

              {/* Navigation entre les jours */}
              <div className="flex justify-between pt-4">
                {index > 0 && (
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Jour {step.day_number - 1}
                  </Button>
                )}
                <div className="flex-1" />
                {index < steps.length - 1 && (
                  <Button variant="outline" size="sm">
                    Jour {step.day_number + 1}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informations pratiques */}
      {(post.practical_info || post.budget_info || post.transport_info) && (
        <div className="bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Informations pratiques</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {post.practical_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Conseils pratiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: post.practical_info }}
                    />
                  </CardContent>
                </Card>
              )}

              {post.budget_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: post.budget_info }}
                    />
                  </CardContent>
                </Card>
              )}

              {post.transport_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <NavigationIcon className="w-5 h-5" />
                      Transport
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: post.transport_info }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Galerie principale */}
      {post.gallery_images && post.gallery_images.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Galerie photos</h2>
          <ImageGallery images={post.gallery_images} />
        </div>
      )}

      {/* Vidéos YouTube */}
      {post.youtube_videos && post.youtube_videos.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Vidéos du voyage</h2>
          <div className="grid gap-6">
            {post.youtube_videos.map((videoId, index) => (
              <div key={index} className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Vidéo ${index + 1}`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section des commentaires */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <CommentSection postId={post.id} />
      </div>

      <Footer />
    </div>
  );
};

export default BlogPostItinerary;