-- SQL_FOR_SUPABASE_SECURE.sql
-- نسخة محسّنة أمنياً من السكريبت
-- هذا السكريبت يوفر أماناً أفضل لكن قد يتطلب تعديلات إضافية

-- ⚠️ ملاحظة: هذا السكريبت البديل يوفر أماناً أفضل
-- لكن سيتطلب استخدام Service Role Key في صفحة الإدارة
-- أو استخدام Supabase Dashboard مباشرة لعمليات الإدارة

-- ═══════════════════════════════════════════════════════════
-- للاستخدام: 
-- 1. إذا كنت تريد أماناً أفضل، استخدم هذا السكريبت
-- 2. سيسمح بالقراءة والإضافة فقط عبر التطبيق
-- 3. عمليات التعديل/الحذف تتم عبر Supabase Dashboard
-- ═══════════════════════════════════════════════════════════

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Allow public read" ON bookings;
DROP POLICY IF EXISTS "Allow public insert" ON bookings;
DROP POLICY IF EXISTS "Allow public update" ON bookings;
DROP POLICY IF EXISTS "Allow public delete" ON bookings;

-- سياسات آمنة للحجوزات
CREATE POLICY "Allow public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
-- UPDATE و DELETE محظوران على العامة - يتطلب service role أو Supabase Dashboard

-- نفس الشيء للجداول الأخرى
DROP POLICY IF EXISTS "Allow public read" ON cancelled_days;
DROP POLICY IF EXISTS "Allow public insert" ON cancelled_days;
DROP POLICY IF EXISTS "Allow public update" ON cancelled_days;
DROP POLICY IF EXISTS "Allow public delete" ON cancelled_days;

CREATE POLICY "Allow public read cancelled_days" ON cancelled_days FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

DROP POLICY IF EXISTS "Allow public read" ON announcements;
DROP POLICY IF EXISTS "Allow public insert" ON announcements;
DROP POLICY IF EXISTS "Allow public update" ON announcements;
DROP POLICY IF EXISTS "Allow public delete" ON announcements;

CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

DROP POLICY IF EXISTS "Allow public read" ON journal;
DROP POLICY IF EXISTS "Allow public insert" ON journal;
DROP POLICY IF EXISTS "Allow public update" ON journal;
DROP POLICY IF EXISTS "Allow public delete" ON journal;

CREATE POLICY "Allow public read journal" ON journal FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

DROP POLICY IF EXISTS "Allow public read" ON income;
DROP POLICY IF EXISTS "Allow public insert" ON income;
DROP POLICY IF EXISTS "Allow public update" ON income;
DROP POLICY IF EXISTS "Allow public delete" ON income;

CREATE POLICY "Allow public read income" ON income FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

DROP POLICY IF EXISTS "Allow public read" ON debt;
DROP POLICY IF EXISTS "Allow public insert" ON debt;
DROP POLICY IF EXISTS "Allow public update" ON debt;
DROP POLICY IF EXISTS "Allow public delete" ON debt;

CREATE POLICY "Allow public read debt" ON debt FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

DROP POLICY IF EXISTS "Allow public read" ON workdays;
DROP POLICY IF EXISTS "Allow public insert" ON workdays;
DROP POLICY IF EXISTS "Allow public update" ON workdays;
DROP POLICY IF EXISTS "Allow public delete" ON workdays;

CREATE POLICY "Allow public read workdays" ON workdays FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE محظور

SELECT 'السياسات الأمنية المحسّنة تم تطبيقها بنجاح! ✅' AS status;
SELECT 'ملاحظة: صفحة الإدارة ستحتاج إلى استخدام Supabase Dashboard للتعديلات' AS note;
