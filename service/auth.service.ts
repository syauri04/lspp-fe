const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** lang: bahasa halaman, dikirim sebagai header X-Locale agar pesan validasi BE sesuai bahasa (id/en). */
export async function registerUser(body: any, lang: string = "id") {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Locale": lang,
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function loginUser(body: any, lang: string = "id") {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Locale": lang,
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function verifyEmailLink(queryString: string) {
  const res = await fetch(`${API_BASE_URL}/auth/email/verify${queryString}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  return res;
}

export async function resendVerification(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/email/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return res;
}

export async function loginGoogle(idToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });
  return res;
}

export async function updateProfile(body: FormData, token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body,
  });
  return res;
}

/** Akun Google belum punya password: buat password pertama kali (tanpa password lama). */
export async function setPassword(
  body: { password: string; password_confirmation: string },
  token: string,
) {
  return fetch(`${API_BASE_URL}/auth/set-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

/** Data akun terbaru dari server (mis. untuk menyegarkan has_password di localStorage). */
export async function getMe(token: string) {
  return fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/** Gabungkan pesan validasi 422 Laravel ({errors: {field: [..]}}) menjadi satu teks. */
export function pesanErrorApi(result: any, cadangan: string): string {
  const errors = result?.errors as Record<string, string[]> | undefined;
  if (errors) {
    const semua = Object.values(errors).flat().filter(Boolean);
    if (semua.length > 0) return semua.join(" ");
  }
  return result?.message || cadangan;
}

export async function changePassword(body: any, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  return res;
}

/**
 * Cek aturan password di browser (sama dengan lspp-be: min. 8 karakter, huruf besar & kecil, angka, simbol)
 * agar asesi langsung tahu kekurangannya tanpa menghabiskan captcha. Server tetap memvalidasi ulang.
 */
export function cekAturanPassword(password: string, lang: string): string[] {
  const en = lang === "en";
  const kurang: string[] = [];
  if (password.length < 8) kurang.push(en ? "at least 8 characters" : "minimal 8 karakter");
  if (!/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password))
    kurang.push(en ? "uppercase and lowercase letters" : "huruf besar dan huruf kecil");
  if (!/\p{N}/u.test(password)) kurang.push(en ? "at least one number" : "minimal satu angka");
  if (!/[\p{P}\p{S}\p{Z}]/u.test(password)) kurang.push(en ? "at least one symbol (e.g. ! @ # ?)" : "minimal satu simbol (mis. ! @ # ?)");
  return kurang;
}
