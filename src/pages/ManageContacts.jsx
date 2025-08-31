import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL - change this to match your backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Change port if your backend runs on different port
axios.defaults.baseURL = API_BASE_URL;

const ManageContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Enhanced status configuration
    const statusConfig = {
        unread: {
            label: 'New',
            color: 'bg-danger',
            icon: 'fas fa-envelope',
            description: 'New contact submission'
        },
        read: {
            label: 'In Progress',
            color: 'bg-warning',
            icon: 'fas fa-eye',
            description: 'Contact has been viewed'
        },
        resolved: {
            label: 'Completed',
            color: 'bg-success',
            icon: 'fas fa-check-circle',
            description: 'Issue resolved'
        },
        pending: {
            label: 'Pending',
            color: 'bg-info',
            icon: 'fas fa-clock',
            description: 'Awaiting response or action'
        }
    };

    // Get authentication token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token') || localStorage.getItem('adminToken');
    };

    // Create axios instance with auth headers
    const createAuthenticatedRequest = () => {
        const token = getAuthToken();
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    // Gmail reply functionality
    const replyViaGmail = (contact) => {
        const to = encodeURIComponent(contact.email);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
        window.open(gmailUrl, '_blank');
    };

    // Fetch contacts from backend
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get('/api/contact/admin/all', createAuthenticatedRequest());
            setContacts(response.data.contacts || []);
            setError('');
        } catch (error) {
            console.error('Error fetching contacts:', error);
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('adminToken');
            } else {
                setError('Failed to fetch contacts. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter contacts based on status and search term
    const filteredContacts = contacts.filter(contact => {
        const matchesFilter = filter === 'all' || contact.status === filter;
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`/api/contact/admin/status/${id}`,
                { status: newStatus },
                createAuthenticatedRequest()
            );
            setContacts(contacts.map(contact =>
                contact._id === id ? { ...contact, status: newStatus } : contact
            ));

            // Update selected contact if it's the one being updated
            if (selectedContact && selectedContact._id === id) {
                setSelectedContact({ ...selectedContact, status: newStatus });
            }

            // Show success notification
            showNotification(`Status updated to ${statusConfig[newStatus]?.label || newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            if (error.response?.status === 401) {
                showNotification('Authentication failed. Please login again.', 'error');
                localStorage.removeItem('adminToken');
            } else {
                showNotification('Failed to update status. Please try again.', 'error');
            }
        }
    };

    const deleteContact = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/api/contact/admin/delete/${id}`, createAuthenticatedRequest());
            setContacts(contacts.filter(contact => contact._id !== id));
            setShowModal(false);
            setSelectedContact(null);
            showNotification('Contact deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting contact:', error);
            if (error.response?.status === 401) {
                showNotification('Authentication failed. Please login again.', 'error');
                localStorage.removeItem('adminToken');
            } else {
                showNotification('Failed to delete contact. Please try again.', 'error');
            }
        }
    };

    const handleContactClick = async (contact) => {
        setSelectedContact(contact);
        setShowModal(true);

        // Mark as read when opened (if it's unread)
        if (contact.status === 'unread') {
            await updateStatus(contact._id, 'read');
        }
    };

    // Enhanced status badge with icon
    const getStatusBadge = (status) => {
        const config = statusConfig[status] || { label: status, color: 'bg-secondary', icon: 'fas fa-question' };
        return (
            <span className={`badge ${config.color} d-flex align-items-center gap-1`}>
                <i className={config.icon} style={{ fontSize: '0.8em' }}></i>
                {config.label}
            </span>
        );
    };

    const getStatusCount = (status) => {
        return contacts.filter(contact => contact.status === status).length;
    };

    // Simple notification system
    const showNotification = (message, type = 'info') => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    };

    // Get priority level based on status and date
    const getPriorityLevel = (contact) => {
        const daysSinceSubmission = Math.floor((new Date() - new Date(contact.submittedAt)) / (1000 * 60 * 60 * 24));

        if (contact.status === 'unread' && daysSinceSubmission > 2) return 'high';
        if (contact.status === 'read' && daysSinceSubmission > 5) return 'medium';
        return 'normal';
    };

    // Fixed formatDate function to handle consistent date formatting
    const formatDate = (dateString) => {
        try {
            let date;

            if (dateString instanceof Date) {
                date = dateString;
            } else if (typeof dateString === 'string') {
                date = new Date(dateString);
            } else if (typeof dateString === 'number') {
                date = new Date(dateString);
            } else {
                console.warn('Invalid date format:', dateString);
                return 'Invalid Date';
            }

            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return 'Invalid Date';
            }

            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata'
            };

            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="container-fluid py-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading contacts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <button className="btn btn-danger" onClick={fetchContacts}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="h3 mb-0">
                            <i className="fas fa-envelope me-2"></i>
                            Contact Management
                        </h1>
                        <div className="d-flex gap-2 flex-wrap">
                            <span className="badge bg-danger d-flex align-items-center gap-1">
                                <i className="fas fa-envelope"></i>
                                New: {getStatusCount('unread')}
                            </span>
                            <span className="badge bg-warning d-flex align-items-center gap-1">
                                <i className="fas fa-eye"></i>
                                In Progress: {getStatusCount('read')}
                            </span>
                            <span className="badge bg-success d-flex align-items-center gap-1">
                                <i className="fas fa-check-circle"></i>
                                Completed: {getStatusCount('resolved')}
                            </span>
                            <span className="badge bg-info d-flex align-items-center gap-1">
                                <i className="fas fa-clock"></i>
                                Pending: {getStatusCount('pending')}
                            </span>
                            <button className="btn btn-primary btn-sm" onClick={fetchContacts}>
                                <i className="fas fa-sync-alt me-1"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, email, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="unread">New</option>
                        <option value="read">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Completed</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <div className="text-muted d-flex align-items-center">
                        <i className="fas fa-filter me-2"></i>
                        Total: {filteredContacts.length} contacts
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card" style={{ overflow: 'visible' }}>
                        <div className="card-body p-0" style={{ overflow: 'visible' }}>
                            <div className="table-responsive" style={{ overflow: 'visible' }}>
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>
                                                <i className="fas fa-user me-1"></i>
                                                Name
                                            </th>
                                            <th>
                                                <i className="fas fa-envelope me-1"></i>
                                                Email
                                            </th>
                                            <th>
                                                <i className="fas fa-phone me-1"></i>
                                                Phone
                                            </th>
                                            <th>
                                                <i className="fas fa-subject me-1"></i>
                                                Subject
                                            </th>
                                            <th>
                                                <i className="fas fa-calendar me-1"></i>
                                                Date
                                            </th>
                                            <th>
                                                <i className="fas fa-flag me-1"></i>
                                                Status
                                            </th>
                                            <th>
                                                <i className="fas fa-cog me-1"></i>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContacts.map(contact => {
                                            const priority = getPriorityLevel(contact);
                                            return (
                                                <tr
                                                    key={contact._id}
                                                    className={`cursor-pointer ${priority === 'high' ? 'table-danger' : priority === 'medium' ? 'table-warning' : ''}`}
                                                    onClick={() => handleContactClick(contact)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="fw-semibold">
                                                        {priority === 'high' && <i className="fas fa-exclamation-triangle text-danger me-1" title="High Priority"></i>}
                                                        {contact.name}
                                                    </td>
                                                    <td>{contact.email}</td>
                                                    <td>{contact.phone}</td>
                                                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                        {contact.subject}
                                                    </td>
                                                    <td>{formatDate(contact.submittedAt)}</td>
                                                    <td>
                                                        {getStatusBadge(contact.status)}
                                                    </td>
                                                    <td>
                                                        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                                type="button"
                                                                data-bs-toggle="dropdown"
                                                            >
                                                                <i className="fas fa-ellipsis-v"></i>
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handleContactClick(contact)}
                                                                    >
                                                                        <i className="fas fa-eye me-2"></i>
                                                                        View Details
                                                                    </button>
                                                                </li>
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => updateStatus(contact._id, 'pending')}
                                                                    >
                                                                        <i className="fas fa-clock me-2"></i>
                                                                        Mark as Pending
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => updateStatus(contact._id, 'resolved')}
                                                                    >
                                                                        <i className="fas fa-check-circle me-2"></i>
                                                                        Mark as Completed
                                                                    </button>
                                                                </li>
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => replyViaGmail(contact)}
                                                                    >
                                                                        <i className="fab fa-google me-2"></i>
                                                                        Reply via Gmail
                                                                    </button>
                                                                </li>
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => deleteContact(contact._id)}
                                                                    >
                                                                        <i className="fas fa-trash me-2"></i>
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {filteredContacts.length === 0 && !loading && (
                                <div className="text-center p-4 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-3"></i>
                                    <h5>No contacts found</h5>
                                    <p>No contacts match your current search criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Details Modal */}
            {selectedContact && (
                <div
                    className={`modal fade ${showModal ? 'show' : ''}`}
                    style={{ display: showModal ? 'block' : 'none' }}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-address-card me-2"></i>
                                    Contact Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">
                                            <i className="fas fa-user me-2"></i>
                                            Contact Information
                                        </h6>
                                        <div className="mb-2">
                                            <strong>Name:</strong>
                                            <span className="ms-2">{selectedContact.name}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Email:</strong>
                                            <a href={`mailto:${selectedContact.email}`} className="ms-2">
                                                <i className="fas fa-envelope me-1"></i>
                                                {selectedContact.email}
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Phone:</strong>
                                            <a href={`tel:${selectedContact.phone}`} className="ms-2">
                                                <i className="fas fa-phone me-1"></i>
                                                {selectedContact.phone}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Message Details
                                        </h6>
                                        <div className="mb-2">
                                            <strong>Subject:</strong>
                                            <span className="ms-2">{selectedContact.subject}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Date:</strong>
                                            <span className="ms-2">{formatDate(selectedContact.submittedAt)}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Status:</strong>
                                            <span className="ms-2">{getStatusBadge(selectedContact.status)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">
                                        <i className="fas fa-comment me-2"></i>
                                        Full Message
                                    </h6>
                                    <div className="border rounded p-3 bg-light">
                                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedContact.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Status Update */}
                                <div className="mb-3">
                                    <h6 className="text-muted mb-3">
                                        <i className="fas fa-flag me-2"></i>
                                        Quick Status Update
                                    </h6>
                                    <div className="btn-group" role="group">
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                className={`btn btn-outline-secondary ${selectedContact.status === key ? 'active' : ''}`}
                                                onClick={() => updateStatus(selectedContact._id, key)}
                                            >
                                                <i className={config.icon + ' me-1'}></i>
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => replyViaGmail(selectedContact)}
                                >
                                    <i className="fab fa-google me-1"></i>
                                    Reply via Gmail
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => {
                                        updateStatus(selectedContact._id, 'resolved');
                                        setShowModal(false);
                                    }}
                                >
                                    <i className="fas fa-check-circle me-1"></i>
                                    Mark as Completed
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => deleteContact(selectedContact._id)}
                                >
                                    <i className="fas fa-trash me-1"></i>
                                    Delete Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Backdrop */}
            {showModal && (
                <div
                    className="modal-backdrop fade show"
                    onClick={() => setShowModal(false)}
                ></div>
            )}
        </div>
    );
};

export default ManageContacts;