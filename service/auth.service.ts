const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function registerUser(body: any) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function loginUser(body: any) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
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

export async function changePassword(body: any, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  return res;
}
