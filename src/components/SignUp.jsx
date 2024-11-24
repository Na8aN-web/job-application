import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import Sign from '../assets/auth.svg';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    address: '',
    phonenumber: '',
    resume: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phonenumber") {
      setFormData({ ...formData, [name]: parseInt(value, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      setError('Invalid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/usersignup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstname: formData.firstname,
          lastname: formData.lastname,
          address: formData.address,
          phonenumber: formData.phonenumber,
          resume: formData.resume,
        }),
      });
      const data = await response.json();
      if (response.ok) {     
        console.log(data);
        navigate('/validate-otp', { state: { email: formData.email } });
      }
      else{
        setError(data.message);
      }
  } catch (error) {
    console.log(error)
  }
};

return (
  <div className="h-screen flex overflow-hidden font-sora">
    <div className="flex-1 hidden md:flex justify-center items-center bg-white">
      <img src={Sign} alt="Sign Up" className="" />
    </div>

    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="w-full max-w-full md:max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900 text-center">Sign up</h1>
          <p className="text-sm text-gray-500 text-center my-4">Enter your details to create your account</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="w-full mt-8">
            <div className="mx-auto flex flex-col gap-4">
              <div className='flex gap-4'>
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="text"
                  name="firstname"
                  placeholder="Enter your first name"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="text"
                  name="lastname"
                  placeholder="Enter your last name"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <input
                className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className='flex gap-4'>
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <input
                className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <div className='flex gap-4'>
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="text"
                  name="phonenumber"
                  placeholder="Enter your phone number"
                  value={formData.phonenumber}
                  onChange={handleInputChange}
                />
                <input
                  className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200"
                  type="text"
                  name="resume"
                  placeholder="Paste your resume link"
                  value={formData.resume}
                  onChange={handleInputChange}
                />
              </div>
              <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <svg
                    className="w-6 h-6 -ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-3">Sign Up</span>
                </button>
              <p className="mt-6 text-xs text-gray-600 text-center">
                Already have an account?{' '}
                <a href="/signin">
                  <span className="text-blue-900 font-semibold">Sign in</span>
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

export default SignUp;
