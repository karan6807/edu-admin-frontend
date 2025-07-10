import React, { useEffect, useState } from "react";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    specializations: '',
    experience: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/instructors');

      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }

      const data = await response.json();

      if (data.success) {
        setInstructors(data.data);
      } else {
        setError(data.message || 'Failed to load instructors');
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      let profileImageUrl = '';
      
      // Upload image if selected
      if (formData.profileImage) {
        profileImageUrl = await uploadImage(formData.profileImage);
      }

      const response = await fetch('http://localhost:5000/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          specializations: formData.specializations.split(',').map(s => s.trim()),
          experience: parseInt(formData.experience) || 0,
          profileImage: profileImageUrl
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        fetchInstructors();
      } else {
        const errorData = await response.json();
        alert(`Failed to add instructor: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding instructor:', err);
      alert('Error adding instructor');
    } finally {
      setUploading(false);
    }
  };

  const handleEditInstructor = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      let profileImageUrl = selectedInstructor.profileImage;
      
      // Upload new image if selected
      if (formData.profileImage) {
        profileImageUrl = await uploadImage(formData.profileImage);
      }

      const response = await fetch(`http://localhost:5000/api/instructors/${selectedInstructor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          specializations: formData.specializations.split(',').map(s => s.trim()),
          experience: parseInt(formData.experience) || 0,
          profileImage: profileImageUrl
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedInstructor(null);
        resetForm();
        fetchInstructors();
      } else {
        const errorData = await response.json();
        alert(`Failed to update instructor: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating instructor:', err);
      alert('Error updating instructor');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/instructors/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchInstructors();
        } else {
          const errorData = await response.json();
          alert(`Failed to delete instructor: ${errorData.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Error deleting instructor:', err);
        alert('Error deleting instructor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      specializations: '',
      experience: '',
      profileImage: null
    });
    setImagePreview(null);
  };

  const openViewModal = (instructor) => {
    setSelectedInstructor(instructor);
    setShowViewModal(true);
  };

  const openEditModal = (instructor) => {
    setSelectedInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      bio: instructor.bio,
      specializations: instructor.specializations ? instructor.specializations.join(', ') : '',
      experience: instructor.experience || '',
      profileImage: null
    });
    setImagePreview(instructor.profileImage || null);
    setShowEditModal(true);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setShowEditModal(false);
    setShowViewModal(false);
    resetForm();
    setSelectedInstructor(null);
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading instructors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5 text-center">
        <h2 className="text-danger">{error}</h2>
        <p className="text-muted">Failed to load instructors data.</p>
      </div>
    );
  }

  return (
    <>
      {/* Add Bootstrap Icons CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      
      <div className="container my-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Instructors Management</h2>
          <button
            className="btn btn-primary"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Instructor
          </button>
        </div>

        {/* Instructors Table */}
        <div className="card shadow rounded-4">
          <div className="card-body">
            {instructors.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-person-plus display-4 mb-2"></i>
                <p>No instructors found. Add your first instructor!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Experience</th>
                      <th>Specializations</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor) => (
                      <tr key={instructor._id}>
                        <td>
                          {instructor.profileImage ? (
                            <img
                              src={`http://localhost:5000${instructor.profileImage}`}
                              alt={instructor.name}
                              className="rounded-circle"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                              style={{ width: "40px", height: "40px", fontSize: "14px" }}
                            >
                              {instructor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          )}
                        </td>
                        <td className="fw-semibold">{instructor.name}</td>
                        <td className="text-muted">{instructor.email}</td>
                        <td>
                          {instructor.experience > 0 ? (
                            <span className="badge bg-info">{instructor.experience} years</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {instructor.specializations && instructor.specializations.length > 0 ? (
                            <div>
                              {instructor.specializations.slice(0, 2).map((spec, index) => (
                                <span key={index} className="badge bg-primary-subtle text-primary me-1 mb-1">
                                  {spec}
                                </span>
                              ))}
                              {instructor.specializations.length > 2 && (
                                <span className="text-muted">+{instructor.specializations.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-muted">
                          {new Date(instructor.dateJoined).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openViewModal(instructor)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openEditModal(instructor)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteInstructor(instructor._id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
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

        {/* Add Instructor Modal */}
        {showAddForm && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Instructor</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <form onSubmit={handleAddInstructor}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Experience (years)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specializations</label>
                        <input
                          type="text"
                          className="form-control"
                          name="specializations"
                          value={formData.specializations}
                          onChange={handleInputChange}
                          placeholder="React, Node.js, JavaScript (comma separated)"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                        </div>
                      )}
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
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding...
                        </>
                      ) : (
                        'Add Instructor'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedInstructor && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Instructor Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 text-center mb-3">
                      {selectedInstructor.profileImage ? (
                        <img
                          src={`http://localhost:5000${selectedInstructor.profileImage}`}
                          alt={selectedInstructor.name}
                          className="rounded-circle shadow"
                          style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white shadow mx-auto"
                          style={{ width: "120px", height: "120px", fontSize: "32px" }}
                        >
                          {selectedInstructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <h4 className="fw-bold">{selectedInstructor.name}</h4>
                      <p className="text-muted mb-3">{selectedInstructor.email}</p>

                      {selectedInstructor.bio && (
                        <div className="mb-3">
                          <strong>Bio:</strong>
                          <p className="text-muted">{selectedInstructor.bio}</p>
                        </div>
                      )}

                      <div className="mb-3">
                        <strong>Experience:</strong> {selectedInstructor.experience || 0} years
                      </div>

                      {selectedInstructor.specializations && selectedInstructor.specializations.length > 0 && (
                        <div className="mb-3">
                          <strong>Specializations:</strong>
                          <div className="mt-2">
                            {selectedInstructor.specializations.map((spec, index) => (
                              <span key={index} className="badge bg-primary-subtle text-primary me-2 mb-1">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <strong>Joined:</strong> {new Date(selectedInstructor.dateJoined).toLocaleDateString()}
                      </div>

                      {selectedInstructor.rating > 0 && (
                        <div className="mb-3">
                          <strong>Rating:</strong>
                          <span className="text-warning ms-2">
                            <i className="bi bi-star-fill"></i> {selectedInstructor.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {selectedInstructor.totalStudents > 0 && (
                        <div className="mb-3">
                          <strong>Total Students:</strong> {selectedInstructor.totalStudents}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedInstructor && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Instructor</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <form onSubmit={handleEditInstructor}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Experience (years)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specializations</label>
                        <input
                          type="text"
                          className="form-control"
                          name="specializations"
                          value={formData.specializations}
                          onChange={handleInputChange}
                          placeholder="React, Node.js, JavaScript (comma separated)"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <img
                            src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5000${imagePreview}`}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                        </div>
                      )}
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
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Instructor'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Instructors;