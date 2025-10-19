// js/supabase-client.js
// عميل Supabase مع دوال CRUD

let supabaseClient = null;

// تهيئة عميل Supabase
async function initSupabase() {
  try {
    // التحقق من وجود إعدادات Supabase
    if (!validateSupabaseConfig()) {
      console.warn('⚠️ لم يتم تكوين Supabase - سيتم استخدام localStorage كنسخة احتياطية');
      return null;
    }

    // التحقق من تحميل مكتبة Supabase
    if (typeof supabase === 'undefined') {
      console.error('❌ مكتبة Supabase غير محملة!');
      return null;
    }

    // إنشاء عميل Supabase
    supabaseClient = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );

    console.log('✅ تم الاتصال بقاعدة البيانات Supabase');
    return supabaseClient;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بـ Supabase:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للحجوزات (Bookings)
// ═══════════════════════════════════════════════════════════

async function getAllBookings() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    return [];
  }
}

async function addBooking(booking) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .insert([booking])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة حجز:', error);
    throw error;
  }
}

async function updateBooking(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في تحديث حجز:', error);
    throw error;
  }
}

async function deleteBooking(id) {
  try {
    const { error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('خطأ في حذف حجز:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للأيام الملغاة (Cancelled Days)
// ═══════════════════════════════════════════════════════════

async function getAllCancelledDays() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.CANCELLED_DAYS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الأيام الملغاة:', error);
    return [];
  }
}

async function addCancelledDay(day) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.CANCELLED_DAYS)
      .insert([day])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة يوم ملغى:', error);
    throw error;
  }
}

async function deleteCancelledDay(id) {
  try {
    const { error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.CANCELLED_DAYS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('خطأ في حذف يوم ملغى:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للإعلانات (Announcements)
// ═══════════════════════════════════════════════════════════

async function getAllAnnouncements() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ANNOUNCEMENTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return [];
  }
}

async function addAnnouncement(announcement) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ANNOUNCEMENTS)
      .insert([announcement])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة إعلان:', error);
    throw error;
  }
}

async function deleteAnnouncement(id) {
  try {
    const { error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ANNOUNCEMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('خطأ في حذف إعلان:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للسجل (Journal)
// ═══════════════════════════════════════════════════════════

async function getAllJournalEntries() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.JOURNAL)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب السجل:', error);
    return [];
  }
}

async function addJournalEntry(entry) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.JOURNAL)
      .insert([entry])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة مدخل للسجل:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للدخل (Income)
// ═══════════════════════════════════════════════════════════

async function getAllIncomeEntries() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.INCOME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الدخل:', error);
    return [];
  }
}

async function addIncomeEntry(entry) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.INCOME)
      .insert([entry])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة دخل:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD للديون (Debt)
// ═══════════════════════════════════════════════════════════

async function getAllDebtEntries() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الديون:', error);
    return [];
  }
}

async function addDebtEntry(entry) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .insert([entry])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في إضافة دين:', error);
    throw error;
  }
}

async function updateDebtEntry(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('خطأ في تحديث دين:', error);
    throw error;
  }
}

async function deleteDebtEntry(id) {
  try {
    const { error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('خطأ في حذف دين:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// دوال CRUD لأيام العمل (Workdays)
// ═══════════════════════════════════════════════════════════

async function getAllWorkdays() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.WORKDAYS)
      .select('*')
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(w => ({
      dayOfWeek: w.day_of_week,
      dayName: w.day_name,
      capacity: w.capacity
    }));
  } catch (error) {
    console.error('خطأ في جلب أيام العمل:', error);
    return [];
  }
}

async function saveAllWorkdays(workdays) {
  try {
    // حذف جميع أيام العمل القديمة
    await supabaseClient
      .from(SUPABASE_CONFIG.tables.WORKDAYS)
      .delete()
      .neq('id', 0); // حذف الكل

    // إضافة أيام العمل الجديدة
    if (workdays && workdays.length > 0) {
      const data = workdays.map(w => ({
        day_of_week: w.dayOfWeek,
        day_name: w.dayName,
        capacity: w.capacity
      }));

      const { error } = await supabaseClient
        .from(SUPABASE_CONFIG.tables.WORKDAYS)
        .insert(data);

      if (error) throw error;
    }

    console.log('💾 تم حفظ أيام العمل في Supabase');
    return true;
  } catch (error) {
    console.error('خطأ في حفظ أيام العمل:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// تصدير الدوال
// ═══════════════════════════════════════════════════════════

window.supabaseAPI = {
  init: initSupabase,
  bookings: {
    getAll: getAllBookings,
    add: addBooking,
    update: updateBooking,
    delete: deleteBooking
  },
  cancelledDays: {
    getAll: getAllCancelledDays,
    add: addCancelledDay,
    delete: deleteCancelledDay
  },
  announcements: {
    getAll: getAllAnnouncements,
    add: addAnnouncement,
    delete: deleteAnnouncement
  },
  journal: {
    getAll: getAllJournalEntries,
    add: addJournalEntry
  },
  income: {
    getAll: getAllIncomeEntries,
    add: addIncomeEntry
  },
  debt: {
    getAll: getAllDebtEntries,
    add: addDebtEntry,
    update: updateDebtEntry,
    delete: deleteDebtEntry
  },
  workdays: {
    getAll: getAllWorkdays,
    saveAll: saveAllWorkdays
  }
};

console.log('📦 تم تحميل عميل Supabase');
