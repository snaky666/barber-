// js/supabase-client.js
// عميل Supabase للتعامل مع قاعدة البيانات

let supabaseClient = null;

// تهيئة عميل Supabase
function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('❌ مكتبة Supabase غير محملة! تأكد من تحميل السكريبت في HTML');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    console.log('✅ تم الاتصال بقاعدة البيانات Supabase');
  }

  return supabaseClient;
}

// ====================
// دوال الحجوزات (Bookings)
// ====================

async function getAllBookings() {
  try {
    const client = initSupabase();
    const { data, error } = await client
      .from(SUPABASE_CONFIG.tables.bookings)
      .select('*')
      .order('daykey', { ascending: true })
      .order('createdat', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    return [];
  }
}

async function getBookingsByDay(dayKey) {
  try {
    const client = initSupabase();
    const { data, error } = await client
      .from(SUPABASE_CONFIG.tables.bookings)
      .select('*')
      .eq('daykey', dayKey)
      .order('createdat', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error);
    return [];
  }
}

async function addBooking(booking) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.bookings)
    .insert([booking])
    .select();

  if (error) {
    console.error('خطأ في إضافة حجز:', error);
    throw error;
  }

  return data[0];
}

async function updateBooking(id, updates) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.bookings)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('خطأ في تحديث الحجز:', error);
    throw error;
  }

  return data[0];
}

async function deleteBooking(id) {
  const client = initSupabase();
  const { error } = await client
    .from(SUPABASE_CONFIG.tables.bookings)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('خطأ في حذف الحجز:', error);
    throw error;
  }
}

async function saveAllBookings(bookings) {
  const client = initSupabase();

  // حذف جميع الحجوزات الحالية ثم إدراج الجديدة
  await client.from(SUPABASE_CONFIG.tables.bookings).delete().neq('id', '');

  if (bookings.length > 0) {
    const { error } = await client
      .from(SUPABASE_CONFIG.tables.bookings)
      .insert(bookings);

    if (error) {
      console.error('خطأ في حفظ الحجوزات:', error);
      throw error;
    }
  }
}

// ====================
// دوال الأيام الملغاة (Cancelled Days)
// ====================

async function getAllCancelledDays() {
  try {
    const client = initSupabase();
    const { data, error } = await client
      .from(SUPABASE_CONFIG.tables.cancelled)
      .select('*')
      .order('ts', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب الأيام الملغاة:', error);
    return [];
  }
}

async function addCancelledDay(cancelledDay) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.cancelled)
    .insert([cancelledDay])
    .select();

  if (error) {
    console.error('خطأ في إضافة يوم ملغى:', error);
    throw error;
  }

  return data[0];
}

async function deleteCancelledDay(dayKey) {
  try {
    const client = initSupabase();
    const { error } = await client
      .from(SUPABASE_CONFIG.tables.cancelled)
      .delete()
      .eq('daykey', dayKey);

    if (error) throw error;
  } catch (error) {
    console.error('خطأ في حذف اليوم الملغى:', error);
    throw error;
  }
}

// ====================
// دوال الإعلانات (Announcements)
// ====================

async function getAllAnnouncements() {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.annonces)
    .select('*')
    .order('ts', { ascending: false });

  if (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return [];
  }

  return data || [];
}

async function addAnnouncement(announcement) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.annonces)
    .insert([announcement])
    .select();

  if (error) {
    console.error('خطأ في إضافة إعلان:', error);
    throw error;
  }

  return data[0];
}

async function deleteAnnouncement(id) {
  const client = initSupabase();
  const { error } = await client
    .from(SUPABASE_CONFIG.tables.annonces)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('خطأ في حذف الإعلان:', error);
    throw error;
  }
}

// ====================
// دوال السجل (Journal)
// ====================

async function getAllJournal() {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.journal)
    .select('*')
    .order('ts', { ascending: false })
    .limit(100);

  if (error) {
    console.error('خطأ في جلب السجل:', error);
    return [];
  }

  return data || [];
}

async function addJournalEntry(entry) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.journal)
    .insert([entry])
    .select();

  if (error) {
    console.error('خطأ في إضافة سجل:', error);
    throw error;
  }

  return data[0];
}

// ====================
// دوال الدخل (Income)
// ====================

async function getAllIncome() {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.income)
    .select('*')
    .order('ts', { ascending: false });

  if (error) {
    console.error('خطأ في جلب الدخل:', error);
    return [];
  }

  return data || [];
}

async function addIncome(income) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.income)
    .insert([income])
    .select();

  if (error) {
    console.error('خطأ في إضافة دخل:', error);
    throw error;
  }

  return data[0];
}

// ====================
// دوال الديون (Debt)
// ====================

async function getAllDebt() {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.debt)
    .select('*')
    .order('ts', { ascending: false });

  if (error) {
    console.error('خطأ في جلب الديون:', error);
    return [];
  }

  return data || [];
}

async function addDebt(debt) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.debt)
    .insert([debt])
    .select();

  if (error) {
    console.error('خطأ في إضافة دين:', error);
    throw error;
  }

  return data[0];
}

async function updateDebt(id, updates) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.debt)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('خطأ في تحديث الدين:', error);
    throw error;
  }

  return data[0];
}

async function deleteDebt(id) {
  const client = initSupabase();
  const { error } = await client
    .from(SUPABASE_CONFIG.tables.debt)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('خطأ في حذف الدين:', error);
    throw error;
  }
}

// ====================
// دوال أيام العمل (Work Days)
// ====================

async function getAllWorkDays() {
  try {
    const client = initSupabase();
    const { data, error } = await client
      .from(SUPABASE_CONFIG.tables.workdays)
      .select('*')
      .order('dayofweek', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('خطأ في جلب أيام العمل:', error);
    return [];
  }
}

async function addWorkDay(workday) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.workdays)
    .insert([workday])
    .select();

  if (error) {
    console.error('خطأ في إضافة يوم عمل:', error);
    throw error;
  }

  return data[0];
}

async function updateWorkDay(dayOfWeek, updates) {
  const client = initSupabase();
  const { data, error } = await client
    .from(SUPABASE_CONFIG.tables.workdays)
    .update(updates)
    .eq('dayofweek', dayOfWeek)
    .select();

  if (error) {
    console.error('خطأ في تحديث يوم العمل:', error);
    throw error;
  }

  return data[0];
}

async function deleteWorkDay(dayOfWeek) {
  const client = initSupabase();
  const { error } = await client
    .from(SUPABASE_CONFIG.tables.workdays)
    .delete()
    .eq('dayofweek', dayOfWeek);

  if (error) {
    console.error('خطأ في حذف يوم العمل:', error);
    throw error;
  }
}

async function saveAllWorkDays(workdays) {
  const client = initSupabase();

  await client.from(SUPABASE_CONFIG.tables.workdays).delete().neq('dayofweek', -1);

  if (workdays.length > 0) {
    const { error } = await client
      .from(SUPABASE_CONFIG.tables.workdays)
      .insert(workdays);

    if (error) {
      console.error('خطأ في حفظ أيام العمل:', error);
      throw error;
    }
  }
}

// ====================
// الاشتراك في التحديثات الفورية (Real-time)
// ====================

function subscribeToBookings(callback) {
  const client = initSupabase();

  const subscription = client
    .channel('bookings-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.bookings },
      (payload) => {
        console.log('تحديث في الحجوزات:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

function subscribeToAnnouncements(callback) {
  const client = initSupabase();

  const subscription = client
    .channel('announcements-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.annonces },
      (payload) => {
        console.log('تحديث في الإعلانات:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

console.log('📦 تم تحميل عميل Supabase');