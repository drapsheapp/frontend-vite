import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png"; // ✅ ADD THIS

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-silk-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Drapshe"
              className="h-16 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium hover:text-royal-plum transition-colors">
              Collections
            </Link>

            <Link to="/how-it-works" className="text-sm font-medium hover:text-royal-plum transition-colors">
              How It Works
            </Link>

            <Link to="/about" className="text-sm font-medium hover:text-royal-plum transition-colors">
              About Us
            </Link>
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-3">

            {user ? (
              <>
                {/* PROFILE */}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>

                {/* CART */}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm">
                    <ShoppingBag className="h-5 w-5" />

                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-royal-plum text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* LOGOUT */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-royal-plum hover:bg-royal-plum/90 text-white">
                  Sign In
                </Button>
              </Link>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-silk-border bg-white">

          <div className="px-4 py-4 space-y-3">

            <Link
              to="/products"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>

            <Link
              to="/how-it-works"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>

            <Link
              to="/about"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block py-2 text-base font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;