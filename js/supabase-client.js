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
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(b => ({
      ...b,
      dayKey: b.daykey,
      timeSlot: b.timeslot,
      createdAt: b.created_at
    }));
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    return [];
  }
}

async function addBooking(booking) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbBooking = {
      id: booking.id,
      name: booking.name || '',
      surname: booking.surname || '',
      phone: booking.phone || '',
      daykey: booking.dayKey || '',
      timeslot: booking.timeSlot || '',
      completed: booking.completed || false,
      paid: booking.paid || false
    };
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .insert([dbBooking])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
      result.timeSlot = result.timeslot;
      result.createdAt = result.created_at;
    }
    return result;
  } catch (error) {
    console.error('خطأ في إضافة حجز:', error);
    throw error;
  }
}

async function updateBooking(id, updates) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbUpdates = { ...updates };
    if (dbUpdates.dayKey) {
      dbUpdates.daykey = dbUpdates.dayKey;
      delete dbUpdates.dayKey;
    }
    if (dbUpdates.timeSlot) {
      dbUpdates.timeslot = dbUpdates.timeSlot;
      delete dbUpdates.timeSlot;
    }
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.BOOKINGS)
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
      result.timeSlot = result.timeslot;
    }
    return result;
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
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(d => ({
      ...d,
      dayKey: d.daykey
    }));
  } catch (error) {
    console.error('خطأ في جلب الأيام الملغاة:', error);
    return [];
  }
}

async function addCancelledDay(day) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbDay = {
      ...day,
      daykey: day.dayKey
    };
    delete dbDay.dayKey;
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.CANCELLED_DAYS)
      .insert([dbDay])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
    }
    return result;
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
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(a => ({
      ...a,
      text: a.message,
      ts: a.created_at
    }));
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return [];
  }
}

async function addAnnouncement(announcement) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbAnnouncement = {
      id: announcement.id,
      message: announcement.text || announcement.message,
      type: announcement.type || 'user'
    };
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ANNOUNCEMENTS)
      .insert([dbAnnouncement])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.text = result.message;
      result.ts = result.created_at;
    }
    return result;
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
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(j => ({
      ...j,
      msg: j.action,
      ts: j.timestamp
    }));
  } catch (error) {
    console.error('خطأ في جلب السجل:', error);
    return [];
  }
}

async function addJournalEntry(entry) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbEntry = {
      id: entry.id,
      action: entry.msg || entry.action,
      timestamp: entry.ts || entry.timestamp
    };
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.JOURNAL)
      .insert([dbEntry])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.msg = result.action;
      result.ts = result.timestamp;
    }
    return result;
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
      .order('created_at', { ascending: false});

    if (error) throw error;
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(i => ({
      ...i,
      dayKey: i.daykey,
      bookingId: i.booking_id,
      clientName: i.client_name,
      wasDebt: i.was_debt
    }));
  } catch (error) {
    console.error('خطأ في جلب الدخل:', error);
    return [];
  }
}

async function addIncomeEntry(entry) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbEntry = {
      id: entry.id,
      booking_id: entry.bookingId,
      client_name: entry.clientName,
      daykey: entry.dayKey,
      amount: entry.amount,
      timestamp: entry.ts || entry.timestamp,
      was_debt: entry.wasDebt || false
    };
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.INCOME)
      .insert([dbEntry])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
      result.bookingId = result.booking_id;
      result.clientName = result.client_name;
      result.wasDebt = result.was_debt;
      result.ts = result.timestamp;
    }
    return result;
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
    
    // تحويل من صيغة قاعدة البيانات إلى صيغة التطبيق
    return (data || []).map(d => ({
      ...d,
      dayKey: d.daykey,
      bookingId: d.booking_id,
      dayLabel: d.daykey ? new Date(d.daykey + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
      ts: d.timestamp
    }));
  } catch (error) {
    console.error('خطأ في جلب الديون:', error);
    return [];
  }
}

async function addDebtEntry(entry) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbEntry = {
      id: entry.id,
      booking_id: entry.bookingId,
      name: entry.name,
      surname: entry.surname,
      phone: entry.phone || '',
      daykey: entry.dayKey,
      amount: entry.amount,
      timestamp: entry.ts || entry.timestamp,
      paid: entry.paid || false
    };
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .insert([dbEntry])
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
      result.bookingId = result.booking_id;
      result.dayLabel = result.daykey ? new Date(result.daykey + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
      result.ts = result.timestamp;
    }
    return result;
  } catch (error) {
    console.error('خطأ في إضافة دين:', error);
    throw error;
  }
}

async function updateDebtEntry(id, updates) {
  try {
    // تحويل من صيغة التطبيق إلى صيغة قاعدة البيانات
    const dbUpdates = { ...updates };
    if (dbUpdates.dayKey) {
      dbUpdates.daykey = dbUpdates.dayKey;
      delete dbUpdates.dayKey;
    }
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.DEBT)
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    const result = data ? data[0] : null;
    if (result) {
      result.dayKey = result.daykey;
    }
    return result;
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
// دوال CRUD لبيانات المستخدم الإداري (Admin Credentials)
// ═══════════════════════════════════════════════════════════

async function getAdminCredentials() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ADMIN_CREDENTIALS)
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // إذا لم توجد بيانات، نرجع القيم الافتراضية
      if (error.code === 'PGRST116') {
        return { user: 'younes', pass: 'younes' };
      }
      throw error;
    }
    
    return data || { user: 'younes', pass: 'younes' };
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    return { user: 'younes', pass: 'younes' };
  }
}

async function updateAdminCredentials(credentials) {
  try {
    // التحقق من وجود سجل
    const { data: existing } = await supabaseClient
      .from(SUPABASE_CONFIG.tables.ADMIN_CREDENTIALS)
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // تحديث السجل الموجود
      const { data, error } = await supabaseClient
        .from(SUPABASE_CONFIG.tables.ADMIN_CREDENTIALS)
        .update({
          user: credentials.user,
          pass: credentials.pass,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      return data ? data[0] : null;
    } else {
      // إنشاء سجل جديد
      const { data, error } = await supabaseClient
        .from(SUPABASE_CONFIG.tables.ADMIN_CREDENTIALS)
        .insert([{
          user: credentials.user,
          pass: credentials.pass
        }])
        .select();

      if (error) throw error;
      return data ? data[0] : null;
    }
  } catch (error) {
    console.error('خطأ في تحديث بيانات المستخدم:', error);
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
  },
  adminCredentials: {
    get: getAdminCredentials,
    update: updateAdminCredentials
  }
};

console.log('📦 تم تحميل عميل Supabase');
