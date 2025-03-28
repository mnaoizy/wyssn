export default {
  nav: {
    about: 'Chi siamo',
    changelog: 'Registro delle modifiche',
    pricing: 'Prezzi',
    signin: 'Accedi',
    signup: 'Registrati',
    signout: 'Esci',
    account: 'Account',
    signin_success: 'Accesso effettuato.',
    signout_success: 'Disconnessione effettuata.',
    register_success: 'Registrazione effettuata.',
  },
  hero: {
    title: 'What You Should Say Next',
    description: 'Mai più senza parole.',
    email_placeholder: 'Inserisci la tua email',
    waitlist: 'Unisciti alla lista d’attesa per l’accesso anticipato',
  },
  footer: {
    privacy: 'Privacy',
    terms: 'Termini',
    contact: 'Contatti',
    copyright: '© 2025 Langrics Tutti i diritti riservati.',
  },
  categories: {
    deeper_reflection: 'Riflessione più profonda',
    additional_details: 'Dettagli aggiuntivi',
    question_expansion: 'Espansione della domanda',
    related_topics: 'Argomenti correlati',
    personal_opinion: 'Opinione personale',
    related_thoughts: 'Pensieri correlati',
    narrative_continuation: 'Continuazione della narrazione',
    additional_context: 'Contesto aggiuntivo',
    personal_perspective: 'Prospettiva personale',
  },
  main: {
    translation: 'Traduzione',
    suggestion_heading: 'Mantieni viva la conversazione con',
    prompt_speak: 'Tocca o clicca sul microfono e inizia a parlare',
    add_context: 'Aggiungi contesto',
    cancel: 'Annulla',
    clear: 'Cancella',
  },
  changelog: {
    title: 'Registro delle modifiche',
    description:
      "Traccia tutti gli aggiornamenti e le modifiche all'applicazione Wyssn",
  },

  account: {
    title: 'Account',
    manage_subscription:
      "Gestisci il tuo abbonamento e le impostazioni dell'account",
    manage_subscription_button: 'Gestisci abbonamento',
    user_info: 'Informazioni utente',
    name: 'Nome',
    email: 'Email',
    subscription: 'Abbonamento',
    loading: 'Caricamento...',
    subscription_success: 'Il tuo abbonamento è stato elaborato con successo.',
    subscription_canceled: 'Il processo di abbonamento è stato annullato.',
    error_no_customer:
      'Non hai ancora un account cliente Stripe. Per favore abbonati prima.',
    error_portal_failed:
      'Impossibile accedere al portale di fatturazione. Riprova più tardi.',
    error_generic: 'Si è verificato un errore. Riprova.',
    usage: 'Utilizzo',
    today_usage: "Utilizzo odierno",
    total_usage: 'Utilizzo totale',
    reset_time: 'Ora di reset',
    current_usage: 'Utilizzo attuale: {count} / {limit} richieste questo mese',
    subscription_renewal: 'Il tuo abbonamento {action} il {date}',
    subscription_renew: 'si rinnoverà',
    subscription_end: 'terminerà',
    free_plan_status: 'Attualmente stai utilizzando il piano gratuito',
  },
  // Contact
  contact: {
    title: 'Contattaci',
    email: 'Indirizzo email',
    subject: 'Oggetto',
    message: 'Messaggio',
    submit: 'Invia',
    sending: 'Invio in corso...',
    success: 'Messaggio inviato con successo!',
    errors: {
      required: 'Questo campo è obbligatorio',
      email_invalid: 'Inserisci un indirizzo email valido',
      rate_limit: 'Troppe richieste. Riprova più tardi.',
      generic_error: 'Invio del messaggio fallito. Riprova.'
    }
  },

  // Subscription plans
  plans: {
    heading: 'Scegli il piano adatto a te',
    subheading: 'Inizia con le nostre opzioni di prezzo flessibili',
    free: {
      title: 'Piano Gratuito',
      description: 'Perfetto per iniziare con le funzionalità di base',
      current_plan: 'Piano Attuale',
      downgrade: 'Retrocedi',
    },
    pro: {
      title: 'Piano Pro',
      description: 'Per individui che necessitano di maggiore capacità',
      subscribe: 'Abbonati',
    },
    enterprise: {
      title: 'Piano Enterprise',
      description: 'Per team e aziende con esigenze personalizzate',
      contact_sales: 'Contatta Vendite',
    },
    pricing: {
      month: 'mese',
      custom_pricing: 'Personalizzato',
      pricing: 'prezzi',
      popular: 'Popolare',
      current_plan: 'Piano Attuale',
    },
    features: {
      core_features: 'Tutte le funzionalità principali incluse',
      requests_free_daily: 'Limitato a100richieste al giorno',
      requests_free_monthly: 'Limitato a 500 richieste al mese',
      standard_support: 'Supporto standard',
      requests_pro_daily: 'Limitato a 500 richieste al giorno',
      requests_pro_monthly: 'Limitato a 10.000 richieste al mese',
      priority_support: 'Supporto prioritario',
      custom_limits: 'Limiti di richieste personalizzati',
      team_management: 'Funzionalità di gestione del team',
      dedicated_support: 'Supporto dedicato',
      custom_billing: 'Opzioni di fatturazione personalizzate',
    },
  },
} as const
