import React from 'react';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/15ff9a6d-5fc2-41cc-82c6-046da107e6ef.png" 
                alt="Magib Sall" 
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <h3 className="text-lg font-semibold">Magib Sall</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Passionné de voyages et de découvertes. Je partage mes aventures 
              et conseils pour explorer le monde avec vous.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:nanouchkaly@yahoo.fr" className="text-muted-foreground hover:text-primary transition-colors">
                  nanouchkaly@yahoo.fr
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+32498150284" className="text-muted-foreground hover:text-primary transition-colors">
                  +32 498 15 02 84
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Belgique</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens Rapides</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Articles
              </a>
              <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                À propos
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <a href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Connexion
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
            <span>© 2024 Magib Sall. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>pour les voyageurs</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;