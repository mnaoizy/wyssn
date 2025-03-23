// 繁体字中国語 (zh-TW)
export default {
  // Navigation
  nav: {
    about: '關於',
    changelog: '更新日誌',
    pricing: '價格',
    signin: '登入',
    signup: '註冊',
    signout: '登出',
    account: '帳戶',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description:
      '您的LLM驅動的對話夥伴，通過提供適當的上下文建議幫助您保持有意義的對話。',
    email_placeholder: '輸入您的電子郵件',
    waitlist: '加入我們的等候名單以獲取早期訪問權限',
  },

  // Footer
  footer: {
    privacy: '隱私政策',
    terms: '使用條款',
    contact: '聯絡我們',
    copyright: '© 2025 WYSSN. 保留所有權利。',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: '深度思考',
    additional_details: '附加細節',
    question_expansion: '問題拓展',
    related_topics: '相關話題',
    personal_opinion: '個人觀點',
    related_thoughts: '相關想法',
    narrative_continuation: '敘述延續',
    additional_context: '附加背景',
    personal_perspective: '個人視角',
  },
  // Main
  main: {
    translation: '翻譯',
    suggestion_heading: '保持對話持續進行',
    prompt_speak: '點擊麥克風並開始講話',
    add_context: '添加上下文',
  },

  // Changelog page
  changelog: {
    title: '更新日誌',
    description: '追蹤Wyssn應用的所有更新和變更',
  },

  // Account page
  account: {
    title: '帳戶',
    manage_subscription: '管理您的訂閱和帳戶設定',
    manage_subscription_button: '管理訂閱',
    user_info: '用戶資訊',
    name: '姓名',
    email: '電子郵件',
    subscription: '訂閱',
    loading: '載入中...',
    subscription_success: '您的訂閱已成功處理。',
    subscription_canceled: '您的訂閱流程已取消。',
    error_no_customer: '您還沒有Stripe客戶帳戶。請先訂閱。',
    error_portal_failed: '無法訪問帳單門戶。請稍後再試。',
    error_generic: '發生錯誤。請重試。',
    current_usage: '當前使用情況：本月{count} / {limit}請求',
    subscription_renewal: '您的訂閱將於{date}{action}',
    subscription_renew: '續訂',
    subscription_end: '結束',
    free_plan_status: '您目前使用的是免費計劃',
  },
  // Subscription plans
  plans: {
    heading: '選擇適合您的計劃',
    subheading: '從我們靈活的定價選項開始',
    free: {
      title: '免費計劃',
      description: '適合開始使用基本功能',
      current_plan: '當前計劃',
      downgrade: '降級',
    },
    pro: {
      title: '專業計劃',
      description: '適合需要更多容量的個人',
      subscribe: '訂閱',
    },
    enterprise: {
      title: '企業計劃',
      description: '適合有定製需求的團隊和企業',
      contact_sales: '聯絡銷售',
    },
    pricing: {
      month: '月',
      custom_pricing: '定製',
      pricing: '定價',
      popular: '熱門',
      current_plan: '當前計劃',
    },
    features: {
      core_features: '包含所有核心功能',
      requests_free_daily: '每天限制50個請求',
      requests_free_monthly: '每月限制500個請求',
      standard_support: '標準支援',
      requests_pro_daily: '每天限制500個請求',
      requests_pro_monthly: '每月限制10,000個請求',
      priority_support: '優先支援',
      custom_limits: '自定義請求限制',
      team_management: '團隊管理功能',
      dedicated_support: '專屬支援',
      custom_billing: '自定義帳單選項',
    },
  },
} as const
