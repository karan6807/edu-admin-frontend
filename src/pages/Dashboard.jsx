/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
// import api from "../utils/api";

function Dashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalStudents: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        completionRate: 0,
        newSignups: 0,
        coursesSold: 0,
        avgRating: 0,
        revenueData: [],
        topCourses: [],
        recentActivity: [],
        studentGrowth: [],
    });

    useEffect(() => {
        // Mock data for e-learning platform
        const mockData = {
            totalRevenue: 125840,
            totalStudents: 3247,
            totalCourses: 156,
            activeEnrollments: 2891,
            completionRate: 78,
            newSignups: 89,
            coursesSold: 423,
            avgRating: 4.6,
            revenueData: [
                { month: 'Jan', revenue: 18500, courses: 89 },
                { month: 'Feb', revenue: 22300, courses: 112 },
                { month: 'Mar', revenue: 19800, courses: 95 },
                { month: 'Apr', revenue: 25600, courses: 134 },
                { month: 'May', revenue: 28900, courses: 156 },
                { month: 'Jun', revenue: 32400, courses: 178 },
            ],
            topCourses: [
                { id: 1, title: 'Complete Web Development Bootcamp', students: 892, revenue: 35680, rating: 4.8 },
                { id: 2, title: 'Data Science & Machine Learning', students: 654, revenue: 26160, rating: 4.7 },
                { id: 3, title: 'Digital Marketing Masterclass', students: 543, revenue: 21720, rating: 4.6 },
                { id: 4, title: 'Mobile App Development with React Native', students: 421, revenue: 16840, rating: 4.5 },
                { id: 5, title: 'UI/UX Design Fundamentals', students: 389, revenue: 15560, rating: 4.7 },
            ],
            recentActivity: [
                { type: 'enrollment', message: 'Sarah Johnson enrolled in "Complete Web Development"', time: '2 min ago' },
                { type: 'completion', message: 'Mike Chen completed "Data Science Basics"', time: '15 min ago' },
                { type: 'review', message: 'Emma Davis left a 5-star review for "Digital Marketing"', time: '1 hour ago' },
                { type: 'purchase', message: 'Alex Wilson purchased "Mobile App Development"', time: '2 hours ago' },
                { type: 'completion', message: 'Lisa Park completed "UI/UX Design Fundamentals"', time: '3 hours ago' },
            ],
            studentGrowth: [
                { period: 'Week 1', students: 45 },
                { period: 'Week 2', students: 67 },
                { period: 'Week 3', students: 52 },
                { period: 'Week 4', students: 89 },
            ],
        };

        setStats(mockData);

        // Uncomment below for actual API call
        /*
        api.get("/dashboard")
          .then((res) => {
            setStats(res.data);
          })
          .catch((err) => {
            console.error("Error fetching dashboard data:", err);
          });
        */
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'enrollment': return '📚';
            case 'completion': return '🎓';
            case 'review': return '⭐';
            case 'purchase': return '💳';
            default: return '📋';
        }
    };

    return (
        <div className="container-fluid">
            {/* Welcome Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">Welcome back, Admin! 👋</h2>
                            <p className="text-muted mb-0">Here's what's happening with Edu today</p>
                        </div>
                        <div className="text-end">
                            <div className="text-muted small">Last updated</div>
                            <div className="fw-bold">{new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="row mb-4">
                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="card-label">Total Revenue</p>
                                    <h3 className="card-value text-success">{formatCurrency(stats.totalRevenue)}</h3>
                                    <div className="progress-bar bg-success" style={{ width: '85%' }}></div>
                                </div>
                                <div className="text-success fs-2">💰</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="card-label">Total Students</p>
                                    <h3 className="card-value text-primary">{stats.totalStudents.toLocaleString()}</h3>
                                    <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                                </div>
                                <div className="text-primary fs-2">👥</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="card-label">Active Courses</p>
                                    <h3 className="card-value text-info">{stats.totalCourses}</h3>
                                    <div className="progress-bar bg-info" style={{ width: '90%' }}></div>
                                </div>
                                <div className="text-info fs-2">📚</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="card-label">Completion Rate</p>
                                    <h3 className="card-value text-warning">{stats.completionRate}%</h3>
                                    <div className="progress-bar bg-warning" style={{ width: `${stats.completionRate}%` }}></div>
                                </div>
                                <div className="text-warning fs-2">🎯</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics Row */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body text-center">
                            <div className="fs-1 mb-2">📈</div>
                            <h4 className="card-value text-success">+{stats.newSignups}</h4>
                            <p className="card-label mb-0">New Signups Today</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body text-center">
                            <div className="fs-1 mb-2">🛒</div>
                            <h4 className="card-value text-primary">{stats.coursesSold}</h4>
                            <p className="card-label mb-0">Courses Sold This Month</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body text-center">
                            <div className="fs-1 mb-2">⭐</div>
                            <h4 className="card-value text-warning">{stats.avgRating}/5.0</h4>
                            <p className="card-label mb-0">Average Course Rating</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="dashboard-card card h-100">
                        <div className="card-body text-center">
                            <div className="fs-1 mb-2">🎓</div>
                            <h4 className="card-value text-info">{stats.activeEnrollments.toLocaleString()}</h4>
                            <p className="card-label mb-0">Active Enrollments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Data Row */}
            <div className="row mb-4">
                <div className="col-xl-8 col-lg-12 mb-4">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">Revenue & Course Sales Overview</h5>
                                <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                                    <option>Last 6 Months</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0', overflowX: 'auto' }}>
                                {stats.revenueData.map((data, index) => (
                                    <div key={index} className="d-flex flex-column align-items-center flex-shrink-0" style={{ minWidth: '80px' }}>
                                        <div className="d-flex align-items-end mb-2" style={{ height: '200px' }}>
                                            <div
                                                className="bg-success me-2"
                                                style={{
                                                    width: '25px',
                                                    height: `${(data.revenue / 35000) * 200}px`,
                                                    borderRadius: '4px 4px 0 0'
                                                }}
                                                title={`Revenue: ${formatCurrency(data.revenue)}`}
                                            ></div>
                                            <div
                                                className="bg-primary"
                                                style={{
                                                    width: '25px',
                                                    height: `${(data.courses / 200) * 200}px`,
                                                    borderRadius: '4px 4px 0 0'
                                                }}
                                                title={`Courses Sold: ${data.courses}`}
                                            ></div>
                                        </div>
                                        <small className="text-muted fw-bold">{data.month}</small>
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <div className="d-flex align-items-center me-4">
                                    <div className="bg-success" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
                                    <span className="ms-2 small">Revenue</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
                                    <span className="ms-2 small">Courses Sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-12 mb-4">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Student Growth</h5>
                            <div className="chart-container" style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0' }}>
                                {stats.studentGrowth.map((data, index) => (
                                    <div key={index} className="d-flex flex-column align-items-center" style={{ width: '50px' }}>
                                        <div
                                            className="bg-gradient"
                                            style={{
                                                width: '30px',
                                                height: `${(data.students / 100) * 150}px`,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '15px 15px 0 0',
                                                marginBottom: '8px'
                                            }}
                                            title={`${data.students} new students`}
                                        ></div>
                                        <small className="text-muted text-center">{data.period}</small>
                                        <small className="fw-bold text-primary">+{data.students}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Courses and Recent Activity Row */}
            <div className="row">
                <div className="col-xl-8 col-lg-12 mb-4">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">Top Performing Courses</h5>
                                <a href="/courses" className="text-decoration-none small">View All →</a>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Course Title</th>
                                            <th>Students</th>
                                            <th>Revenue</th>
                                            <th>Rating</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topCourses.map((course, index) => (
                                            <tr key={course.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className=" d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{course.title}</div>
                                                            <small className="text-muted">Active Course</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-bold">{course.students}</span>
                                                    <br />
                                                    <small className="text-muted">enrolled</small>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-success">{formatCurrency(course.revenue)}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="text-warning me-1">⭐</span>
                                                        <span className="fw-bold">{course.rating}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="progress" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{ width: `${(course.students / 1000) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <small className="text-muted">vs target</small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-12 mb-4">
                    <div className="dashboard-card card h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Recent Activity</h5>
                            <div className="activity-feed" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {stats.recentActivity.map((activity, index) => (
                                    <div key={index} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                                        <div className="me-3 fs-5">{getActivityIcon(activity.type)}</div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small">{activity.message}</p>
                                            <small className="text-muted">{activity.time}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-3">
                                <a href="/activity" className="btn btn-outline-primary btn-sm">View All Activity</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
                <div className="col-12">
                    <div className="dashboard-card card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Quick Actions</h5>
                            <div className="row">
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <a href="/add-course" className="btn btn-primary w-100 py-3">
                                        <div className="fs-4 mb-2">➕</div>
                                        Add New Course
                                    </a>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <a href="/users" className="btn btn-info w-100 py-3">
                                        <div className="fs-4 mb-2">👥</div>
                                        Manage Students
                                    </a>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <a href="/orders" className="btn btn-success w-100 py-3">
                                        <div className="fs-4 mb-2">📊</div>
                                        View Sales Report
                                    </a>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-3">
                                    <a href="/categories" className="btn btn-warning w-100 py-3">
                                        <div className="fs-4 mb-2">🗂️</div>
                                        Manage Categories
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;