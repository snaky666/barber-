// js/supabase-config.js
// إعدادات Supabase

const SUPABASE_CONFIG = {
  // ⚠️ مهم: يجب على المستخدم إضافة هذه القيم من مشروعه في Supabase
  // 🔒 احتفظ بهذه المفاتيح سرية ولا تشاركها علناً
  url: '', // مثال: https://xxxxx.supabase.co
  anonKey: '', // مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
  // أسماء الجداول في قاعدة البيانات
  tables: {
    BOOKINGS: 'bookings',
    CANCELLED_DAYS: 'cancelled_days',
    ANNOUNCEMENTS: 'announcements',
    JOURNAL: 'journal',
    INCOME: 'income',
    DEBT: 'debt',
    WORKDAYS: 'workdays'
  }
};

// التحقق من صحة الإعدادات
function validateSupabaseConfig() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('⚠️ تنبيه: لم يتم تكوين Supabase بعد!');
    console.error('يرجى إضافة URL و Anon Key في ملف js/supabase-config.js');
    return false;
  }
  
  if (SUPABASE_CONFIG.url === '' || SUPABASE_CONFIG.anonKey === '') {
    console.error('⚠️ تنبيه: إعدادات Supabase فارغة!');
    return false;
  }
  
  return true;
}

console.log('📋 تم تحميل إعدادات Supabase');
