import React from 'react';
import { Link } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';

const Sidebar = ({ isSidebarOpen, location }) => (
    <>
        {/* Desktop Sidebar */}
        <div className={`lg:w-[300px] hidden lg:block  bg-white absolute lg:relative top-0 lg:left-0 h-screen `}>
            <div className="relative px-8 pt-8 pb-12">
                <div className="mb-8">
                    <img
                        src="/job-application-management.png"
                        alt="Job Application Management"
                        className="w-full max-w-4xl mx-auto" 
                    />
                </div>
            </div>
            <NavigationMenu location={location} />

        </div>

        {/* Mobile Sidebar Dropdown */}
        {isSidebarOpen && (
            <div className="lg:hidden absolute top-[70px] right-4 bg-white shadow-lg rounded-lg z-40 p-4 w-[300px]">
                <NavigationMenu location={location} />
            </div>
        )}
    </>
);

export default Sidebar;
