import React from 'react';


const MainContent = ({ children }) => (
    <div className="relative flex-1 px-4 py-2 lg:mt-0 mt-32">
        <div className="hidden lg:flex justify-end gap-4 my-4">
        </div>
        <div className="relative z-0">
            {children}
        </div>
    </div>
);

export default MainContent;
