import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api/v1'

export const teacherService = {
  // ─── TEACHER CRUD ──────────────────────────────────────────────────────────
  async getTeachers(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/teachers`, { params })
    return response.data
  },

  async getTeacherById(id) {
    const response = await axios.get(`${API_BASE_URL}/teachers/${id}/profile`)
    return response.data?.data || response.data
  },

  async createTeacher(payload) {
    const response = await axios.post(`${API_BASE_URL}/teachers`, payload)
    return response.data
  },

  async updateTeacher(id, payload) {
    const response = await axios.put(`${API_BASE_URL}/teachers/${id}`, payload)
    return response.data
  },

  async deleteTeacher(id) {
    const response = await axios.delete(`${API_BASE_URL}/teachers/${id}`)
    return response.data
  },

  async toggleStatus(id, status) {
    const response = await axios.patch(`${API_BASE_URL}/teachers/${id}/status`, { status })
    return response.data
  },

  // ─── DEPARTMENTS ───────────────────────────────────────────────────────────
  async getDepartments() {
    const response = await axios.get(`${API_BASE_URL}/teachers/departments`)
    return response.data?.data || []
  },

  async createDepartment(payload) {
    const response = await axios.post(`${API_BASE_URL}/teachers/departments`, payload)
    return response.data
  },

  async deleteDepartment(id) {
    const response = await axios.delete(`${API_BASE_URL}/teachers/departments/${id}`)
    return response.data
  },

  // ─── DESIGNATIONS ──────────────────────────────────────────────────────────
  async getDesignations() {
    const response = await axios.get(`${API_BASE_URL}/teachers/designations`)
    return response.data?.data || []
  },

  async createDesignation(payload) {
    const response = await axios.post(`${API_BASE_URL}/teachers/designations`, payload)
    return response.data
  },

  async deleteDesignation(id) {
    const response = await axios.delete(`${API_BASE_URL}/teachers/designations/${id}`)
    return response.data
  },

  // ─── ASSIGNMENTS ───────────────────────────────────────────────────────────
  async assignClasses(id, assignedClasses) {
    const response = await axios.post(`${API_BASE_URL}/teachers/${id}/assign-class`, { assignedClasses })
    return response.data
  },

  async assignSubjects(id, assignedSubjects) {
    const response = await axios.post(`${API_BASE_URL}/teachers/${id}/assign-subject`, { assignedSubjects })
    return response.data
  },

  // ─── QUALIFICATIONS & EXPERIENCES ──────────────────────────────────────────
  async addQualification(teacherId, payload) {
    const response = await axios.post(`${API_BASE_URL}/teachers/${teacherId}/qualifications`, payload)
    return response.data
  },

  async addExperience(teacherId, payload) {
    const response = await axios.post(`${API_BASE_URL}/teachers/${teacherId}/experiences`, payload)
    return response.data
  },

  // ─── DOCUMENTS ─────────────────────────────────────────────────────────────
  async uploadDocument(teacherId, formData) {
    const response = await axios.post(`${API_BASE_URL}/teachers/${teacherId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // ─── DEDICATED TEACHER PORTAL FEATURE APIs ────────────────────────────────
  async getTeacherDashboard(teacherId = '') {
    const response = await axios.get(`${API_BASE_URL}/teacher/dashboard`, { params: { teacherId } })
    return response.data?.data || null
  },

  async getTeacherClasses(teacherId = '') {
    const response = await axios.get(`${API_BASE_URL}/teacher/classes`, { params: { teacherId } })
    return response.data?.data || []
  },

  async getTeacherStudents(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/teacher/students`, { params })
    return response.data || { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }
  },

  async getTeacherSchedule(teacherId = '') {
    const response = await axios.get(`${API_BASE_URL}/teacher/schedule`, { params: { teacherId } })
    return response.data?.data || { teacherName: '', weeklySchedule: [] }
  },

  async getTeacherCalendar() {
    const response = await axios.get(`${API_BASE_URL}/teacher/calendar`)
    return response.data?.data || { academicYear: '', events: [] }
  }
}

export default teacherService
