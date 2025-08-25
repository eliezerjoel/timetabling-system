class ApiClient {
  constructor(baseURL = "") {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Handle empty responses (like DELETE operations)
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body: data })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body: data })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" })
  }
}

// Create instances for different API endpoints
export const apiClient = new ApiClient("/api")
export const adminApiClient = new ApiClient("/api/admin")
export const instructorApiClient = new ApiClient("/api/instructor")

// Specific API functions for common operations
export const timetableApi = {
  getTimetable: () => apiClient.get("/timetable"),
}

export const adminApi = {
  // Departments
  getDepartments: () => adminApiClient.get("/departments"),
  createDepartment: (data) => adminApiClient.post("/departments", data),
  updateDepartment: (id, data) => adminApiClient.put(`/departments/${id}`, data),
  deleteDepartment: (id) => adminApiClient.delete(`/departments/${id}`),

  // Courses
  getCourses: () => adminApiClient.get("/courses"),
  getCourse: (id) => adminApiClient.get(`/courses/${id}`),
  createCourse: (data) => adminApiClient.post("/courses", data),
  updateCourse: (id, data) => adminApiClient.put(`/courses/${id}`, data),
  deleteCourse: (id) => adminApiClient.delete(`/courses/${id}`),

  // Instructors
  getInstructors: () => adminApiClient.get("/instructors"),
  getInstructor: (id) => adminApiClient.get(`/instructors/${id}`),
  createInstructor: (data) => adminApiClient.post("/instructors", data),
  updateInstructor: (id, data) => adminApiClient.put(`/instructors/${id}`, data),
  deleteInstructor: (id) => adminApiClient.delete(`/instructors/${id}`),
  getInstructorSchedule: (id) => adminApiClient.get(`/instructors/${id}/schedule`),

  // Programs
  getPrograms: () => adminApiClient.get("/programs"),
  getProgram: (id) => adminApiClient.get(`/programs/${id}`),
  createProgram: (data) => adminApiClient.post("/programs", data),
  updateProgram: (id, data) => adminApiClient.put(`/programs/${id}`, data),
  deleteProgram: (id) => adminApiClient.delete(`/programs/${id}`),

  // Timetable Generation
  generateTimetable: () => adminApiClient.post("/timetable-generation"),
  getGenerationStatus: () => adminApiClient.get("/timetable-generation/status"),
}

export const instructorApi = {
  getSchedule: () => instructorApiClient.get("/schedule"),
}
