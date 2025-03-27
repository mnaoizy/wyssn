export default {
  // Navigation
  nav: {
    about: 'À propos',
    changelog: 'Nouveautés',
    pricing: 'Tarification',
    signin: 'Se connecter',
    signup: "S'inscrire",
    signout: 'Se déconnecter',
    account: 'Compte',
    signin_success: 'Connexion réussie.',
    signout_success: 'Déconnexion réussie.',
    register_success: 'Inscription réussie.',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: 'Les mots justes, au moment parfait.',
    email_placeholder: 'Entrez votre email',
    waitlist: "Rejoignez notre liste d'attente pour un accès anticipé",
  },

  // Footer
  footer: {
    privacy: 'Confidentialité',
    terms: 'Conditions',
    contact: 'Contact',
    copyright: '© 2025 Langrics Tous droits réservés.',
  },
  // Suggestion categories
  categories: {
    deeper_reflection: 'Réflexion Approfondie',
    additional_details: 'Détails Supplémentaires',
    question_expansion: 'Développement de la Question',
    related_topics: 'Sujets Connexes',
    personal_opinion: 'Opinion Personnelle',
    related_thoughts: 'Pensées Connexes',
    narrative_continuation: 'Suite Narrative',
    additional_context: 'Contexte Supplémentaire',
    personal_perspective: 'Perspective Personnelle',
  },
  // Main
  main: {
    translation: 'Traduction',
    suggestion_heading: 'Vous pouvez poursuivre la conversation ainsi',
    prompt_speak: 'Appuyez ou cliquez sur le microphone et commencez à parler',
    add_context: 'Ajouter du contexte',
    cancel: 'Annuler',
    clear: 'Effacer',
  },

  // Changelog page
  changelog: {
    title: 'Nouveautés',
    description:
      "Suivez toutes les mises à jour et modifications de l'application Wyssn",
  },

  // Account page
  account: {
    title: 'Compte',
    manage_subscription:
      'Gérez votre abonnement et les paramètres de votre compte',
    manage_subscription_button: "Gérer l'abonnement",
    user_info: 'Informations utilisateur',
    name: 'Nom',
    email: 'E-mail',
    subscription: 'Abonnement',
    loading: 'Chargement...',
    subscription_success: 'Votre abonnement a été traité avec succès.',
    subscription_canceled: "Votre processus d'abonnement a été annulé.",
    error_no_customer:
      "Vous n'avez pas encore de compte client Stripe. Veuillez vous abonner d'abord.",
    error_portal_failed:
      "Échec d'accès au portail de facturation. Veuillez réessayer plus tard.",
    error_generic: "Une erreur s'est produite. Veuillez réessayer.",
    usage: 'Utilisation',
    today_usage: "Utilisation d'aujourd'hui",
    total_usage: 'Utilisation totale',
    reset_time: 'Heure de réinitialisation',
    current_usage:
      'Utilisation actuelle : {count} / {limit} requêtes ce mois-ci',
    subscription_renewal: 'Votre abonnement {action} le {date}',
    subscription_renew: 'se renouvellera',
    subscription_end: 'se terminera',
    free_plan_status: 'Vous utilisez actuellement le forfait Gratuit',
  },
  // Subscription plans
  plans: {
    heading: 'Choisissez le forfait qui vous convient',
    subheading: 'Commencez avec nos options de tarification flexibles',
    free: {
      title: 'Forfait Gratuit',
      description: 'Parfait pour débuter avec les fonctionnalités de base',
      current_plan: 'Forfait Actuel',
      downgrade: 'Rétrograder',
      signup_free: "S'inscrire gratuitement",
    },
    pro: {
      title: 'Forfait Pro',
      description: 'Pour les individus qui ont besoin de plus de capacité',
      subscribe: "S'abonner",
    },
    enterprise: {
      title: 'Forfait Entreprise',
      description:
        'Pour les équipes et entreprises avec des besoins personnalisés',
      contact_sales: 'Contacter les ventes',
    },
    pricing: {
      month: 'mois',
      custom_pricing: 'Personnalisé',
      pricing: 'tarification',
      popular: 'Populaire',
      current_plan: 'Forfait Actuel',
    },
    features: {
      core_features: 'Toutes les fonctionnalités principales incluses',
      requests_free_daily: 'Limité à100requêtes par jour',
      requests_free_monthly: 'Limité à 500 requêtes par mois',
      standard_support: 'Support standard',
      requests_pro_daily: 'Limité à 500 requêtes par jour',
      requests_pro_monthly: 'Limité à 10 000 requêtes par mois',
      priority_support: 'Support prioritaire',
      custom_limits: 'Limites de requêtes personnalisées',
      team_management: "Fonctionnalités de gestion d'équipe",
      dedicated_support: 'Support dédié',
      custom_billing: 'Options de facturation personnalisées',
    },
  },
} as const
