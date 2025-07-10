/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const UserDetail = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchUserDetail = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockUserDetail = {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@edu.com',
          phoneNumber: '+1234567890',
          profileImage: null, // URL to profile image or null
          homeAddress: '123 Main St, City, State 12345',
          dateCreated: '2024-01-15',
          bio: 'Passionate computer science student with interests in web development and artificial intelligence.',
          department: 'Computer Science',
          lastLogin: '2024-06-09',
          totalSpent: 1250.00,
          coursesEnrolled: 5,
          completedCourses: 3,
          // Personal Information
          dateOfBirth: '1998-05-15',
          gender: 'Male',
          // Purchased Courses
          purchasedCourses: [
            {
              id: 1,
              title: 'Introduction to React',
              instructor: 'Dr. Smith',
              purchaseDate: '2024-01-20',
              price: 299.99,
              duration: '6 weeks',
              category: 'Web Development'
            },
            {
              id: 2,
              title: 'Advanced JavaScript',
              instructor: 'Prof. Johnson',
              purchaseDate: '2024-02-15',
              price: 399.99,
              duration: '8 weeks',
              category: 'Programming'
            },
            {
              id: 3,
              title: 'Database Design',
              instructor: 'Dr. Wilson',
              purchaseDate: '2024-03-10',
              price: 349.99,
              duration: '5 weeks',
              category: 'Database'
            },
            {
              id: 4,
              title: 'Machine Learning Basics',
              instructor: 'Prof. Davis',
              purchaseDate: '2024-04-05',
              price: 199.99,
              duration: '4 weeks',
              category: 'AI/ML'
            }
          ],
          // Payment History
          paymentHistory: [
            {
              id: 1,
              date: '2024-01-20',
              amount: 299.99,
              course: 'Introduction to React',
              method: 'Credit Card',
              status: 'Paid'
            },
            {
              id: 2,
              date: '2024-02-15',
              amount: 399.99,
              course: 'Advanced JavaScript',
              method: 'PayPal',
              status: 'Paid'
            },
            {
              id: 3,
              date: '2024-03-10',
              amount: 349.99,
              course: 'Database Design',
              method: 'Credit Card',
              status: 'Paid'
            },
            {
              id: 4,
              date: '2024-04-05',
              amount: 199.99,
              course: 'Machine Learning Basics',
              method: 'Bank Transfer',
              status: 'Paid'
            }
          ]
        };
        setUser(mockUserDetail);
        setLoading(false);
      }, 500);
    };

    fetchUserDetail();
  }, [userId]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'bg-success',
      'In Progress': 'bg-warning',
      'Not Started': 'bg-secondary',
      'Active': 'bg-success',
      'Paid': 'bg-success'
    };
    return `badge ${statusClasses[status] || 'bg-secondary'}`;
  };

  const getProgressBar = (progress) => {
    const progressClass = progress === 100 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-info';
    return (
      <div className="progress" style={{ height: '6px' }}>
        <div 
          className={`progress-bar ${progressClass}`} 
          role="progressbar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <p>User not found</p>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-0">
            {/* User Profile Header */}
            <div className="bg-light p-4 border-bottom">
              <div className="row align-items-center">
                <div className="col-auto">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="rounded-circle" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                    >
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="col">
                  <h4 className="mb-1">{user.firstName} {user.lastName}</h4>
                  <p className="text-muted mb-2">{user.email}</p>
                  <div className="d-flex gap-3 flex-wrap">
                    <span className={getStatusBadge(user.status)}>{user.status}</span>
                    <small className="text-muted">Member since {new Date(user.dateCreated).toLocaleDateString()}</small>
                  </div>
                </div>
                <div className="col-auto text-end">
                  <div className="row g-2">
                    <div className="col-12">
                      <strong className="h5 text-success">${user.totalSpent.toFixed(2)}</strong>
                      <div className="small text-muted">Total Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-bottom">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <div className="h4 text-primary mb-0">{user.coursesEnrolled}</div>
                    <div className="small text-muted">Courses Enrolled</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <div className="h4 text-success mb-0">{user.completedCourses}</div>
                    <div className="small text-muted">Completed</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <div className="h4 text-warning mb-0">{user.coursesEnrolled - user.completedCourses}</div>
                    <div className="small text-muted">In Progress</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-center">
                    <div className="h4 text-info mb-0">{user.paymentHistory.length}</div>
                    <div className="small text-muted">Transactions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('courses')}
                  >
                    Courses
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                  >
                    Payments
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'overview' && (
                <div className="row g-4">
                  {/* Personal Information */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">Personal Information</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Full Name</label>
                            <p className="mb-0">{user.firstName} {user.lastName}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Email</label>
                            <p className="mb-0">{user.email}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Phone Number</label>
                            <p className="mb-0">{user.phoneNumber}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Date of Birth</label>
                            <p className="mb-0">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Gender</label>
                            <p className="mb-0">{user.gender}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Home Address</label>
                            <p className="mb-0">{user.homeAddress}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Department</label>
                            <p className="mb-0">{user.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account & Bio Information */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">Account & Bio</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Account Created</label>
                            <p className="mb-0">{new Date(user.dateCreated).toLocaleDateString()}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Enrollment Date</label>
                            <p className="mb-0">{new Date(user.enrollmentDate).toLocaleDateString()}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Last Login</label>
                            <p className="mb-0">{user.lastLogin}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Bio</label>
                            <p className="mb-0">{user.bio}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Emergency Contact</label>
                            <p className="mb-0">
                              {user.emergencyContact.name} ({user.emergencyContact.relationship})
                              <br />
                              <small className="text-muted">{user.emergencyContact.phone}</small>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <h6 className="mb-3">Purchased Courses ({user.purchasedCourses.length})</h6>
                  <div className="row g-3">
                    {user.purchasedCourses.map(course => (
                      <div key={course.id} className="col-12 col-md-6 col-xl-4">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">{course.title}</h6>
                              <span className={getStatusBadge(course.status)}>{course.status}</span>
                            </div>
                            <p className="text-muted small mb-2">by {course.instructor}</p>
                            <p className="text-muted small mb-2">
                              <i className="bi bi-clock me-1"></i>
                              {course.duration} • {course.category}
                            </p>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between small mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              {getProgressBar(course.progress)}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold text-success">${course.price}</span>
                              <small className="text-muted">
                                {new Date(course.purchaseDate).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <h6 className="mb-3">Payment History ({user.paymentHistory.length} transactions)</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Course</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.paymentHistory.map(payment => (
                          <tr key={payment.id}>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td>{payment.course}</td>
                            <td className="fw-semibold">${payment.amount}</td>
                            <td>{payment.method}</td>
                            <td>
                              <span className={getStatusBadge(payment.status)}>{payment.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end mt-3">
                    <strong>Total Spent: ${user.totalSpent.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;