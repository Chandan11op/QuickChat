import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-800 text-white items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4 text-gray-200">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8">
        Oops! The page you are looking for doesn't exist or has been moved. 
      </p>
      <Link to="/" className="bg-primary hover:bg-primaryHover text-white font-medium py-3 px-8 rounded-full transition-all shadow-lg flex justify-center items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 12l8-8M3 12l8 8"></path>
        </svg>
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;