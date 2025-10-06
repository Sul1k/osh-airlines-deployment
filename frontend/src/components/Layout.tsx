import { Link, useLocation } from 'react-router-dom';
import { Plane, User, LogOut, Home, LayoutDashboard } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { Button } from './ui/button';

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">OSH Airlines</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                to="/gallery"
                className={`transition-colors ${
                  isActive('/gallery') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Gallery
              </Link>
              <Link
                to="/about"
                className={`transition-colors ${
                  isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={`transition-colors ${
                  isActive('/contact') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <Link to={currentUser.role === 'user' ? '/dashboard' : currentUser.role === 'company_manager' ? '/company' : '/admin'}>
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{currentUser.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
                <span>OSH Airlines</span>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Your trusted partner for comfortable and affordable air travel worldwide.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/" className="hover:text-primary-foreground">Home</Link></li>
                <li><Link to="/gallery" className="hover:text-primary-foreground">Gallery</Link></li>
                <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-foreground">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Flight Booking</li>
                <li>Travel Insurance</li>
                <li>Group Bookings</li>
                <li>Business Travel</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Email: info@oshairlines.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; 2025 OSH Airlines. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}