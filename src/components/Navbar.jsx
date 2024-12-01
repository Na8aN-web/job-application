import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');

        dispatch(logout());
        
        navigate('/signin', { state: { message: 'Logout successful' } });
    };

    return (
        <nav>
            <button 
                onClick={handleLogout} 
                className="mt-5 tracking-wide font-semibold bg-red-900 text-gray-100 w-full py-4 rounded-lg hover:bg-red-400 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
            >
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
