// src/components/AdminNavbar.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const AdminNavbar = ({ toggleSidebar }) => {
    const location = useLocation();
    if (location.pathname === "/login") return null;

    return (
        <nav className="admin-navbar">
            <div className="navbar-left">
                <button
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    ☰
                </button>

            </div>

            <div className="navbar-right">
                <button className="notification-bell" aria-label="Notifications">
                    🔔

                </button>

                <div className="dropdown user-dropdown">
                    <button
                        className="dropdown-toggle"
                        type="button"
                        id="dropdownUser"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src="https://images8.alphacoders.com/114/thumb-1920-1148450.jpg"
                            alt="User"
                            className="user-avatar"
                        />
                    </button>
                    <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby="dropdownUser"
                    >
                        <li>
                            <a className="dropdown-item" href="/profile">
                                Profile
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="/settings">
                                Settings
                            </a>
                        </li>
                        <li>
                            <hr className="dropdown-divider" />
                        </li>
                        <li>
                            <a className="dropdown-item" href="/login">
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;