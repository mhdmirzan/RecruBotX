import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileAuthDropdown, setOpenMobileAuthDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);

  // Hide navbar on dashboard and portal pages
  const hideNavbarPaths = [
    "/candidate/dashboard",
    "/candidate/settings",
    "/candidate/interview",
    "/candidate/analyze-resume",
    "/candidate/resume",
    "/recruiter/dashboard",
    "/recruiter/job-posting",
    "/recruiter/cv-screening",
    "/recruiter/settings",
    "/recruiter/report",
    "/template/",
    "/resume-builder"
  ];

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Detect scroll position (only for large screens)
  // Navbar is hidden whenever user is not at the top of the page
  useEffect(() => {
    const handleScroll = () => {
      if (!isLargeScreen) {
        setIsScrolling(false);
        return;
      }

      // Hide navbar if not at top position
      if (window.scrollY > 50) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLargeScreen]);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (hideNavbarPaths.some(path => location.pathname.includes(path))) {
    return null;
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/how-it-works", label: "How it Works" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ];

  const authDropdowns = [
    {
      key: "signup",
      label: "Sign up as",
      buttonClass:
        "border border-slate-400 text-slate-800 bg-slate-100/70 hover:bg-slate-200/70",
      items: [
        { to: "/candidate/signup", label: "Candidate" },
        { to: "/recruiter/signup", label: "Recruiter" },
      ],
    },
    {
      key: "login",
      label: "Log in",
      buttonClass:
        "bg-[#0a2a5e] text-white hover:bg-[#081d42] border border-[#0a2a5e]",
      items: [
        { to: "/candidate/signin", label: "Candidate" },
        { to: "/recruiter/signin", label: "Recruiter" },
      ],
    },
  ];

  return (
    <nav
      className={`bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${isScrolling && isLargeScreen
        ? "opacity-0 pointer-events-none -translate-y-2"
        : "opacity-100 translate-y-0"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9 w-auto" />
        </Link>

        {/* Desktop Menu Links - Centered */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-12 px-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to ||
              (link.to !== "/" && location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative py-2 font-medium transition-colors
                  ${isActive
                    ? "text-[#0a2a5e]"
                    : "text-gray-600 hover:text-[#0a2a5e]"
                  }
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:transition-all after:duration-300
                  ${isActive
                    ? "after:w-full after:bg-[#0a2a5e]"
                    : "after:w-0 hover:after:w-full after:bg-blue-300"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Dropdowns */}
        <div ref={dropdownContainerRef} className="hidden md:flex items-center gap-3">
          {authDropdowns.map((dropdown) => {
            const isOpen = openDropdown === dropdown.key;

            return (
              <div key={dropdown.key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : dropdown.key)}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-3 font-semibold transition-colors ${dropdown.buttonClass}`}
                >
                  <span>{dropdown.label}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0a2a5e]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            if (isMobileMenuOpen) {
              setOpenMobileAuthDropdown(null);
            }
          }}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#0a2a5e] transition-colors"
              >
                <span className="font-medium">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              {authDropdowns.map((dropdown) => {
                const isOpen = openMobileAuthDropdown === dropdown.key;

                return (
                  <div key={dropdown.key} className="overflow-hidden rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setOpenMobileAuthDropdown(isOpen ? null : dropdown.key)}
                      className="w-full flex items-center justify-between py-3 px-3 text-left text-[#0b67b5] bg-[#f3f4f6] hover:bg-[#e9ecef] transition-colors"
                    >
                      <span className="text-[18px] font-medium leading-none">{dropdown.label}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="bg-white border-t border-slate-200">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenMobileAuthDropdown(null);
                            }}
                            className="flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-[#0a2a5e] transition-colors"
                          >
                            <span className="font-medium">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
