export async function loadLocale(locale){
  const res = await fetch(`/i18n/${locale}.json`);
  const data = await res.json();
  return data;
}

export function applyTranslations(dict){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(dict[key]){
      if(el.placeholder) el.placeholder = dict[key];
      else el.textContent = dict[key];
    }
  });
}
