import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './components/MobileHeader';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className='flex flex-col'>
            <div className="relative min-h-screen flex">
                {/* Mobile Header */}
                <MobileHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                {/* Sidebar */}
                <Sidebar isSidebarOpen={isSidebarOpen} location={location} />

                {/* Main Content */}
                <MainContent>{children}</MainContent>
            </div>
        </div>
    );
};

export default DashboardLayout;
