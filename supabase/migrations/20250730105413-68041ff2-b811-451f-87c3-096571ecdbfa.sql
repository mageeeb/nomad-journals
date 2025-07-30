-- Add replies table (only admins can reply)
CREATE TABLE public.comment_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Add reactions table (likes/hearts)
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_reaction_comment FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for replies (only admins can create)
CREATE POLICY "Anyone can view replies" ON public.comment_replies FOR SELECT USING (true);
CREATE POLICY "Only admins can create replies" ON public.comment_replies FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies for reactions
CREATE POLICY "Anyone can view reactions" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their reactions" ON public.comment_reactions FOR ALL USING (auth.uid() = user_id);