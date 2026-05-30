const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) errorMsg = body.error
    } catch { /* ignore parse errors */ }
    throw new Error(errorMsg)
  }
  return res.json() as Promise<T>
}
