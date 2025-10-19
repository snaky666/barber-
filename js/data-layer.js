// js/data-layer.js
// طبقة البيانات - localStorage + JSON file

// ═══════════════════════════════════════════════════════════
// المفاتيح المستخدمة في localStorage
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  BOOKINGS: 'bookings',
  CANCELLED: 'cancelled',
  ANNONCES: 'annonces',
  JOURNAL: 'journal',
  INCOME: 'income',
  DEBT: 'debt',
  WORKDAYS: 'workdays',
  CREDENTIALS: 'credentials'
};

// ═══════════════════════════════════════════════════════════
// دوال مساعدة للـ localStorage
// ═══════════════════════════════════════════════════════════

function load(key) {
  const val = localStorage.getItem(key);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error('خطأ في تحميل البيانات:', key, e);
    return null;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('خطأ في حفظ البيانات:', key, e);
  }
}

// ═══════════════════════════════════════════════════════════
// تهيئة البيانات من الملف JSON
// ═══════════════════════════════════════════════════════════

async function initData() {
  console.log('📥 جاري تحميل البيانات من data.json...');

  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('فشل تحميل البيانات من السيرفر');
    }

    const data = await response.json();

    // حفظ البيانات في localStorage
    save(STORAGE_KEYS.BOOKINGS, data.bookings || []);
    save(STORAGE_KEYS.CANCELLED, data.cancelled || []);
    save(STORAGE_KEYS.ANNONCES, data.annonces || []);
    save(STORAGE_KEYS.JOURNAL, data.journal || []);
    save(STORAGE_KEYS.INCOME, data.income || []);
    save(STORAGE_KEYS.DEBT, data.debt || []);
    save(STORAGE_KEYS.WORKDAYS, data.workdays || []);

    console.log('✅ تم تحميل البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات:', error);

    // استخدام البيانات الافتراضية إذا فشل التحميل
    if (!load(STORAGE_KEYS.BOOKINGS)) save(STORAGE_KEYS.BOOKINGS, []);
    if (!load(STORAGE_KEYS.CANCELLED)) save(STORAGE_KEYS.CANCELLED, []);
    if (!load(STORAGE_KEYS.ANNONCES)) save(STORAGE_KEYS.ANNONCES, []);
    if (!load(STORAGE_KEYS.JOURNAL)) save(STORAGE_KEYS.JOURNAL, []);
    if (!load(STORAGE_KEYS.INCOME)) save(STORAGE_KEYS.INCOME, []);
    if (!load(STORAGE_KEYS.DEBT)) save(STORAGE_KEYS.DEBT, []);
    if (!load(STORAGE_KEYS.WORKDAYS)) {
      save(STORAGE_KEYS.WORKDAYS, [
        { dayOfWeek: 0, dayName: 'Dimanche', capacity: 5 },
        { dayOfWeek: 2, dayName: 'Mardi', capacity: 5 },
        { dayOfWeek: 4, dayName: 'Jeudi', capacity: 5 },
        { dayOfWeek: 5, dayName: 'Vendredi', capacity: 3 },
        { dayOfWeek: 6, dayName: 'Samedi', capacity: 5 }
      ]);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// دوال الوصول للبيانات
// ═══════════════════════════════════════════════════════════

function getBookings() {
  return load(STORAGE_KEYS.BOOKINGS) || [];
}

function saveBookings(bookings) {
  save(STORAGE_KEYS.BOOKINGS, bookings);
  syncToServer();
}

function getCancelled() {
  return load(STORAGE_KEYS.CANCELLED) || [];
}

function saveCancelled(cancelled) {
  save(STORAGE_KEYS.CANCELLED, cancelled);
  syncToServer();
}

function getAnnonces() {
  return load(STORAGE_KEYS.ANNONCES) || [];
}

function saveAnnonces(annonces) {
  save(STORAGE_KEYS.ANNONCES, annonces);
  syncToServer();
}

function getJournal() {
  return load(STORAGE_KEYS.JOURNAL) || [];
}

function saveJournal(journal) {
  save(STORAGE_KEYS.JOURNAL, journal);
  syncToServer();
}

function getIncome() {
  return load(STORAGE_KEYS.INCOME) || [];
}

function saveIncome(income) {
  save(STORAGE_KEYS.INCOME, income);
  syncToServer();
}

function getDebt() {
  return load(STORAGE_KEYS.DEBT) || [];
}

function saveDebt(debt) {
  save(STORAGE_KEYS.DEBT, debt);
  syncToServer();
}

function getWorkDays() {
  return load(STORAGE_KEYS.WORKDAYS) || [];
}

function saveWorkDays(workdays) {
  save(STORAGE_KEYS.WORKDAYS, workdays);
  syncToServer();
}

function getCredentials() {
  return load(STORAGE_KEYS.CREDENTIALS) || { username: 'younes', password: 'younes' };
}

function saveCredentials(credentials) {
  save(STORAGE_KEYS.CREDENTIALS, credentials);
}

// ═══════════════════════════════════════════════════════════
// مزامنة البيانات مع السيرفر
// ═══════════════════════════════════════════════════════════

async function syncToServer() {
  try {
    const data = {
      bookings: getBookings(),
      cancelled: getCancelled(),
      annonces: getAnnonces(),
      journal: getJournal(),
      income: getIncome(),
      debt: getDebt(),
      workdays: getWorkDays()
    };

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('خطأ في المزامنة مع السيرفر:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// التهيئة عند تحميل الصفحة
// ═══════════════════════════════════════════════════════════

initData().then(() => {
  console.log('✅ طبقة البيانات جاهزة');
});

console.log('📊 تم تحميل طبقة البيانات (localStorage + JSON)');