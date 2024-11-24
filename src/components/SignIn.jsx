import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import Sign from '../assets/auth.svg';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const [logoutMessage, setLogoutMessage] = useState(location.state?.message || '');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => {
        setLogoutMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [logoutMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes('@')) {
      setError('Invalid email address.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful');
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        dispatch(login({
          accessToken: data.access_token,
          user: data.user,
        }));

        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden font-sora">
      <div className="flex-1 hidden md:flex justify-center items-center bg-white">
        <img src={Sign} alt="Sign Up" />
      </div>

      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-full md:max-w-md p-6">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900 text-center">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 text-center my-4">Welcome Back!</p>
            {/* Display logout message if available */}
            {logoutMessage && <p className="text-green-500 text-sm">{logoutMessage}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="w-full mt-8">
              <div className="mx-auto flex flex-col gap-4">
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <span className="ml-3">Sign In</span>
                </button>
                <Link to='/password-reset'>
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-red-900 text-gray-100 w-full py-4 rounded-lg hover:bg-red-400"
                  >
                    <span className="ml-3">Reset Password</span>
                  </button>
                </Link>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  Don't have an account?{" "}
                  <a href="/signup">
                    <span className="text-blue-900 font-semibold">Sign Up</span>
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
