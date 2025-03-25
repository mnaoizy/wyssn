export default {
  // Navigation
  nav: {
    about: 'Acerca de',
    changelog: 'Registro de cambios',
    pricing: 'Precios',
    signin: 'Iniciar sesión',
    signup: 'Registrarse',
    signout: 'Cerrar sesión',
    account: 'Cuenta',
    signin_success: 'Inicio de sesión exitoso.',
    signout_success: 'Cierre de sesión exitoso.',
    register_success: 'Registro exitoso.',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: 'Nunca más te quedarás sin palabras.',
    email_placeholder: 'Introduce tu email',
    waitlist: 'Únete a nuestra lista de espera para acceso anticipado',
  },

  // Footer
  footer: {
    privacy: 'Privacidad',
    terms: 'Términos',
    contact: 'Contacto',
    copyright: '© 2025 Langrics Todos los derechos reservados.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: 'Reflexión Profunda',
    additional_details: 'Detalles Adicionales',
    question_expansion: 'Ampliación de Preguntas',
    related_topics: 'Temas Relacionados',
    personal_opinion: 'Opinión Personal',
    related_thoughts: 'Pensamientos Relacionados',
    narrative_continuation: 'Continuación Narrativa',
    additional_context: 'Contexto Adicional',
    personal_perspective: 'Perspectiva Personal',
  },
  // Main
  main: {
    translation: 'Traducción',
    suggestion_heading: 'Mantén la conversación con',
    prompt_speak: 'Toca o haz clic en el micrófono y comienza a hablar',
    add_context: 'Añadir contexto',
  },

  // Changelog page
  changelog: {
    title: 'Registro de cambios',
    description:
      'Sigue todas las actualizaciones y cambios en la aplicación Wyssn',
  },

  // Account page
  account: {
    title: 'Cuenta',
    manage_subscription: 'Administra tu suscripción y configuración de cuenta',
    manage_subscription_button: 'Administrar suscripción',
    user_info: 'Información del usuario',
    name: 'Nombre',
    email: 'Correo electrónico',
    subscription: 'Suscripción',
    loading: 'Cargando...',
    subscription_success: 'Tu suscripción ha sido procesada con éxito.',
    subscription_canceled: 'Tu proceso de suscripción ha sido cancelado.',
    error_no_customer:
      'No tienes una cuenta de cliente Stripe todavía. Por favor, suscríbete primero.',
    error_portal_failed:
      'No se pudo acceder al portal de facturación. Por favor, inténtalo de nuevo más tarde.',
    error_generic: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    current_usage: 'Uso actual: {count} / {limit} solicitudes este mes',
    subscription_renewal: 'Tu suscripción se {action} el {date}',
    subscription_renew: 'renovará',
    subscription_end: 'terminará',
    free_plan_status: 'Actualmente estás en el plan gratuito',
  },
  // Subscription plans
  plans: {
    heading: 'Elige el plan que se adapte a ti',
    subheading: 'Comienza con nuestras opciones de precios flexibles',
    free: {
      title: 'Plan Gratuito',
      description: 'Perfecto para comenzar con funciones básicas',
      current_plan: 'Plan Actual',
      downgrade: 'Degradar',
      signup_free: 'Registrarse gratis',
    },
    pro: {
      title: 'Plan Pro',
      description: 'Para individuos que necesitan más capacidad',
      subscribe: 'Suscribirse',
    },
    enterprise: {
      title: 'Plan Empresarial',
      description: 'Para equipos y empresas con necesidades personalizadas',
      contact_sales: 'Contactar Ventas',
    },
    pricing: {
      month: 'mes',
      custom_pricing: 'Personalizado',
      pricing: 'precios',
      popular: 'Popular',
      current_plan: 'Plan Actual',
    },
    features: {
      core_features: 'Todas las funciones principales incluidas',
      requests_free_daily: 'Limitado a 50 solicitudes por día',
      requests_free_monthly: 'Limitado a 500 solicitudes por mes',
      standard_support: 'Soporte estándar',
      requests_pro_daily: 'Limitado a 500 solicitudes por día',
      requests_pro_monthly: 'Limitado a 10,000 solicitudes por mes',
      priority_support: 'Soporte prioritario',
      custom_limits: 'Límites de solicitudes personalizados',
      team_management: 'Funciones de gestión de equipos',
      dedicated_support: 'Soporte dedicado',
      custom_billing: 'Opciones de facturación personalizadas',
    },
  },
} as const
