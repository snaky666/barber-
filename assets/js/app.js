import { supabase, fetchBookingsByDate, realtimeSubscribeBookings } from './supabase-client.js';
import { loadLocale, applyTranslations } from './i18n.js';

const DEFAULT_USER = { username: 'younes', password: 'younes' };
let state = { locale: localStorage.getItem('locale') || 'ar' };

async function init(){
  try{
    const dict = await loadLocale(state.locale);
    applyTranslations(dict);
  }catch(e){
    // ignore if i18n not found
  }

  const form = document.getElementById('booking-form');
  if(form){
    form.addEventListener('submit', async e =>{
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      if(!data.first_name || !data.last_name || !data.day_date) return alert('اكمل المعلومات');

      const day = data.day_date;
      const bookings = await fetchBookingsByDate(day).catch(()=>[]);
      const CAPACITY = parseInt(localStorage.getItem(`cap_${day}`) || '6', 10);
      if(bookings.length >= CAPACITY) return alert('اليوم ممتلئ');

      const { error } = await supabase.from('bookings').insert([{...data, status:'pending'}]);
      if(error) return alert('خطأ: '+error.message);
      await supabase.from('journal').insert([{event_type:'booking_create', details:data}]);
      alert('تم الحجز');
      form.reset();
    });
  }

  const adminForm = document.getElementById('admin-login');
  if(adminForm){
    adminForm.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(adminForm);
      const { username, password } = Object.fromEntries(fd.entries());
      if(adminLogin(username, password)){
        document.getElementById('admin-area').style.display = 'block';
        adminForm.parentElement.style.display = 'none';
      } else alert('معلومات الدخول خاطئة');
    });
  }

  realtimeSubscribeBookings(payload => {
    console.log('Realtime payload', payload);
  });
}

export function adminLogin(username, password){
  const ok = username === DEFAULT_USER.username && password === DEFAULT_USER.password;
  if(ok){
    localStorage.setItem('admin_auth','1');
    return true;
  }
  return false;
}

window.addEventListener('DOMContentLoaded', init);
