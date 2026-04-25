import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ShieldCheck
} from "lucide-react";
import { FaPinterest } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-royal-plum text-raw-silk">
      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* TOP GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-sm">

          {/* Top Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-zari-gold">TOP CATEGORIES</h4>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-zari-gold" to="/products/blouse">
                  Blouse
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/products/salwar">
                  Salwar Kameez
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/products/kurta">
                  Kurta Sets
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/products/pant">
                  Pant
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-zari-gold">CUSTOMER SERVICE</h4>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-zari-gold" to="/returns-refunds">
                  Returns & Cancellation
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/faq">
                  FAQs
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/contact">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/blog">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Drapshe Brand */}
          <div>
            <h4 className="font-semibold mb-4 text-zari-gold">DRAPSHE</h4>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-zari-gold" to="/about">
                  About Us
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/business">
                  Business Enquiry
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/store-locator">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* My Profile */}
          <div>
            <h4 className="font-semibold mb-4 text-zari-gold">MY PROFILE</h4>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-zari-gold" to="/profile">
                  My Account
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/returns-refunds">
                  Return & Cancellation
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/cart">
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-zari-gold">QUICK LINKS</h4>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-zari-gold" to="/shipping-policy">
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/privacy-policy">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link className="hover:text-zari-gold" to="/terms">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* SOCIAL + PAYMENTS */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-12 gap-6 text-center lg:text-left">

          {/* Follow Us */}
          <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">

            <span className="font-medium text-sm sm:text-base">Follow Us</span>

            <a href="https://www.facebook.com/Drapshe" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

            <a href="https://www.instagram.com/drapsheofficial" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

            <a href="https://x.com/Drapsheofficial" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

            <a href="https://in.pinterest.com/drapshe/" target="_blank" rel="noopener noreferrer">
              <FaPinterest className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

            <a href="https://www.youtube.com/@drapshe" target="_blank" rel="noopener noreferrer">
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

            <a href="https://in.linkedin.com/company/drapshe" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-zari-gold"/>
            </a>

          </div>

          {/* Secure Payment */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">

            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-5 h-5 text-green-400"/>
              100% Secure Payments
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-white text-black px-3 py-1 rounded">VISA</span>
              <span className="bg-white text-black px-3 py-1 rounded">MasterCard</span>
              <span className="bg-white text-black px-3 py-1 rounded">UPI</span>
            </div>

          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="text-center text-xs mt-10 text-raw-silk/70">
          <p>
            Copyright to Drapshe store |
            Name of Manufacturer - Drapshe |
            Country of Manufacture - India
          </p>
        </div>

        {/* FRAUD WARNING */}
        <div className="border border-white/30 mt-6 p-4 text-xs text-center max-w-4xl mx-auto">

          <strong>BEWARE OF FRAUDULENT CALLS</strong>

          <p className="mt-2">
            Drapshe does not ask for OTP, bank details or payments over phone calls.
            Please report suspicious activity immediately to our support team.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;