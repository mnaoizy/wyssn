export default {
  // Navigation
  nav: {
    about: '소개',
    changelog: '업데이트 내역',
    pricing: '가격',
    signin: '로그인',
    signup: '회원가입',
    signout: '로그아웃',
    account: '계정',
    signin_success: '로그인 되었습니다.',
    signout_success: '로그아웃 되었습니다.',
    register_success: '등록되었습니다.',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: '더 이상 말문이 막히지 않습니다.',
    email_placeholder: '이메일 주소',
    waitlist: '사전 신청하기',
  },

  // Footer
  footer: {
    privacy: '개인정보 처리방침',
    terms: '이용 약관',
    contact: '문의하기',
    copyright: '© 2025 Langrics 모든 권리 보유.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: '생각 더 깊이 탐구하기',
    additional_details: '세부 내용 추가하기',
    question_expansion: '질문 확장하기',
    related_topics: '관련 주제로 확장하기',
    personal_opinion: '개인 의견 말하기',
    related_thoughts: '관련 생각 이야기하기',
    narrative_continuation: '이야기 이어가기',
    additional_context: '추가 맥락 제공하기',
    personal_perspective: '개인적인 시각 제공하기',
  },

  // Main
  main: {
    translation: '번역',
    suggestion_heading: '다음과 같이 이어서 말해보세요',
    prompt_speak: '마이크 버튼을 탭하거나 클릭해서 말해보세요',
    add_context: '맥락 추가하기',
  },

  // Changelog page
  changelog: {
    title: '업데이트 내역',
    description: 'Wyssn 애플리케이션의 모든 업데이트 및 변경 사항을 확인하세요',
  },

  // Account page
  account: {
    title: '계정',
    manage_subscription: '구독 및 계정 설정 관리',
    manage_subscription_button: '구독 관리',
    user_info: '사용자 정보',
    name: '이름',
    email: '이메일',
    subscription: '구독',
    loading: '로딩 중...',
    subscription_success: '구독이 성공적으로 처리되었습니다.',
    subscription_canceled: '구독 과정이 취소되었습니다.',
    error_no_customer: '아직 Stripe 고객 계정이 없습니다. 먼저 구독해 주세요.',
    error_portal_failed:
      '결제 포털에 접근할 수 없습니다. 나중에 다시 시도해 주세요.',
    error_generic: '오류가 발생했습니다. 다시 시도해 주세요.',
    current_usage: '현재 사용량: 이번 달 {count} / {limit} 요청',
    subscription_renewal: '구독은 {date}에 {action}됩니다',
    subscription_renew: '갱신',
    subscription_end: '종료',
    free_plan_status: '현재 무료 플랜을 이용 중입니다',
  },
  // Subscription plans
  plans: {
    heading: '귀하에게 맞는 플랜을 선택하세요',
    subheading: '유연한 가격 옵션으로 시작하세요',
    free: {
      title: '무료 플랜',
      description: '기본 기능으로 시작하기에 완벽합니다',
      current_plan: '현재 플랜',
      downgrade: '다운그레이드',
    },
    pro: {
      title: '프로 플랜',
      description: '더 많은 용량이 필요한 개인을 위한 플랜',
      subscribe: '구독하기',
    },
    enterprise: {
      title: '엔터프라이즈 플랜',
      description: '맞춤형 요구사항을 가진 팀과 비즈니스를 위한 플랜',
      contact_sales: '영업팀 문의',
    },
    pricing: {
      month: '월',
      custom_pricing: '맞춤형',
      pricing: '가격',
      popular: '인기',
      current_plan: '현재 플랜',
    },
    features: {
      core_features: '모든 핵심 기능 포함',
      requests_free_daily: '하루 50개 요청으로 제한',
      requests_free_monthly: '월 500개 요청으로 제한',
      standard_support: '표준 지원',
      requests_pro_daily: '하루 500개 요청으로 제한',
      requests_pro_monthly: '월 10,000개 요청으로 제한',
      priority_support: '우선 지원',
      custom_limits: '맞춤형 요청 제한',
      team_management: '팀 관리 기능',
      dedicated_support: '전담 지원',
      custom_billing: '맞춤형 결제 옵션',
    },
  },
} as const
