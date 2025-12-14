import React from 'react';

/**
 * AppShell Component
 * Main layout wrapper with sidebar and topbar
 */
const AppShell = ({ sidebar, topbar, children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            {sidebar}

            {/* Main Content Area */}
            <div className="ml-64">
                {/* Topbar */}
                {topbar}

                {/* Page Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppShell;
