import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 

const OtpSignUp = () => {
    const location = useLocation();
    const navigate = useNavigate();  
    const email = location.state?.email || '';
    const [otpData, setOtpData] = useState({
        email: email,
        otp: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOtpData({ ...otpData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/validate-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: otpData.email,
                    otp: otpData.otp
                })
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setMessage('OTP validated successfully');
                setTimeout(() => {
                    
                    navigate('/signin');
                }, 1000); 
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('An error occurred during OTP validation.');
            console.error(error);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center font-sora">
            <div className="w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4">Validate OTP</h2>
                {error && <p className="text-red-500">{error}</p>}
                {message && <p className="text-green-500">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={otpData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 mb-4 border rounded"
                        required
                    />
                    <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={otpData.otp}
                        onChange={handleInputChange}
                        className="w-full p-3 mb-4 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-900 text-white py-3 rounded"
                    >
                        Validate OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OtpSignUp;
