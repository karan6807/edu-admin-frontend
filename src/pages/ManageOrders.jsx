import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const modalRef = useRef(null);
    const refundModalRef = useRef(null);

    // API base URL - adjust according to your setup
    const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

    // Fetch orders from backend
    const fetchOrders = async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage or wherever you store it
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.get(`${API_BASE_URL}/orders/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    page,
                    limit,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    search: searchTerm || undefined
                }
            });

            if (response.data.success) {
                const ordersData = response.data.orders.map(order => {
                    // Safely extract customer info
                    const customerInfo = order.customerInfo || {};
                    const user = order.user || {};
                    
                    // Build student name with proper null checking
                    let studentName = 'N/A';
                    if (customerInfo.firstName || customerInfo.lastName) {
                        studentName = `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim();
                    } else if (user.firstName || user.lastName) {
                        studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    } else if (user.username) {
                        studentName = user.username;
                    }
                    
                    // Safely extract email
                    const email = customerInfo.email || user.email || 'N/A';
                    
                    // Safely extract course information
                    const course = order.items && Array.isArray(order.items) 
                        ? order.items.map(item => item.course?.title || 'Unknown Course').join(', ') 
                        : 'N/A';
                    
                    // Safely extract pricing information
                    const pricing = order.pricing || {};
                    const payment = order.payment || {};
                    
                    return {
                        id: order._id,
                        orderNumber: order.orderNumber,
                        studentName,
                        email,
                        course,
                        orderDate: new Date(order.createdAt).toISOString().split('T')[0],
                        amount: pricing.total || 0,
                        status: order.status,
                        paymentMethod: payment.method || 'N/A',
                        phone: customerInfo.phone || 'N/A',
                        lastUpdated: order.updatedAt,
                        // Additional backend data
                        paymentStatus: payment.status,
                        subtotal: pricing.subtotal || 0,
                        tax: pricing.tax || 0,
                        shipping: pricing.shipping || 0,
                        items: order.items || [],
                        customerInfo: customerInfo,
                        rawOrder: order // Keep full order data for detailed view
                    };
                });

                setOrders(ordersData);
                setFilteredOrders(ordersData);

                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch orders');

            // If it's an auth error, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
            }
        } finally {
            setLoading(false);
        }
    };

    // Update order status on backend
    const updateOrderStatusOnBackend = async (orderId, newStatus, refundReason = null) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.put(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
                status: newStatus,
                refundReason: refundReason
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                return response.data.order;
            } else {
                throw new Error(response.data.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders when statusFilter or searchTerm changes
    useEffect(() => {
        // If we're using backend filtering, refetch data
        // Otherwise, filter locally
        if (statusFilter !== 'all' || searchTerm) {
            // Debounce search to avoid too many API calls
            const timeoutId = setTimeout(() => {
                fetchOrders(1); // Reset to page 1 when filtering
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            fetchOrders(1);
        }
    }, [statusFilter, searchTerm]);

    // Local filtering (if you prefer client-side filtering)
    const filterOrdersLocally = () => {
        let filtered = orders;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchLower) ||
                order.orderNumber?.toLowerCase().includes(searchLower) ||
                order.studentName.toLowerCase().includes(searchLower) ||
                order.course.toLowerCase().includes(searchLower) ||
                order.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredOrders(filtered);
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'bg-warning',
            confirmed: 'bg-info',
            processing: 'bg-info',
            completed: 'bg-success',
            cancelled: 'bg-danger',
            refunded: 'bg-secondary'
        };
        return statusClasses[status] || 'bg-secondary';
    };

    const getAvailableActions = (status, paymentStatus) => {
        const actions = [];

        switch (status) {
            case 'pending':
                actions.push(
                    { action: 'confirmed', label: 'Confirm Order', className: 'dropdown-item' },
                    { action: 'cancelled', label: 'Cancel Order', className: 'dropdown-item text-danger' }
                );
                break;
            case 'confirmed':
                actions.push(
                    { action: 'processing', label: 'Mark Processing', className: 'dropdown-item' },
                    { action: 'completed', label: 'Mark Completed', className: 'dropdown-item' },
                    { action: 'cancelled', label: 'Cancel Order', className: 'dropdown-item text-danger' }
                );
                break;
            case 'processing':
                actions.push(
                    { action: 'completed', label: 'Mark Completed', className: 'dropdown-item' },
                    { action: 'cancelled', label: 'Cancel Order', className: 'dropdown-item text-danger' }
                );
                break;
            case 'completed':
                if (paymentStatus === 'completed') {
                    actions.push(
                        { action: 'refund', label: 'Issue Refund', className: 'dropdown-item text-warning' }
                    );
                }
                actions.push(
                    { action: 'download', label: 'Download Receipt', className: 'dropdown-item' }
                );
                break;
            case 'cancelled':
                if (paymentStatus !== 'completed') {
                    actions.push(
                        { action: 'pending', label: 'Reactivate Order', className: 'dropdown-item text-success' }
                    );
                }
                break;
            case 'refunded':
                actions.push(
                    { action: 'download', label: 'Download Receipt', className: 'dropdown-item' }
                );
                break;
        }

        return actions;
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);

            // Update on backend
            const updatedOrder = await updateOrderStatusOnBackend(orderId, newStatus);

            // Update local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: newStatus,
                            lastUpdated: new Date().toISOString()
                        }
                        : order
                )
            );

            setShowModal(false);

            // Show success message
            alert(`Order ${orderId} status updated to ${newStatus}`);

        } catch (error) {
            alert(`Failed to update order status: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const generateReceiptHTML = (order) => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderNumber || order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .table th { background-color: #f8f9fa; }
                .pricing { margin-top: 20px; }
                .pricing-row { display: flex; justify-content: space-between; padding: 5px 0; }
                .total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Course Order Receipt</h1>
                <p>Thank you for your purchase!</p>
            </div>
            
            <div class="order-info">
                <div>
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${order.orderNumber || order.id}</p>
                    <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                    <p><strong>Payment Status:</strong> ${(order.paymentStatus || '').charAt(0).toUpperCase() + (order.paymentStatus || '').slice(1)}</p>
                </div>
                <div>
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> ${order.studentName}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                </div>
            </div>
            
            <h3>Courses Purchased</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items?.map(item => `
                        <tr>
                            <td>${item.course?.title || 'Unknown Course'}</td>
                            <td>${item.quantity || 1}</td>
                            <td>₹${item.price || 0}</td>
                            <td>₹${(item.price || 0) * (item.quantity || 1)}</td>
                        </tr>
                    `).join('') || `
                        <tr>
                            <td colspan="4">No course details available</td>
                        </tr>
                    `}
                </tbody>
            </table>
            
            <div class="pricing">
                <div class="pricing-row">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal || 0}</span>
                </div>
                ${order.shipping > 0 ? `
                <div class="pricing-row">
                    <span>Shipping:</span>
                    <span>₹${order.shipping}</span>
                </div>
                ` : ''}
                ${order.tax > 0 ? `
                <div class="pricing-row">
                    <span>Tax (GST):</span>
                    <span>₹${order.tax}</span>
                </div>
                ` : ''}
                <div class="pricing-row total">
                    <span>Total Amount:</span>
                    <span>₹${order.amount}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>This is an automatically generated receipt.</p>
                <p>Payment Method: ${order.paymentMethod}</p>
            </div>
        </body>
        </html>
        `;
    };

    const downloadReceipt = (order) => {
        const receiptHTML = generateReceiptHTML(order);
        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${order.orderNumber || order.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleActionClick = (orderId, action) => {
        const order = orders.find(o => o.id === orderId);

        switch (action) {
            case 'refund':
                setSelectedOrder(order);
                setShowRefundModal(true);
                break;
            case 'download':
                if (order) {
                    downloadReceipt(order);
                }
                break;
            default:
                updateOrderStatus(orderId, action);
        }
    };

    const handleRefund = async () => {
        if (selectedOrder && refundReason.trim()) {
            try {
                await updateOrderStatusOnBackend(selectedOrder.id, 'refunded', refundReason);
                updateOrderStatus(selectedOrder.id, 'refunded');
                setShowRefundModal(false);
                setRefundReason('');
                alert(`Refund processed for ${selectedOrder.orderNumber || selectedOrder.id}. Reason: ${refundReason}`);
            } catch (error) {
                alert(`Failed to process refund: ${error.message}`);
            }
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const closeRefundModal = () => {
        setShowRefundModal(false);
        setRefundReason('');
        setSelectedOrder(null);
    };

    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handleRefundModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeRefundModal();
        }
    };

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            completed: orders.filter(o => o.status === 'completed').length,
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            processing: orders.filter(o => o.status === 'processing').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            refunded: orders.filter(o => o.status === 'refunded').length
        };
        return stats;
    };

    const exportOrdersToCSV = () => {
        const headers = [
            'Order Number', 'Order ID', 'Student Name', 'Email', 'Course',
            'Order Date', 'Amount', 'Status', 'Payment Status', 'Payment Method',
            'Phone', 'Last Updated'
        ];

        const csvContent = [
            headers.join(','),
            ...filteredOrders.map(order => [
                order.orderNumber || order.id,
                order.id,
                `"${order.studentName}"`,
                order.email,
                `"${order.course}"`,
                order.orderDate,
                order.amount,
                order.status,
                order.paymentStatus || '',
                order.paymentMethod,
                order.phone,
                order.lastUpdated
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Calculate stats
    const stats = getOrderStats();

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" />
            <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />

            <div className="container-fluid py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div>
                                <h1 className="h3 mb-1 text-primary">
                                    <i className="bi bi-cart-check me-2"></i>
                                    Order Management
                                </h1>
                                <p className="text-muted mb-3 mb-md-0">Manage and track all course orders efficiently</p>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    className="btn btn-outline-success"
                                    onClick={exportOrdersToCSV}
                                    title="Export orders to CSV"
                                >
                                    <i className="bi bi-download me-2"></i>
                                    Export CSV
                                </button>
                                <button
                                    className="btn btn-outline-info"
                                    onClick={() => fetchOrders()}
                                    disabled={loading}
                                    title="Refresh orders"
                                >
                                    <i className={`bi ${loading ? 'bi-arrow-repeat spinner-border spinner-border-sm' : 'bi-arrow-clockwise'} me-2`}></i>
                                    Refresh
                                </button>
                                <button className="btn btn-primary">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Manual Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                <strong>Error:</strong> {error}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setError(null)}
                                    aria-label="Close"
                                ></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="row mb-4">
                    <div className="col-6 col-lg-2 mb-3 mb-lg-0">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Total Orders</h6>
                                        <h3 className="mb-0 fw-bold">{stats.total}</h3>
                                    </div>
                                    <i className="bi bi-cart3 fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2 mb-3 mb-lg-0">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Completed</h6>
                                        <h3 className="mb-0 fw-bold">{stats.completed}</h3>
                                    </div>
                                    <i className="bi bi-check-circle fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2 mb-3 mb-lg-0">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Pending</h6>
                                        <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                                    </div>
                                    <i className="bi bi-clock fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2 mb-3 mb-lg-0">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Processing</h6>
                                        <h3 className="mb-0 fw-bold">{stats.processing}</h3>
                                    </div>
                                    <i className="bi bi-arrow-repeat fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2 mb-3 mb-lg-0">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Cancelled</h6>
                                        <h3 className="mb-0 fw-bold">{stats.cancelled}</h3>
                                    </div>
                                    <i className="bi bi-x-circle fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2">
                        <div className="card bg-gradient text-dark h-100" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="card-title mb-0">Refunded</h6>
                                        <h3 className="mb-0 fw-bold">{stats.refunded}</h3>
                                    </div>
                                    <i className="bi bi-arrow-left-circle fs-2 opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Filters and Search */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-light">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-funnel me-2"></i>
                                    Filters & Search
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-5">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-search me-1"></i>
                                            Search Orders
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <i className="bi bi-search text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by Order ID, Student, Email, or Course"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            {searchTerm && (
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setSearchTerm('')}
                                                    title="Clear search"
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-filter me-1"></i>
                                            Filter by Status
                                        </label>
                                        <select
                                            className="form-select"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-lg-4 d-flex align-items-end">
                                        <div className="d-flex gap-2 w-100">
                                            <button
                                                className="btn btn-outline-secondary flex-grow-1"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                }}
                                            >
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Reset Filters
                                            </button>
                                            <button
                                                className="btn btn-info"
                                                onClick={() => fetchOrders()}
                                                disabled={loading}
                                                title="Apply filters"
                                            >
                                                <i className={`bi ${loading ? 'bi-arrow-repeat spinner-border spinner-border-sm' : 'bi-check2'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading orders...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-table me-2"></i>
                                    Orders ({filteredOrders.length})
                                </h5>
                                <div className="d-flex gap-2">
                                    <span className="badge bg-primary">
                                        Showing {filteredOrders.length} of {pagination.total || orders.length}
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th className="text-center">#</th>
                                                <th>Order ID</th>
                                                <th>Student</th>
                                                <th className="d-none d-md-table-cell">Course</th>
                                                <th className="d-none d-lg-table-cell">Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order, index) => (
                                                <tr key={order.id} className="align-middle">
                                                    <td className="text-center text-muted fw-semibold">
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong className="text-primary">{order.orderNumber || order.id}</strong>
                                                            <br />
                                                            <small className="text-muted">{order.id}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-semibold">{order.studentName}</div>
                                                            <small className="text-muted">{order.email}</small>
                                                            <small className="text-muted d-block d-md-none">
                                                                <i className="bi bi-book me-1"></i>
                                                                {order.course}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td className="d-none d-md-table-cell">
                                                        <div
                                                            className="text-truncate"
                                                            style={{ maxWidth: '200px' }}
                                                            title={order.course}
                                                        >
                                                            <i className="bi bi-book text-muted me-1"></i>
                                                            {order.course}
                                                        </div>
                                                    </td>
                                                    <td className="d-none d-lg-table-cell">
                                                        <div>
                                                            <div>{new Date(order.orderDate).toLocaleDateString()}</div>
                                                            <small className="text-muted">
                                                                {new Date(order.orderDate).toLocaleTimeString()}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong className="text-success">₹{order.amount}</strong>
                                                            <br />
                                                            <small className="text-muted">{order.paymentMethod}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(order.status)} fs-6 px-3 py-2`}>
                                                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleViewOrder(order)}
                                                                title="View order details"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                            {getAvailableActions(order.status, order.paymentStatus).length > 0 && (
                                                                <div className="btn-group">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                                        type="button"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded="false"
                                                                        title="More actions"
                                                                    >
                                                                        <i className="bi bi-three-dots-vertical"></i>
                                                                    </button>
                                                                    <ul className="dropdown-menu">
                                                                        {getAvailableActions(order.status, order.paymentStatus).map((actionItem, idx) => (
                                                                            <li key={idx}>
                                                                                <button
                                                                                    className={actionItem.className}
                                                                                    onClick={() => handleActionClick(order.id, actionItem.action)}
                                                                                >
                                                                                    <i className={`bi ${actionItem.action === 'confirmed' ? 'bi-check-circle' :
                                                                                        actionItem.action === 'processing' ? 'bi-arrow-repeat' :
                                                                                            actionItem.action === 'completed' ? 'bi-check-circle-fill' :
                                                                                                actionItem.action === 'cancelled' ? 'bi-x-circle' :
                                                                                                    actionItem.action === 'refund' ? 'bi-arrow-left-circle' :
                                                                                                        actionItem.action === 'download' ? 'bi-download' :
                                                                                                            'bi-arrow-right'
                                                                                        } me-2`}></i>
                                                                                    {actionItem.label}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Empty State */}
                                {!loading && filteredOrders.length === 0 && (
                                    <div className="text-center py-5">
                                        <i className="bi bi-inbox display-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">No orders found</h5>
                                        <p className="text-muted">
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'Try adjusting your search criteria or filters'
                                                : 'No orders have been placed yet'
                                            }
                                        </p>
                                        {(searchTerm || statusFilter !== 'all') && (
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                }}
                                            >
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="row mt-4">
                        <div className="col-12">
                            <nav aria-label="Orders pagination">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => fetchOrders(pagination.current - 1)}
                                            disabled={pagination.current === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {[...Array(pagination.pages)].map((_, index) => (
                                        <li key={index + 1} className={`page-item ${pagination.current === index + 1 ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => fetchOrders(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => fetchOrders(pagination.current + 1)}
                                            disabled={pagination.current === pagination.pages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Order Details Modal */}
                {showModal && selectedOrder && (
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={handleModalBackdropClick}
                        ref={modalRef}
                    >
                        <div className="modal-dialog modal-lg modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">
                                        <i className="bi bi-receipt me-2"></i>
                                        Order Details - {selectedOrder.orderNumber || selectedOrder.id}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card mb-3">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0">
                                                        <i className="bi bi-person me-2"></i>
                                                        Student Information
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="mb-2">
                                                        <strong>Name:</strong> {selectedOrder.studentName}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Email:</strong>
                                                        <a href={`mailto:${selectedOrder.email}`} className="text-decoration-none ms-1">
                                                            {selectedOrder.email}
                                                        </a>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Phone:</strong>
                                                        <a href={`tel:${selectedOrder.phone}`} className="text-decoration-none ms-1">
                                                            {selectedOrder.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card mb-3">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0">
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        Order Information
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="mb-2">
                                                        <strong>Order ID:</strong> {selectedOrder.id}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Order Number:</strong> {selectedOrder.orderNumber || 'N/A'}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Last Updated:</strong> {new Date(selectedOrder.lastUpdated).toLocaleString()}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Status:</strong>
                                                        <span className={`badge ${getStatusBadge(selectedOrder.status)} ms-2`}>
                                                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Payment Status:</strong>
                                                        <span className={`badge ${selectedOrder.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning'} ms-2`}>
                                                            {selectedOrder.paymentStatus || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0">
                                                        <i className="bi bi-book me-2"></i>
                                                        Course Details
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <h6 className="card-title text-primary">{selectedOrder.course}</h6>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <div className="mb-2">
                                                                <strong>Subtotal:</strong> ₹{selectedOrder.subtotal || selectedOrder.amount}
                                                            </div>
                                                            {selectedOrder.tax > 0 && (
                                                                <div className="mb-2">
                                                                    <strong>Tax (GST):</strong> ₹{selectedOrder.tax}
                                                                </div>
                                                            )}
                                                            {selectedOrder.shipping > 0 && (
                                                                <div className="mb-2">
                                                                    <strong>Shipping:</strong> ₹{selectedOrder.shipping}
                                                                </div>
                                                            )}
                                                            <div className="mb-2">
                                                                <strong className="text-success">Total Amount:</strong>
                                                                <span className="text-success fw-bold ms-1">₹{selectedOrder.amount}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="mb-2">
                                                                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                                                            </div>
                                                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                                                <div className="mb-2">
                                                                    <strong>Items:</strong> {selectedOrder.items.length}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        <i className="bi bi-x me-2"></i>
                                        Close
                                    </button>
                                    <div className="btn-group">
                                        {getAvailableActions(selectedOrder.status, selectedOrder.paymentStatus).map((actionItem, index) => (
                                            <button
                                                key={index}
                                                className={`btn ${actionItem.action === 'refund' ? 'btn-warning' :
                                                    actionItem.action === 'pending' ? 'btn-success' :
                                                        actionItem.action === 'completed' ? 'btn-success' :
                                                            actionItem.action === 'cancelled' ? 'btn-danger' :
                                                                actionItem.action === 'download' ? 'btn-info' :
                                                                    'btn-primary'
                                                    }`}
                                                onClick={() => handleActionClick(selectedOrder.id, actionItem.action)}
                                            >
                                                <i className={`bi ${actionItem.action === 'confirmed' ? 'bi-check-circle' :
                                                    actionItem.action === 'processing' ? 'bi-arrow-repeat' :
                                                        actionItem.action === 'completed' ? 'bi-check-circle-fill' :
                                                            actionItem.action === 'cancelled' ? 'bi-x-circle' :
                                                                actionItem.action === 'refund' ? 'bi-arrow-left-circle' :
                                                                    actionItem.action === 'download' ? 'bi-download' :
                                                                        'bi-arrow-right'
                                                    } me-2`}></i>
                                                {actionItem.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refund Modal */}
                {showRefundModal && selectedOrder && (
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={handleRefundModalBackdropClick}
                        ref={refundModalRef}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-warning text-dark">
                                    <h5 className="modal-title">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Issue Refund
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeRefundModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="alert alert-warning">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        You are about to issue a refund for order {selectedOrder.id} of ${selectedOrder.amount}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Refund Reason</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Enter reason for refund..."
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeRefundModal}>Cancel</button>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={handleRefund}
                                        disabled={!refundReason.trim()}
                                    >
                                        Issue Refund
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ManageOrders;
