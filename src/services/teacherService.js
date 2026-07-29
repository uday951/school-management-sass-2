import axiosClient from '@/config/axiosClient'

export const teacherService = {
  // ─── ADMIN-FACING TEACHER CRUD (uses /teachers/ admin routes) ────────────────
  async getTeachers(params = {}) {
    const response = await axiosClient.get('/teachers', { params })
    return response.data
  },

  async getTeacherById(id) {
    const response = await axiosClient.get(`/teachers/${id}/profile`)
    return response.data?.data || response.data
  },

  async createTeacher(payload) {
    const response = await axiosClient.post('/teachers', payload)
    return response.data
  },

  async updateTeacher(id, payload) {
    const response = await axiosClient.put(`/teachers/${id}`, payload)
    return response.data
  },

  async deleteTeacher(id) {
    const response = await axiosClient.delete(`/teachers/${id}`)
    return response.data
  },

  async toggleStatus(id, status) {
    const response = await axiosClient.patch(`/teachers/${id}/status`, { status })
    return response.data
  },

  // ─── DEPARTMENTS ──────────────────────────────────────────────────────────────
  async getDepartments() {
    const response = await axiosClient.get('/teachers/departments')
    return response.data?.data || []
  },

  async createDepartment(payload) {
    const response = await axiosClient.post('/teachers/departments', payload)
    return response.data
  },

  async deleteDepartment(id) {
    const response = await axiosClient.delete(`/teachers/departments/${id}`)
    return response.data
  },

  // ─── DESIGNATIONS ─────────────────────────────────────────────────────────────
  async getDesignations() {
    const response = await axiosClient.get('/teachers/designations')
    return response.data?.data || []
  },

  async createDesignation(payload) {
    const response = await axiosClient.post('/teachers/designations', payload)
    return response.data
  },

  async deleteDesignation(id) {
    const response = await axiosClient.delete(`/teachers/designations/${id}`)
    return response.data
  },

  // ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
  async assignClasses(id, assignedClasses) {
    const response = await axiosClient.post(`/teachers/${id}/assign-class`, { assignedClasses })
    return response.data
  },

  async assignSubjects(id, assignedSubjects) {
    const response = await axiosClient.post(`/teachers/${id}/assign-subject`, { assignedSubjects })
    return response.data
  },

  // ─── QUALIFICATIONS & EXPERIENCES ─────────────────────────────────────────────
  async addQualification(teacherId, payload) {
    const response = await axiosClient.post(`/teachers/${teacherId}/qualifications`, payload)
    return response.data
  },

  async addExperience(teacherId, payload) {
    const response = await axiosClient.post(`/teachers/${teacherId}/experiences`, payload)
    return response.data
  },

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────────
  async uploadDocument(teacherId, formData) {
    const response = await axiosClient.post(`/teachers/${teacherId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // ─── TEACHER PORTAL SELF-SERVICE (uses /teacher/ portal routes) ───────────────
  async getTeacherDashboard() {
    const response = await axiosClient.get('/teacher/dashboard')
    return response.data?.data || null
  },

  async getMyClasses() {
    const response = await axiosClient.get('/teacher/my-classes')
    return response.data?.data || []
  },

  async getMyStudents(params = {}) {
    const response = await axiosClient.get('/teacher/my-students', { params })
    return response.data || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } }
  },

  // Keep legacy names for backward compat with existing pages that call these
  async getTeacherClasses() {
    return this.getMyClasses()
  },

  async getTeacherStudents(params = {}) {
    return this.getMyStudents(params)
  }
}

export default teacherService
