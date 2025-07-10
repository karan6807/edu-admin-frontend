/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import UserDetail from './UserDetail';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@edu.com',
        department: 'Computer Science',
        phoneNumber: '+1234567890',
        enrollmentDate: '2024-01-15',
        lastLogin: '2024-06-09'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@edu.com',
        department: 'Mathematics',
        phoneNumber: '+1234567891',
        enrollmentDate: '2023-08-20',
        lastLogin: '2024-06-10'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    return (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewUser = (user) => {
    setSelectedUserId(user.id);
    setShowUserDetail(true);
  };

  const handleCloseUserDetail = () => {
    setShowUserDetail(false);
    setSelectedUserId(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12">
          <h2 className="mb-1">Manage Users</h2>
          <p className="text-muted mb-3">View and manage students, teachers, and administrators</p>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-lg-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4 col-lg-2">
          <div className="text-muted small text-center text-md-start">
            <span className="d-block d-md-inline">Showing {filteredUsers.length} of {users.length} users</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="d-none d-lg-block">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Department</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-primary text-white me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                            <div className="text-muted small">{user.email}</div>
                            <div className="text-muted small">{user.phoneNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.department}</td>
                      <td className="text-muted small">{user.lastLogin}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewUser(user)}
                            title="View User Details"
                          >
                            <i className="bi bi-eye me-1"></i>
                            <span className="d-none d-sm-inline">View</span>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <i className="bi bi-trash me-1"></i>
                            <span className="d-none d-sm-inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="d-lg-none">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted">
                No users found matching your criteria
              </div>
            ) : (
              <div className="p-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="card mb-3 border">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-3 col-sm-2">
                          <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '50px', height: '50px', borderRadius: '50%' }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="col-9 col-sm-10">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{user.firstName} {user.lastName}</h6>
                              <div className="text-muted small">{user.email}</div>
                              <div className="text-muted small d-sm-none">{user.phoneNumber}</div>
                            </div>
                          </div>

                          <div className="small text-muted mb-2">
                            <strong>Department:</strong> {user.department}
                          </div>

                          <div className="small text-muted mb-3">
                            <strong>Last Login:</strong> {user.lastLogin}
                          </div>

                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewUser(user)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              <span className="d-none d-sm-inline">View</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              <span className="d-none d-sm-inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUserId && (
        <UserDetail 
          userId={selectedUserId} 
          onClose={handleCloseUserDetail}
        />
      )}

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
      />
    </div>
  );
};

export default ManageUsers;