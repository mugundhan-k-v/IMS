import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export async function getProducts() {
  const res = await client.get('/products');
  return res.data;
}

export async function login(payload) {
  const res = await client.post('/auth/login', payload);
  return res.data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await client.put('/auth/password', { currentPassword, newPassword });
  return res.data;
}

export async function getProduct(id) {
  const res = await client.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(payload) {
  const res = await client.post('/products', payload);
  return res.data;
}

export async function updateProduct(id, payload) {
  const res = await client.put(`/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await client.delete(`/products/${id}`);
  return res.data;
}

export async function getLowStock() {
  const res = await client.get('/lowstock');
  return res.data;
}

export async function getSuppliers() {
  const res = await client.get('/suppliers');
  return res.data;
}

export async function createSupplier(payload) {
  const res = await client.post('/suppliers', payload);
  return res.data;
}

export async function getSupplier(id) {
  const res = await client.get(`/suppliers/${id}`);
  return res.data;
}

export async function updateSupplier(id, payload) {
  const res = await client.put(`/suppliers/${id}`, payload);
  return res.data;
}

export async function deleteSupplier(id) {
  const res = await client.delete(`/suppliers/${id}`);
  return res.data;
}

export async function getNotifications() {
  const res = await client.get('/notifications');
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await client.put(`/notifications/${id}/read`);
  return res.data;
}


export default client;
