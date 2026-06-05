export const formatError = (message) => {
    if (!message) return 'Une erreur est survenue.'
    if (message.includes('Token invalide') || message.includes('Token manquant')) {
      return 'Votre session a expiré. Veuillez vous reconnecter.'
    }
    if (message.includes('Email ou mot de passe incorrect')) {
      return 'Identifiants incorrects.'
    }
    if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.'
    }
    return 'Oups, un petit souci technique. Réessaie dans un instant.'
  }