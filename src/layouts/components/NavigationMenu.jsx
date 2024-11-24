import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';

const NavigationMenu = ({ location }) => {
    const [isHovered, setIsHovered] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        dispatch(logout());
        navigate('/signin', { state: { message: 'Logout successful' } });
    };

    return (
        <nav className="mt-4">
            <ul>
                <li className="mx-auto w-[250px] my-4" onMouseEnter={() => setIsHovered(8)} onMouseLeave={() => setIsHovered(null)}>
                    <Link to="/dashboard"
                        className={`flex items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/dashboard') ? 'text-blue-900 font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white '}`}>
                        Dashboard
                    </Link>
                </li>

                <li className="mx-auto  w-[250px] my-4" onMouseEnter={() => setIsHovered(8)} onMouseLeave={() => setIsHovered(null)}>
                    <Link to="/jobs"
                        className={`flex items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/jobs') ? 'text-blue-900 font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white '}`}>
                        View Jobs
                    </Link>
                </li>

                <li className="mx-auto  w-[250px] my-4" onMouseEnter={() => setIsHovered(8)} onMouseLeave={() => setIsHovered(null)}>
                    <Link to="/create"
                        className={`flex items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/create') ? 'text-blue-900 font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white '}`}>
                        Create Application
                    </Link>
                </li>

                <li className="mx-auto w-[250px] my-4" onMouseEnter={() => setIsHovered(1)} onMouseLeave={() => setIsHovered(null)}>
                    <Link to="/view"
                        className={`flex items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/view') ? 'text-blue-900  font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white '}`}>
                        View all applications
                    </Link>
                </li>

                <li className="mx-auto w-[250px] my-4" onMouseEnter={() => setIsHovered(1)} onMouseLeave={() => setIsHovered(null)}>
                    <Link to="/set-reminder"
                        className={`flex items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/set-reminder') ? 'text-blue-900  font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white '}`}>
                        Set Reminder
                    </Link>
                </li>

                {/* Replaced Edit Profile Link */}
                <li className="mx-auto w-[250px] my-4" onMouseEnter={() => setIsHovered(2)} onMouseLeave={() => setIsHovered(null)}>
                    <button
                        onClick={() => navigate('/edit-profile')}
                        className={`flex w-[250px] items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] ${isActive('/edit-profile') ? 'text-blue-900  font-bold' : 'text-[#636363] hover:bg-[#407BFF] hover:text-white'}`}
                    >
                        Edit Profile
                    </button>
                </li>

                {/* Replaced Log Out Link */}
                <li className="mx-auto w-[250px] mb-8" onMouseEnter={() => setIsHovered(9)} onMouseLeave={() => setIsHovered(null)}>
                    <button
                        onClick={handleLogout}
                        className="flex w-[250px] items-center justify-start rounded-[10px] gap-2 font-sora p-3 text-[20px] text-[#636363] hover:bg-red-500 hover:text-white"
                    >
                        Log Out
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationMenu;
