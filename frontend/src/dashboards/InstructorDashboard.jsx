import React, { useState, useEffect } from 'react';
import { supabase } from '../core/supabaseClient.js';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('published'); // 'published', 'drafts', 'create'

  // Edit Course Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', is_published: false });
  const [formError, setFormError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Curriculum Management State
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState('');

  // Module Form State
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleFormMode, setModuleFormMode] = useState('create');
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', order_no: '', description: '' });

  // Lesson Modal State (New Window for Lesson Creation/Editing)
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonFormMode, setLessonFormMode] = useState('create');
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({ 
    title: '', 
    order_no: '',
    body: '',
    video_url: '',
    file_url: ''
  });

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchUserAndCourses();
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setCategoriesLoading(true);
    setCategoriesError('');

    supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true })
      .then(({ data, error: supabaseError }) => {
        if (supabaseError) {
          throw new Error(supabaseError.message || 'Failed to fetch categories');
        }
        setCategories((data || []).map((item) => item.name));
      })
      .catch((err) => {
        setCategories([]);
        setCategoriesError(err.message || 'Failed to fetch categories');
      })
      .finally(() => setCategoriesLoading(false));
  };

  const fetchUserAndCourses = () => {
    setLoading(true);
    setError('');
    fetch(`${baseUrl}/auth/current-user`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("Authentication failed");
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        return fetch(`${baseUrl}/courses`, { credentials: 'include' });
      })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch courses"))
      .then(coursesData => setCourses(coursesData || []))
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false));
  };

  // --- COURSE MANAGEMENT ---
  const handleOpenEditModal = (course) => {
    setFormError('');
    setCurrentCourseId(course.id);
    setFormData({ 
      title: course.title || '', 
      description: course.description || '',
      category: course.category || '',
      is_published: course.is_published || false
    });
    setShowEditModal(true);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    setFormError('');
    fetch(`${baseUrl}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error || "Failed to create course"); }))
      .then(() => {
        fetchUserAndCourses();
        setActiveTab('drafts'); // Switch to drafts tab upon creation
      })
      .catch(err => setFormError(err.message));
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    setFormError('');
    fetch(`${baseUrl}/courses/${currentCourseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error || "Failed to save course"); }))
      .then(() => {
        setShowEditModal(false);
        fetchUserAndCourses();
      })
      .catch(err => setFormError(err.message));
  };

  const handleDeleteCourse = (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? All modules and lessons will be lost.")) return;
    fetch(`${baseUrl}/courses/${courseId}`, { method: 'DELETE', credentials: 'include' })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error || "Failed to delete course"); }))
      .then(() => setCourses(prev => prev.filter(c => c.id !== courseId)))
      .catch(err => setError(err.message));
  };

  // --- CURRICULUM MANAGEMENT (MODULES & LESSONS) ---
  const openCurriculum = (course) => {
    setActiveCourse(course);
    setModules([]);
    setLessonsMap({});
    setCurriculumError('');
    setShowCurriculumModal(true);
    setCurriculumLoading(true);

    fetch(`${baseUrl}/courses/${course.id}/modules`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load modules"))
      .then(modulesData => {
        setModules(modulesData || []);
        modulesData.forEach(mod => fetchLessons(mod.id));
      })
      .catch(err => setCurriculumError(err.toString()))
      .finally(() => setCurriculumLoading(false));
  };

  const fetchLessons = (moduleId) => {
    fetch(`${baseUrl}/courses/modules/${moduleId}/lessons`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load lessons"))
      .then(lessonsData => setLessonsMap(prev => ({ ...prev, [moduleId]: lessonsData || [] })))
      .catch(err => setLessonsMap(prev => ({ ...prev, [moduleId]: [] })));
  };

  // --- MODULE ACTIONS ---
  const saveModule = (e) => {
    e.preventDefault();
    setCurriculumError('');
    const url = moduleFormMode === 'create' ? `${baseUrl}/courses/modules` : `${baseUrl}/courses/modules/${currentModuleId}`;
    const payload = moduleFormMode === 'create' 
      ? { ...moduleFormData, course_id: activeCourse.id } 
      : moduleFormData;

    fetch(url, {
      method: moduleFormMode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error); }))
      .then(() => {
        setShowModuleForm(false);
        openCurriculum(activeCourse);
      })
      .catch(err => setCurriculumError(err.message));
  };

  const deleteModule = (moduleId) => {
    if (!window.confirm("Are you sure? All lessons in this module will be deleted.")) return;
    fetch(`${baseUrl}/courses/modules/${moduleId}`, { method: 'DELETE', credentials: 'include' })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error); }))
      .then(() => {
        setModules(prev => prev.filter(m => m.id !== moduleId));
      })
      .catch(err => setCurriculumError(err.message));
  };

  // --- LESSON ACTIONS ---
  const saveLesson = (e) => {
    e.preventDefault();
    setCurriculumError('');

    const payload = {
      title: lessonFormData.title,
      order_no: lessonFormData.order_no
    };

    if (lessonFormData.body && lessonFormData.body.trim()) {
      payload.body = lessonFormData.body.trim();
    }
    if (lessonFormData.video_url && lessonFormData.video_url.trim()) {
      payload.video_url = lessonFormData.video_url.trim();
    }
    if (lessonFormData.file_url && lessonFormData.file_url.trim()) {
      payload.file_url = lessonFormData.file_url.trim();
    }

    const url = lessonFormMode === 'create' ? `${baseUrl}/courses/lessons` : `${baseUrl}/courses/lessons/${currentLessonId}`;
    if (lessonFormMode === 'create') {
      payload.module_id = activeModuleForLesson;
    }

    fetch(url, {
      method: lessonFormMode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error); }))
      .then(() => {
        setShowLessonModal(false);
        fetchLessons(activeModuleForLesson);
        openCurriculum(activeCourse);
      })
      .catch(err => {
          setShowLessonModal(false);
          setCurriculumError("Lesson Window Error: " + err.message);
      });
  };

  const deleteLesson = (lessonId, moduleId) => {
    if (!window.confirm("Delete this lesson?")) return;
    fetch(`${baseUrl}/courses/lessons/${lessonId}`, { method: 'DELETE', credentials: 'include' })
      .then(res => res.ok ? res.json() : res.json().then(errData => { throw new Error(errData.error); }))
      .then(() => fetchLessons(moduleId))
      .catch(err => setCurriculumError(err.message));
  };

  const openLessonEditor = async (moduleId, lesson) => {
    setLessonFormMode('edit');
    setCurrentLessonId(lesson.id);
    setActiveModuleForLesson(moduleId);
    setCurriculumError('');

    // Teammate handoff note:
    // Replace direct Supabase read with backend lesson-detail endpoint when available.
    // Suggested endpoint: GET /api/courses/lessons/<lesson_id>
    const { data, error: supabaseError } = await supabase
      .from('lessons')
      .select('id, title, order_no, body, video_url, file_url')
      .eq('id', lesson.id)
      .single();

    if (supabaseError || !data) {
      setLessonFormData({
        title: lesson.title || '',
        order_no: lesson.order_no || '',
        body: '',
        video_url: '',
        file_url: ''
      });
      if (supabaseError) {
        setCurriculumError(`Could not load full lesson details. ${supabaseError.message}`);
      }
    } else {
      setLessonFormData({
        title: data.title || '',
        order_no: data.order_no || '',
        body: data.body || '',
        video_url: data.video_url || '',
        file_url: data.file_url || ''
      });
    }

    setShowLessonModal(true);
  };

  // Derived state for filtering
  const publishedCourses = courses.filter(c => c.is_published);
  const draftCourses = courses.filter(c => !c.is_published);
  const coursesToRender = activeTab === 'published' ? publishedCourses : draftCourses;

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Dashboard Title Section Header */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-2 text-dark">Instructor Control Panel</h1>
            <p className="text-muted">Manage your courses, build your curriculum, and publish content.</p>
          </div>
        </div>

        {/* 3-Tab Controller Navigation System */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-8 text-center">
            <div className="btn-group w-100 shadow-sm rounded-pill p-1 bg-white border flex-wrap">
              <button 
                className={`btn rounded-pill px-4 fw-medium ${activeTab === 'published' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'published' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('published')}
              >
                <i className="bi bi-collection-play-fill me-2"></i>Published Courses
              </button>
              <button 
                className={`btn rounded-pill px-4 fw-medium ${activeTab === 'drafts' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'drafts' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('drafts')}
              >
                <i className="bi bi-file-earmark-text-fill me-2"></i>Draft Courses
              </button>
              <button 
                className={`btn rounded-pill px-4 fw-medium ${activeTab === 'create' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'create' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => {
                   setActiveTab('create');
                   setFormData({ title: '', description: '', category: '', is_published: false });
                   setFormError('');
                }}
              >
                <i className="bi bi-plus-circle-fill me-2"></i>Create New Course
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {categoriesError && (
          <div className="alert alert-warning text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            Could not load course categories from database. {categoriesError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row mt-4">
            
            {/* TAB: PUBLISHED OR DRAFTS */}
            {(activeTab === 'published' || activeTab === 'drafts') && (
              coursesToRender.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">You have no {activeTab} courses.</p>
                </div>
              ) : (
                coursesToRender.map(course => (
                  <div key={course.id} className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0 rounded-3 bg-white h-100 p-3">
                      <div className="card-body d-flex flex-column p-2">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="fw-bold text-dark text-truncate mb-0" title={course.title}>{course.title}</h5>
                          <span className={`badge rounded-pill px-3 py-2 ${course.is_published ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {course.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h6 className="card-subtitle mb-3 text-muted small"><i className="bi bi-tag-fill me-1"></i>{course.category}</h6>
                        <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{course.description}"
                        </p>
                        
                        <div className="mt-4 d-flex flex-column gap-2 border-top pt-3">
                          <button className="btn rounded-pill fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }} onClick={() => openCurriculum(course)}>
                            <i className="bi bi-list-check me-2"></i>Manage Curriculum
                          </button>
                          <div className="d-flex justify-content-between gap-2 mt-1">
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 flex-grow-1 fw-medium" onClick={() => handleOpenEditModal(course)}>Edit Meta</button>
                            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 flex-grow-1 fw-medium" onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {/* TAB: CREATE NEW COURSE */}
            {activeTab === 'create' && (
              <div className="col-12 col-md-10 col-lg-8 mx-auto">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4">
                  <h3 className="fw-bold mb-4 text-dark h5 border-bottom pb-2">Course Information</h3>
                  
                  {formError && (
                    <div className="alert alert-danger shadow-sm">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateCourse}>
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-medium">Course Title</label>
                      <input type="text" className="form-control rounded-3" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-medium">Description</label>
                      <textarea className="form-control rounded-3" rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-medium">Category</label>
                      <select className="form-select rounded-3" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required disabled={categoriesLoading || categories.length === 0}>
                        <option value="" disabled>
                          {categoriesLoading ? 'Loading categories...' : 'Select a category...'}
                        </option>
                        {categories.map((categoryName) => (
                          <option key={categoryName} value={categoryName}>{categoryName}</option>
                        ))}
                      </select>
                      {!categoriesLoading && categories.length === 0 && (
                        <small className="text-danger d-block mt-2">No categories available in database.</small>
                      )}
                    </div>
                    
                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                      <button type="submit" className="btn rounded-pill px-4 fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }}>Create Course Draft</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* EDIT COURSE MODAL */}
        {showEditModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header bg-light border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark">Edit Course Metadata</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger shadow-sm">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}
                    </div>
                  )}
                  <form onSubmit={handleUpdateCourse}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-medium">Course Title</label>
                      <input type="text" className="form-control rounded-3" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-medium">Description</label>
                      <textarea className="form-control rounded-3" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-medium">Category</label>
                      <select className="form-select rounded-3" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required disabled={categoriesLoading || categories.length === 0}>
                        <option value="" disabled>
                          {categoriesLoading ? 'Loading categories...' : 'Select a category...'}
                        </option>
                        {categories.map((categoryName) => (
                          <option key={categoryName} value={categoryName}>{categoryName}</option>
                        ))}
                        {formData.category && !categories.includes(formData.category) && (
                          <option value={formData.category}>{formData.category}</option>
                        )}
                      </select>
                      {!categoriesLoading && categories.length === 0 && (
                        <small className="text-danger d-block mt-2">No categories available in database.</small>
                      )}
                    </div>
                    
                    <div className="mb-3 form-check mt-4 p-3 bg-light rounded-3 border">
                      <input type="checkbox" className="form-check-input ms-1 me-3 mt-2" id="isPublishedCheck" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} />
                      <label className="form-check-label fw-bold text-dark" htmlFor="isPublishedCheck">Publish this course</label>
                      <p className="text-muted small ms-4 mb-0">Check this box to make the course visible to all students.</p>
                    </div>
                    
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => setShowEditModal(false)}>Cancel</button>
                      <button type="submit" className="btn rounded-pill px-4 fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CURRICULUM MANAGEMENT MODAL */}
        {showCurriculumModal && activeCourse && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header bg-light border-bottom">
                  <h5 className="modal-title fw-bold text-dark"><i className="bi bi-folder-fill me-2 text-warning"></i>Curriculum Editor: {activeCourse.title}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCurriculumModal(false)}></button>
                </div>
                <div className="modal-body p-4 bg-light">
                  {curriculumError && (
                    <div className="alert alert-danger shadow-sm text-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{curriculumError}
                    </div>
                  )}
                  
                  {curriculumLoading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="btn rounded-pill fw-medium text-white mb-4 shadow-sm w-100 py-2" 
                        style={{ backgroundColor: '#6f42c1' }}
                        onClick={() => { setModuleFormMode('create'); setModuleFormData({title: '', order_no: '', description: ''}); setShowModuleForm(true); }}
                      >
                        <i className="bi bi-plus-circle-fill me-2"></i>Add New Module
                      </button>

                      {showModuleForm && (
                        <div className="card shadow-sm mb-4 border-0 rounded-3">
                          <div className="card-body bg-white rounded-3 p-4">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">{moduleFormMode === 'create' ? 'Add Module' : 'Edit Module'}</h6>
                            <form onSubmit={saveModule} className="d-flex flex-column gap-3">
                              <div className="d-flex gap-3 align-items-end">
                                <div className="flex-grow-1">
                                  <label className="form-label small text-muted fw-medium">Module Title</label>
                                  <input type="text" className="form-control rounded-3" required value={moduleFormData.title} onChange={e => setModuleFormData({...moduleFormData, title: e.target.value})} />
                                </div>
                                <div style={{width: '100px'}}>
                                  <label className="form-label small text-muted fw-medium">Order No</label>
                                  <input type="number" className="form-control rounded-3" required value={moduleFormData.order_no} onChange={e => setModuleFormData({...moduleFormData, order_no: e.target.value === '' ? '' : parseInt(e.target.value, 10)})} />
                                </div>
                              </div>
                              <div>
                                <label className="form-label small text-muted fw-medium">Module Description (Optional)</label>
                                <textarea className="form-control rounded-3" rows="2" value={moduleFormData.description || ''} onChange={e => setModuleFormData({...moduleFormData, description: e.target.value})}></textarea>
                              </div>
                              <div className="d-flex justify-content-end gap-2 mt-2">
                                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => setShowModuleForm(false)}>Cancel</button>
                                <button type="submit" className="btn rounded-pill px-4 fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }}>Save Module</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      <div className="accordion shadow-sm rounded-3 overflow-hidden" id="curriculumAccordion">
                        {modules.length === 0 ? (
                          <div className="text-center p-5 bg-white rounded-3 text-muted">
                            <i className="bi bi-box-seam fs-1 text-secondary mb-2 d-block"></i>
                            <p className="mb-0">No modules exist for this course.</p>
                          </div>
                        ) : (
                          modules.map((module) => (
                            <div className="accordion-item border-0 border-bottom" key={module.id}>
                              <h2 className="accordion-header d-flex bg-white">
                                <button className="accordion-button collapsed fw-bold flex-grow-1 text-dark" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${module.id}`}>
                                  Module {module.order_no}: {module.title}
                                </button>
                                <div className="px-3 py-2 d-flex align-items-center gap-2 border-start bg-white">
                                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium" onClick={() => { setModuleFormMode('edit'); setCurrentModuleId(module.id); setModuleFormData({title: module.title, order_no: module.order_no, description: module.description || ''}); setShowModuleForm(true); }}>Edit</button>
                                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium" onClick={() => deleteModule(module.id)}>Delete</button>
                                </div>
                              </h2>
                              <div id={`collapse${module.id}`} className="accordion-collapse collapse" data-bs-parent="#curriculumAccordion">
                                <div className="accordion-body bg-light border-top">
                                  {module.description && (
                                    <p className="text-muted small mb-3 border-bottom pb-2"><i>{module.description}</i></p>
                                  )}
                                  <ul className="list-group list-group-flush mb-3 rounded-3 shadow-sm border overflow-hidden">
                                    {lessonsMap[module.id]?.map(lesson => (
                                      <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center bg-white py-3">
                                        <div>
                                          <span className="badge bg-secondary rounded-pill me-3 px-3">Lesson {lesson.order_no}</span>
                                          <span className="fw-medium text-dark">{lesson.title}</span>
                                        </div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-secondary px-3 fw-medium" onClick={() => openLessonEditor(module.id, lesson)}>Edit</button>
                                          <button className="btn btn-sm btn-outline-danger px-3 fw-medium" onClick={() => deleteLesson(lesson.id, module.id)}>Delete</button>
                                        </div>
                                      </li>
                                    ))}
                                    {(!lessonsMap[module.id] || lessonsMap[module.id].length === 0) && (
                                      <li className="list-group-item text-muted fst-italic bg-white py-4 text-center">No lessons added to this module yet.</li>
                                    )}
                                  </ul>

                                  <div className="text-end mt-2">
                                    <button className="btn btn-sm rounded-pill px-4 fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }} onClick={() => { 
                                        setLessonFormMode('create'); 
                                        setLessonFormData({title: '', order_no: '', body: '', video_url: '', file_url: ''}); 
                                        setActiveModuleForLesson(module.id); 
                                        setShowLessonModal(true); 
                                      }}>
                                      <i className="bi bi-plus-circle-fill me-1"></i>Add Lesson
                                    </button>
                                  </div>

                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEPARATE LESSON BUILDER MODAL WINDOW (Stacked above Curriculum) */}
        {showLessonModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header bg-white border-bottom pb-3">
                  <h5 className="modal-title fw-bold text-dark">
                    <i className="bi bi-file-earmark-play-fill me-2 text-primary" style={{ color: '#6f42c1' }}></i>
                    {lessonFormMode === 'create' ? 'Create New Lesson' : 'Edit Lesson Content'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
                </div>
                <div className="modal-body p-4 bg-light">
                  <form onSubmit={saveLesson} className="d-flex flex-column gap-4">
                    
                    {/* Row 1: Title and Order */}
                    <div className="row g-3">
                      <div className="col-md-9">
                        <label className="form-label small text-muted fw-medium">Lesson Title <span className="text-danger">*</span></label>
                        <input type="text" className="form-control form-control-lg rounded-3 shadow-sm border-0" required value={lessonFormData.title} onChange={e => setLessonFormData({...lessonFormData, title: e.target.value})} placeholder="Enter lesson title" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-muted fw-medium">Order No <span className="text-danger">*</span></label>
                        <input type="number" className="form-control form-control-lg rounded-3 shadow-sm border-0" required value={lessonFormData.order_no} onChange={e => setLessonFormData({...lessonFormData, order_no: e.target.value === '' ? '' : parseInt(e.target.value, 10)})} placeholder="Enter order number" />
                      </div>
                    </div>

                    {/* Row 2: Video URL */}
                    <div>
                      <label className="form-label small text-muted fw-medium">Video URL (Optional)</label>
                      <div className="input-group shadow-sm rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0 text-muted"><i className="bi bi-link-45deg"></i></span>
                        <input type="url" className="form-control border-0" value={lessonFormData.video_url} onChange={e => setLessonFormData({...lessonFormData, video_url: e.target.value})} placeholder="https://youtube.com/..." />
                      </div>
                    </div>

                    <div>
                      <label className="form-label small text-muted fw-medium">Attachment URL (Optional)</label>
                      <div className="input-group shadow-sm rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0 text-muted"><i className="bi bi-paperclip"></i></span>
                        <input type="url" className="form-control border-0" value={lessonFormData.file_url} onChange={e => setLessonFormData({...lessonFormData, file_url: e.target.value})} placeholder="https://.../lesson-material.pdf" />
                      </div>
                    </div>

                    {/* Row 3: Rich Content */}
                    <div>
                      <label className="form-label small text-muted fw-medium">Lesson Text Body (Optional)</label>
                      <textarea className="form-control rounded-3 shadow-sm border-0" rows="6" value={lessonFormData.body} onChange={e => setLessonFormData({...lessonFormData, body: e.target.value})} placeholder="Write detailed notes, instructions, or reading material here..."></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="d-flex justify-content-end gap-3 mt-2 pt-3 border-top">
                      <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => setShowLessonModal(false)}>Cancel</button>
                      <button type="submit" className="btn rounded-pill px-5 fw-bold text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }}>
                        {lessonFormMode === 'create' ? 'Save & Create Lesson' : 'Update Lesson'}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
