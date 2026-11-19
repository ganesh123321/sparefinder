import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const searchParts = (params) => api.get('/search', { params })
export const getSubstitutes = (partId) => api.get(`/substitutes/${partId}`)
export const getSpareDetail = (partId) => api.get(`/spare/${partId}`)
export const uploadImage = (formData) => api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getAvailability = (partId) => api.get(`/availability/${partId}`)
export const createReservation = (data) => api.post('/reserve', data)
export const getStock = () => api.get('/stock')
export const updateStock = (stockId, data) => api.put(`/stock/${stockId}`, data)
export const getShops = () => api.get('/shops')
export const getSales = () => api.get('/sales')
export const getAllParts = () => api.get('/parts')
export const addPart = (data) => api.post('/parts', data)
export const updatePart = (partId, data) => api.put(`/parts/${partId}`, data)
export const deletePart = (partId) => api.delete(`/parts/${partId}`)
export const getReservations = () => api.get('/reservations')
export const updateReservation = (resId, data) => api.put(`/reservations/${resId}`, data)
export const adminLogin = (data) => api.post('/admin/login', data)
export const adminLogout = () => api.post('/admin/logout')
export const checkAdmin = () => api.get('/admin/check')

export default api
