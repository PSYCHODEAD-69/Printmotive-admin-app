const API_BASE = 'https://printmotive-worker.devpandey618.workers.dev';

export async function apiFetch(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  return data;
}

export async function uploadFile(file, folder = 'products', token) {
  const formData = new FormData();
  formData.append('file', {
    uri:  file.uri,
    name: file.name || `upload_${Date.now()}.jpg`,
    type: file.mimeType || 'image/jpeg',
  });
  formData.append('folder', folder);

  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
  });
  return res.json();
}

// Auth
export const loginApi = (username, password) =>
  apiFetch('/api/auth/login', 'POST', { username, password });

// Products
export const getProducts = () =>
  apiFetch('/api/products', 'GET');

export const addProducts = (products, token) =>
  apiFetch('/api/admin/products', 'POST', products, token);

export const editProduct = (id, data, token) =>
  apiFetch(`/api/admin/products/${id}`, 'PUT', data, token);

export const deleteProduct = (id, token) =>
  apiFetch(`/api/admin/products/${id}`, 'DELETE', null, token);

// Orders
export const getOrders = (token) =>
  apiFetch('/api/admin/orders', 'GET', null, token);

export const deleteOrder = (id, token) =>
  apiFetch(`/api/admin/orders/${id}`, 'DELETE', null, token);

// Reviews
export const getReviews = () =>
  apiFetch('/api/reviews', 'GET');

export const deleteReview = (id, token) =>
  apiFetch(`/api/admin/reviews/${id}`, 'DELETE', null, token);
