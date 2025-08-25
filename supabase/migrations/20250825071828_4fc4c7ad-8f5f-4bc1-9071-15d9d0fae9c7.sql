-- Create albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create album_photos table
CREATE TABLE public.album_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  date_taken TIMESTAMP WITH TIME ZONE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photo_comments table
CREATE TABLE public.photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.album_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Users can view all albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Users can create their own albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own albums" ON public.albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own albums" ON public.albums FOR DELETE USING (auth.uid() = user_id);

-- Album photos policies
CREATE POLICY "Users can view all album photos" ON public.album_photos FOR SELECT USING (true);
CREATE POLICY "Users can manage photos in their albums" ON public.album_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.albums WHERE albums.id = album_photos.album_id AND albums.user_id = auth.uid())
);

-- Photo comments policies
CREATE POLICY "Users can view all photo comments" ON public.photo_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.photo_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.photo_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.photo_comments FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_comments_updated_at
  BEFORE UPDATE ON public.photo_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();