import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Grille de galerie */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image}
              alt={`Galerie ${index + 1}`}
              className="w-full h-64 object-cover transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          {selectedImageIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Bouton fermer */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation précédente */}
              {selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              )}

              {/* Image principale */}
              <div className="relative max-w-full max-h-full p-8">
                <img
                  src={images[selectedImageIndex]}
                  alt={`Galerie ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain animate-scale-in"
                />
              </div>

              {/* Navigation suivante */}
              {selectedImageIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              )}

              {/* Indicateur de position */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-black/50 rounded-full px-4 py-2 text-white text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Miniatures */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      index === selectedImageIndex 
                        ? 'ring-2 ring-white scale-110' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;