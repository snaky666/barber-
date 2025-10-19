-- SQL_ADMIN_CREDENTIALS.sql
-- سكريبت إضافة جدول بيانات المستخدم الإداري
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════
-- جدول بيانات المستخدم الإداري (Admin Credentials)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  "user" TEXT NOT NULL,
  pass TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- سياسات الأمان (RLS)
-- ⚠️ ملاحظة أمنية: السياسات الحالية تسمح بالوصول الكامل للجميع
-- هذا مناسب لمشاريع صغيرة خاصة، ولكن للإنتاج يُنصح بإضافة مصادقة
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON admin_credentials;
CREATE POLICY "Allow public read" ON admin_credentials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON admin_credentials;
CREATE POLICY "Allow public insert" ON admin_credentials FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON admin_credentials;
CREATE POLICY "Allow public update" ON admin_credentials FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON admin_credentials;
CREATE POLICY "Allow public delete" ON admin_credentials FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- إدراج البيانات الافتراضية
-- ═══════════════════════════════════════════════════════════

-- حذف البيانات الموجودة أولاً لتجنب التكرار
DELETE FROM admin_credentials;

-- إدراج بيانات المستخدم الافتراضية
INSERT INTO admin_credentials ("user", pass) VALUES ('younes', 'younes');

-- ═══════════════════════════════════════════════════════════
-- ✅ انتهى السكريبت بنجاح
-- ═══════════════════════════════════════════════════════════

-- للتحقق من إنشاء الجدول بنجاح:
SELECT 'تم إنشاء جدول admin_credentials بنجاح! ✅' AS status;
