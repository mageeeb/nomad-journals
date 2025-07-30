import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapPin, Camera, Plane, Heart, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  const cities = [
    'Genève', 'Dakar', 'Saint-Louis', 'Bretagne', 
    'Guadeloupe', 'île de Groix', 'Bruxelles', 
    'Paris', 'Milan', 'etc...'
  ];
  
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIndex((prev) => (prev + 1) % cities.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [cities.length]);

  const features = [
    {
      icon: Plane,
      title: 'Destinations uniques',
      description: 'Découvrez des lieux extraordinaires hors des sentiers battus'
    },
    {
      icon: Camera,
      title: 'Récits authentiques',
      description: 'Des histoires vraies et des expériences vécues sur le terrain'
    },
    {
      icon: MapPin,
      title: 'Conseils pratiques',
      description: 'Tout ce que vous devez savoir pour organiser vos voyages'
    },
    {
      icon: Heart,
      title: 'Passion partagée',
      description: 'L\'amour du voyage transmis avec enthusiasm et authenticité'
    }
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
                Explorez le monde à travers des villes comme
                <span className="text-primary block relative h-20 flex items-center">
                  <span 
                    key={currentCityIndex}
                    className="absolute animate-fade-in font-semibold"
                  >
                    "{cities[currentCityIndex]}"
                  </span>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Bienvenue sur mon blog de voyage ! Découvrez mes aventures à travers 
                le globe, mes conseils pour voyager malin et laissez-vous inspirer 
                pour votre prochaine escapade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/blog">
                    Découvrir mes voyages
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/about">En savoir plus</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/lovable-uploads/15ff9a6d-5fc2-41cc-82c6-046da107e6ef.png" 
                alt="Magib Sall" 
                className="w-80 h-80 rounded-full border-4 border-primary shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-playfair">
              Pourquoi suivre mes aventures ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Plus qu'un simple blog, c'est une invitation au voyage et à la découverte
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-8 pb-6">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-playfair">
            Prêt pour l'aventure ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez-moi dans mes découvertes et commencez à planifier 
            votre prochain voyage dès maintenant !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/blog">Lire les articles</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/contact">Me contacter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Quick Access (if logged in as admin) */}
      {user && isAdmin && (
        <section className="py-8 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-4 bg-background p-4 rounded-lg border">
              <span className="text-sm text-muted-foreground">Mode Admin :</span>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">Tableau de bord</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
