-- Créer le bucket de stockage pour les images de voyage
INSERT INTO storage.buckets (id, name, public) VALUES ('travel-images', 'travel-images', true);

-- Ajouter des colonnes supplémentaires à la table posts pour les informations de voyage
ALTER TABLE public.posts 
ADD COLUMN location TEXT,
ADD COLUMN country TEXT,
ADD COLUMN gallery_images TEXT[],
ADD COLUMN excerpt TEXT,
ADD COLUMN reading_time INTEGER DEFAULT 5;

-- Créer des politiques de stockage pour les images
-- Les admins peuvent uploader des images
CREATE POLICY "Admins can upload travel images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'travel-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent voir toutes les images
CREATE POLICY "Admins can view travel images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'travel-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent supprimer des images
CREATE POLICY "Admins can delete travel images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'travel-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Tout le monde peut voir les images publiquement
CREATE POLICY "Public can view travel images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'travel-images');