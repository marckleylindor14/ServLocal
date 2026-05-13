const API_URL = (() => {
  const hostname = window.location.hostname
  // En développement local (localhost ou IP locale) : on prend le même hôte mais le port 8080
  if (hostname === 'localhost' || hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/)) {
    return `http://${hostname}:8080`
  }
  // En production : ici l'URL Railway de ton backend
  return 'https://servlocal-production.up.railway.app'
})()

export default API_URL