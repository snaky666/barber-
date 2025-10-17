
// js/supabase-config.js
// إعدادات الاتصال بقاعدة بيانات Supabase

const SUPABASE_CONFIG = {
  // ⚠️ مهم: استبدل هذه القيم بقيم مشروعك من Supabase
  // احصل عليها من: https://app.supabase.com/project/YOUR_PROJECT/settings/api
  
  url: 'https://tfbwezlcxecwxrwayhqz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYndlemxjeGVjd3hyd2F5aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjcyMzEsImV4cCI6MjA3NjA0MzIzMX0.IC4siEnbvjJZSgOebXA5_C5PH2nzbUM6gmwI05Ta8Mg',
  
  // اسم الجداول في قاعدة البيانات
  tables: {
    bookings: 'bookings',
    cancelled: 'cancelled_days',
    annonces: 'announcements',
    journal: 'journal',
    income: 'income',
    debt: 'debt'
  }
};

// تحذير إذا لم يتم تعيين الإعدادات
if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️ تحذير: لم يتم تعيين إعدادات Supabase! اقرأ ملف SUPABASE_SETUP.md');
}
