/**
 * Detección de actualizaciones del build desplegado.
 * El servidor expone GET /api/version y devuelve una huella única por build.
 * La comparamos contra lo que quedó guardado en el dispositivo para saber
 * si el cliente instalado (p. ej. PWA en iOS) quedó desactualizado.
 */
const STORAGE_KEY = 'mc_app_version';

export interface AppVersionResponse {
  version: string;
}

export async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch('/api/version', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as AppVersionResponse;
    return data.version || null;
  } catch {
    return null;
  }
}

export function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeVersion(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    /* almacenamiento no disponible */
  }
}
