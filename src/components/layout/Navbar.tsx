
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center mr-2">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TaskFlow</span>
            </Link>
          </div>

          {!isMobile ? (
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/#features" className="text-gray-600 hover:text-purple-500">Features</Link>
              <Link to="/#pricing" className="text-gray-600 hover:text-purple-500">Pricing</Link>
              <Link to="/login" className="text-gray-600 hover:text-purple-500">Login</Link>
              <Link to="/signup">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">Sign Up</Button>
              </Link>
            </nav>
          ) : (
            <>
              <button
                className="md:hidden text-gray-500 hover:text-gray-800 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute top-16 right-0 left-0 bg-white shadow-md p-4 rounded-b-lg animate-fade-in">
                  <nav className="flex flex-col space-y-3">
                    <Link to="/#features" className="text-gray-600 hover:text-purple-500 py-2" onClick={() => setMenuOpen(false)}>Features</Link>
                    <Link to="/#pricing" className="text-gray-600 hover:text-purple-500 py-2" onClick={() => setMenuOpen(false)}>Pricing</Link>
                    <Link to="/login" className="text-gray-600 hover:text-purple-500 py-2" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white w-full">Sign Up</Button>
                    </Link>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
