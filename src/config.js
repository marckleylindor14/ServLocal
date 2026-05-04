const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://servlocal-production.up.railway.app'

export default API_URL