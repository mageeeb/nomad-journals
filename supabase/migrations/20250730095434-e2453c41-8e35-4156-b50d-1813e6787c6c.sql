-- Ajouter la colonne youtube_videos à la table posts
ALTER TABLE public.posts 
ADD COLUMN youtube_videos TEXT[] DEFAULT '{}';

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.posts.youtube_videos IS 'Array of YouTube iframe embeds for travel videos';