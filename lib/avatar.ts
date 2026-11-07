const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Avatar bawaan (vektor) di storage publik lspp-be: storage/app/public/avatars/default.svg */
export const AVATAR_BAWAAN = (() => {
  try {
    return `${new URL(API_BASE_URL ?? "").origin}/storage/avatars/default.svg`;
  } catch {
    return "/storage/avatars/default.svg";
  }
})();

/**
 * URL avatar untuk ditampilkan: foto asesi (unggahan / Google) -> avatar_url dari API -> avatar bawaan.
 * Data user lama di localStorage (sebelum ada avatar_url) tetap mendapat avatar bawaan.
 */
export function urlAvatar(user: { avatar?: string | null; avatar_url?: string | null } | null | undefined): string {
  return user?.avatar || user?.avatar_url || AVATAR_BAWAAN;
}

/** SVG tidak dioptimasi next/image (perlu `unoptimized`). */
export function avatarSvg(src: string): boolean {
  return /\.svg(\?|$)/i.test(src);
}
