import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Camera, Globe, Heart } from 'lucide-react';

const About = () => {
  // About page component
  const stats = [
    { icon: Globe, label: 'Pays visités', value: '25+' },
    { icon: MapPin, label: 'Villes explorées', value: '150+' },
    { icon: Camera, label: 'Photos prises', value: '5000+' },
    { icon: Heart, label: 'Souvenirs inoubliables', value: '∞' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-playfair">
                À propos de moi
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Passionné de voyages, je parcours le monde pour découvrir de nouvelles cultures, 
                rencontrer des personnes extraordinaires et vivre des aventures uniques.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/me.png"
                alt="Magib Sall" 
                className="w-80 h-80 rounded-full border-4 border-primary shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-center mb-8">Mon Histoire</h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Tout a commencé par une simple curiosité : découvrir ce qui se cache 
                au-delà de l'horizon. Depuis mon premier voyage à l'âge de 20 ans, 
                j'ai attrapé le virus du voyage et n'ai jamais cessé d'explorer.
              </p>
              
              <p>
                Au fil des années, j'ai eu la chance de parcourir des continents entiers, 
                de dormir sous les étoiles du Sahara, de naviguer dans les fjords norvégiens, 
                de méditer dans les temples bouddhistes d'Asie et de danser la salsa 
                dans les rues colorées d'Amérique latine.
              </p>
              
              <p>
                Chaque voyage m'a appris quelque chose de nouveau sur le monde, 
                mais surtout sur moi-même. J'ai découvert que les plus belles richesses 
                ne sont pas matérielles : ce sont les rencontres, les sourires partagés, 
                les moments d'émerveillement face à la beauté de notre planète.
              </p>
              
              <p>
                Aujourd'hui, à travers ce blog, je souhaite partager ces expériences 
                avec vous. Mes récits, conseils pratiques et coups de cœur vous 
                accompagneront dans la préparation de vos propres aventures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Restons en Contact</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Une question sur une destination ? Envie de partager votre propre 
            expérience de voyage ? N'hésitez pas à me contacter !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:magib.sall@cf2m.be"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              M'envoyer un email
            </a>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-transparent hover:bg-primary/10 transition-colors"
            >
              Formulaire de contact
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;