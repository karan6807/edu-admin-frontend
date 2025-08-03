/* eslint-disable no-loop-func */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [categoryType, setCategoryType] = useState("main");
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded states for dropdown functionality
  const [expandedMainCategories, setExpandedMainCategories] = useState(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState(new Set());

  // Filter dropdowns
  const [filterMainCategory, setFilterMainCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");

  // Sorting states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // API Base URL - adjust this to your backend URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const API_BASE_URL = `${API_URL}/api/admin`; // Change this to your backend URL

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("adminToken") || "";
  };

  // API Headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAuthToken()}`
  });

  // Helper functions
  const getCategoryLevel = (type) => {
    switch (type) {
      case "main": return 1;
      case "sub": return 2;
      case "sub-sub": return 3;
      default: return 1;
    }
  };

  const getCategoryTypeFromLevel = (level) => {
    switch (level) {
      case 1: return "main";
      case 2: return "sub";
      case 3: return "sub-sub";
      default: return "main";
    }
  };

  // FIXED: Updated helper functions to properly handle category relationships
  const getMainCategories = () => {
    return categories.filter((cat) => cat.level === 1);
  };

  const getSubCategories = (mainCategoryId = null) => {
    if (mainCategoryId) {
      return categories.filter(
        (cat) => cat.level === 2 &&
          (cat.parentCategory === mainCategoryId ||
            (cat.parentCategory && cat.parentCategory._id === mainCategoryId))
      );
    }
    return categories.filter((cat) => cat.level === 2);
  };

  const getSubSubCategories = (subCategoryId = null) => {
    if (subCategoryId) {
      return categories.filter(
        (cat) => cat.level === 3 &&
          (cat.parentCategory === subCategoryId ||
            (cat.parentCategory && cat.parentCategory._id === subCategoryId))
      );
    }
    return categories.filter((cat) => cat.level === 3);
  };

  const getCategoryPath = (category) => {
    const path = [];
    let current = category;

    while (current) {
      path.unshift(current.name);
      const parentId = current.parentCategory && current.parentCategory._id
        ? current.parentCategory._id
        : current.parentCategory;
      current = categories.find((cat) => cat._id === parentId);
    }

    return path.join(" > ");
  };

  // FIXED: Updated getChildrenCount to properly handle parent-child relationships
  const getChildrenCount = (categoryId) => {
    return categories.filter((cat) => {
      const parentId = cat.parentCategory && cat.parentCategory._id
        ? cat.parentCategory._id
        : cat.parentCategory;
      return parentId === categoryId;
    }).length;
  };

  // NEW: Function to find parent main category of a sub category
  const findParentMainCategory = (subCategoryId) => {
    const subCategory = categories.find(cat => cat._id === subCategoryId);
    if (!subCategory) return null;

    const parentId = subCategory.parentCategory && subCategory.parentCategory._id
      ? subCategory.parentCategory._id
      : subCategory.parentCategory;

    return categories.find(cat => cat._id === parentId);
  };

  // NEW: Auto-expansion logic when filters are applied
  const applyAutoExpansion = () => {
    const newExpandedMain = new Set(expandedMainCategories);
    const newExpandedSub = new Set(expandedSubCategories);

    // If sub-category filter is applied, expand its parent main category
    if (filterSubCategory) {
      const parentMain = findParentMainCategory(filterSubCategory);
      if (parentMain) {
        newExpandedMain.add(parentMain._id);

        // Also expand the sub-category itself to show its sub-sub categories
        newExpandedSub.add(filterSubCategory);
      }
    }

    // If main category filter is applied, expand it
    if (filterMainCategory) {
      newExpandedMain.add(filterMainCategory);
    }

    setExpandedMainCategories(newExpandedMain);
    setExpandedSubCategories(newExpandedSub);
  };

  // Apply auto-expansion whenever filters change
  useEffect(() => {
    if (filterMainCategory || filterSubCategory) {
      applyAutoExpansion();
    }
  }, [filterMainCategory, filterSubCategory, categories]);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched categories:", data); // Debug log
      setCategories(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Sort categories function
  const sortCategories = (categoryList) => {
    return [...categoryList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "id":
          aValue = a._id;
          bValue = b._id;
          break;
        case "children":
          aValue = getChildrenCount(a._id);
          bValue = getChildrenCount(b._id);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortBy === "name") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
    });
  };

  // Get sorted sub categories
  const getSortedSubCategories = (parentId) => {
    const subCats = getSubCategories(parentId);
    return sortCategories(subCats);
  };

  // Get sorted sub-sub categories
  const getSortedSubSubCategories = (parentId) => {
    const subSubCats = getSubSubCategories(parentId);
    return sortCategories(subSubCats);
  };

  // Toggle functions for expand/collapse
  const toggleMainCategory = (categoryId) => {
    const newExpanded = new Set(expandedMainCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
      // Also collapse all sub-categories under this main category
      const subCats = getSubCategories(categoryId);
      subCats.forEach((subCat) => {
        const newExpandedSub = new Set(expandedSubCategories);
        newExpandedSub.delete(subCat._id);
        setExpandedSubCategories(newExpandedSub);
      });
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedMainCategories(newExpanded);
  };

  const toggleSubCategory = (categoryId) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  // Handle cascading dropdown changes
  const handleMainCategoryChange = (mainCatId) => {
    setSelectedMainCategory(mainCatId);
    setSelectedSubCategory(null);

    if (categoryType === "sub") {
      setParentId(mainCatId);
    } else if (categoryType === "sub-sub") {
      setParentId(null);
    }
  };

  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCategory(subCatId);

    if (categoryType === "sub-sub") {
      setParentId(subCatId);
    }
  };

  // ENHANCED: Filter change handlers with visual feedback
  const handleMainCategoryFilterChange = (mainCatId) => {
    setFilterMainCategory(mainCatId);
    // Clear sub category filter when main category filter changes
    if (mainCatId) {
      setFilterSubCategory("");
    }
  };

  const handleSubCategoryFilterChange = (subCatId) => {
    setFilterSubCategory(subCatId);
    // If sub-category is selected, clear main category filter to show all relevant categories
    if (subCatId) {
      setFilterMainCategory("");
    }
  };

  // ENHANCED: Clear filters with collapse functionality
  const clearAllFilters = () => {
    setFilterMainCategory("");
    setFilterSubCategory("");
    // Optionally collapse all categories when clearing filters
    setExpandedMainCategories(new Set());
    setExpandedSubCategories(new Set());
  };

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const level = getCategoryLevel(categoryType);
      let finalParentId = null;

      if (categoryType === "sub" && selectedMainCategory) {
        finalParentId = selectedMainCategory;
      } else if (categoryType === "sub-sub" && selectedSubCategory) {
        finalParentId = selectedSubCategory;
      }

      const categoryData = {
        name: name.trim(),
        level,
        parentCategory: finalParentId,
        isActive
      };

      console.log("Submitting category data:", categoryData); // Debug log

      if (editingId) {
        // Update existing category
        const response = await fetch(`${API_BASE_URL}/categories/${editingId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update category");
        }

        const data = await response.json();
        console.log("Category updated:", data.message);
      } else {
        // Add new category
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add category");
        }

        const data = await response.json();
        console.log("Category added:", data);
      }

      // Refresh categories list
      await fetchCategories();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message || "Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setIsActive(true);
    setCategoryType("main");
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setParentId(null);
    setEditingId(null);
    setError("");
  };

  const handleEdit = (category) => {
    setName(category.name);
    setIsActive(category.isActive);
    setCategoryType(getCategoryTypeFromLevel(category.level));

    if (category.level === 2) {
      const parentId = category.parentCategory && category.parentCategory._id
        ? category.parentCategory._id
        : category.parentCategory;
      setSelectedMainCategory(parentId);
      setSelectedSubCategory(null);
    } else if (category.level === 3) {
      const parentId = category.parentCategory && category.parentCategory._id
        ? category.parentCategory._id
        : category.parentCategory;
      const parentSub = categories.find((cat) => cat._id === parentId);
      if (parentSub) {
        const grandParentId = parentSub.parentCategory && parentSub.parentCategory._id
          ? parentSub.parentCategory._id
          : parentSub.parentCategory;
        setSelectedMainCategory(grandParentId);
        setSelectedSubCategory(parentSub._id);
      }
    } else {
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    }

    const parentId = category.parentCategory && category.parentCategory._id
      ? category.parentCategory._id
      : category.parentCategory;
    setParentId(parentId);
    setEditingId(category._id);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const hasChildren = getChildrenCount(id) > 0;

    if (hasChildren) {
      alert("Cannot delete category that has subcategories. Please delete subcategories first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete category");
        }

        console.log("Category deleted successfully");
        await fetchCategories(); // Refresh the list
      } catch (err) {
        console.error("Error deleting category:", err);
        alert(err.message || "Failed to delete category. Please try again.");
      }
    }
  };

  // Get filtered main categories
  const getFilteredMainCategories = () => {
    let mainCats = getMainCategories();

    if (filterMainCategory) {
      mainCats = mainCats.filter((cat) => cat._id === filterMainCategory);
    }

    return sortCategories(mainCats);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="mb-0">Manage Categories</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Debug Information */}
      <div className="alert alert-info mb-4">
        <small>
          <strong>Debug:</strong> Total categories loaded: {categories.length}
          <br />
          Main: {categories.filter((cat) => cat.level === 1).length} |
          Sub: {categories.filter((cat) => cat.level === 2).length} |
          Sub-Sub: {categories.filter((cat) => cat.level === 3).length}
          {(filterMainCategory || filterSubCategory) && (
            <>
              <br />
              <span className="text-warning">
                <i className="fas fa-filter me-1"></i>
                Active Filters: {filterMainCategory ? "Main Category" : ""} {filterSubCategory ? "Sub Category" : ""}
              </span>
            </>
          )}
        </small>
      </div>

      {/* Category Statistics */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Main Categories</h5>
              <h3 className="text-primary">
                {categories.filter((cat) => cat.level === 1).length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Sub Categories</h5>
              <h3 className="text-info">
                {categories.filter((cat) => cat.level === 2).length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Sub-Sub Categories</h5>
              <h3 className="text-success">
                {categories.filter((cat) => cat.level === 3).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0 text-center">
            Filter & Sort Categories
            {(filterMainCategory || filterSubCategory) && (
              <span className="badge bg-warning text-dark ms-2">
                <i className="fas fa-filter me-1"></i>
                Filters Active
              </span>
            )}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Filter Section */}
            <div className="col-md-8 text-center">
              <h6 className="text-muted mb-3">Filter Options</h6>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">
                    Main Category
                    {filterMainCategory && (
                      <span className="badge bg-primary ms-2">Active</span>
                    )}
                  </label>
                  <select
                    className="form-select"
                    value={filterMainCategory}
                    onChange={(e) => handleMainCategoryFilterChange(e.target.value)}
                  >
                    <option value="">All Main Categories</option>
                    {getMainCategories().map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Sub Category
                    {filterSubCategory && (
                      <span className="badge bg-info ms-2">Active</span>
                    )}
                  </label>
                  <select
                    className="form-select"
                    value={filterSubCategory}
                    onChange={(e) => handleSubCategoryFilterChange(e.target.value)}
                  >
                    <option value="">All Sub Categories</option>
                    {getSubCategories().map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({findParentMainCategory(cat._id)?.name || 'Unknown Parent'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="col-md-4 text-center">
              <h6 className="text-muted mb-3">Sort Options</h6>
              <div className="row">
                <div className="col-md-12">
                  <label className="form-label">Sort Order</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">A to Z</option>
                    <option value="desc">Z to A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mt-3">
            <div className="col-md-12">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearAllFilters}
                >
                  <i className="fas fa-filter me-1"></i>
                  Clear All Filters
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => {
                    setSortBy("name");
                    setSortOrder("asc");
                  }}
                >
                  <i className="fas fa-sort me-1"></i>
                  Reset Sorting
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => {
                    setExpandedMainCategories(new Set(getMainCategories().map(cat => cat._id)));
                    setExpandedSubCategories(new Set(getSubCategories().map(cat => cat._id)));
                  }}
                >
                  <i className="fas fa-expand me-1"></i>
                  Expand All
                </button>
                <button
                  className="btn btn-outline-warning"
                  onClick={() => {
                    setExpandedMainCategories(new Set());
                    setExpandedSubCategories(new Set());
                  }}
                >
                  <i className="fas fa-compress me-1"></i>
                  Collapse All
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown/Accordion Style Categories */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0 text-center">Categories</h5>
        </div>
        <div className="card-body">
          {getFilteredMainCategories().length === 0 ? (
            <div className="text-center text-muted py-4">
              No categories found matching the current filters.
            </div>
          ) : (
            getFilteredMainCategories().map((mainCategory, index) => {
              const subCategories = getSortedSubCategories(mainCategory._id);
              const isMainExpanded = expandedMainCategories.has(mainCategory._id);

              // Filter sub categories if filter is applied
              const filteredSubCategories = filterSubCategory
                ? subCategories.filter((sub) => sub._id === filterSubCategory)
                : subCategories;

              return (
                <div key={mainCategory._id} className="mb-3">
                  {/* Main Category */}
                  <div className="border rounded">
                    <div
                      className={`p-3 d-flex justify-content-between align-items-center ${filterMainCategory === mainCategory._id
                        ? 'bg-primary text-white'
                        : 'bg-light'
                        }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleMainCategory(mainCategory._id)}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas ${isMainExpanded ? "fa-chevron-down" : "fa-chevron-right"
                            } me-2`}
                        ></i>
                        <span className={`badge me-2 ${filterMainCategory === mainCategory._id
                          ? 'bg-light text-primary'
                          : 'bg-primary'
                          }`}>Main</span>
                        <strong>
                          {index + 1}. {mainCategory.name}
                        </strong>
                        <small className={`ms-2 ${filterMainCategory === mainCategory._id
                          ? 'text-light'
                          : 'text-muted'
                          }`}>
                          ({getChildrenCount(mainCategory._id)} sub-categories)
                        </small>
                        {filterMainCategory === mainCategory._id && (
                          <span className="badge bg-warning text-dark ms-2">
                            <i className="fas fa-filter me-1"></i>
                            Filtered
                          </span>
                        )}
                      </div>
                      <div>
                        <button
                          className={`btn btn-sm me-2 ${filterMainCategory === mainCategory._id
                            ? 'btn-outline-light'
                            : 'btn-outline-primary'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(mainCategory);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${filterMainCategory === mainCategory._id
                            ? 'btn-outline-light'
                            : 'btn-outline-danger'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mainCategory._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Sub Categories */}
                    {isMainExpanded && filteredSubCategories.length > 0 && (
                      <div className="border-top">
                        {filteredSubCategories.map((subCategory) => {
                          const subSubCategories = getSortedSubSubCategories(subCategory._id);
                          const isSubExpanded = expandedSubCategories.has(subCategory._id);

                          return (
                            <div key={subCategory._id}>
                              <div
                                className={`p-3 ps-5 d-flex justify-content-between align-items-center border-bottom ${filterSubCategory === subCategory._id
                                  ? 'bg-info text-white'
                                  : 'bg-white'
                                  }`}
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleSubCategory(subCategory._id)}
                              >
                                <div className="d-flex align-items-center">
                                  <span className={`badge me-2 ${filterSubCategory === subCategory._id
                                    ? 'bg-light text-info'
                                    : 'bg-info'
                                    }`}>Sub</span>
                                  <strong>{subCategory.name}</strong>
                                  <small className={`ms-2 ${filterSubCategory === subCategory._id
                                    ? 'text-light'
                                    : 'text-muted'
                                    }`}>
                                    ({getChildrenCount(subCategory._id)} sub-sub categories)
                                  </small>
                                  {filterSubCategory === subCategory._id && (
                                    <span className="badge bg-warning text-dark ms-2">
                                      <i className="fas fa-filter me-1"></i>
                                      Filtered
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <button
                                    className={`btn btn-sm me-2 ${filterSubCategory === subCategory._id
                                      ? 'btn-outline-light'
                                      : 'btn-outline-primary'
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(subCategory);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className={`btn btn-sm ${filterSubCategory === subCategory._id
                                      ? 'btn-outline-light'
                                      : 'btn-outline-danger'
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(subCategory._id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {/* Sub-Sub Categories */}
                              {isSubExpanded && subSubCategories.length > 0 && (
                                <div className="bg-light">
                                  {subSubCategories.map((subSubCategory) => (
                                    <div
                                      key={subSubCategory._id}
                                      className="p-3 ps-5 ms-4 d-flex justify-content-between align-items-center border-bottom"
                                    >
                                      <div className="d-flex align-items-center">
                                        <span className="badge bg-success me-2">Sub-Sub</span>
                                        <strong>{subSubCategory.name}</strong>
                                      </div>
                                      <div>
                                        <button
                                          className="btn btn-sm btn-outline-primary me-2"
                                          onClick={() => handleEdit(subSubCategory)}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDelete(subSubCategory._id)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Category Type Selection */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-layer-group me-2"></i>
                        Category Type
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={categoryType}
                        onChange={(e) => {
                          setCategoryType(e.target.value);
                          setSelectedMainCategory(null);
                          setSelectedSubCategory(null);
                          setParentId(null);
                        }}
                        disabled={editingId}
                      >
                        <option value="main">
                          🏠 Main Category (Level 1)
                        </option>
                        <option value="sub">
                          📁 Sub Category (Level 2)
                        </option>
                        <option value="sub-sub">
                          📄 Sub-Sub Category (Level 3)
                        </option>
                      </select>
                      {editingId && (
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Category type cannot be changed when editing
                        </small>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-toggle-on me-2"></i>
                        Status
                      </label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActiveSwitch"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isActiveSwitch">
                          <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Parent Category Selection */}
                  {categoryType !== "main" && (
                    <div className="card mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-sitemap me-2"></i>
                          Parent Category Selection
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">
                              <i className="fas fa-home me-2"></i>
                              Main Category *
                            </label>
                            <select
                              className="form-select"
                              value={selectedMainCategory || ""}
                              onChange={(e) =>
                                handleMainCategoryChange(
                                  e.target.value ? e.target.value : null
                                )
                              }
                              required
                            >
                              <option value="">-- Select Main Category --</option>
                              {getMainCategories().map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  🏠 {cat.name} ({getChildrenCount(cat._id)} sub-categories)
                                </option>
                              ))}
                            </select>
                          </div>

                          {categoryType === "sub-sub" && (
                            <div className="col-md-6">
                              <label className="form-label fw-bold">
                                <i className="fas fa-folder me-2"></i>
                                Sub Category *
                              </label>
                              <select
                                className="form-select"
                                value={selectedSubCategory || ""}
                                onChange={(e) =>
                                  handleSubCategoryChange(
                                    e.target.value ? e.target.value : null
                                  )
                                }
                                disabled={!selectedMainCategory}
                                required
                              >
                                <option value="">-- Select Sub Category --</option>
                                {selectedMainCategory &&
                                  getSubCategories(selectedMainCategory).map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                      📁 {cat.name} ({getChildrenCount(cat._id)} sub-sub categories)
                                    </option>
                                  ))}
                              </select>
                              {!selectedMainCategory && (
                                <small className="text-muted">
                                  Please select a main category first
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Name Input */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tag me-2"></i>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter category name..."
                      required
                      maxLength={100}
                    />
                    <div className="form-text">
                      {name.length}/100 characters
                    </div>
                  </div>

                  {/* Live Preview Section */}
                  {name && (
                    <div className="card mb-4">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0">
                          <i className="fas fa-eye me-2"></i>
                          Live Preview
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-8">
                            <strong>Category Path:</strong>
                            <div className="mt-2">
                              <span className="badge bg-secondary me-1">Path:</span>
                              {categoryType === "main" ? (
                                <span className="badge bg-primary fs-6">{name}</span>
                              ) : categoryType === "sub" && selectedMainCategory ? (
                                <>
                                  <span className="badge bg-primary me-1">
                                    {categories.find((cat) => cat._id === selectedMainCategory)?.name}
                                  </span>
                                  <i className="fas fa-chevron-right mx-2"></i>
                                  <span className="badge bg-info fs-6">{name}</span>
                                </>
                              ) : categoryType === "sub-sub" && selectedMainCategory && selectedSubCategory ? (
                                <>
                                  <span className="badge bg-primary me-1">
                                    {categories.find((cat) => cat._id === selectedMainCategory)?.name}
                                  </span>
                                  <i className="fas fa-chevron-right mx-2"></i>
                                  <span className="badge bg-info me-1">
                                    {categories.find((cat) => cat._id === selectedSubCategory)?.name}
                                  </span>
                                  <i className="fas fa-chevron-right mx-2"></i>
                                  <span className="badge bg-success fs-6">{name}</span>
                                </>
                              ) : (
                                <span className="text-warning">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Please select all required parent categories
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4 text-end">
                            <div className="mb-2">
                              <span className="badge bg-light text-dark">
                                Level: {getCategoryLevel(categoryType)}
                              </span>
                            </div>
                            <div>
                              <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="modal-footer bg-light">
                    <div className="d-flex justify-content-between w-100">
                      <div>
                        {editingId && (
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Editing existing category
                          </small>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={() => {
                            setShowModal(false);
                            resetForm();
                          }}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting || !name.trim()}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              {editingId ? "Updating..." : "Saving..."}
                            </>
                          ) : (
                            <>
                              <i className={`fas ${editingId ? 'fa-save' : 'fa-plus'} me-1`}></i>
                              {editingId ? "Update Category" : "Save Category"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 9999 }}>
          <div className="card">
            <div className="card-body text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h6>{editingId ? "Updating category..." : "Adding category..."}</h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;