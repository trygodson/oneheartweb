export function SET_STORAGE_ITEM(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function GET_STORAGE_ITEM(key) {
  if (localStorage.getItem(key) == 'undefined') return '';
  if (localStorage.getItem(key) == undefined) return '';
  if (localStorage.getItem(key) == 'null') return '';
  if (localStorage.getItem(key) == null) return null;
  if (!localStorage.getItem(key)) return '';
  return JSON.parse(localStorage.getItem(key));
}

export function REMOVE_STORAGE_ITEM(key) {
  return localStorage.removeItem(key);
}
