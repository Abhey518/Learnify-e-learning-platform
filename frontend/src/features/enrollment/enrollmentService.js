// src/features/enrollment/enrollmentService.js
const API_BASE_URL = "http://127.0.0.1:5000/api/enrollment";

export const enrollmentService = {
  // FR-2.1: Fetch available courses global catalog
  getCatalog: async () => {
    const response = await fetch(`${API_BASE_URL}/catalog`);
    if (!response.ok) throw new Error("Failed to fetch catalog");
    return response.json();
  },

  // FR-2.1: Get courses the student is currently enrolled in
  getStudentEnrollments: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}?student_id=${studentId}`);
    if (!response.ok) throw new Error("Failed to fetch enrollments");
    return response.json();
  },

  // FR-2.2: Enroll student in a course
  enrollUser: async (studentId, courseId) => {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, course_id: courseId }),
    });
    return response.json();
  },

  // FR-2.3: Unenroll from a course by its specific enrollment record ID
  unenrollByRecordId: async (enrollmentId) => {
    const response = await fetch(`${API_BASE_URL}/${enrollmentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to unenroll");
    return response.json();
  },

  // FR-2.4: Fetch targeted lesson details securely
  getLessonContent: async (studentId, lessonId) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}?student_id=${studentId}`);
    if (!response.ok) throw new Error("Access Denied");
    return response.json();
  },

  // FR-2.5: Toggle lesson completion tracking state
  trackProgress: async (studentId, lessonId, isCompleted = true) => {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, lesson_id: lessonId, is_completed: isCompleted }),
    });
    return response.json();
  },

  // FR-2.6: Get progress breakdown analytical data (overall %, module checklist)
  getCourseProgress: async (studentId, courseId) => {
    const response = await fetch(`${API_BASE_URL}/progress/${studentId}/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch progress");
    return response.json();
  }
};