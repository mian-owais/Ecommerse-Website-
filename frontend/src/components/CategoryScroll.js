import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../utils/api';
import './CategoryScroll.css';

const CategoryScroll = ({ categories, isAdmin, onRefreshCategories }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '📦',
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Scroll function
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      setTimeout(checkScroll, 300);
    }
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size exceeds 5MB limit');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }

      setCategoryImageFile(file);
    }
  };

  // Handle category submission
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('❌ Please enter category name');
      return;
    }

    try {
      setFormLoading(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('emoji', formData.emoji);
      form.append('description', formData.description);
      if (categoryImageFile) {
        form.append('image', categoryImageFile);
      }

      // Update category via API
      await categoryAPI.updateCategory(editingCategory._id, form);
      
      alert('✅ Category updated successfully!');
      
      // Refresh categories
      if (onRefreshCategories) {
        await onRefreshCategories();
      }
      
      // Reset and close modal
      setFormData({ name: '', emoji: '📦', description: '' });
      setCategoryImageFile(null);
      setEditingCategory(null);
      setShowEditModal(false);
    } catch (err) {
      alert('❌ Failed to update category: ' + (err.message || 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle new category submission
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('❌ Please enter category name');
      return;
    }

    try {
      setFormLoading(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('emoji', formData.emoji);
      form.append('description', formData.description);
      if (categoryImageFile) {
        form.append('image', categoryImageFile);
      }

      // Create category via API
      await categoryAPI.createCategory(form);
      
      alert('✅ Category added successfully!');
      
      // Refresh categories
      if (onRefreshCategories) {
        await onRefreshCategories();
      }
      
      // Reset and close modal
      setFormData({ name: '', emoji: '📦', description: '' });
      setCategoryImageFile(null);
      setShowAddModal(false);
    } catch (err) {
      alert('❌ Failed to add category: ' + (err.message || 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal for a category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji || '📦',
      description: category.description || ''
    });
    setCategoryImageFile(null);
    setShowEditModal(true);
  };

  // Render category image
  const renderImage = (image, emoji) => {
    if (!image) {
      return <span className="category-scroll-emoji">{emoji || '📦'}</span>;
    }

    if (typeof image === 'string' && (image.startsWith('/uploads/') || image.startsWith('http'))) {
      const imageUrl = image.startsWith('http') ? image : `http://localhost:5000${image}`;
      return (
        <img
          src={imageUrl}
          alt="Category"
          className="category-scroll-image"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.parentElement) {
              e.target.parentElement.innerHTML = `<span class="category-scroll-emoji">${emoji || '📦'}</span>`;
            }
          }}
        />
      );
    }

    return <span className="category-scroll-emoji">{image || emoji || '📦'}</span>;
  };

  return (
    <div className="category-scroll-wrapper">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          className="scroll-arrow scroll-arrow-left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ❮
        </button>
      )}

      {/* Scroll Container */}
      <div
        className="category-scroll-container"
        ref={scrollContainerRef}
        onScroll={checkScroll}
      >
        {categories.map((category, index) => (
          <div
            key={category._id || category.name}
            className="category-scroll-card"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="scroll-card-image">
              {renderImage(category.image || category.emoji, category.emoji)}
            </div>
            <h4 className="scroll-card-name">{category.name}</h4>
            <p className="scroll-card-description">
              {category.description || 'Browse products'}
            </p>
            <div className="scroll-card-actions">
              <Link
                to={`/products?category=${category.name}`}
                className="category-explore-link"
              >
                Explore →
              </Link>
              {isAdmin && (
                <button
                  className="btn-edit-category"
                  onClick={() => handleEditCategory(category)}
                  title="Edit category"
                >
                  ✎
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add New Category Button (Admin Only) */}
        {isAdmin && (
          <button
            className="category-add-card"
            onClick={() => {
              setFormData({ name: '', emoji: '📦', description: '' });
              setCategoryImageFile(null);
              setShowAddModal(true);
            }}
            title="Add new category"
          >
            <div className="add-card-icon">+</div>
            <p>Add New</p>
            <p className="add-card-subtitle">Category</p>
          </button>
        )}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          className="scroll-arrow scroll-arrow-right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          ❯
        </button>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div
          className="edit-category-modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            setEditingCategory(null);
          }}
        >
          <div
            className="edit-category-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
                setCategoryImageFile(null);
              }}
            >
              ✕
            </button>

            <h2>Edit Category</h2>

            <form onSubmit={handleUpdateCategory} className="edit-category-form">
              {/* Category Name */}
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Books, Furniture, Clothing"
                  disabled={formLoading}
                  required
                />
              </div>

              {/* Emoji */}
              <div className="form-group">
                <label htmlFor="emoji">Category Emoji</label>
                <div className="emoji-input-wrapper">
                  <input
                    type="text"
                    id="emoji"
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleFormChange}
                    placeholder="📚"
                    maxLength="1"
                    disabled={formLoading}
                    className="emoji-input"
                  />
                  <span className="emoji-preview">{formData.emoji}</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter category description (optional)"
                  disabled={formLoading}
                  rows="3"
                />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="image">Category Image (Optional)</label>
                <div className="file-upload-box">
                  <label htmlFor="image" className="file-upload-label">
                    <div className="file-upload-icon">📁</div>
                    <div className="file-upload-text">
                      {categoryImageFile ? (
                        <>
                          <strong>✅ {categoryImageFile.name}</strong>
                          <br />
                          <small>Click to change</small>
                        </>
                      ) : (
                        <>
                          <strong>Click to select image</strong>
                          <br />
                          <small>or drag and drop</small>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={formLoading}
                    aria-label="Upload category image"
                    className="file-input-hidden"
                  />
                </div>
                <small style={{ color: '#999', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                </small>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                    setCategoryImageFile(null);
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? '⏳ Updating...' : '✓ Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div
          className="add-category-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="add-category-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowAddModal(false);
                setCategoryImageFile(null);
              }}
            >
              ✕
            </button>

            <h2>Add New Category</h2>

            <form onSubmit={handleAddCategory} className="add-category-form">
              {/* Category Name */}
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Books, Furniture, Clothing"
                  disabled={formLoading}
                  required
                />
              </div>

              {/* Emoji */}
              <div className="form-group">
                <label htmlFor="emoji">Category Emoji</label>
                <div className="emoji-input-wrapper">
                  <input
                    type="text"
                    id="emoji"
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleFormChange}
                    placeholder="📚"
                    maxLength="1"
                    disabled={formLoading}
                    className="emoji-input"
                  />
                  <span className="emoji-preview">{formData.emoji}</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter category description (optional)"
                  disabled={formLoading}
                  rows="3"
                />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="image">Category Image (Optional)</label>
                <div className="file-upload-box">
                  <label htmlFor="image" className="file-upload-label">
                    <div className="file-upload-icon">📁</div>
                    <div className="file-upload-text">
                      {categoryImageFile ? (
                        <>
                          <strong>✅ {categoryImageFile.name}</strong>
                          <br />
                          <small>Click to change</small>
                        </>
                      ) : (
                        <>
                          <strong>Click to select image</strong>
                          <br />
                          <small>or drag and drop</small>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={formLoading}
                    aria-label="Upload category image"
                    className="file-input-hidden"
                  />
                </div>
                <small style={{ color: '#999', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                </small>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setCategoryImageFile(null);
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? '⏳ Adding...' : '✓ Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryScroll;
