// ベトナム語 (vi-VN)
export default {
  // Navigation
  nav: {
    about: 'Giới thiệu',
    changelog: 'Lịch sử thay đổi',
    pricing: 'Giá cả',
    signin: 'Đăng nhập',
    signup: 'Đăng ký',
    signout: 'Đăng xuất',
    account: 'Tài khoản',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description:
      'Người bạn đồng hành trong cuộc trò chuyện được hỗ trợ bởi LLM giúp bạn duy trì đối thoại ý nghĩa với các gợi ý phù hợp theo ngữ cảnh.',
    email_placeholder: 'Nhập email của bạn',
    waitlist: 'Tham gia danh sách chờ để nhận quyền truy cập sớm',
  },

  // Footer
  footer: {
    privacy: 'Chính sách riêng tư',
    terms: 'Điều khoản',
    contact: 'Liên hệ',
    copyright: '© 2025 Langrics Bảo lưu mọi quyền.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: 'Suy ngẫm sâu sắc hơn',
    additional_details: 'Chi tiết bổ sung',
    question_expansion: 'Mở rộng câu hỏi',
    related_topics: 'Chủ đề liên quan',
    personal_opinion: 'Ý kiến cá nhân',
    related_thoughts: 'Suy nghĩ liên quan',
    narrative_continuation: 'Tiếp tục câu chuyện',
    additional_context: 'Bối cảnh bổ sung',
    personal_perspective: 'Góc nhìn cá nhân',
  },
  // Main
  main: {
    translation: 'Dịch',
    suggestion_heading: 'Tiếp tục cuộc trò chuyện với',
    prompt_speak: 'Nhấn hoặc bấm vào micro và bắt đầu nói',
    add_context: 'Thêm bối cảnh',
  },

  // Changelog page
  changelog: {
    title: 'Lịch sử thay đổi',
    description:
      'Theo dõi tất cả các bản cập nhật và thay đổi của ứng dụng Wyssn',
  },

  // Account page
  account: {
    title: 'Tài khoản',
    manage_subscription: 'Quản lý gói đăng ký và cài đặt tài khoản của bạn',
    manage_subscription_button: 'Quản lý gói đăng ký',
    user_info: 'Thông tin người dùng',
    name: 'Tên',
    email: 'Email',
    subscription: 'Gói đăng ký',
    loading: 'Đang tải...',
    subscription_success: 'Gói đăng ký của bạn đã được xử lý thành công.',
    subscription_canceled: 'Quá trình đăng ký gói của bạn đã bị hủy.',
    error_no_customer:
      'Bạn chưa có tài khoản khách hàng Stripe. Vui lòng đăng ký trước.',
    error_portal_failed:
      'Không thể truy cập cổng thông tin thanh toán. Vui lòng thử lại sau.',
    error_generic: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    current_usage:
      'Mức sử dụng hiện tại: {count} / {limit} yêu cầu trong tháng này',
    subscription_renewal: 'Gói đăng ký của bạn sẽ {action} vào ngày {date}',
    subscription_renew: 'gia hạn',
    subscription_end: 'kết thúc',
    free_plan_status: 'Bạn đang sử dụng gói miễn phí',
  },
  // Subscription plans
  plans: {
    heading: 'Chọn gói phù hợp với bạn',
    subheading: 'Bắt đầu với các tùy chọn giá linh hoạt của chúng tôi',
    free: {
      title: 'Gói miễn phí',
      description: 'Hoàn hảo để bắt đầu với các tính năng cơ bản',
      current_plan: 'Gói hiện tại',
      downgrade: 'Hạ cấp',
    },
    pro: {
      title: 'Gói chuyên nghiệp',
      description: 'Dành cho cá nhân cần nhiều dung lượng hơn',
      subscribe: 'Đăng ký',
    },
    enterprise: {
      title: 'Gói doanh nghiệp',
      description: 'Dành cho các đội nhóm và doanh nghiệp có nhu cầu tùy chỉnh',
      contact_sales: 'Liên hệ bộ phận bán hàng',
    },
    pricing: {
      month: 'tháng',
      custom_pricing: 'Tùy chỉnh',
      pricing: 'giá',
      popular: 'Phổ biến',
      current_plan: 'Gói hiện tại',
    },
    features: {
      core_features: 'Bao gồm tất cả các tính năng cốt lõi',
      requests_free_daily: 'Giới hạn 50 yêu cầu mỗi ngày',
      requests_free_monthly: 'Giới hạn 500 yêu cầu mỗi tháng',
      standard_support: 'Hỗ trợ tiêu chuẩn',
      requests_pro_daily: 'Giới hạn 500 yêu cầu mỗi ngày',
      requests_pro_monthly: 'Giới hạn 10.000 yêu cầu mỗi tháng',
      priority_support: 'Hỗ trợ ưu tiên',
      custom_limits: 'Giới hạn yêu cầu tùy chỉnh',
      team_management: 'Tính năng quản lý nhóm',
      dedicated_support: 'Hỗ trợ chuyên dụng',
      custom_billing: 'Tùy chọn thanh toán tùy chỉnh',
    },
  },
} as const
