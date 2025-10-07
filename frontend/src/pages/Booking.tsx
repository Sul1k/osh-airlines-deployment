import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Clock, User, Mail, CheckCircle, Plus, Minus } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatDuration } from '../lib/utils/duration';

export function Booking() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { flights, companies, addBooking, currentUser, loadFlights } = useApp();

  const [seatClass, setSeatClass] = useState<'economy' | 'comfort' | 'business'>(
    (location.state?.seatClass as 'economy' | 'comfort' | 'business') || 'economy'
  );
  const [passengerName, setPassengerName] = useState(currentUser?.name || '');
  const [passengerEmail, setPassengerEmail] = useState(currentUser?.email || '');
  const [quantity, setQuantity] = useState(1);
  const [confirmationId, setConfirmationId] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  // Load flights when component mounts
  useEffect(() => {
    loadFlights();
  }, []);

  const flight = flights.find(f => f.id === id);

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2>Flight Not Found</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const company = companies.find(c => c.id === flight.companyId);
  const pricePerTicket = flight.price?.[seatClass] || (seatClass === 'economy' ? flight.economyPrice : 
                                              seatClass === 'comfort' ? flight.comfortPrice : 
                                              flight.businessPrice) || 0;
  const totalPrice = pricePerTicket * quantity;
  const seats = (seatClass === 'economy' ? { total: flight.economySeats, available: flight.economySeats } :
                 seatClass === 'comfort' ? { total: flight.comfortSeats || 0, available: flight.comfortSeats || 0 } :
                 { total: flight.businessSeats || 0, available: flight.businessSeats || 0 });
  const departureDate = new Date(flight.departureDate);
  const arrivalDate = new Date(flight.arrivalDate);

  const handleBooking = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (seats.available < quantity) {
      error(`Only ${seats.available} seats available in ${seatClass} class`);
      return;
    }

    try {
      // Create multiple bookings for the quantity
      const confirmationIds = [];
      for (let i = 0; i < quantity; i++) {
        const confirmId = await addBooking({
          userId: currentUser.id,
          flightId: flight.id,
          passengerName,
          passengerEmail,
          seatClass,
          price: pricePerTicket,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        confirmationIds.push(confirmId);
      }

      setConfirmationId(confirmationIds.join(', '));
      setIsBooked(true);
      success(`Successfully booked ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  if (isBooked) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Your flight has been successfully booked
              </p>

              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Confirmation ID{quantity > 1 ? 's' : ''}
                </p>
                <p className="text-2xl mb-4 break-all">{confirmationId}</p>
                <p className="text-sm text-muted-foreground">
                  Please save {quantity > 1 ? 'these confirmation IDs' : 'this confirmation ID'} for future reference
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flight Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-1">{flight.origin} → {flight.destination}</h3>
                  <p className="text-sm text-muted-foreground">
                    {company?.name} • {flight.flightNumber}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Departure</p>
                  <p>{departureDate.toLocaleDateString()}</p>
                  <p className="text-sm">{departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Arrival</p>
                  <p>{arrivalDate.toLocaleDateString()}</p>
                  <p className="text-sm">{arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Duration: {formatDuration(flight.duration)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passenger Information</CardTitle>
              <CardDescription>Please provide passenger details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Seat Class</Label>
                <Select value={seatClass} onValueChange={(v) => setSeatClass(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">
                      Economy - ${flight.economyPrice} ({flight.economySeats} available)
                    </SelectItem>
                    <SelectItem value="comfort">
                      Comfort - ${flight.comfortPrice || 0} ({flight.comfortSeats || 0} available)
                    </SelectItem>
                    <SelectItem value="business">
                      Business - ${flight.businessPrice || 0} ({flight.businessSeats || 0} available)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Tickets</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={seats.available}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(value, seats.available)));
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(seats.available, quantity + 1))}
                    disabled={quantity >= seats.available}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum {seats.available} tickets available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Route</span>
                  <span>{flight.origin} → {flight.destination}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class</span>
                  <span className="capitalize">{seatClass}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Passengers</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per ticket</span>
                  <span>${pricePerTicket}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span>Total Amount</span>
                <span className="text-2xl">${totalPrice}</span>
              </div>

              {seats.available === 0 ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    No seats available in {seatClass} class
                  </AlertDescription>
                </Alert>
              ) : seats.available < 5 ? (
                <Alert>
                  <AlertDescription>
                    Only {seats.available} seats left in {seatClass} class!
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button 
                className="w-full" 
                onClick={handleBooking}
                disabled={!passengerName || !passengerEmail || seats.available === 0}
              >
                Confirm & Pay ${totalPrice}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By confirming, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}