export default {
  // Navigation
  nav: {
    about: 'เกี่ยวกับเรา',
    changelog: 'บันทึกการเปลี่ยนแปลง',
    pricing: 'ราคา',
    signin: 'เข้าสู่ระบบ',
    signup: 'ลงทะเบียน',
    signout: 'ออกจากระบบ',
    account: 'บัญชี',
    signin_success: 'คุณได้เข้าสู่ระบบแล้ว',
    signout_success: 'คุณได้ออกจากระบบแล้ว',
    register_success: 'คุณได้ลงทะเบียนเรียบร้อยแล้ว',
  },

  // Hero section
  hero: {
    title: 'WYSSN',
    description: 'ช่วยให้คำพูดในใจของคุณ เป็นจริงได้',
    email_placeholder: 'ป้อนอีเมลของคุณ',
    waitlist: 'ลงทะเบียนเพื่อเข้าถึงก่อนใคร',
  },

  // Footer
  footer: {
    privacy: 'นโยบายความเป็นส่วนตัว',
    terms: 'ข้อกำหนดการใช้งาน',
    contact: 'ติดต่อเรา',
    copyright: '© 2025 Langrics สงวนลิขสิทธิ์',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: 'การวิเคราะห์เชิงลึก',
    additional_details: 'รายละเอียดเพิ่มเติม',
    question_expansion: 'การขยายคำถาม',
    related_topics: 'หัวข้อที่เกี่ยวข้อง',
    personal_opinion: 'ความคิดเห็นส่วนตัว',
    related_thoughts: 'ความคิดที่เกี่ยวข้อง',
    narrative_continuation: 'การดำเนินเรื่องต่อ',
    additional_context: 'บริบทเพิ่มเติม',
    personal_perspective: 'มุมมองส่วนตัว',
  },
  // Main
  main: {
    translation: 'การแปล',
    suggestion_heading: 'ทำให้การสนทนาดำเนินต่อไปด้วย',
    prompt_speak: 'แตะหรือคลิกที่ไมโครโฟนและเริ่มพูด',
    add_context: 'เพิ่มบริบท',
    cancel: 'ยกเลิก',
    clear: 'ล้าง',
  },

  // Changelog page
  changelog: {
    title: 'บันทึกการเปลี่ยนแปลง',
    description: 'ติดตามการอัปเดตและการเปลี่ยนแปลงทั้งหมดของแอปพลิเคชัน Wyssn',
  },

  // Account page
  account: {
    title: 'บัญชี',
    manage_subscription: 'จัดการการสมัครสมาชิกและการตั้งค่าบัญชีของคุณ',
    manage_subscription_button: 'จัดการการสมัครสมาชิก',
    user_info: 'ข้อมูลผู้ใช้',
    name: 'ชื่อ',
    email: 'อีเมล',
    subscription: 'การสมัครสมาชิก',
    loading: 'กำลังโหลด...',
    subscription_success: 'การสมัครสมาชิกของคุณได้รับการประมวลผลเรียบร้อยแล้ว',
    subscription_canceled: 'กระบวนการสมัครสมาชิกของคุณถูกยกเลิก',
    error_no_customer: 'คุณยังไม่มีบัญชีลูกค้า Stripe โปรดสมัครสมาชิกก่อน',
    error_portal_failed:
      'ไม่สามารถเข้าถึงพอร์ทัลการเรียกเก็บเงิน โปรดลองอีกครั้งในภายหลัง',
    error_generic: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง',
    current_usage: 'การใช้งานปัจจุบัน: {count} / {limit} คำขอในเดือนนี้',
    subscription_renewal: 'การสมัครสมาชิกของคุณจะ{action}ในวันที่ {date}',
    subscription_renew: 'ต่ออายุ',
    subscription_end: 'สิ้นสุด',
    free_plan_status: 'ขณะนี้คุณใช้แผนฟรี',
  },
  // Contact
  contact: {
    title: 'ติดต่อเรา',
    email: 'อีเมล',
    subject: 'หัวข้อ',
    message: 'ข้อความ',
    submit: 'ส่ง',
    sending: 'กำลังส่ง...',
    success: 'ส่งข้อความสำเร็จแล้ว!',
    errors: {
      required: 'จำเป็นต้องกรอกข้อมูลนี้',
      email_invalid: 'กรุณากรอกอีเมลที่ถูกต้อง',
      rate_limit: 'มีการร้องขอมากเกินไป กรุณาลองใหม่ในภายหลัง',
      generic_error: 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่'
    }
  },

  // Subscription plans
  plans: {
    heading: 'เลือกแผนที่เหมาะกับคุณ',
    subheading: 'เริ่มต้นด้วยตัวเลือกราคาที่ยืดหยุ่นของเรา',
    free: {
      title: 'แผนฟรี',
      description: 'เหมาะสำหรับการเริ่มต้นด้วยคุณสมบัติพื้นฐาน',
      current_plan: 'แผนปัจจุบัน',
      downgrade: 'ลดระดับ',
      signup_free: 'ลงทะเบียนฟรี',
    },
    pro: {
      title: 'แผนโปร',
      description: 'สำหรับบุคคลที่ต้องการความจุมากขึ้น',
      subscribe: 'สมัครสมาชิก',
    },
    enterprise: {
      title: 'แผนองค์กร',
      description: 'สำหรับทีมและธุรกิจที่มีความต้องการเฉพาะ',
      contact_sales: 'ติดต่อฝ่ายขาย',
    },
    pricing: {
      month: 'เดือน',
      custom_pricing: 'กำหนดเอง',
      pricing: 'ราคา',
      popular: 'ยอดนิยม',
      current_plan: 'แผนปัจจุบัน',
    },
    features: {
      core_features: 'รวมคุณสมบัติหลักทั้งหมด',
      requests_free_daily: 'จำกัดที่100คำขอต่อวัน',
      requests_free_monthly: 'จำกัดที่ 500 คำขอต่อเดือน',
      standard_support: 'การสนับสนุนมาตรฐาน',
      requests_pro_daily: 'จำกัดที่ 500 คำขอต่อวัน',
      requests_pro_monthly: 'จำกัดที่ 10,000 คำขอต่อเดือน',
      priority_support: 'การสนับสนุนแบบเร่งด่วน',
      custom_limits: 'ข้อจำกัดคำขอที่กำหนดเอง',
      team_management: 'คุณสมบัติการจัดการทีม',
      dedicated_support: 'การสนับสนุนเฉพาะ',
      custom_billing: 'ตัวเลือกการเรียกเก็บเงินที่กำหนดเอง',
    },
    signup_free: 'ลงทะเบียนฟรี',
  },
} as const
