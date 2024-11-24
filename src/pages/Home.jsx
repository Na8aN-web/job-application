import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen font-sora bg-white">
      {/* Top-center text for Job Application Management System */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <h1 className="text-xl font-bold text-blue-900">Job Application Management System</h1>
      </div>

      {/* Add the image at the top */}
      <div className="mb-8">
        <img
          src="/job-application-management.png"
          alt="Job Application Management"
          className="w-full max-w-4xl mx-auto" 
        />
      </div>

      {/* Existing content */}
      <div>
        <h1 className="text-3xl mb-4 text-center">Home</h1>
        <div className='flex justify-center gap-8'>
          <Link to="/signup" className="text-blue-500 underline text-[20px]">
            Sign Up
          </Link>
          <Link to="/signin" className="text-blue-500 underline text-[20px]">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
