import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Shield, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { FlightSearch } from '../components/FlightSearch';
import { useApp } from '../lib/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatDuration } from '../lib/utils/duration';

export function Home() {
  const { banners, flights, companies, loadFlights, loadBanners, loadCompanies } = useApp();
  const [currentBanner, setCurrentBanner] = useState(0);

  // Load data when component mounts
  useEffect(() => {
    console.log('🏠 Home page: Loading flights, banners, and companies...');
    loadFlights();
    loadBanners();
    loadCompanies();
  }, []);

  const activeBanners = banners.filter(b => b.active);

  useEffect(() => {
    if (activeBanners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
    }, activeBanners[currentBanner]?.duration * 1000 || 5000);

    return () => clearInterval(timer);
  }, [currentBanner, activeBanners]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Featured flights (upcoming, limited seats, with available seats)
  const featuredFlights = flights
    .filter(f => {
      const isActive = f.isActive;
      const isUpcoming = f.status === 'upcoming' || new Date(f.departureDate) > new Date();
      const hasAvailableSeats = (f.economySeats || 0) + (f.comfortSeats || 0) + (f.businessSeats || 0) > 0;
      return isActive && isUpcoming && hasAvailableSeats;
    })
    .slice(0, 3);

  // Console logging for flights
  useEffect(() => {
    console.log('✈️ All flights loaded:', flights.length);
    console.log('✈️ Upcoming flights:', featuredFlights.length);
    console.log('✈️ Featured flights:', featuredFlights.map(f => ({ 
      flightNumber: f.flightNumber, 
      origin: f.origin, 
      destination: f.destination,
      departureDate: f.departureDate,
      isUpcoming: new Date(f.departureDate) > new Date()
    })));
  }, [flights, featuredFlights]);

  // Console logging for banners
  useEffect(() => {
    console.log('🎯 All banners loaded:', banners.length);
    console.log('🎯 Active banners:', activeBanners.length);
    console.log('🎯 Banner details:', activeBanners.map(b => ({
      title: b.title,
      link: b.link,
      hasLink: !!b.link,
      linkType: typeof b.link
    })));
  }, [banners, activeBanners]);

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  };

  return (
    <div>
      {/* Hero Banner Carousel */}
      {activeBanners.length > 0 && (
        <div className="relative h-[500px] overflow-hidden bg-muted">
          {activeBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{
                pointerEvents: index === currentBanner ? 'auto' : 'none'
              }}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
                <div className="container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    <Badge className="mb-4">{banner.type}</Badge>
                    <h1 className="mb-4">{banner.title}</h1>
                    <p className="mb-6 text-lg">{banner.description}</p>
                    {banner.link ? (
                      <a 
                        href={banner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block"
                        onClick={(e) => {
                          console.log('Banner link clicked:', banner.link);
                          console.log('Banner title:', banner.title);
                          console.log('Event target:', e.target);
                          console.log('Event currentTarget:', e.currentTarget);
                          console.log('Current banner index:', currentBanner);
                          console.log('This banner index:', index);
                          // Force the link to open
                          if (banner.link) {
                            window.open(banner.link, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        style={{ 
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Button size="lg" variant="secondary">
                          Learn More
                        </Button>
                      </a>
                    ) : (
                      <div className="text-sm text-gray-400">
                        No link available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBanner ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-10 mb-16">
        <FlightSearch />
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card key="best-prices">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">
                Competitive fares on all routes
              </p>
            </CardContent>
          </Card>

          <Card key="safe-travel">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2">Safe Travel</h3>
              <p className="text-sm text-muted-foreground">
                Your safety is our priority
              </p>
            </CardContent>
          </Card>

          <Card key="support">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Always here to help you
              </p>
            </CardContent>
          </Card>

          <Card key="premium-service">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2">Premium Service</h3>
              <p className="text-sm text-muted-foreground">
                Luxury experience guaranteed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Offers */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="mb-2">Featured Flights</h2>
            <p className="text-muted-foreground">Book these popular destinations now</p>
          </div>
          <Link to="/search">
            <Button variant="outline">View All Flights</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredFlights.map((flight, index) => {
            const departureDate = new Date(flight.departureDate);
            const totalSeats = flight.economySeats + (flight.comfortSeats || 0) + (flight.businessSeats || 0);
            const seatsFilled = Math.floor(totalSeats * 0.7); // Mock data - 70% filled
            const percentageFilled = Math.round((seatsFilled / totalSeats) * 100);

            return (
              <Card key={flight.id || `flight-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{flight.origin} → {flight.destination}</CardTitle>
                      <CardDescription>{getCompanyName(flight.companyId)}</CardDescription>
                    </div>
                    <Badge variant={percentageFilled > 80 ? 'destructive' : 'secondary'}>
                      {percentageFilled}% Full
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Flight</span>
                      <span>{flight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>{departureDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{formatDuration(flight.duration)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="text-2xl">${flight.economyPrice}</span>
                    </div>
                    <Link to={`/booking/${flight.id}`}>
                      <Button className="w-full">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}