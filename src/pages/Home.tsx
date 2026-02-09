import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { cars } from '@/data/cars';
import { Layout } from '@/components/layout/Layout';

const heroImages = [
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920',
];

export default function Home() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                opacity: currentSlide === i ? 1 : 0,
                scale: currentSlide === i ? 1 : 1.1,
              }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <img
                src={img}
                alt={`Hero ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-metallic">{t('home.heroTitle')}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking">
                <Button size="lg" className="btn-accent text-white text-lg px-8 h-14">
                  {t('home.bookNow')}
                </Button>
              </Link>
              <Link to="/cars">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 glass">
                  {t('home.viewCars')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={prevSlide} className="glass">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-accent' : 'bg-foreground/30'
                }`}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={nextSlide} className="glass">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.whyChooseUs')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: t('home.premium'), desc: t('home.premiumDesc') },
              { icon: Shield, title: t('home.affordable'), desc: t('home.affordableDesc') },
              { icon: Clock, title: t('home.support'), desc: t('home.supportDesc') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-8 text-center hover-lift"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cars.title')}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('cars.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.slice(0, 3).map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/cars/${car.id}`} className="block">
                  <div className="glass rounded-2xl overflow-hidden hover-lift group">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {car.type} • {car.seats} {t('cars.seats')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-accent">
                          ${car.pricePerDay}
                          <span className="text-sm font-normal text-muted-foreground">
                            {t('cars.perDay')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/cars">
              <Button size="lg" variant="outline" className="glass">
                {t('home.viewCars')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
