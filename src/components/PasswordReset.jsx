
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setSuccess('Check your email for the OTP!');
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/password/reset`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setSuccess('Password reset successfully! You can now log in.');
      navigate('/signin')
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white font-sora">
      <h1 className="text-2xl font-bold">Password Reset</h1>
      {error && <p className="text-red-500 my-4">{error}</p>}
      {success && <p className="text-green-500 my-4">{success}</p>}
      {step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="mt-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="px-4 py-2 border border-gray-300 rounded"
          />
          <button type="submit" className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="flex flex-col mt-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
            className="px-4 py-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="px-4 py-2 border border-gray-300 rounded mt-2"
          />
          <button type="submit"  className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default PasswordReset;
