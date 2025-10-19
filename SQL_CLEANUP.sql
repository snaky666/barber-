
-- ═══════════════════════════════════════════════════════════
-- مسح قاعدة البيانات بالكامل وإعادة إنشائها
-- ═══════════════════════════════════════════════════════════

-- حذف الجداول القديمة (CASCADE سيحذف كل السياسات تلقائياً)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS cancelled_days CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS journal CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS debt CASCADE;
DROP TABLE IF EXISTS workdays CASCADE;

-- ═══════════════════════════════════════════════════════════
-- تم! الآن قم بتنفيذ SQL_FOR_SUPABASE.sql
-- ═══════════════════════════════════════════════════════════
