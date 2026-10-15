const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export interface GalleryItem {
  id: number;
  slug: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  cover_image: string;
  event_date: string;
  photos_count: string;
}

export interface GalleryPhoto {
  id: number;
  image: string;
  caption: { id: string; en: string };
  sort_order: string;
}

export interface GalleryDetail {
  id: number;
  slug: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  cover_image: string;
  event_date: string;
  photos: GalleryPhoto[];
}

export interface GalleryListResponse {
  data: GalleryItem[];
}

export interface GalleryDetailResponse {
  data: GalleryDetail;
}

export async function getGalleryList(): Promise<GalleryListResponse | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/gallery`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Failed to fetch gallery list: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching gallery list:", error);
    return null;
  }
}

export async function getGalleryDetail(
  slug: string,
): Promise<GalleryDetail | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/gallery/${slug}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok)
      throw new Error(`Failed to fetch gallery detail: ${res.status}`);
    const json: GalleryDetailResponse = await res.json();
    return json.data || null;
  } catch (error) {
    console.error(`Error fetching gallery detail for slug ${slug}:`, error);
    return null;
  }
}
