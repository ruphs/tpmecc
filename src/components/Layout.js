import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-700">NSG's Portfolio</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className={`text-base font-medium ${isHomePage ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>
                Home
              </Link>
              <Link to="/tools" className={`text-base font-medium ${location.pathname === '/tools' ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>
                Tools
              </Link>
              <Link to="/contact" className={`text-base font-medium ${location.pathname === '/contact' ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <footer className="bg-white shadow-inner mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} NSG - Programmer & Geologist
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
