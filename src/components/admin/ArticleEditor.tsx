import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

const articleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères'),
  excerpt: z.string().min(10, 'L\'extrait doit contenir au moins 10 caractères'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  location: z.string().min(2, 'Le lieu doit contenir au moins 2 caractères'),
  country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
  reading_time: z.number().min(1).max(60),
  published: z.boolean(),
  image_url: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
  onSaved: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId, onBack, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      location: '',
      country: '',
      reading_time: 5,
      published: false,
      image_url: '',
      gallery_images: [],
    },
  });

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        location: data.location || '',
        country: data.country || '',
        reading_time: data.reading_time || 5,
        published: data.published,
        image_url: data.image_url || '',
        gallery_images: data.gallery_images || [],
      });
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger l\'article.',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Limiter la longueur
  };

  const handlePreview = () => {
    // Pour la prévisualisation, on peut être moins strict sur la validation
    const values = form.getValues();
    console.log('Aperçu de l\'article:', values);
    toast({
      title: 'Prévisualisation',
      description: 'Fonctionnalité de prévisualisation à implémenter.',
    });
  };

  const onSubmit = async (data: ArticleFormData) => {
    setSaving(true);
    
    try {
      const articleData = {
        ...data,
        slug: data.slug || generateSlug(data.title),
      };

      if (articleId) {
        const { error } = await supabase
          .from('posts')
          .update(articleData)
          .eq('id', articleId);

        if (error) throw error;

        toast({
          title: 'Article mis à jour',
          description: 'L\'article a été mis à jour avec succès.',
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([articleData]);

        if (error) throw error;

        toast({
          title: 'Article créé',
          description: 'L\'article a été créé avec succès.',
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'article.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Prévisualiser
          </Button>
          <Button
            type="submit"
            form="article-form"
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {articleId ? 'Modifier l\'article' : 'Nouvel article de voyage'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form id="article-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l'article</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mon voyage extraordinaire à..."
                          {...field}
                           onChange={(e) => {
                             field.onChange(e);
                             // Générer automatiquement le slug si le titre fait plus de 3 caractères
                             if (e.target.value.length >= 3 && !form.getValues('slug')) {
                               const newSlug = generateSlug(e.target.value);
                               form.setValue('slug', newSlug);
                             }
                           }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug URL</FormLabel>
                      <FormControl>
                        <Input placeholder="mon-voyage-extraordinaire" {...field} />
                      </FormControl>
                      <FormDescription>
                        Généré automatiquement à partir du titre
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris, Bali, Tokyo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="France, Indonésie, Japon..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Extrait */}
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extrait</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Un court résumé de votre voyage qui donnera envie de lire la suite..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image principale */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Image principale de l'article</label>
                <ImageUpload
                  onImageUploaded={(url) => form.setValue('image_url', url)}
                  folder="articles"
                  className="border rounded-lg p-4"
                />
              </div>

              {/* Galerie d'images */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Galerie d'images du voyage</label>
                <ImageUpload
                  onImagesUploaded={(urls) => form.setValue('gallery_images', urls)}
                  multiple
                  folder="gallery"
                  className="border rounded-lg p-4"
                />
              </div>

              {/* Contenu principal */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu de l'article</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Racontez votre voyage en détail... Vous pouvez utiliser du Markdown."
                        className="min-h-[300px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Utilisez le Markdown pour formater votre texte (gras, italique, listes, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Paramètres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reading_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temps de lecture (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publier l'article</FormLabel>
                        <FormDescription>
                          L'article sera visible par tous les visiteurs
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleEditor;