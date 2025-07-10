// src/components/AdminSidebar.jsx
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Admin.css";

const AdminSidebar = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
    const location = useLocation();

    const menuItems = [
        {
            section: "MAIN",
            items: [{ path: "/dashboard", label: "Dashboard", icon: "🏠" }],
        },
        {
            section: "COURSES",
            items: [
                { path: "/courses", label: "All Courses", icon: "📚" },
                { path: "/add-course", label: "Add Course", icon: "➕" }, // Updated path
                { path: "/categories", label: "Categories", icon: "🗂️" },
            ],
        },
        {
            section: "USERS",
            items: [{ path: "/users", label: "Users", icon: "👥" }],
        },
        {
            section: "ORDERS",
            items: [{ path: "/orders", label: "Orders", icon: "💳" }],
        },
          {
            section: "INSTRUCTOR",
            items: [{ path: "/instructors", label: "All Instructors", icon: "👨‍🏫" }],
        },
        {
            section: "COMMUNICATIONS",
            items: [{ path: "/contacts", label: "Contacts", icon: "📧" }],
        },
    ];

    // Handle body scroll lock for mobile
    useEffect(() => {
        if (isMobile) {
            if (sidebarOpen) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [sidebarOpen, isMobile]);

    // Handle route changes - close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

    if (location.pathname === "/login") return null;

    const handleOverlayClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleLinkClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isMobile && (
                <div
                    className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                    onClick={handleOverlayClick}
                />
            )}

            <div
                className={`admin-sidebar ${isMobile
                        ? sidebarOpen
                            ? "mobile-open"
                            : ""
                        : sidebarOpen
                            ? ""
                            : "collapsed"
                    }`}
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-icon">E</div>
                    <span className="brand-text">Edu</span>
                </div>

                {/* Navigation */}
                <div className="sidebar-nav">
                    {menuItems.map((section) => (
                        <div key={section.section}>
                            <div className="nav-section-title">{section.section}</div>
                            <ul className="nav flex-column">
                                {section.items.map((item) => (
                                    <li className="nav-item" key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`nav-link ${location.pathname === item.path ? "active" : ""
                                                }`}
                                            onClick={handleLinkClick}
                                        >
                                            <span className="nav-icon">{item.icon}</span>
                                            <span className="nav-text">{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;