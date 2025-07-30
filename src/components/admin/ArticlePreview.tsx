import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Share2, ArrowLeft } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  location: string;
  country: string;
  reading_time: number;
  published: boolean;
  image_url?: string;
  gallery_images?: string[];
}

interface ArticlePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  articleData: ArticleData;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ isOpen, onClose, articleData }) => {
  const formatContent = (content: string) => {
    // Simple formatage Markdown basique
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          {/* Header de l'article */}
          <div className="relative">
            {articleData.image_url && (
              <div className="h-[50vh] relative overflow-hidden">
                <img 
                  src={articleData.image_url} 
                  alt={articleData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="container mx-auto">
                    <Button 
                      variant="ghost" 
                      onClick={onClose}
                      className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Fermer l'aperçu
                    </Button>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        APERÇU
                      </Badge>
                      {!articleData.published && (
                        <Badge variant="destructive">
                          NON PUBLIÉ
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      {articleData.title || 'Titre de l\'article'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90">
                      {articleData.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{articleData.location}, {articleData.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{currentDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{articleData.reading_time} min de lecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!articleData.image_url && (
              <div className="bg-gradient-to-r from-primary to-primary/80 py-16">
                <div className="container mx-auto px-4">
                  <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Fermer l'aperçu
                  </Button>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white text-primary">
                      APERÇU
                    </Badge>
                    {!articleData.published && (
                      <Badge variant="destructive">
                        NON PUBLIÉ
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                    {articleData.title || 'Titre de l\'article'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90">
                    {articleData.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{articleData.location}, {articleData.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{currentDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{articleData.reading_time} min de lecture</span>
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
              {articleData.excerpt && (
                <div className="mb-12">
                  <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6">
                    {articleData.excerpt}
                  </p>
                </div>
              )}

              {/* Bouton de partage */}
              <div className="flex justify-center mb-12">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled
                >
                  <Share2 className="w-4 h-4" />
                  Partager cet article
                </Button>
              </div>

              {/* Contenu principal */}
              {articleData.content && (
                <div className="prose prose-lg max-w-none mb-16">
                  <div 
                    className="text-foreground leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{ 
                      __html: `<p>${formatContent(articleData.content)}</p>` 
                    }}
                  />
                </div>
              )}

              {/* Galerie d'images */}
              {articleData.gallery_images && articleData.gallery_images.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                    Galerie du voyage
                  </h3>
                  <ImageGallery images={articleData.gallery_images} />
                </div>
              )}

              {/* Message d'information pour l'aperçu */}
              <div className="mt-20 pt-12 border-t border-border">
                <div className="text-center">
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aperçu de l'article
                    </h3>
                    <p className="text-muted-foreground">
                      Ceci est un aperçu de votre article. Les visiteurs verront exactement ceci une fois l'article publié.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticlePreview;