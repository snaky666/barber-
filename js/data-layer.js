// js/data-layer.js
// طبقة البيانات - Supabase

// ═══════════════════════════════════════════════════════════
// المفاتيح المستخدمة (للتوافق مع main.js)
// ═══════════════════════════════════════════════════════════

const LS_KEYS = {
  BOOK: 'bookings',
  CANCELLED: 'cancelled',
  CAN: 'cancelled', // اختصار للتوافق مع main.js
  ANNONCES: 'announcements',
  ANN: 'announcements', // اختصار للتوافق مع main.js
  JOURNAL: 'journal',
  JOUR: 'journal', // اختصار للتوافق مع main.js
  INCOME: 'income',
  DEBT: 'debt',
  WORKDAYS: 'workdays',
  CREDS: 'credentials' // بيانات الدخول تبقى في localStorage للأمان
};

// ═══════════════════════════════════════════════════════════
// التخزين المحلي (Cache) - لتحسين الأداء
// ═══════════════════════════════════════════════════════════

let localCache = {
  bookings: [],
  cancelled: [],
  announcements: [],
  journal: [],
  income: [],
  debt: [],
  workdays: []
};

let isSupabaseReady = false;
let isDataLoaded = false;

// ═══════════════════════════════════════════════════════════
// تهيئة Supabase وتحميل البيانات
// ═══════════════════════════════════════════════════════════

async function initDataLayer() {
  console.log('📥 جاري تحميل البيانات من Supabase...');

  try {
    // تهيئة Supabase
    const client = await window.supabaseAPI.init();
    
    if (!client) {
      console.warn('⚠️ فشل الاتصال بـ Supabase - سيتم استخدام localStorage');
      loadFromLocalStorage();
      isDataLoaded = true;
      return;
    }

    isSupabaseReady = true;

    // تحميل جميع البيانات من Supabase
    const [bookings, cancelled, announcements, journal, income, debt, workdays] = await Promise.all([
      window.supabaseAPI.bookings.getAll(),
      window.supabaseAPI.cancelledDays.getAll(),
      window.supabaseAPI.announcements.getAll(),
      window.supabaseAPI.journal.getAll(),
      window.supabaseAPI.income.getAll(),
      window.supabaseAPI.debt.getAll(),
      window.supabaseAPI.workdays.getAll()
    ]);

    // حفظ في الذاكرة المؤقتة
    localCache.bookings = bookings || [];
    localCache.cancelled = cancelled || [];
    localCache.announcements = announcements || [];
    localCache.journal = journal || [];
    localCache.income = income || [];
    localCache.debt = debt || [];
    localCache.workdays = workdays || [];

    // إذا لم تكن هناك أيام عمل، استخدم القيم الافتراضية
    if (localCache.workdays.length === 0) {
      localCache.workdays = [
        { dayOfWeek: 0, dayName: 'Dimanche', capacity: 5 },
        { dayOfWeek: 2, dayName: 'Mardi', capacity: 5 },
        { dayOfWeek: 4, dayName: 'Jeudi', capacity: 5 },
        { dayOfWeek: 5, dayName: 'Vendredi', capacity: 3 },
        { dayOfWeek: 6, dayName: 'Samedi', capacity: 5 }
      ];
      // حفظ القيم الافتراضية في Supabase
      await window.supabaseAPI.workdays.saveAll(localCache.workdays);
    }

    isDataLoaded = true;
    console.log('✅ تم تحميل البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات:', error);
    
    // استخدام localStorage كنسخة احتياطية
    loadFromLocalStorage();
    isDataLoaded = true;
  }
}

// تحميل من localStorage (نسخة احتياطية)
function loadFromLocalStorage() {
  console.log('📦 تحميل البيانات من localStorage...');
  
  localCache.bookings = loadLocal('bp_bookings') || [];
  localCache.cancelled = loadLocal('bp_cancelled') || [];
  localCache.announcements = loadLocal('bp_annonces') || [];
  localCache.journal = loadLocal('bp_journal') || [];
  localCache.income = loadLocal('bp_income') || [];
  localCache.debt = loadLocal('bp_debt') || [];
  localCache.workdays = loadLocal('bp_workdays') || [
    { dayOfWeek: 0, dayName: 'Dimanche', capacity: 5 },
    { dayOfWeek: 2, dayName: 'Mardi', capacity: 5 },
    { dayOfWeek: 4, dayName: 'Jeudi', capacity: 5 },
    { dayOfWeek: 5, dayName: 'Vendredi', capacity: 3 },
    { dayOfWeek: 6, dayName: 'Samedi', capacity: 5 }
  ];
}

function loadLocal(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('خطأ في حفظ localStorage:', e);
  }
}

// ═══════════════════════════════════════════════════════════
// دوال الوصول للبيانات (متوافقة مع main.js)
// ═══════════════════════════════════════════════════════════

function load(key) {
  switch (key) {
    case LS_KEYS.BOOK:
      return localCache.bookings || [];
    case LS_KEYS.CANCELLED:
    case LS_KEYS.CAN:
      return localCache.cancelled || [];
    case LS_KEYS.ANNONCES:
    case LS_KEYS.ANN:
      return localCache.announcements || [];
    case LS_KEYS.JOURNAL:
    case LS_KEYS.JOUR:
      return localCache.journal || [];
    case LS_KEYS.INCOME:
      return localCache.income || [];
    case LS_KEYS.DEBT:
      return localCache.debt || [];
    case LS_KEYS.WORKDAYS:
      return localCache.workdays || [];
    case LS_KEYS.CREDS:
      // بيانات الدخول تبقى في localStorage
      return loadLocal('bp_creds') || { user: 'younes', pass: 'younes' };
    default:
      return null;
  }
}

async function save(key, value) {
  try {
    // تحديث الذاكرة المؤقتة
    switch (key) {
      case LS_KEYS.BOOK:
        localCache.bookings = value;
        if (isSupabaseReady) {
          // حذف الكل وإضافة من جديد (بساطة التطبيق)
          await syncBookingsToSupabase(value);
        } else {
          saveLocal('bp_bookings', value);
        }
        break;
      case LS_KEYS.CANCELLED:
      case LS_KEYS.CAN:
        localCache.cancelled = value;
        if (isSupabaseReady) {
          await syncCancelledToSupabase(value);
        } else {
          saveLocal('bp_cancelled', value);
        }
        break;
      case LS_KEYS.ANNONCES:
      case LS_KEYS.ANN:
        localCache.announcements = value;
        if (isSupabaseReady) {
          await syncAnnouncementsToSupabase(value);
        } else {
          saveLocal('bp_annonces', value);
        }
        break;
      case LS_KEYS.JOURNAL:
      case LS_KEYS.JOUR:
        localCache.journal = value;
        if (isSupabaseReady) {
          await syncJournalToSupabase(value);
        } else {
          saveLocal('bp_journal', value);
        }
        break;
      case LS_KEYS.INCOME:
        localCache.income = value;
        if (isSupabaseReady) {
          await syncIncomeToSupabase(value);
        } else {
          saveLocal('bp_income', value);
        }
        break;
      case LS_KEYS.DEBT:
        localCache.debt = value;
        if (isSupabaseReady) {
          await syncDebtToSupabase(value);
        } else {
          saveLocal('bp_debt', value);
        }
        break;
      case LS_KEYS.WORKDAYS:
        localCache.workdays = value;
        if (isSupabaseReady) {
          await window.supabaseAPI.workdays.saveAll(value);
        } else {
          saveLocal('bp_workdays', value);
        }
        break;
      case LS_KEYS.CREDS:
        // بيانات الدخول تبقى في localStorage فقط
        saveLocal('bp_creds', value);
        break;
    }
    
    console.log('💾 تم حفظ البيانات:', key);
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', key, error);
    // حفظ في localStorage كنسخة احتياطية
    saveLocal('bp_' + key, value);
  }
}

// ═══════════════════════════════════════════════════════════
// دوال المزامنة مع Supabase (أبسط طريقة: حذف الكل وإضافة من جديد)
// ═══════════════════════════════════════════════════════════

async function syncBookingsToSupabase(bookings) {
  try {
    // حذف جميع الحجوزات القديمة
    const oldBookings = await window.supabaseAPI.bookings.getAll();
    for (const booking of oldBookings) {
      await window.supabaseAPI.bookings.delete(booking.id);
    }
    
    // إضافة الحجوزات الجديدة
    for (const booking of bookings) {
      await window.supabaseAPI.bookings.add(booking);
    }
  } catch (error) {
    console.error('خطأ في مزامنة الحجوزات:', error);
    throw error;
  }
}

async function syncCancelledToSupabase(cancelled) {
  try {
    const oldCancelled = await window.supabaseAPI.cancelledDays.getAll();
    for (const day of oldCancelled) {
      await window.supabaseAPI.cancelledDays.delete(day.id);
    }
    
    for (const day of cancelled) {
      await window.supabaseAPI.cancelledDays.add(day);
    }
  } catch (error) {
    console.error('خطأ في مزامنة الأيام الملغاة:', error);
    throw error;
  }
}

async function syncAnnouncementsToSupabase(announcements) {
  try {
    const oldAnnouncements = await window.supabaseAPI.announcements.getAll();
    for (const ann of oldAnnouncements) {
      await window.supabaseAPI.announcements.delete(ann.id);
    }
    
    for (const ann of announcements) {
      await window.supabaseAPI.announcements.add(ann);
    }
  } catch (error) {
    console.error('خطأ في مزامنة الإعلانات:', error);
    throw error;
  }
}

async function syncJournalToSupabase(journal) {
  try {
    const oldJournal = await window.supabaseAPI.journal.getAll();
    for (const entry of oldJournal) {
      // لا يوجد حذف في السجل، فقط إضافة
    }
    
    for (const entry of journal) {
      // التحقق من عدم وجوده مسبقاً
      const exists = oldJournal.find(e => e.id === entry.id);
      if (!exists) {
        await window.supabaseAPI.journal.add(entry);
      }
    }
  } catch (error) {
    console.error('خطأ في مزامنة السجل:', error);
    throw error;
  }
}

async function syncIncomeToSupabase(income) {
  try {
    const oldIncome = await window.supabaseAPI.income.getAll();
    for (const entry of oldIncome) {
      // لا يوجد حذف في الدخل، فقط إضافة
    }
    
    for (const entry of income) {
      const exists = oldIncome.find(e => e.id === entry.id);
      if (!exists) {
        await window.supabaseAPI.income.add(entry);
      }
    }
  } catch (error) {
    console.error('خطأ في مزامنة الدخل:', error);
    throw error;
  }
}

async function syncDebtToSupabase(debt) {
  try {
    const oldDebt = await window.supabaseAPI.debt.getAll();
    for (const entry of oldDebt) {
      await window.supabaseAPI.debt.delete(entry.id);
    }
    
    for (const entry of debt) {
      await window.supabaseAPI.debt.add(entry);
    }
  } catch (error) {
    console.error('خطأ في مزامنة الديون:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال للتوافق مع الكود القديم
// ═══════════════════════════════════════════════════════════

function getBookings() {
  return load(LS_KEYS.BOOK);
}

function saveBookings(bookings) {
  return save(LS_KEYS.BOOK, bookings);
}

function getCancelled() {
  return load(LS_KEYS.CANCELLED);
}

function saveCancelled(cancelled) {
  return save(LS_KEYS.CANCELLED, cancelled);
}

function getAnnonces() {
  return load(LS_KEYS.ANNONCES);
}

function saveAnnonces(annonces) {
  return save(LS_KEYS.ANNONCES, annonces);
}

function getJournal() {
  return load(LS_KEYS.JOURNAL);
}

function saveJournal(journal) {
  return save(LS_KEYS.JOURNAL, journal);
}

function getIncome() {
  return load(LS_KEYS.INCOME);
}

function saveIncome(income) {
  return save(LS_KEYS.INCOME, income);
}

function getDebt() {
  return load(LS_KEYS.DEBT);
}

function saveDebt(debt) {
  return save(LS_KEYS.DEBT, debt);
}

function getWorkDays() {
  return load(LS_KEYS.WORKDAYS);
}

function saveWorkDays(workdays) {
  return save(LS_KEYS.WORKDAYS, workdays);
}

function getCredentials() {
  return load(LS_KEYS.CREDS);
}

function saveCredentials(credentials) {
  return save(LS_KEYS.CREDS, credentials);
}

// ═══════════════════════════════════════════════════════════
// التهيئة عند تحميل الصفحة
// ═══════════════════════════════════════════════════════════

initDataLayer().then(() => {
  console.log('✅ طبقة البيانات جاهزة وتم تحميل البيانات من Supabase');
}).catch(err => {
  console.error('❌ خطأ في تهيئة طبقة البيانات:', err);
});

console.log('📊 تم تحميل طبقة البيانات (Supabase)');
