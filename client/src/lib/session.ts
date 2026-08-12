/**
 * Identidad del cliente en este dispositivo.
 * Cada navegador/móvil recibe un ID único persistente en localStorage.
 */
const ID_KEY = 'motocar:customerId';
const NAME_KEY = 'motocar:customerName';

export function getCustomerId(): string {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = `cust-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function getCustomerName(): string {
  return localStorage.getItem(NAME_KEY) || 'Cliente Pro';
}

export function setCustomerName(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim() || 'Cliente Pro');
}
