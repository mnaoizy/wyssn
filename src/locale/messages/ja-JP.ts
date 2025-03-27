export default {
  // Navigation
  nav: {
    about: '概要',
    changelog: '更新情報',
    pricing: '価格',
    signin: 'ログイン',
    signup: '新規登録',
    signout: 'ログアウト',
    account: 'アカウント',
    signin_success: 'ログインしました。',
    signout_success: 'ログアウトしました。',
    register_success: '登録しました。',
  },

  // Hero section
  hero: {
    title: 'What You Should Say Next',
    description: '心に浮かぶ言葉を、形にする手助けをします。',
    email_placeholder: 'メールアドレス',
    waitlist: '先行アクセスに申し込む',
  },

  // Footer
  footer: {
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    contact: 'お問い合わせ',
    copyright: '© 2025 Langrics All rights reserved.',
  },

  // Suggestion categories
  categories: {
    deeper_reflection: '感想の深掘り',
    additional_details: '詳細の補足',
    question_expansion: '質問の展開',
    related_topics: '関連話題への展開',
    personal_opinion: '個人的感想',
    related_thoughts: '関連する考え',
    narrative_continuation: '話の続き',
    additional_context: '追加の文脈',
    personal_perspective: '個人的視点',
  },
  // Main
  main: {
    translation: '翻訳',
    suggestion_heading: 'この後、こんなふうに続けてみましょう',
    prompt_speak: 'マイクボタンをタップまたはクリックして話してください',
    add_context: '文脈を追加',
    cancel: 'キャンセル',
    clear: 'クリア',
  },

  // Changelog page
  changelog: {
    title: '更新情報',
    description: 'Wyssnアプリケーションのすべての更新と変更を追跡する',
  },

  // Account page
  account: {
    title: 'アカウント',
    manage_subscription: 'サブスクリプションとアカウント設定の管理',
    manage_subscription_button: 'サブスクリプションの管理',
    user_info: 'ユーザー情報',
    name: '名前',
    email: 'メール',
    subscription: 'サブスクリプション',
    loading: '読み込み中...',
    subscription_success: 'サブスクリプションが正常に処理されました。',
    subscription_canceled: 'サブスクリプション処理がキャンセルされました。',
    error_no_customer:
      'Stripeの顧客アカウントをお持ちではありません。まずはサブスクリプションにご登録ください。',
    error_portal_failed:
      '請求ポータルへのアクセスに失敗しました。後ほど再度お試しください。',
    error_generic: 'エラーが発生しました。もう一度お試しください。',
    current_usage: '現在の使用状況: {count} / {limit} リクエスト（今月）',
    subscription_renewal: 'サブスクリプションは{date}に{action}されます',
    subscription_renew: '更新',
    subscription_end: '終了',
    free_plan_status: '現在フリープランをご利用中です',
  },
  // Speech recognition errors
  speech_recognition: {
    no_speech: '音声が検出されませんでした。',
    aborted: '音声入力が中断されました。',
    audio_capture: '音声の取得に失敗しました。',
    network: 'ネットワーク通信に失敗しました。',
    not_allowed: 'マイクへのアクセスが拒否されました。',
    service_not_allowed: '音声認識サービスが許可されていません。',
    bad_grammar: '音声認識の文法にエラーがあります。',
    language_not_supported: '言語がサポートされていません。',
    browser_not_supported: 'お使いのブラウザは音声認識をサポートしていません。',
  },

  // Subscription plans
  plans: {
    heading: 'あなたに合ったプランを選択',
    subheading: '柔軟な料金オプションで始めましょう',
    free: {
      title: 'Freeプラン',
      description: '基本機能の利用に最適',
      current_plan: '現在のプラン',
      downgrade: 'ダウングレード',
      signup_free: '無料で登録',
    },
    pro: {
      title: 'Proプラン',
      description: 'より多くの容量が必要な個人向け',
      subscribe: '登録する',
    },
    enterprise: {
      title: 'Enterpriseプラン',
      description: 'カスタムニーズを持つビジネス向け',
      contact_sales: '営業に問い合わせる',
    },
    pricing: {
      month: '月',
      custom_pricing: 'カスタム',
      pricing: '価格',
      popular: '人気',
      current_plan: '現在のプラン',
    },
    features: {
      core_features: 'すべての主要機能を含む',
      requests_free_daily: '1日50リクエストまで',
      requests_free_monthly: '月間500リクエストまで',
      standard_support: '標準サポート',
      requests_pro_daily: '1日500リクエストまで',
      requests_pro_monthly: '月間10,000リクエストまで',
      priority_support: '優先サポート',
      custom_limits: 'カスタムリクエスト制限',
      team_management: 'チーム管理機能',
      dedicated_support: '専任サポート',
      custom_billing: 'カスタム請求オプション',
    },
  },
} as const
