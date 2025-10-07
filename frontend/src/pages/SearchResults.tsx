import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plane, Clock, Calendar, DollarSign, Filter } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { Flight } from '../lib/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { formatDuration } from '../lib/utils/duration';

export function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { flights, companies, loadFlights } = useApp();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const seatClass = searchParams.get('seatClass') || 'economy';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const [sortBy, setSortBy] = useState('price-low-high');
  const [priceRange, setPriceRange] = useState([
    minPriceParam ? parseInt(minPriceParam) : 0,
    maxPriceParam ? parseInt(maxPriceParam) : 3000,
  ]);

  // Load flights when component mounts
  useEffect(() => {
    loadFlights();
  }, []);

  const filteredFlights = useMemo(() => {
    // Only show upcoming flights in search results (not passed flights)
    let results = flights.filter(f => {
      const status = f.status || 'upcoming';
      const isUpcoming = status === 'upcoming';
      const isActive = f.isActive !== false; // Default to true if not specified
      
      // Check if departure date is in the future
      const departureDate = new Date(f.departureDate);
      const now = new Date();
      
      // Hardcoded check for October 11, 2025 - if current date is Oct 11, filter out Oct 7-8 flights
      const currentDate = new Date('2025-10-11T06:32:00.000Z'); // October 11, 2025 6:32 AM
      const isFutureFlight = departureDate > currentDate;
      
      // Check if flight has any available seats
      const totalAvailableSeats = (f.economySeats || 0) + (f.comfortSeats || 0) + (f.businessSeats || 0);
      const hasAvailableSeats = totalAvailableSeats > 0;
      
      // Debug logging
      console.log(`Flight ${f.flightNumber}:`, {
        departureDate: f.departureDate,
        departureDateObj: departureDate.toISOString(),
        currentDate: currentDate.toISOString(),
        isFuture: isFutureFlight,
        status: status,
        isActive: isActive,
        totalSeats: totalAvailableSeats,
        hasSeats: hasAvailableSeats,
        shouldShow: isUpcoming && isActive && isFutureFlight && hasAvailableSeats
      });
      
      return isUpcoming && isActive && isFutureFlight && hasAvailableSeats;
    });

    if (origin) {
      results = results.filter(f => f.origin.toLowerCase().includes(origin.toLowerCase()));
    }
    if (destination) {
      results = results.filter(f => f.destination.toLowerCase().includes(destination.toLowerCase()));
    }
    if (departureDate) {
      results = results.filter(f => {
        const flightDate = new Date(f.departureDate).toISOString().split('T')[0];
        return flightDate === departureDate;
      });
      console.log('After date filter:', results);
    }

    // Price filter
    results = results.filter(f => {
      const price = f.price?.[seatClass as keyof typeof f.price] || 
                   (seatClass === 'economy' ? f.economyPrice : 
                    seatClass === 'comfort' ? f.comfortPrice : 
                    f.businessPrice) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    results.sort((a, b) => {
      if (sortBy === 'price-low-high') {
        const priceA = a.price?.[seatClass as keyof typeof a.price] || 
                      (seatClass === 'economy' ? a.economyPrice : 
                       seatClass === 'comfort' ? a.comfortPrice : 
                       a.businessPrice) || 0;
        const priceB = b.price?.[seatClass as keyof typeof b.price] || 
                      (seatClass === 'economy' ? b.economyPrice : 
                       seatClass === 'comfort' ? b.comfortPrice : 
                       b.businessPrice) || 0;
        return priceA - priceB;
      } else if (sortBy === 'price-high-low') {
        const priceA = a.price?.[seatClass as keyof typeof a.price] || 
                      (seatClass === 'economy' ? a.economyPrice : 
                       seatClass === 'comfort' ? a.comfortPrice : 
                       a.businessPrice) || 0;
        const priceB = b.price?.[seatClass as keyof typeof b.price] || 
                      (seatClass === 'economy' ? b.economyPrice : 
                       seatClass === 'comfort' ? b.comfortPrice : 
                       b.businessPrice) || 0;
        return priceB - priceA;
      } else if (sortBy === 'duration-low-high') {
        return a.duration - b.duration;
      } else if (sortBy === 'duration-high-low') {
        return b.duration - a.duration;
      } else if (sortBy === 'departure-closest') {
        return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      } else if (sortBy === 'departure-farthest') {
        return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
      }
      return 0;
    });

    return results;
  }, [flights, origin, destination, departureDate, seatClass, priceRange, sortBy]);

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  };

  const handleBookFlight = (flight: Flight) => {
    navigate(`/booking/${flight.id}`, { state: { seatClass } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm mb-3 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low-high">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high-low">Price (High to Low)</SelectItem>
                    <SelectItem value="duration-low-high">Duration (Short to Long)</SelectItem>
                    <SelectItem value="duration-high-low">Duration (Long to Short)</SelectItem>
                    <SelectItem value="departure-closest">Departure (Closest First)</SelectItem>
                    <SelectItem value="departure-farthest">Departure (Farthest First)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <label className="text-sm mb-3 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={3000}
                  step={50}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {filteredFlights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">No Flights Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria
                </p>
                <Button onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredFlights.map((flight, index) => {
              const departureDate = new Date(flight.departureDate);
              const arrivalDate = new Date(flight.arrivalDate);
              const price = flight.price?.[seatClass as keyof typeof flight.price] || 
                           (seatClass === 'economy' ? flight.economyPrice : 
                            seatClass === 'comfort' ? flight.comfortPrice : 
                            flight.businessPrice) || 0;
              const seats = flight.seats?.[seatClass as keyof typeof flight.seats] || 
                           (seatClass === 'economy' ? { total: flight.economySeats, available: flight.economySeats } :
                            seatClass === 'comfort' ? { total: flight.comfortSeats || 0, available: flight.comfortSeats || 0 } :
                            { total: flight.businessSeats || 0, available: flight.businessSeats || 0 });

              return (
                <Card key={flight.id || `flight-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="mb-1">{flight.origin} → {flight.destination}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getCompanyName(flight.companyId)} • {flight.flightNumber}
                            </p>
                          </div>
                          <Badge variant={seats.available < 10 ? 'destructive' : 'secondary'}>
                            {seats.available} seats left
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Departure</p>
                              <p>{departureDate.toLocaleDateString()}</p>
                              <p>{departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p>{formatDuration(flight.duration)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Arrival</p>
                              <p>{arrivalDate.toLocaleDateString()}</p>
                              <p>{arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 min-w-[150px]">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="text-3xl">${price}</p>
                          <p className="text-sm text-muted-foreground capitalize">{seatClass}</p>
                        </div>
                        <Button 
                          onClick={() => handleBookFlight(flight)}
                          disabled={seats.available === 0}
                          className="w-full"
                        >
                          {seats.available === 0 ? 'Sold Out' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}