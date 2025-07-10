import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./Admin.css";

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
            // Clean up body class on unmount
            document.body.classList.remove('sidebar-open');
        };
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    if (location.pathname === "/login") return <>{children}</>;

    return (
        <div className="admin-wrapper">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
            />
            <div className={`admin-main ${!isMobile && !sidebarOpen ? "expanded" : ""
                }`}>
                <AdminNavbar toggleSidebar={toggleSidebar} />
                <div className="admin-content">{children}</div>
            </div>
        </div>
    );
};

export default AdminLayout;