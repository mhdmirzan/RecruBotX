import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a2a5e] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left: Logo & Tagline */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-accent to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">RecruBotX</span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed">
              AI-powered interview automation for smarter hiring. Transform your recruitment process with intelligent conversations.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/recrubotx"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-primary-accent transition"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://linkedin.com/company/recrubotx"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-primary-accent transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://github.com/recrubotx"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-primary-accent transition"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <Link to="/" className="text-sm hover:text-primary-accent transition">Home</Link>
              <Link to="/how-it-works" className="text-sm hover:text-primary-accent transition">How it Works</Link>
              <Link to="/candidates" className="text-sm hover:text-primary-accent transition">Candidates</Link>
              <Link to="/recruiters" className="text-sm hover:text-primary-accent transition">Recruiters</Link>
              <Link to="/pricing" className="text-sm hover:text-primary-accent transition">Pricing</Link>
              <Link to="/about" className="text-sm hover:text-primary-accent transition">About</Link>
              <Link to="/contact" className="text-sm hover:text-primary-accent transition">Contact</Link>
              <Link to="/faq" className="text-sm hover:text-primary-accent transition">FAQ</Link>
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-accent" />
                <a
                  href="mailto:support@recrubotx.com"
                  className="text-sm hover:text-primary-accent transition"
                >
                  support@recrubotx.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-accent" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>
            <div className="pt-6 space-y-2">
              <Link
                to="/privacy"
                className="block text-sm hover:text-primary-accent transition"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="block text-sm hover:text-primary-accent transition"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-sm leading-relaxed">
            © 2024 RecruBotX. All rights reserved.  
            <br className="block md:hidden" /> Built with AI for the future of recruitment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
