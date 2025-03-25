export default {
  // Navigation
  nav: {
    about: 'Über uns',
    changelog: 'Änderungsprotokoll',
    pricing: 'Preise',
    signin: 'Anmelden',
    signup: 'Registrieren',
    signout: 'Abmelden',
    account: 'Konto',
    signin_success: 'Anmeldung erfolgreich.',
    signout_success: 'Abmeldung erfolgreich.',
    register_success: 'Registrierung erfolgreich.',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: 'Nie wieder sprachlos sein.',
    email_placeholder: 'E-Mail-Adresse eingeben',
    waitlist: 'Tragen Sie sich in unsere Warteliste für frühen Zugang ein',
  },

  // Footer
  footer: {
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    copyright: '© 2025 Langrics Alle Rechte vorbehalten.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: 'Tiefere Reflexion',
    additional_details: 'Zusätzliche Details',
    question_expansion: 'Fragenerweiterung',
    related_topics: 'Verwandte Themen',
    personal_opinion: 'Persönliche Meinung',
    related_thoughts: 'Verwandte Gedanken',
    narrative_continuation: 'Fortsetzung der Erzählung',
    additional_context: 'Zusätzlicher Kontext',
    personal_perspective: 'Persönliche Perspektive',
  },
  // Main
  main: {
    translation: 'Übersetzung',
    suggestion_heading: 'So könnten Sie das Gespräch fortsetzen',
    prompt_speak:
      'Tippen oder klicken Sie auf das Mikrofon und beginnen Sie zu sprechen',
    add_context: 'Kontext hinzufügen',
    cancel: 'Abbrechen',
  },

  // Changelog page
  changelog: {
    title: 'Änderungsprotokoll',
    description:
      'Verfolgen Sie alle Aktualisierungen und Änderungen an der Wyssn-Anwendung',
  },

  // Account page
  account: {
    title: 'Konto',
    manage_subscription: 'Verwalten Sie Ihr Abonnement und Kontoeinstellungen',
    manage_subscription_button: 'Abonnement verwalten',
    user_info: 'Benutzerinformationen',
    name: 'Name',
    email: 'E-Mail',
    subscription: 'Abonnement',
    loading: 'Wird geladen...',
    subscription_success: 'Ihr Abonnement wurde erfolgreich verarbeitet.',
    subscription_canceled: 'Ihr Abonnementvorgang wurde abgebrochen.',
    error_no_customer:
      'Sie haben noch kein Stripe-Kundenkonto. Bitte abonnieren Sie zuerst.',
    error_portal_failed:
      'Zugriff auf das Abrechnungsportal fehlgeschlagen. Bitte versuchen Sie es später erneut.',
    error_generic: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    current_usage:
      'Aktuelle Nutzung: {count} / {limit} Anfragen in diesem Monat',
    subscription_renewal: 'Ihr Abonnement wird am {date} {action}',
    subscription_renew: 'verlängert',
    subscription_end: 'enden',
    free_plan_status: 'Sie nutzen derzeit den kostenlosen Plan',
  },
  // Subscription plans
  plans: {
    heading: 'Wählen Sie den passenden Plan für Sie',
    subheading: 'Starten Sie mit unseren flexiblen Preisoptionen',
    free: {
      title: 'Kostenloser Plan',
      description: 'Perfekt für den Einstieg mit grundlegenden Funktionen',
      current_plan: 'Aktueller Plan',
      downgrade: 'Downgrade',
      signup_free: 'Kostenlos registrieren',
    },
    pro: {
      title: 'Pro-Plan',
      description: 'Für Einzelpersonen, die mehr Kapazität benötigen',
      subscribe: 'Abonnieren',
    },
    enterprise: {
      title: 'Enterprise-Plan',
      description: 'Für Teams und Unternehmen mit individuellen Anforderungen',
      contact_sales: 'Vertrieb kontaktieren',
    },
    pricing: {
      month: 'Monat',
      custom_pricing: 'Individuell',
      pricing: 'Preisgestaltung',
      popular: 'Beliebt',
      current_plan: 'Aktueller Plan',
    },
    features: {
      core_features: 'Alle Kernfunktionen inbegriffen',
      requests_free_daily: 'Begrenzt auf 50 Anfragen pro Tag',
      requests_free_monthly: 'Begrenzt auf 500 Anfragen pro Monat',
      standard_support: 'Standard-Support',
      requests_pro_daily: 'Begrenzt auf 500 Anfragen pro Tag',
      requests_pro_monthly: 'Begrenzt auf 10.000 Anfragen pro Monat',
      priority_support: 'Prioritäts-Support',
      custom_limits: 'Individuelle Anfragelimits',
      team_management: 'Team-Management-Funktionen',
      dedicated_support: 'Dedizierter Support',
      custom_billing: 'Individuelle Abrechnungsoptionen',
    },
  },
} as const
