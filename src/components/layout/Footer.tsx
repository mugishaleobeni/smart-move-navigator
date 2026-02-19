import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/cars', label: t('nav.cars') },
    { to: '/booking', label: t('nav.booking') },
    { to: '/contact', label: t('contact.title') },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Glass background */}
      <div className="glass-strong border-t border-border/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 group w-fit">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground transition-smooth group-hover:scale-105">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-metallic-gold">Smart Move</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium car rental services in Rwanda. Experience luxury, comfort, and reliability with Smart Move Transport.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg glass border border-border/50 text-muted-foreground hover:text-accent hover:border-accent/50 transition-smooth hover-lift"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-accent transition-smooth flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-smooth" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70">
                {t('contact.info')}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>+250 788 000 000</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>info@smartmove.rw</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>KG 11 Ave, Kigali, Rwanda</span>
                </li>
              </ul>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70">
                {t('contact.hours')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">Mon – Sat</p>
                    <p>6:00 AM – 9:00 PM</p>
                  </div>
                </li>
                <li className="pl-7 text-xs text-muted-foreground/70">
                  Sunday by appointment
                </li>
              </ul>

              {/* Mini glass card for emergency */}
              <div className="glass border border-accent/20 rounded-xl p-3 mt-4">
                <p className="text-xs font-semibold text-accent mb-1">24/7 Emergency</p>
                <p className="text-xs text-muted-foreground">+250 788 999 999</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Smart Move Transport. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="#" className="hover:text-accent transition-smooth">Privacy Policy</Link>
              <span className="w-px h-3 bg-border" />
              <Link to="#" className="hover:text-accent transition-smooth">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
