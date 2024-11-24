import React from 'react';
import { Link } from 'react-router-dom';
import Ham from '../../assets/hamburger.png';
import Close from '../../assets/close.png';

const MobileHeader = ({ toggleSidebar, isSidebarOpen }) => (
    <div className='lg:hidden absolute top-4 w-full p-4'>
        <div className='flex justify-between items-center'>
            <Link to="/">
            <img
                        src="/job-application-management.png"
                        alt="Job Application Management"
                        className="w-[150px] mx-auto" 
                    />
            </Link>
            <button className="z-50" onClick={toggleSidebar}>
                <img src={isSidebarOpen ? Close : Ham} alt="Toggle Sidebar" />
            </button>
        </div>
    </div>
);

export default MobileHeader;
