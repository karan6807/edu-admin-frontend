import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddCourse() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [instructors, setInstructors] = useState([]); // Added for instructors
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        instructor: "", // Changed from "You" to empty string
        instructorId: "", // Added to store instructor ID
        price: 0,
        category: "",
        subcategory: "",
        sub_subcategory: "",
        level: "",
        duration: "",
        thumbnailUrl: "",
        videoUrl: "",
        tags: [""],
        language: "",
        isPublished: false,
        learningOutcomes: [""],
        whatYouWillLearn: [""],
    });

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Use environment variable instead of hardcoded localhost
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

                const res = await axios.get(`${API_URL}/api/admin/categories`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                });
                console.log("Fetched categories:", res.data);
                setCategories(res.data);
            } catch (err) {
                console.error("Error fetching categories", err);
                setError("Failed to fetch categories");
            }
        };

        fetchCategories();
    }, []);

    // Fetch instructors from backend
    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                // Use environment variable instead of hardcoded localhost
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

                const response = await fetch(`${API_URL}/api/instructors`);

                if (!response.ok) {
                    throw new Error('Failed to fetch instructors');
                }

                const data = await response.json();

                if (data.success) {
                    setInstructors(data.data);
                } else {
                    console.error('Failed to load instructors:', data.message);
                }
            } catch (err) {
                console.error('Error fetching instructors:', err);
                // Don't set error here as it's not critical for the form
            }
        };

        fetchInstructors();
    }, []);

    const [activeTab, setActiveTab] = useState("basic");
    const [dragActive, setDragActive] = useState(false);

    const levels = ["Beginner", "Intermediate", "Advanced", "Professional"];
    const languages = [
        "English",
        "Hindi",
        "Spanish",
        "French",
        "German",
        "Chinese",
        "Japanese",
    ];

    // FIXED: Updated category helper functions to match ManageCategories.jsx structure
    const getMainCategories = () => {
        return categories.filter((cat) => cat.level === 1);
    };

    const getSubCategories = () => {
        return categories.filter((cat) => {
            if (cat.level !== 2) return false;

            const parentId = cat.parentCategory && cat.parentCategory._id
                ? cat.parentCategory._id
                : cat.parentCategory;

            return parentId === courseData.category;
        });
    };

    const getSubSubCategories = () => {
        return categories.filter((cat) => {
            if (cat.level !== 3) return false;

            const parentId = cat.parentCategory && cat.parentCategory._id
                ? cat.parentCategory._id
                : cat.parentCategory;

            return parentId === courseData.subcategory;
        });
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return "None";
        const category = categories.find(cat => (cat._id || cat.id) === categoryId);
        return category ? category.name : "Unknown";
    };

    const getCategoryPath = () => {
        const parts = [];
        if (courseData.category) {
            parts.push(getCategoryName(courseData.category));
        }
        if (courseData.subcategory) {
            parts.push(getCategoryName(courseData.subcategory));
        }
        if (courseData.sub_subcategory) {
            parts.push(getCategoryName(courseData.sub_subcategory));
        }
        return parts.length > 0 ? parts.join(" > ") : "None";
    };

    const handleInputChange = (field, value) => {
        setCourseData((prev) => ({ ...prev, [field]: value }));
    };

    // Updated instructor selection handler
    const handleInstructorChange = (instructorId) => {
        const selectedInstructor = instructors.find(inst => inst._id === instructorId);
        setCourseData((prev) => ({
            ...prev,
            instructorId: instructorId,
            instructor: selectedInstructor ? selectedInstructor.name : ""
        }));
    };

    const handleArrayChange = (field, index, value) => {
        setCourseData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const addArrayItem = (field) => {
        setCourseData((prev) => ({
            ...prev,
            [field]: [...prev[field], ""],
        }));
    };

    const removeArrayItem = (field, index) => {
        setCourseData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e, fileType) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0], fileType);
        }
    };

    const handleFileUpload = (file, fileType) => {
        if (fileType === "thumbnail") {
            setCourseData((prev) => ({
                ...prev,
                thumbnailFile: file,
                thumbnailUrl: URL.createObjectURL(file),
            }));
        } else if (fileType === "promoVideo") {
            setCourseData((prev) => ({
                ...prev,
                promoVideoFile: file,
                videoUrl: URL.createObjectURL(file),
            }));
        }
    };

    const handleSubmit = async (action) => {
        try {
            setIsLoading(true);
            setError(null);

            // Basic validation
            if (!courseData.title || !courseData.description || !courseData.category) {
                throw new Error("Please fill in all required fields (Title, Description, Category)");
            }

            // Validate instructor selection
            if (!courseData.instructorId) {
                throw new Error("Please select an instructor");
            }

            const formData = new FormData();
            formData.append("title", courseData.title);
            formData.append("description", courseData.description);
            formData.append("instructor", courseData.instructor);
            formData.append("instructorId", courseData.instructorId); // Include instructor ID
            formData.append("price", courseData.price);
            formData.append("category", courseData.category);
            formData.append("subcategory", courseData.subcategory);
            formData.append("sub_subcategory", courseData.sub_subcategory);
            formData.append("level", courseData.level);
            formData.append("duration", courseData.duration);
            formData.append("language", courseData.language);
            formData.append("isPublished", action === "published");

            if (courseData.thumbnailFile) {
                formData.append("thumbnail", courseData.thumbnailFile);
            }
            if (courseData.promoVideoFile) {
                formData.append("videoUrl", courseData.promoVideoFile);
            }

            formData.append("tags", JSON.stringify(courseData.tags.filter(tag => tag.trim())));
            formData.append("learningOutcomes", JSON.stringify(courseData.learningOutcomes.filter(outcome => outcome.trim())));
            formData.append("whatYouWillLearn", JSON.stringify(courseData.whatYouWillLearn.filter(item => item.trim())));

            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

            const token = localStorage.getItem("adminToken");
            const response = await axios.post(
                `${API_URL}/api/admin/add-course`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.message === "Course added successfully") {
                alert(`Course ${action === "published" ? "published" : "saved as draft"} successfully!`);
                navigate("/courses");
            } else {
                throw new Error("Failed to add course");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to save course");
            console.error("Course submission error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`btn me-2 d-flex align-items-center ${activeTab === id ? "btn-primary" : "btn-outline-secondary"}`}
        >
            <span className="me-2">{icon}</span>
            <span>{label}</span>
        </button>
    );

    const FileUploadZone = ({ fileType, accept, label, description, file }) => (
        <div
            className={`border border-2 border-dashed rounded p-4 text-center ${dragActive ? "border-secondary bg-light" : "border-secondary"}`}
            style={{ minHeight: "200px" }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, fileType)}
        >
            {file ? (
                <div className="d-flex flex-column align-items-center">
                    <div
                        className="bg-success bg-opacity-25 rounded-circle p-3 mb-3"
                        style={{ width: "80px", height: "80px" }}
                    >
                        <span style={{ fontSize: "2rem" }}>
                            {fileType === "thumbnail" ? "🖼️" : "🎥"}
                        </span>
                    </div>
                    <p className="fw-bold mb-2">
                        {typeof file === "string" ? file.split("/").pop() : file.name}
                    </p>
                    <button
                        onClick={() => {
                            if (fileType === "thumbnail") {
                                setCourseData((prev) => ({
                                    ...prev,
                                    thumbnailUrl: "",
                                    thumbnailFile: null
                                }));
                            } else if (fileType === "promoVideo") {
                                setCourseData((prev) => ({
                                    ...prev,
                                    videoUrl: "",
                                    promoVideoFile: null
                                }));
                            }
                        }}
                        className="btn btn-sm btn-outline-danger"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div className="d-flex flex-column align-items-center">
                    <div
                        className="bg-light rounded-circle p-3 mb-3"
                        style={{ width: "80px", height: "80px" }}
                    >
                        <span style={{ fontSize: "2rem" }}>📤</span>
                    </div>
                    <div className="mb-3">
                        <p className="fw-bold mb-1">{label}</p>
                        <p className="text-muted small">{description}</p>
                    </div>
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) =>
                            e.target.files[0] && handleFileUpload(e.target.files[0], fileType)
                        }
                        className="d-none"
                        id={`${fileType}-upload`}
                    />
                    <label htmlFor={`${fileType}-upload`} className="btn btn-primary">
                        Choose File
                    </label>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white border-bottom">
                <div className="container-fluid py-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div
                                className="bg-primary rounded p-2 me-3"
                                style={{ width: "48px", height: "48px" }}
                            >
                                <span className="text-white fs-4">📚</span>
                            </div>
                            <div>
                                <h1 className="h2 mb-1">Add New Course</h1>
                                <p className="text-muted mb-0">
                                    Create and publish your course content
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                onClick={() => handleSubmit("draft")}
                                className="btn btn-outline-secondary"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Draft"}
                            </button>
                            <button
                                onClick={() => handleSubmit("published")}
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? "Publishing..." : "Publish Course"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="container-fluid mt-3">
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                </div>
            )}

            <div className="container-fluid py-4">
                {/* Navigation Tabs */}
                <div className="bg-white rounded shadow-sm p-3 mb-4">
                    <div className="d-flex flex-wrap gap-2">
                        <TabButton id="basic" label="Basic Info" icon="📝" />
                        <TabButton id="media" label="Media" icon="🖼️" />
                        <TabButton id="content" label="Content" icon="📚" />
                        <TabButton id="pricing" label="Pricing" icon="💰" />
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Basic Information Tab */}
                        {activeTab === "basic" && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title h4 mb-4">Basic Information</h2>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                Course Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={courseData.title}
                                                onChange={(e) =>
                                                    handleInputChange("title", e.target.value)
                                                }
                                                placeholder="Enter a compelling course title"
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                Course Description *
                                            </label>
                                            <textarea
                                                value={courseData.description}
                                                onChange={(e) =>
                                                    handleInputChange("description", e.target.value)
                                                }
                                                placeholder="Provide a detailed description of your course content, objectives, and target audience..."
                                                rows={6}
                                                className="form-control"
                                                style={{ resize: "none" }}
                                                required
                                            />
                                        </div>

                                        {/* FIXED: Updated Category Selection Section */}
                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold">
                                                        Main Category *
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={courseData.category}
                                                        onChange={(e) => {
                                                            handleInputChange("category", e.target.value);
                                                            handleInputChange("subcategory", "");
                                                            handleInputChange("sub_subcategory", "");
                                                        }}
                                                        required
                                                    >
                                                        <option value="">Select Main Category</option>
                                                        {getMainCategories().map((cat) => (
                                                            <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {getMainCategories().length === 0 && (
                                                        <div className="form-text text-warning">
                                                            No main categories found. Please add categories first.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold">
                                                        Sub Category *
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={courseData.subcategory}
                                                        onChange={(e) => {
                                                            handleInputChange("subcategory", e.target.value);
                                                            handleInputChange("sub_subcategory", "");
                                                        }}
                                                        disabled={!courseData.category}
                                                        required
                                                    >
                                                        <option value="">Select Sub Category</option>
                                                        {getSubCategories().map((cat) => (
                                                            <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {courseData.category && getSubCategories().length === 0 && (
                                                        <div className="form-text text-warning">
                                                            No sub-categories found for selected main category.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold">
                                                        Sub-Sub Category *
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={courseData.sub_subcategory}
                                                        onChange={(e) =>
                                                            handleInputChange("sub_subcategory", e.target.value)
                                                        }
                                                        disabled={!courseData.subcategory}
                                                        required
                                                    >
                                                        <option value="">Select Sub-Sub Category</option>
                                                        {getSubSubCategories().map((cat) => (
                                                            <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {courseData.subcategory && getSubSubCategories().length === 0 && (
                                                        <div className="form-text text-warning">
                                                            No sub-sub-categories found for selected sub-category.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Level *</label>
                                            <select
                                                value={courseData.level}
                                                onChange={(e) =>
                                                    handleInputChange("level", e.target.value)
                                                }
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select Level</option>
                                                {levels.map((level) => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Language *</label>
                                            <select
                                                value={courseData.language}
                                                onChange={(e) =>
                                                    handleInputChange("language", e.target.value)
                                                }
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select Language</option>
                                                {languages.map((lang) => (
                                                    <option key={lang} value={lang}>
                                                        {lang}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* UPDATED: Instructor Selection with Dropdown */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                Course Instructor *
                                            </label>
                                            <select
                                                value={courseData.instructorId}
                                                onChange={(e) => handleInstructorChange(e.target.value)}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select Instructor</option>
                                                {instructors.map((instructor) => (
                                                    <option key={instructor._id} value={instructor._id}>
                                                        {instructor.name} - {instructor.email}
                                                        {instructor.specializations && instructor.specializations.length > 0 &&
                                                            ` (${instructor.specializations.slice(0, 2).join(', ')})`
                                                        }
                                                    </option>
                                                ))}
                                            </select>
                                            {instructors.length === 0 && (
                                                <div className="form-text text-warning">
                                                    No instructors found. Please add instructors first.
                                                </div>
                                            )}
                                            {courseData.instructorId && (
                                                <div className="mt-2">
                                                    <small className="text-muted">
                                                        Selected: {courseData.instructor}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === "media" && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title h4 mb-4">Media Assets</h2>

                                    <div className="row g-4">
                                        <div className="col-12">
                                            <h3 className="h5 mb-3">Course Thumbnail</h3>
                                            <FileUploadZone
                                                fileType="thumbnail"
                                                accept="image/*"
                                                label="Upload Course Thumbnail"
                                                description="Recommended: 1280x720px, JPG or PNG"
                                                file={courseData.thumbnailUrl ? { name: "Thumbnail uploaded" } : null}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <h3 className="h5 mb-3">Promotional Video</h3>
                                            <FileUploadZone
                                                fileType="promoVideo"
                                                accept="video/*"
                                                label="Upload Promo Video"
                                                description="Optional: MP4 format, max 100MB"
                                                file={courseData.videoUrl ? { name: "Video uploaded" } : null}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content Tab - UPDATED with new fields */}
                        {activeTab === "content" && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title h4 mb-4">Course Content</h2>

                                    <div className="row g-4">
                                        {/* Learning Outcomes - Added from friend's version */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                Learning Outcomes
                                            </label>
                                            <p className="text-muted small mb-3">
                                                What will students achieve after completing this course?
                                            </p>
                                            {courseData.learningOutcomes.map((outcome, index) => (
                                                <div
                                                    key={index}
                                                    className="d-flex align-items-center mb-3"
                                                >
                                                    <input
                                                        type="text"
                                                        value={outcome}
                                                        onChange={(e) =>
                                                            handleArrayChange(
                                                                "learningOutcomes",
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={`Learning outcome ${index + 1}`}
                                                        className="form-control me-2"
                                                    />
                                                    {courseData.learningOutcomes.length > 1 && (
                                                        <button
                                                            onClick={() =>
                                                                removeArrayItem("learningOutcomes", index)
                                                            }
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addArrayItem("learningOutcomes")}
                                                className="btn btn-outline-primary btn-sm"
                                                type="button"
                                            >
                                                ➕ Add Learning Outcome
                                            </button>
                                        </div>

                                        {/* What You'll Learn - Added from friend's version */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                What You'll Learn
                                            </label>
                                            <p className="text-muted small mb-3">
                                                Describe what skills or knowledge students will gain in this course.
                                            </p>
                                            {courseData.whatYouWillLearn.map((item, index) => (
                                                <div key={index} className="d-flex align-items-center mb-3">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) =>
                                                            handleArrayChange("whatYouWillLearn", index, e.target.value)
                                                        }
                                                        placeholder={`What you'll learn ${index + 1}`}
                                                        className="form-control me-2"
                                                    />
                                                    {courseData.whatYouWillLearn.length > 1 && (
                                                        <button
                                                            onClick={() => removeArrayItem("whatYouWillLearn", index)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addArrayItem("whatYouWillLearn")}
                                                className="btn btn-outline-primary btn-sm"
                                                type="button"
                                            >
                                                ➕ Add Item
                                            </button>
                                        </div>

                                        {/* Course Tags - Keep from original */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Course Tags</label>
                                            <p className="text-muted small mb-3">
                                                Add relevant tags to help students find your course
                                            </p>
                                            {courseData.tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="d-flex align-items-center mb-3"
                                                >
                                                    <input
                                                        type="text"
                                                        value={tag}
                                                        onChange={(e) =>
                                                            handleArrayChange("tags", index, e.target.value)
                                                        }
                                                        placeholder={`Tag ${index + 1}`}
                                                        className="form-control me-2"
                                                    />
                                                    {courseData.tags.length > 1 && (
                                                        <button
                                                            onClick={() => removeArrayItem("tags", index)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addArrayItem("tags")}
                                                className="btn btn-outline-primary btn-sm"
                                                type="button"
                                            >
                                                ➕ Add Tag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Pricing Tab - UPDATED with maxStudents */}
                        {activeTab === "pricing" && (
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title h4 mb-4">Pricing & Details</h2>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Course Price (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={courseData.price}
                                                onChange={(e) =>
                                                    handleInputChange("price", e.target.value)
                                                }
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className="form-control"
                                            />
                                            <div className="form-text">Set to 0 for free courses</div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                Course Duration *
                                            </label>
                                            <input
                                                type="text"
                                                value={courseData.duration}
                                                onChange={(e) =>
                                                    handleInputChange("duration", e.target.value)
                                                }
                                                placeholder="e.g., 4 weeks, 20 hours"
                                                className="form-control"
                                                required
                                            />
                                        </div>


                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="row g-3">
                            {/* Course Preview */}
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title h5 mb-3">Course Preview</h3>
                                        <div className="mb-3">
                                            <div
                                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                                style={{ height: "180px" }}
                                            >
                                                {courseData.thumbnailUrl ? (
                                                    <div className="text-center">
                                                        <span style={{ fontSize: "3rem" }}>🖼️</span>
                                                        <p className="text-muted small mb-0 mt-2">
                                                            Thumbnail uploaded
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <span style={{ fontSize: "3rem" }}>📷</span>
                                                        <p className="text-muted small mb-0 mt-2">
                                                            No thumbnail
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="h6 mb-1 text-truncate">
                                                {courseData.title || "Course Title"}
                                            </h4>
                                            <p className="text-muted small mb-0 text-truncate">
                                                {courseData.subtitle ||
                                                    courseData.description?.substring(0, 50) + "..." ||
                                                    "Course description will appear here"}
                                            </p>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">
                                                {courseData.level || "Level"}
                                            </span>
                                            <span className="fw-bold text-primary">
                                                {courseData.price ? `₹${courseData.price}` : "Free"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title h5 mb-3">Quick Stats</h3>
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">⏰</span>
                                                        <span className="small text-muted">Duration</span>
                                                    </div>
                                                    <span className="small fw-bold">
                                                        {courseData.duration || "Not set"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">👨‍🏫</span>
                                                        <span className="small text-muted">
                                                            Instructor
                                                        </span>
                                                    </div>
                                                    <span className="small fw-bold">
                                                        {courseData.instructor || "Not set"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">📚</span>
                                                        <span className="small text-muted">Category</span>
                                                    </div>
                                                    <span className="small fw-bold text-truncate ms-2">
                                                        {getCategoryPath()}
                                                    </span>
                                                </div>
                                            </div>



                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">🌐</span>
                                                        <span className="small text-muted">Language</span>
                                                    </div>
                                                    <span className="small fw-bold">
                                                        {courseData.language || "Not set"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="col-12">
                                <div className="card bg-primary bg-opacity-10 border-primary">
                                    <div className="card-body">
                                        <h3 className="card-title h5 text-primary mb-3">
                                            💡 Tips for Success
                                        </h3>
                                        <ul className="list-unstyled small text-primary mb-0">
                                            <li className="mb-2">
                                                • Use a compelling title that clearly describes what
                                                students will learn
                                            </li>
                                            <li className="mb-2">
                                                • Add a high-quality thumbnail to attract more students
                                            </li>
                                            <li className="mb-2">
                                                • Write detailed description to set clear
                                                expectations
                                            </li>
                                            <li className="mb-2">
                                                • Set appropriate maximum students for better course
                                                management
                                            </li>
                                            <li className="mb-0">
                                                • Choose relevant tags to improve discoverability
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}