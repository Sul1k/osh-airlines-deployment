import { Plane, Users, Globe, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function About() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">About OSH Airlines</h1>
            <p className="text-xl opacity-90">
              Connecting the world with exceptional service, comfort, and reliability since 2025
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              At OSH Airlines, we're committed to making air travel accessible, comfortable, and enjoyable for everyone. 
              Our mission is to connect people, cultures, and opportunities across the globe while maintaining the highest 
              standards of safety and customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2">Modern Fleet</h3>
                    <p className="text-sm text-muted-foreground">
                      Our state-of-the-art aircraft are maintained to the highest standards, ensuring your safety and comfort on every journey.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2">Expert Team</h3>
                    <p className="text-sm text-muted-foreground">
                      Our dedicated team of professionals is trained to provide exceptional service and ensure a smooth travel experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2">Global Network</h3>
                    <p className="text-sm text-muted-foreground">
                      We fly to over 100 destinations worldwide, connecting major cities and hidden gems across all continents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2">Award Winning</h3>
                    <p className="text-sm text-muted-foreground">
                      Recognized for excellence in customer service, safety, and innovation in the aviation industry.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="bg-secondary/30 rounded-xl p-8">
            <h3 className="text-center mb-8">OSH Airlines by the Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Destinations</p>
              </div>
              <div>
                <p className="text-3xl mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Daily Flights</p>
              </div>
              <div>
                <p className="text-3xl mb-2">50M+</p>
                <p className="text-sm text-muted-foreground">Passengers Annually</p>
              </div>
              <div>
                <p className="text-3xl mb-2">98%</p>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}