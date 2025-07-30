import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  accepted_terms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions'
  })
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      accepted_terms: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Sauvegarder dans la base de données
      const { error: dbError } = await supabase
        .from('contacts')
        .insert([data]);

      if (dbError) throw dbError;

      // Envoyer l'email
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          message: data.message,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // On continue même si l'email échoue, car le message est sauvegardé
      }

      toast({
        title: 'Message envoyé !',
        description: 'Votre message a été envoyé avec succès. Je vous répondrai dans les plus brefs délais.',
      });

      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'magib.sall@cf2m.be',
      action: 'mailto:magib.sall@cf2m.be'
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+32 498 15 02 84',
      action: 'tel:+32498150284'
    },
    {
      icon: MapPin,
      label: 'Localisation',
      value: 'Belgique',
      action: null
    },
    {
      icon: Clock,
      label: 'Réponse',
      value: 'Sous 24h',
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Contactez-moi
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une question sur une destination ? Un conseil pour votre prochain voyage ? 
            N'hésitez pas à me contacter, je serai ravi de vous aider !
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Envoyez-moi un message</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Parlez-moi de votre projet de voyage..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accepted_terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              J'accepte que mes données soient utilisées pour me recontacter
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <img 
                  src="/lovable-uploads/15ff9a6d-5fc2-41cc-82c6-046da107e6ef.png" 
                  alt="Magib Sall" 
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <div>
                  <h3 className="text-2xl font-semibold">Magib Sall</h3>
                  <p className="text-muted-foreground">Blogueur voyage</p>
                </div>
              </div>

              <div className="prose prose-sm text-muted-foreground">
                <p>
                  Passionné de voyages depuis plus de 10 ans, je partage mes expériences 
                  et conseils pour vous aider à organiser vos propres aventures. 
                  Que vous cherchiez des conseils sur une destination spécifique ou 
                  des astuces pour voyager malin, je suis là pour vous accompagner !
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center space-x-3">
                      <info.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">{info.label}</div>
                        {info.action ? (
                          <a 
                            href={info.action}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <div className="text-sm text-muted-foreground">{info.value}</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-primary/5">
                <h4 className="font-semibold mb-2">Temps de réponse</h4>
                <p className="text-sm text-muted-foreground">
                  Je m'efforce de répondre à tous les messages dans les 24 heures. 
                  Pour les demandes urgentes, n'hésitez pas à me contacter directement 
                  par téléphone.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;