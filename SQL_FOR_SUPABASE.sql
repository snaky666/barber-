-- SQL_FOR_SUPABASE.sql
-- سكريبت إنشاء قاعدة البيانات لنظام حجز صالون الحلاقة Mohand
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor
-- 
-- 📋 هذا السكريبت يتضمن جميع الحقول المستخدمة في التطبيق
-- 🔧 محدّث ليشمل جميع الوظائف بدون استثناء

-- ═══════════════════════════════════════════════════════════
-- 1. جدول الحجوزات (Bookings)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  phone TEXT DEFAULT '',
  daykey TEXT NOT NULL,
  timeslot TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_bookings_daykey ON bookings(daykey);
CREATE INDEX IF NOT EXISTS idx_bookings_completed ON bookings(completed);
CREATE INDEX IF NOT EXISTS idx_bookings_paid ON bookings(paid);

-- سياسات الأمان (RLS)
-- ⚠️ ملاحظة أمنية: السياسات الحالية تسمح بالوصول الكامل للجميع
-- هذا مناسب لمشاريع صغيرة خاصة، ولكن للإنتاج يُنصح بإضافة مصادقة
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON bookings;
CREATE POLICY "Allow public read" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON bookings;
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON bookings;
CREATE POLICY "Allow public update" ON bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON bookings;
CREATE POLICY "Allow public delete" ON bookings FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 2. جدول الأيام الملغاة (Cancelled Days)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cancelled_days (
  id TEXT PRIMARY KEY,
  daykey TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- سياسات الأمان
ALTER TABLE cancelled_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON cancelled_days;
CREATE POLICY "Allow public read" ON cancelled_days FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON cancelled_days;
CREATE POLICY "Allow public insert" ON cancelled_days FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON cancelled_days;
CREATE POLICY "Allow public update" ON cancelled_days FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON cancelled_days;
CREATE POLICY "Allow public delete" ON cancelled_days FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 3. جدول الإعلانات (Announcements)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث حسب النوع
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

-- سياسات الأمان
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON announcements;
CREATE POLICY "Allow public read" ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON announcements;
CREATE POLICY "Allow public insert" ON announcements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON announcements;
CREATE POLICY "Allow public update" ON announcements FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON announcements;
CREATE POLICY "Allow public delete" ON announcements FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 4. جدول السجل (Journal)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journal (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للترتيب الزمني
CREATE INDEX IF NOT EXISTS idx_journal_timestamp ON journal(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal(created_at DESC);

-- سياسات الأمان
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON journal;
CREATE POLICY "Allow public read" ON journal FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON journal;
CREATE POLICY "Allow public insert" ON journal FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON journal;
CREATE POLICY "Allow public update" ON journal FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON journal;
CREATE POLICY "Allow public delete" ON journal FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 5. جدول الدخل (Income)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  client_name TEXT NOT NULL,
  daykey TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  timestamp TEXT NOT NULL,
  was_debt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_income_daykey ON income(daykey);
CREATE INDEX IF NOT EXISTS idx_income_booking_id ON income(booking_id);
CREATE INDEX IF NOT EXISTS idx_income_timestamp ON income(timestamp DESC);

-- سياسات الأمان
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON income;
CREATE POLICY "Allow public read" ON income FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON income;
CREATE POLICY "Allow public insert" ON income FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON income;
CREATE POLICY "Allow public update" ON income FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON income;
CREATE POLICY "Allow public delete" ON income FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 6. جدول الديون (Debt)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS debt (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  phone TEXT DEFAULT '',
  daykey TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  timestamp TEXT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_debt_paid ON debt(paid);
CREATE INDEX IF NOT EXISTS idx_debt_daykey ON debt(daykey);
CREATE INDEX IF NOT EXISTS idx_debt_booking_id ON debt(booking_id);

-- سياسات الأمان
ALTER TABLE debt ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON debt;
CREATE POLICY "Allow public read" ON debt FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON debt;
CREATE POLICY "Allow public insert" ON debt FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON debt;
CREATE POLICY "Allow public update" ON debt FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON debt;
CREATE POLICY "Allow public delete" ON debt FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 7. جدول أيام العمل (Workdays)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workdays (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 1 AND capacity <= 20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- فهرس للترتيب
CREATE INDEX IF NOT EXISTS idx_workdays_day_of_week ON workdays(day_of_week);

-- سياسات الأمان
ALTER TABLE workdays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON workdays;
CREATE POLICY "Allow public read" ON workdays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON workdays;
CREATE POLICY "Allow public insert" ON workdays FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON workdays;
CREATE POLICY "Allow public update" ON workdays FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON workdays;
CREATE POLICY "Allow public delete" ON workdays FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════
-- 8. إدراج البيانات الافتراضية لأيام العمل
-- ═══════════════════════════════════════════════════════════

-- حذف البيانات الموجودة أولاً لتجنب التكرار
DELETE FROM workdays;

-- إدراج أيام العمل الافتراضية
INSERT INTO workdays (day_of_week, day_name, capacity) VALUES
  (0, 'Dimanche', 5),
  (2, 'Mardi', 5),
  (4, 'Jeudi', 5),
  (5, 'Vendredi', 3),
  (6, 'Samedi', 5);

-- ═══════════════════════════════════════════════════════════
-- 9. ملخص البنية
-- ═══════════════════════════════════════════════════════════

-- للتحقق من إنشاء الجداول بنجاح:
SELECT 
  'تم إنشاء جميع الجداول بنجاح! ✅' AS status,
  (SELECT COUNT(*) FROM bookings) AS bookings_count,
  (SELECT COUNT(*) FROM cancelled_days) AS cancelled_days_count,
  (SELECT COUNT(*) FROM announcements) AS announcements_count,
  (SELECT COUNT(*) FROM journal) AS journal_count,
  (SELECT COUNT(*) FROM income) AS income_count,
  (SELECT COUNT(*) FROM debt) AS debt_count,
  (SELECT COUNT(*) FROM workdays) AS workdays_count;

-- ═══════════════════════════════════════════════════════════
-- ملاحظات مهمة:
-- ═══════════════════════════════════════════════════════════
-- 
-- 📌 تطابق الحقول بين التطبيق وقاعدة البيانات:
-- 
-- التطبيق (camelCase)     →  قاعدة البيانات (snake_case)
-- ─────────────────────────────────────────────────────────
-- dayKey                   →  daykey
-- timeSlot                 →  timeslot
-- createdAt                →  created_at
-- bookingId                →  booking_id
-- clientName               →  client_name
-- wasDebt                  →  was_debt
-- dayOfWeek                →  day_of_week
-- dayName                  →  day_name
-- msg                      →  action (journal)
-- ts                       →  timestamp
-- text                     →  message (announcements)
-- 
-- 🔄 التحويل يتم تلقائياً بواسطة: supabase-client.js
-- 
-- ═══════════════════════════════════════════════════════════
