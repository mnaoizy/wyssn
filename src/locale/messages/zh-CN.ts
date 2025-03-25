// 簡体字中国語 (zh-CN)
export default {
  // Navigation
  nav: {
    about: '关于',
    changelog: '更新日志',
    pricing: '价格',
    signin: '登录',
    signup: '注册',
    signout: '退出',
    account: '账户',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description:
      '您的LLM驱动的对话伴侣，通过提供合适的上下文建议帮助您保持有意义的对话。',
    email_placeholder: '输入您的邮箱',
    waitlist: '加入我们的等候名单以获取早期访问权限',
  },

  // Footer
  footer: {
    privacy: '隐私政策',
    terms: '使用条款',
    contact: '联系我们',
    copyright: '© 2025 Langrics 保留所有权利。',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: '深度思考',
    additional_details: '附加细节',
    question_expansion: '问题拓展',
    related_topics: '相关话题',
    personal_opinion: '个人观点',
    related_thoughts: '相关想法',
    narrative_continuation: '叙述延续',
    additional_context: '附加背景',
    personal_perspective: '个人视角',
  },
  // Main
  main: {
    translation: '翻译',
    suggestion_heading: '保持对话持续进行',
    prompt_speak: '点击麦克风并开始讲话',
    add_context: '添加上下文',
  },

  // Changelog page
  changelog: {
    title: '更新日志',
    description: '跟踪Wyssn应用的所有更新和变更',
  },

  // Account page
  account: {
    title: '账户',
    manage_subscription: '管理您的订阅和账户设置',
    manage_subscription_button: '管理订阅',
    user_info: '用户信息',
    name: '姓名',
    email: '电子邮箱',
    subscription: '订阅',
    loading: '加载中...',
    subscription_success: '您的订阅已成功处理。',
    subscription_canceled: '您的订阅流程已取消。',
    error_no_customer: '您还没有Stripe客户账户。请先订阅。',
    error_portal_failed: '无法访问账单门户。请稍后再试。',
    error_generic: '发生错误。请重试。',
    current_usage: '当前使用情况：本月{count} / {limit}请求',
    subscription_renewal: '您的订阅将于{date}{action}',
    subscription_renew: '续订',
    subscription_end: '结束',
    free_plan_status: '您目前使用的是免费计划',
  },
  // Subscription plans
  plans: {
    heading: '选择适合您的计划',
    subheading: '从我们灵活的定价选项开始',
    free: {
      title: '免费计划',
      description: '适合开始使用基本功能',
      current_plan: '当前计划',
      downgrade: '降级',
      signup_free: '免费注册',
    },
    pro: {
      title: '专业计划',
      description: '适合需要更多容量的个人',
      subscribe: '订阅',
    },
    enterprise: {
      title: '企业计划',
      description: '适合有定制需求的团队和企业',
      contact_sales: '联系销售',
    },
    pricing: {
      month: '月',
      custom_pricing: '定制',
      pricing: '定价',
      popular: '热门',
      current_plan: '当前计划',
    },
    features: {
      core_features: '包含所有核心功能',
      requests_free_daily: '每天限制50个请求',
      requests_free_monthly: '每月限制500个请求',
      standard_support: '标准支持',
      requests_pro_daily: '每天限制500个请求',
      requests_pro_monthly: '每月限制10,000个请求',
      priority_support: '优先支持',
      custom_limits: '自定义请求限制',
      team_management: '团队管理功能',
      dedicated_support: '专属支持',
      custom_billing: '自定义账单选项',
    },
  },
} as const
