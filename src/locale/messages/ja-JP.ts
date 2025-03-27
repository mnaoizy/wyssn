export default {
  // Navigation
  nav: {
    about: '概要',
    changelog: '変更履歴',
    pricing: '料金',
    signin: 'ログイン',
    signup: '新規登録',
    signout: 'ログアウト',
    account: 'アカウント',
    signin_success: 'ログインしました',
    signout_success: 'ログアウトしました',
    register_success: '登録が完了しました',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: '心に浮かぶ言葉を、形にする手助けをします。',
    email_placeholder: 'メールアドレスを入力',
    waitlist: '早期アクセスに参加する',
  },

  // Footer
  footer: {
    privacy: 'プライバシー',
    terms: '利用規約',
    contact: 'お問い合わせ',
    copyright: '© 2025 Langrics 全著作権所有',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: '深い考察',
    additional_details: '追加の詳細',
    question_expansion: '質問の展開',
    related_topics: '関連トピック',
    personal_opinion: '個人的意見',
    related_thoughts: '関連する考え',
    narrative_continuation: '物語の続き',
    additional_context: '追加の文脈',
    personal_perspective: '個人的視点',
  },

  // Main
  main: {
    translation: '翻訳',
    suggestion_heading: '会話を続けるための提案',
    prompt_speak: 'マイクをタップして話し始めてください',
    add_context: '文脈を追加',
    cancel: 'キャンセル',
    clear: 'クリア',
  },

  // Changelog page
  changelog: {
    title: '変更履歴',
    description: 'Wyssnアプリケーションの更新履歴',
  },

  // Account page
  account: {
    title: 'アカウント',
    manage_subscription: 'サブスクリプションとアカウント設定の管理',
    manage_subscription_button: 'サブスクリプション管理',
    user_info: 'ユーザー情報',
    name: '名前',
    email: 'メールアドレス',
    subscription: 'サブスクリプション',
    loading: '読み込み中...',
    subscription_success: 'サブスクリプションが正常に処理されました',
    subscription_canceled: 'サブスクリプション処理がキャンセルされました',
    error_no_customer: 'Stripeカスタマーアカウントがありません。まずサブスクリプションしてください',
    error_portal_failed: '請求ポータルへのアクセスに失敗しました。後で再試行してください',
    error_generic: 'エラーが発生しました。再試行してください',
    usage: '使用状況',
    today_usage: '本日の使用量',
    total_usage: '総使用回数',
    reset_time: 'リセット時刻',
  },

  // Speech recognition errors
  speech_recognition: {
    no_speech: '音声が検出されませんでした',
    aborted: '音声入力が中止されました',
    audio_capture: '音声の取得に失敗しました',
    network: 'ネットワーク通信に失敗しました',
    not_allowed: 'マイクへのアクセスが拒否されました',
    service_not_allowed: '音声認識サービスが許可されていません',
    bad_grammar: '音声認識文法にエラーがあります',
    language_not_supported: '言語がサポートされていません',
    browser_not_supported: 'お使いのブラウザは音声認識をサポートしていません',
  },

  // Subscription plans
  plans: {
    heading: 'あなたに合ったプランを選択',
    subheading: '柔軟な料金プランから始めましょう',
    free: {
      title: '無料プラン',
      description: '基本的な機能を無料で利用',
      current_plan: '現在のプラン',
      downgrade: 'ダウングレード',
      signup_free: '無料で登録',
    },
    pro: {
      title: 'Proプラン',
      description: 'より多くの容量が必要な個人向け',
      subscribe: '購読',
    },
    enterprise: {
      title: 'Enterpriseプラン',
      description: 'カスタムニーズのあるチームや企業向け',
      contact_sales: '営業に連絡',
    },
    pricing: {
      month: '月',
      custom_pricing: 'カスタム',
      pricing: '料金',
      popular: '人気',
      current_plan: '現在のプラン',
    },
    features: {
      core_features: 'すべての基本機能を含む',
      requests_free_daily: '1日100リクエストまで',
      requests_free_monthly: '月500リクエストまで',
      standard_support: '標準サポート',
      requests_pro_daily: '1日500リクエストまで',
      requests_pro_monthly: '月10,000リクエストまで',
      priority_support: '優先サポート',
      custom_limits: 'カスタムリクエスト制限',
      team_management: 'チーム管理機能',
      dedicated_support: '専任サポート',
      custom_billing: 'カスタム請求オプション',
    },
  },
} as const
