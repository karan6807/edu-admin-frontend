import React, { useEffect, useState } from "react";

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(""); // Unified for success/error messages
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        instructor: "",
        price: "",
        description: "",
        duration: "",
        category: "",
        level: "Beginner",
        isPublished: true,
        language: "English",
        tags: ""
    });

    // API base URL - adjust according to your backend setup
    const API_BASE_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api`;

    /**
     * Get auth token from localStorage
     */
    const getAuthToken = () => {
        return localStorage.getItem('adminToken') || localStorage.getItem('token');
    };

    /**
     * Formats a number as Indian Rupees (INR) currency or displays "Free" if price is 0.
     */
    const formatCurrency = (amount) => {
        // Check if amount is 0 or null/undefined
        if (amount === 0 || amount === null || amount === undefined) {
            return "Free";
        }
        
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    /**
     * Fetch courses from backend API
     */
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/admin/courses`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCourses(data);
            setMessage("");
        } catch (error) {
            console.error("Error fetching courses:", error);
            setMessage("Failed to fetch courses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    /**
     * Handles changes to form input fields.
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Opens the modal for editing a course.
     */
    const openModal = (course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title || "",
            instructor: course.instructor || "",
            price: course.price || "",
            description: course.description || "",
            duration: course.duration || "",
            category: course.category || "",
            level: course.level || "Beginner",
            isPublished: course.isPublished !== undefined ? course.isPublished : true,
            language: course.language || "English",
            tags: Array.isArray(course.tags) ? course.tags.join(", ") : (course.tags || "")
        });
        setShowModal(true);
    };

    /**
     * Closes the modal and resets the form data.
     */
    const closeModal = () => {
        setShowModal(false);
        setEditingCourse(null);
        setFormData({
            title: "",
            instructor: "",
            price: "",
            description: "",
            duration: "",
            category: "",
            level: "Beginner",
            isPublished: true,
            language: "English",
            tags: ""
        });
        setMessage("");
    };

    /**
     * Handles the submission of the course form (edit only).
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!editingCourse) {
            setMessage("No course selected for editing.");
            return;
        }

        try {
            const token = getAuthToken();

            // Prepare data for API
            const updateData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            const response = await fetch(`${API_BASE_URL}/admin/courses/${editingCourse._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update local state
            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course._id === editingCourse._id ? data.course : course
                )
            );

            setMessage("Course updated successfully!");
            closeModal();
        } catch (error) {
            console.error("Error updating course:", error);
            setMessage("Failed to update course. Please try again.");
        }
    };

    /**
     * Handles deleting a course.
     */
    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }

        setMessage("Deleting course...");

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/admin/course/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove course from local state
            setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
            setMessage("Course deleted successfully!");
        } catch (error) {
            console.error("Error deleting course:", error);
            setMessage("Failed to delete course. Please try again.");
        }
    };

    /**
     * Handles toggling the published status of a course.
     */
    const toggleCourseStatus = async (courseId, currentStatus) => {
        setMessage("Updating status...");

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPublished: !currentStatus })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update local state
            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course._id === courseId ? data.course : course
                )
            );

            setMessage("Course status updated successfully!");
        } catch (error) {
            console.error("Error updating course status:", error);
            setMessage("Failed to update course status. Please try again.");
        }
    };

    // Display loading spinner while data is being fetched
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="spinner-border text-primary me-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Loading courses...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Manage Courses</h2>
            </div>

            {message && (
                <div className={`alert ${message.includes("success") ? "alert-success" : "alert-danger"} alert-dismissible fade show`} role="alert">
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage("")}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            <div className="card shadow">
                <div className="card-body">
                    {courses.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <div className="mb-3">
                                <svg width="64" height="64" className="text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.75a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75V7.5c0-.414.336-.75.75-.75h3.75zm-3 7.5c-.414 0-.75.336-.75.75v3.75a.75.75 0 00.75.75h3.75a.75.75 0 00.75-.75v-3.75a.75.75 0 00-.75-.75H9zm9-7.5a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-3.75a.75.75 0 01-.75-.75V7.5c0-.414.336-.75.75-.75h3.75zm-3 7.5a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-3.75a.75.75 0 01-.75-.75v-3.75a.75.75 0 01.75-.75h3.75z" />
                                </svg>
                            </div>
                            <h5 className="fw-semibold mb-2">No courses found</h5>
                            <p>No courses are currently available in the system.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Title</th>
                                        <th scope="col">Instructor</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Level</th>
                                        <th scope="col">Duration</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course._id}>
                                            <td>
                                                <div>
                                                    <strong>{course.title}</strong>
                                                    {course.description && (
                                                        <div className="text-muted small">
                                                            {course.description.length > 50
                                                                ? `${course.description.substring(0, 50)}...`
                                                                : course.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-muted">{course.instructor}</td>
                                            <td>
                                                {course.category && (
                                                    <span className="badge bg-secondary">{course.category}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${course.level === 'Beginner' ? 'bg-success' :
                                                        course.level === 'Intermediate' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                    {course.level || 'Beginner'}
                                                </span>
                                            </td>
                                            <td className="text-muted">{course.duration || 'N/A'}</td>
                                            <td>
                                                <strong className={course.price === 0 ? 'text-info' : 'text-success'}>
                                                    {formatCurrency(course.price)}
                                                </strong>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${course.isPublished ? 'btn-success' : 'btn-secondary'}`}
                                                    onClick={() => toggleCourseStatus(course._id, course.isPublished)}
                                                >
                                                    {course.isPublished ? 'Published' : 'Unpublished'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => openModal(course)}
                                                        title="Edit Course"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.109 7.071l4.145-4.146a.5.5 0 01.707 0l2.828 2.828a.5.5 0 010 .707l-4.146 4.145a.5.5 0 01-.707 0l-2.828-2.828a.5.5 0 010-.707zM6.5 14a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5z" />
                                                            <path fillRule="evenodd" d="M3 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDelete(course._id)}
                                                        title="Delete Course"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Course Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Course</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="title" className="form-label">Course Title *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="instructor" className="form-label">Instructor *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="instructor"
                                                name="instructor"
                                                value={formData.instructor}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <label htmlFor="price" className="form-label">Price (₹) *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="1"
                                                required
                                            />
                                            <small className="form-text text-muted">Enter 0 for free courses</small>
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="duration" className="form-label">Duration</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="duration"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 4 weeks, 20 hours"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="level" className="form-label">Level</label>
                                            <select
                                                className="form-select"
                                                id="level"
                                                name="level"
                                                value={formData.level}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="category" className="form-label">Category</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Programming, Design, Business"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="language" className="form-label">Language</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="language"
                                                name="language"
                                                value={formData.language}
                                                onChange={handleInputChange}
                                                placeholder="e.g., English, Hindi"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="tags" className="form-label">Tags</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="tags"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            placeholder="e.g., React, JavaScript, Frontend (separate with commas)"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Brief description of the course..."
                                        ></textarea>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isPublished"
                                            name="isPublished"
                                            checked={formData.isPublished}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isPublished">
                                            Course is published and available for enrollment
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Update Course
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageCourses;
