-- Mettre à jour le rôle de l'utilisateur actuel pour qu'il soit admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '57428853-6ab3-4f3f-88f3-9915624d5221';