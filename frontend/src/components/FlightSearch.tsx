import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { cities } from '../lib/constants';

export function FlightSearch() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('round-trip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [seatClass, setSeatClass] = useState('economy');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: origin || '',
      destination: destination || '',
      departureDate: departureDate || '',
      returnDate: tripType === 'round-trip' ? returnDate || '' : '',
      passengers,
      seatClass,
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border">
      <Tabs value={tripType} onValueChange={setTripType} className="mb-6">
        <TabsList>
          <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way">One Way</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Origin */}
        <div className="space-y-2">
          <Label>From</Label>
          <Input 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter origin city (e.g., New York, Bishkek)"
            list="origin-cities"
          />
          <datalist id="origin-cities">
            {cities.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label>To</Label>
          <Input 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination city (e.g., London, Almaty)"
            list="destination-cities"
          />
          <datalist id="destination-cities">
            {cities.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {/* Departure Date */}
        <div className="space-y-2">
          <Label>Departure Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="pl-10"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Return Date */}
        {tripType === 'round-trip' && (
          <div className="space-y-2">
            <Label>Return Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="pl-10"
                min={departureDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {/* Passengers */}
        <div className="space-y-2">
          <Label>Passengers</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="pl-10"
              min="1"
              max="9"
            />
          </div>
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={seatClass} onValueChange={setSeatClass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="comfort">Comfort</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Min Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Max Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            Search Flights
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}