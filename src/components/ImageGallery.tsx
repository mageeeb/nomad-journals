import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const imageRef = useRef<HTMLDivElement>(null);

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

  // Gestion des gestes tactiles pour mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
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
          className={`${isMobile ? 'max-w-[100vw] max-h-[100vh] w-screen h-screen rounded-none' : 'max-w-[95vw] max-h-[95vh]'} p-0 bg-black/95 border-none`}
          onKeyDown={handleKeyDown}
        >
          {selectedImageIndex !== null && (
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              ref={imageRef}
            >
              {/* Bouton fermer */}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10 text-white hover:bg-white/20`}
                onClick={closeLightbox}
              >
                <X className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`} />
              </Button>

              {/* Navigation précédente - cachée sur mobile */}
              {selectedImageIndex > 0 && !isMobile && (
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
              <div className={`relative max-w-full max-h-full ${isMobile ? 'p-2' : 'p-8'}`}>
                <img
                  src={images[selectedImageIndex]}
                  alt={`Galerie ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain animate-scale-in"
                />
              </div>

              {/* Navigation suivante - cachée sur mobile */}
              {selectedImageIndex < images.length - 1 && !isMobile && (
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
              <div className={`absolute ${isMobile ? 'top-14' : 'bottom-4'} left-1/2 -translate-x-1/2 z-10`}>
                <div className="bg-black/50 rounded-full px-4 py-2 text-white text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Miniatures - cachées sur mobile */}
              {!isMobile && (
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
              )}

              {/* Instructions de swipe sur mobile */}
              {isMobile && images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-black/50 rounded-full px-4 py-2 text-white text-xs">
                    Glissez pour naviguer
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;