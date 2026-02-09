import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import { cars, getCarById } from '@/data/cars';
import { Layout } from '@/components/layout/Layout';
import { useOnlineStatus } from '@/components/offline/OfflineBanner';
import { cn } from '@/lib/utils';

const STEPS = ['selectCar', 'enterLocation', 'selectDateTime', 'confirm'] as const;

interface BookingData {
  carId: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: Date | undefined;
  time: string;
  duration: number;
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();

  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<BookingData>({
    carId: searchParams.get('car') || '',
    pickupLocation: '',
    dropoffLocation: '',
    date: undefined,
    time: '',
    duration: 1,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedCar = booking.carId ? getCarById(booking.carId) : undefined;

  const calculatePrice = () => {
    if (!selectedCar) return 0;
    return selectedCar.pricePerHour * booking.duration;
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!booking.carId;
      case 1:
        return !!booking.pickupLocation && !!booking.dropoffLocation;
      case 2:
        return !!booking.date && !!booking.time && booking.duration > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    const bookingData = {
      ...booking,
      date: booking.date?.toISOString(),
      price: calculatePrice(),
      createdAt: new Date().toISOString(),
    };

    if (!isOnline) {
      // Save to localStorage for offline sync
      const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      pending.push(bookingData);
      localStorage.setItem('pendingBookings', JSON.stringify(pending));
    }

    setIsSubmitted(true);
  };

  // Offline sync
  useEffect(() => {
    if (isOnline) {
      const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      if (pending.length > 0) {
        // In a real app, submit to backend here
        console.log('Syncing pending bookings:', pending);
        localStorage.setItem('pendingBookings', '[]');
      }
    }
  }, [isOnline]);

  if (isSubmitted) {
    return (
      <Layout>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center glass rounded-2xl p-8"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">{t('booking.success')}</h1>
              <p className="text-muted-foreground mb-8">
                {!isOnline ? t('booking.offlineMessage') : t('booking.successMessage')}
              </p>
              <Button onClick={() => navigate('/')} className="btn-accent text-white">
                {t('common.back')}
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('booking.title')}</h1>
          </motion.div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                      i <= step
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-12 md:w-24 h-1 mx-2',
                        i < step ? 'bg-accent' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs md:text-sm text-muted-foreground">
              {STEPS.map((s) => (
                <span key={s} className="text-center w-20 md:w-auto">
                  {t(`booking.${s}`)}
                </span>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-2xl p-8"
              >
                {/* Step 0: Select Car */}
                {step === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{t('booking.selectCar')}</h2>
                    <div className="grid gap-4">
                      {cars.map((car) => (
                        <button
                          key={car.id}
                          onClick={() => setBooking({ ...booking, carId: car.id })}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-xl transition-all text-left',
                            booking.carId === car.id
                              ? 'bg-accent/20 border-2 border-accent'
                              : 'bg-muted/50 border-2 border-transparent hover:border-accent/50'
                          )}
                        >
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-20 h-14 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{car.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {car.type} • {car.seats} {t('cars.seats')}
                            </div>
                          </div>
                          <div className="text-accent font-bold">
                            ${car.pricePerHour}{t('cars.perHour')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Location */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{t('booking.enterLocation')}</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pickup">{t('booking.pickupLocation')}</Label>
                        <div className="relative mt-2">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="pickup"
                            value={booking.pickupLocation}
                            onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })}
                            className="pl-10"
                            placeholder="Enter pickup location"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="dropoff">{t('booking.dropoffLocation')}</Label>
                        <div className="relative mt-2">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="dropoff"
                            value={booking.dropoffLocation}
                            onChange={(e) => setBooking({ ...booking, dropoffLocation: e.target.value })}
                            className="pl-10"
                            placeholder="Enter dropoff location"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{t('booking.selectDateTime')}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>{t('booking.date')}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full mt-2 justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {booking.date ? format(booking.date, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={booking.date}
                              onSelect={(date) => setBooking({ ...booking, date })}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>{t('booking.time')}</Label>
                        <Select
                          value={booking.time}
                          onValueChange={(time) => setBooking({ ...booking, time })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {i.toString().padStart(2, '0')}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>{t('booking.duration')}</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <Select
                          value={booking.duration.toString()}
                          onValueChange={(d) => setBooking({ ...booking, duration: parseInt(d) })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} {t('booking.hours')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && selectedCar && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{t('booking.priceEstimate')}</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <img
                          src={selectedCar.image}
                          alt={selectedCar.name}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-semibold">{selectedCar.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedCar.type}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <div className="text-muted-foreground mb-1">{t('booking.pickupLocation')}</div>
                          <div className="font-medium">{booking.pickupLocation}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <div className="text-muted-foreground mb-1">{t('booking.dropoffLocation')}</div>
                          <div className="font-medium">{booking.dropoffLocation}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <div className="text-muted-foreground mb-1">{t('booking.date')}</div>
                          <div className="font-medium">
                            {booking.date ? format(booking.date, 'PPP') : '-'}
                          </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <div className="text-muted-foreground mb-1">{t('booking.time')}</div>
                          <div className="font-medium">
                            {booking.time} ({booking.duration} {t('booking.hours')})
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-accent/10 rounded-xl flex items-center justify-between">
                        <div className="text-lg font-semibold">{t('booking.total')}</div>
                        <div className="text-3xl font-bold text-accent">${calculatePrice()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      {t('booking.previous')}
                    </Button>
                  )}
                  {step === 0 && <div />}
                  
                  {step < STEPS.length - 1 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="btn-accent text-white gap-2"
                    >
                      {t('booking.next')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="btn-accent text-white gap-2"
                    >
                      {t('booking.confirm')}
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
}
