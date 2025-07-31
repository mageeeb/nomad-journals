import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import ArticleEditor from '@/components/admin/ArticleEditor';
import { ItineraryEditor } from '@/components/admin/ItineraryEditor';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Calendar, 
  Clock,
  Users,
  MessageSquare,
  FileText
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  location: string;
  country: string;
  published: boolean;
  created_at: string;
  reading_time: number;
  image_url: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  sent_at: string;
}

type AdminView = 'dashboard' | 'articles' | 'new-article' | 'edit-article' | 'edit-itinerary' | 'contacts';

const Admin = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingItineraryId, setEditingItineraryId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalContacts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les articles
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Charger les messages de contact
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('sent_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Calculer les statistiques
      const totalPosts = postsData?.length || 0;
      const publishedPosts = postsData?.filter(p => p.published).length || 0;
      const totalContacts = contactsData?.length || 0;

      setStats({ totalPosts, publishedPosts, totalContacts });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Article supprimé',
        description: 'L\'article a été supprimé avec succès.',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article.',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Articles totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.publishedPosts}</p>
                <p className="text-sm text-muted-foreground">Articles publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalContacts}</p>
                <p className="text-sm text-muted-foreground">Messages reçus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => setCurrentView('new-article')}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Plus className="w-12 h-12 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Nouvel article</h3>
                <p className="text-sm text-muted-foreground">
                  Créer un nouveau récit de voyage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('contacts')}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <MessageSquare className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Messages de contact</h3>
                <p className="text-sm text-muted-foreground">
                  Voir les messages des visiteurs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderArticlesList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des articles</h2>
        <Button onClick={() => setCurrentView('new-article')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvel article
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}, {post.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.reading_time} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingArticleId(post.id);
                      setCurrentView('edit-article');
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingItineraryId(post.id);
                      setCurrentView('edit-itinerary');
                    }}
                  >
                    Itinéraire
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePost(post.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages de contact</h2>
      
      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(contact.sent_at)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{contact.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (currentView === 'new-article') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleEditor 
            onBack={() => setCurrentView('dashboard')}
            onSaved={() => {
              loadData();
              setCurrentView('articles');
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentView === 'edit-article' && editingArticleId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleEditor 
            articleId={editingArticleId}
            onBack={() => setCurrentView('articles')}
            onSaved={() => {
              loadData();
              setCurrentView('articles');
              setEditingArticleId(null);
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentView === 'edit-itinerary' && editingItineraryId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ItineraryEditor 
            postId={editingItineraryId}
            onBack={() => {
              setCurrentView('articles');
              setEditingItineraryId(null);
            }}
            onSaved={() => {
              loadData();
              setCurrentView('articles');
              setEditingItineraryId(null);
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que: {user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Navigation secondaire */}
        <div className="flex gap-4 mb-8">
          <Button 
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
          >
            Tableau de bord
          </Button>
          <Button 
            variant={currentView === 'articles' ? 'default' : 'outline'}
            onClick={() => setCurrentView('articles')}
          >
            Articles ({stats.totalPosts})
          </Button>
          <Button 
            variant={currentView === 'contacts' ? 'default' : 'outline'}
            onClick={() => setCurrentView('contacts')}
          >
            Messages ({stats.totalContacts})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'articles' && renderArticlesList()}
            {currentView === 'contacts' && renderContacts()}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Admin;