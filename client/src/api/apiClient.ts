// client/src/api/apiClient.ts

const API_BASE_URL = "";

// 共通レスポンス処理
async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = "API Error";
    try {
      const data = await res.json();
      errorMessage = data.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return res.json();
}

// GET
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(res);
}

// POST
export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

// 将来拡張用（PUT / DELETE なども追加しやすい構造）
export const api = {
  get: apiGet,
  post: apiPost,
};
