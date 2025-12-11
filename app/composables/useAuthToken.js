/**
 * Composable para gestionar el token de autenticación
 */
export const useAuthToken = () => {
  const TOKEN_KEY = 'auth_token'

  /**
   * Guarda el token en localStorage
   * @param {string} token - Token de autenticación
   */
  const setToken = (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      console.log('✅ Token guardado en localStorage')
    }
  }

  /**
   * Obtiene el token de localStorage
   * @returns {string|null} Token de autenticación o null si no existe
   */
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  /**
   * Elimina el token de localStorage
   */
  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      console.log('✅ Token eliminado de localStorage')
    }
  }

  /**
   * Verifica si hay un token guardado
   * @returns {boolean} true si existe un token, false en caso contrario
   */
  const hasToken = () => {
    return getToken() !== null
  }

  /**
   * Obtiene los headers con el token de autenticación
   * @returns {Object} Headers con Authorization Bearer token
   */
  const getAuthHeaders = () => {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  return {
    setToken,
    getToken,
    removeToken,
    hasToken,
    getAuthHeaders
  }
}

