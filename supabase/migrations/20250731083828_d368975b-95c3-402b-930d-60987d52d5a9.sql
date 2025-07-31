-- Ajouter de nouveaux champs pour la structure des itinéraires
ALTER TABLE public.posts 
ADD COLUMN itinerary_days jsonb,
ADD COLUMN practical_info jsonb,
ADD COLUMN budget_info jsonb,
ADD COLUMN transport_info jsonb;

-- Créer une table pour les étapes d'itinéraire
CREATE TABLE public.itinerary_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activities jsonb,
  images TEXT[],
  location TEXT,
  budget DECIMAL,
  tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itinerary_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for itinerary steps
CREATE POLICY "Public can view published itinerary steps" 
ON public.itinerary_steps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = itinerary_steps.post_id 
  AND posts.published = true
));

CREATE POLICY "Admins can manage all itinerary steps" 
ON public.itinerary_steps 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_itinerary_steps_updated_at
BEFORE UPDATE ON public.itinerary_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();