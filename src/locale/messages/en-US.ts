export default {
  // Navigation
  nav: {
    about: 'About',
    changelog: 'Changelog',
    pricing: 'Pricing',
    signin: 'Sign in',
    signup: 'Sign up',
    signout: 'Sign out',
    account: 'Account',
    signin_success: 'You have been signed in.',
    signout_success: 'You have been signed out.',
    register_success: 'You have been registered.',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: 'Never be at a loss for words.',
    email_placeholder: 'Enter your email',
    waitlist: 'Join our waitlist for early access',
  },

  // Footer
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    copyright: '© 2025 Langrics All rights reserved.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: 'Deeper Reflection',
    additional_details: 'Additional Details',
    question_expansion: 'Question Expansion',
    related_topics: 'Related Topics',
    personal_opinion: 'Personal Opinion',
    related_thoughts: 'Related Thoughts',
    narrative_continuation: 'Narrative Continuation',
    additional_context: 'Additional Context',
    personal_perspective: 'Personal Perspective',
  },
  // Main
  main: {
    translation: 'Translation',
    suggestion_heading: 'Keep the conversation going with',
    prompt_speak: 'Tap or click the microphone and start speaking',
    add_context: 'Add context',
    cancel: 'Cancel',
    clear: 'Clear',
  },

  // Changelog page
  changelog: {
    title: 'Changelog',
    description: 'Track all updates and changes to the Wyssn application',
  },

  // Account page
  account: {
    title: 'Account',
    manage_subscription: 'Manage your subscription and account settings',
    manage_subscription_button: 'Manage Subscription',
    user_info: 'User Information',
    name: 'Name',
    email: 'Email',
    subscription: 'Subscription',
    loading: 'Loading...',
    subscription_success: 'Your subscription has been successfully processed.',
    subscription_canceled: 'Your subscription process was canceled.',
    error_no_customer:
      "You don't have a Stripe customer account yet. Please subscribe first.",
    error_portal_failed:
      'Failed to access the billing portal. Please try again later.',
    error_generic: 'An error occurred. Please try again.',
    current_usage: 'Current usage: {count} / {limit} requests this month',
    subscription_renewal: 'Your subscription will {action} on {date}',
    subscription_renew: 'renew',
    subscription_end: 'end',
    free_plan_status: "You're currently on the Free plan",
  },

  // Speech recognition errors
  speech_recognition: {
    no_speech: 'No speech was detected.',
    aborted: 'Speech input was aborted.',
    audio_capture: 'Audio capture failed.',
    network: 'Network communication failed.',
    not_allowed: 'Microphone access was denied.',
    service_not_allowed: 'Speech recognition service not allowed.',
    bad_grammar: 'Error in speech recognition grammar.',
    language_not_supported: 'Language not supported.',
    browser_not_supported: 'Your browser does not support speech recognition.',
  },
  // Subscription plans
  plans: {
    heading: "Choose the plan that's right for you",
    subheading: 'Get started with our flexible pricing options',
    free: {
      title: 'Free Plan',
      description: 'Perfect for getting started with basic features',
      current_plan: 'Current Plan',
      downgrade: 'Downgrade',
      signup_free: 'Sign up for Free',
    },
    pro: {
      title: 'Pro Plan',
      description: 'For individuals who need more capacity',
      subscribe: 'Subscribe',
    },
    enterprise: {
      title: 'Enterprise Plan',
      description: 'For teams and businesses with custom needs',
      contact_sales: 'Contact Sales',
    },
    pricing: {
      month: 'month',
      custom_pricing: 'Custom',
      pricing: 'pricing',
      popular: 'Popular',
      current_plan: 'Current Plan',
    },
    features: {
      core_features: 'All core features included',
      requests_free_daily: 'Limited to100requests per day',
      requests_free_monthly: 'Limited to 500 requests per month',
      standard_support: 'Standard support',
      requests_pro_daily: 'Limited to 500 requests per day',
      requests_pro_monthly: 'Limited to 10,000 requests per month',
      priority_support: 'Priority support',
      custom_limits: 'Custom request limits',
      team_management: 'Team management features',
      dedicated_support: 'Dedicated support',
      custom_billing: 'Custom billing options',
    },
  },
} as const
