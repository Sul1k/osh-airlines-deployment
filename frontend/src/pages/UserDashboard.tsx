import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Search, User, Clock, Ban, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export function UserDashboard() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();
  const { currentUser, bookings, flights, companies, cancelBooking, changePassword, loadUserBookings } = useApp();
  const [searchConfirmation, setSearchConfirmation] = useState('');
  const [searchResult, setSearchResult] = useState<{ booking: any; flight: any; company: any } | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user's bookings when component mounts
  useEffect(() => {
    if (currentUser && currentUser.role === 'user') {
      loadUserBookings(currentUser.id);
    }
  }, [currentUser?.id]); // Only depend on user ID, not the entire currentUser object

  if (!currentUser || currentUser.role !== 'user') {
    navigate('/login');
    return null;
  }

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  const getFlightDetails = (flightId: string) => {
    return flights.find(f => f.id === flightId);
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  };

  const handleSearchByConfirmation = () => {
    const booking = bookings.find(b => b.confirmationId.toLowerCase() === searchConfirmation.toLowerCase());
    if (booking) {
      const flight = getFlightDetails(booking.flightId);
      const company = flight ? companies.find(c => c.id === flight.companyId) : null;
      setSearchResult({ booking, flight, company: company || null });
    } else {
      setSearchResult(null);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword(currentUser.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (error) {
      // Error is already handled in the changePassword function
    }
  };

  // Function to determine the display status based on booking status and flight time
  const getDisplayStatus = (booking: any) => {
    const flight = getFlightDetails(booking.flightId);
    if (!flight) return booking.status;
    
    const departureDate = new Date(flight.departureDate);
    const now = new Date();
    const hasDeparted = departureDate < now;
    
    // If booking is cancelled or refunded, keep that status
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      return booking.status;
    }
    
    // If flight has departed, show as 'passed'
    if (hasDeparted) {
      return 'passed';
    }
    
    // If flight hasn't departed and booking is confirmed, show as 'confirmed'
    if (booking.status === 'confirmed' || booking.status === 'booked') {
      return 'confirmed';
    }
    
    return booking.status;
  };

  const canCancel = (flightId: string, status: string) => {
    // Allow cancellation for 'confirmed' status only
    if (status !== 'confirmed') return false;
    const flight = getFlightDetails(flightId);
    if (!flight) return false;
    const departureDate = new Date(flight.departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDeparture > 0;
  };

  const getRefundInfo = (flightId: string) => {
    const flight = getFlightDetails(flightId);
    if (!flight) return { eligible: false, message: '' };
    
    const departureDate = new Date(flight.departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeparture >= 24) {
      return { 
        eligible: true, 
        message: 'Full refund available (24+ hours before departure)' 
      };
    } else if (hoursUntilDeparture > 0) {
      return { 
        eligible: false, 
        message: 'No refund (less than 24 hours before departure)' 
      };
    } else {
      return { 
        eligible: false, 
        message: 'Flight has already departed' 
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'passed':
        return <Badge className="bg-gray-500"><Clock className="w-3 h-3 mr-1" />Passed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
      case 'booked':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your bookings and view flight schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p>{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Bookings</span>
                  <span>{userBookings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span>{userBookings.filter(b => getDisplayStatus(b) === 'confirmed').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{userBookings.filter(b => {
                    const displayStatus = getDisplayStatus(b);
                    return displayStatus === 'refunded' || displayStatus === 'cancelled' || displayStatus === 'passed';
                  }).length}</span>
                </div>
              </div>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="bookings">
            <TabsList>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="search">Search by Confirmation</TabsTrigger>
              <TabsTrigger value="schedules">Flight Schedules</TabsTrigger>
            </TabsList>

            {/* My Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {userBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your journey by booking your first flight
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Search Flights
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userBookings.map((booking, index) => {
                  const flight = getFlightDetails(booking.flightId);
                  if (!flight) return null;

                  const departureDate = new Date(flight.departureDate);

                  return (
                    <Card key={booking.id || `booking-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3>{flight.origin} → {flight.destination}</h3>
                              {getStatusBadge(getDisplayStatus(booking))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Confirmation ID</p>
                                <p>{booking.confirmationId}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Flight Number</p>
                                <p>{flight.flightNumber}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Passenger</p>
                                <p>{booking.passengerName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Class</p>
                                <p className="capitalize">{booking.seatClass}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Departure</p>
                                <p>{departureDate.toLocaleDateString()} {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p>${booking.price}</p>
                              </div>
                              {booking.status === 'refunded' && booking.refundedAt && (
                                <div>
                                  <p className="text-muted-foreground">Refunded</p>
                                  <p className="text-green-600 font-medium">
                                    ${booking.price} refunded on {new Date(booking.refundedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {booking.status === 'cancelled' && booking.cancelledAt && (
                                <div>
                                  <p className="text-muted-foreground">Cancelled</p>
                                  <p className="text-red-600">
                                    No refund - cancelled on {new Date(booking.cancelledAt).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {canCancel(booking.flightId, getDisplayStatus(booking)) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this booking? 
                                    {(() => {
                                      const refundInfo = getRefundInfo(booking.flightId);
                                      return ` ${refundInfo.message}`;
                                    })()}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                    Cancel Booking
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search by Confirmation ID</CardTitle>
                  <CardDescription>Enter your confirmation ID to view booking details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="OSH-2025-XXXXXX"
                      value={searchConfirmation}
                      onChange={(e) => setSearchConfirmation(e.target.value)}
                    />
                    <Button onClick={handleSearchByConfirmation}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {searchResult && searchResult.booking ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3>{searchResult.flight.origin} → {searchResult.flight.destination}</h3>
                      {getStatusBadge(searchResult.booking.status)}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Confirmation ID</p>
                        <p>{searchResult.booking.confirmationId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Flight Number</p>
                        <p>{searchResult.flight.flightNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Passenger</p>
                        <p>{searchResult.booking.passengerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p>{searchResult.booking.passengerEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Class</p>
                        <p className="capitalize">{searchResult.booking.seatClass}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p>${searchResult.booking.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : searchConfirmation && searchResult === null ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No booking found with this confirmation ID</p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            {/* Flight Schedules Tab */}
            <TabsContent value="schedules" className="space-y-4">
              {flights.filter(f => (f.status || 'upcoming') === 'upcoming').slice(0, 10).map((flight, index) => {
                const departureDate = new Date(flight.departureDate);
                const arrivalDate = new Date(flight.arrivalDate);

                return (
                  <Card key={flight.id || `flight-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <h3>{flight.origin} → {flight.destination}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getCompanyName(flight.companyId)} • {flight.flightNumber}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Departure</p>
                              <p>{departureDate.toLocaleDateString()} {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Arrival</p>
                              <p>{arrivalDate.toLocaleDateString()} {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p>{flight.duration}</p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/booking/${flight.id}`)}>
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}