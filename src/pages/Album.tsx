import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PhotoCommentModal from '@/components/PhotoCommentModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Camera, 
  Heart, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Image as ImageIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Album {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface AlbumPhoto {
  id: string;
  image_url: string;
  caption: string;
  date_taken: string;
  position: number;
  album_id: string;
}

const Album: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const { user } = useAuth();

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          id,
          title,
          description,
          cover_image,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = data?.map(album => album.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine albums with profiles
      const albumsWithProfiles = data?.map(album => ({
        ...album,
        profiles: profiles?.find(profile => profile.user_id === album.user_id) || {
          full_name: 'Auteur',
          avatar_url: null
        }
      })) || [];

      setAlbums(albumsWithProfiles);
      
      // Auto-select first album if none selected
      if (albumsWithProfiles && albumsWithProfiles.length > 0 && !selectedAlbum) {
        setSelectedAlbum(albumsWithProfiles[0]);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les albums",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from('album_photos')
        .select('*')
        .eq('album_id', albumId)
        .order('position', { ascending: true });

      if (error) throw error;
      setAlbumPhotos(data || []);
    } catch (error) {
      console.error('Error fetching album photos:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos de l'album",
        variant: "destructive",
      });
    }
  };

  const handlePhotoClick = (photo: AlbumPhoto) => {
    setSelectedPhoto(photo);
    setShowCommentModal(true);
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      ?.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const getMonthName = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: fr });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      fetchAlbumPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-32 mx-auto"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold capitalize animate-fade-in">
              {getMonthName(currentMonth)}
            </h1>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Camera className="w-5 h-5" />
            <span>{albumPhotos.length} photos</span>
          </div>
        </div>

        {/* Featured Album Header */}
        {selectedAlbum && (
          <Card className="mb-8 overflow-hidden">
            <div className="relative h-64 md:h-80">
              <img
                src={selectedAlbum.cover_image || '/placeholder.svg'}
                alt={selectedAlbum.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">
                  {selectedAlbum.title}
                </h2>
                {selectedAlbum.description && (
                  <p className="text-lg opacity-90 max-w-2xl">
                    {selectedAlbum.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedAlbum.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(selectedAlbum.profiles?.full_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {selectedAlbum.profiles?.full_name || 'Auteur'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(selectedAlbum.created_at), 'd MMM yyyy', { locale: fr })}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Photos Grid */}
        <div className="space-y-6">
          {albumPhotos.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune photo dans cet album</h3>
              <p className="text-muted-foreground">
                {user ? 'Commencez à ajouter des photos à votre album' : 'Cet album est vide pour le moment'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumPhotos.map((photo, index) => (
                <Card 
                  key={photo.id}
                  className="group cursor-pointer overflow-hidden hover-scale transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-4 text-white">
                        <div className="flex items-center gap-1 bg-black/50 rounded-full px-3 py-1">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">0</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/50 rounded-full px-3 py-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Commenter</span>
                        </div>
                      </div>
                    </div>

                    {/* Photo info */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Album Navigation */}
        {albums.length > 1 && (
          <div className="mt-12 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Autres albums</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {albums
                .filter(album => album.id !== selectedAlbum?.id)
                .slice(0, 4)
                .map((album) => (
                  <Card 
                    key={album.id}
                    className="cursor-pointer hover-scale transition-all duration-200"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={album.cover_image || '/placeholder.svg'}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {album.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(album.created_at), 'MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Photo Comment Modal */}
      {selectedPhoto && (
        <PhotoCommentModal
          isOpen={showCommentModal}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedPhoto(null);
          }}
          photoId={selectedPhoto.id}
          photoUrl={selectedPhoto.image_url}
          caption={selectedPhoto.caption}
        />
      )}

      <Footer />
    </div>
  );
};

export default Album;