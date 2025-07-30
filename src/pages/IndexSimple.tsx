import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Camera, Plane, Heart } from 'lucide-react';

console.log('IndexSimple: Starting to define component');

const IndexSimple = () => {
  console.log('IndexSimple: Component rendering');

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
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Explorez le Monde avec
                <span className="text-primary block">Magib Sall</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Bienvenue sur mon blog de voyage ! Version simplifiée pour test.
              </p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Version Simplifiée - Test
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Application sans contexte complexe pour résoudre les problèmes de cache
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
    </div>
  );
};

console.log('IndexSimple: Component defined');

export default IndexSimple;