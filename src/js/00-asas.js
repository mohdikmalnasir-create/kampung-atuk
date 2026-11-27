const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, ch => '&#'+ch.charCodeAt(0)+';');
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : v; } catch(e) { return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch(e) {} }
};
