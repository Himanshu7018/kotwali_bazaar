import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Track route changes

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Call parent search if provided
      onSearch?.(searchQuery);

      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };



  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-subtle border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Kotwali Bazaar</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products and shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full focus:ring-primary focus:border-primary"
              />
            </div>
            <Button type="submit" className="ml-2" variant="default">
              Search
            </Button>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <Button asChild variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Vendor Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products and shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button type="submit" className="ml-2" variant="default">
              Search
            </Button>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 top-16 w-full bg-background border-t border-border shadow-lg py-4 z-50">
            {!user ? (
              <div className='px-4'>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>

            ) : (
              <div className="space-y-2 px-4">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Signed in as {user.email}
                </div>
                {userRole === 'admin' && (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                {userRole === 'vendor' && (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/vendor">
                      <Settings className="mr-2 h-4 w-4" />
                      Vendor Dashboard
                    </Link>
                  </Button>
                )}
                <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
