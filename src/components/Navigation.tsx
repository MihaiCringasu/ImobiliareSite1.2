import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { COMPANY_CONFIG, DESIGN_CONFIG } from "@/config/app";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    if (isHomepage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomepage]);

  const getNavClasses = () => {
    if (!isHomepage) {
      return "bg-white border-b border-gray-100";
    }

    if (scrolled) {
      return "bg-white/95 backdrop-blur-sm border-b border-gray-100";
    }

    return "bg-transparent border-b border-transparent";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavClasses()}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              {COMPANY_CONFIG.logoImage ? (
                <img
                  src={COMPANY_CONFIG.logoImage}
                  alt={`${COMPANY_CONFIG.name} Logo`}
                  className="rounded-lg object-contain"
                  style={{
                    width: COMPANY_CONFIG.logoSize.width,
                    height: COMPANY_CONFIG.logoSize.height,
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-white text-lg font-medium rounded-lg"
                  style={{
                    backgroundColor: DESIGN_CONFIG.colors.primary,
                    width: COMPANY_CONFIG.logoSize.width,
                    height: COMPANY_CONFIG.logoSize.height,
                  }}
                >
                  {COMPANY_CONFIG.logoText}
                </div>
              )}
            </a>
          </div>

          {/* Navigation links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-12">
              <a
                href="/proprietati"
                className={`text-sm font-medium transition-colors ${
                  isHomepage && !scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Proprietăți
              </a>
              <a
                href="/echipa"
                className={`text-sm font-medium transition-colors px-3 py-2 ${
                  isHomepage && !scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Echipa
              </a>
              <a
                href="/contact"
                className={`text-sm font-medium transition-colors px-3 py-2 ${
                  isHomepage && !scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Contact
              </a>
            </div>
          </div>

          {/* Phone number and Mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Phone number - Desktop */}
            <div className="hidden lg:flex items-center">
              <a
                href={`tel:${COMPANY_CONFIG.contact.phone}`}
                className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                  isHomepage && !scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {COMPANY_CONFIG.contact.phone}
                </span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 transition-colors ${
                  isHomepage && !scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                aria-label="Toggle menu"
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
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="px-6 pt-4 pb-6 space-y-2 bg-white border-t border-gray-100">
          <a
            href="/proprietati"
            className="text-gray-700 hover:text-gray-900 block py-3 text-base font-medium transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Proprietăți
          </a>
          <a
            href="/echipa"
            className="text-gray-700 hover:text-gray-900 block py-3 text-base font-medium transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Echipa
          </a>
          <a
            href="/contact"
            className="text-gray-700 hover:text-gray-900 block py-3 text-base font-medium transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </a>

          {/* Phone number in mobile menu */}
          <div className="pt-4 border-t border-gray-100">
            <a
              href={`tel:${COMPANY_CONFIG.contact.phone}`}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 py-3 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone className="h-4 w-4" />
              <span className="text-base font-medium">
                {COMPANY_CONFIG.contact.phone}
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
