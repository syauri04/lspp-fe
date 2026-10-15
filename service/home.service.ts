const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export interface HeroBannerItem {
  id: number;
  title: {
    en: string;
    id: string;
  };
  summary: {
    en: string;
    id: string;
  };
  image: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface MitraItem {
  id: number;
  name: string;
  logo: string;
  link: string | null;
}

export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  try {
    console.log(
      "Fetching hero banners from API:",
      `${API_BASE_URL}/hero-banners`,
    );
    const res = await fetch(`${API_BASE_URL}/hero-banners`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch hero banners: ${res.status}`);
    }

    const json: ApiResponse<HeroBannerItem> = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return [];
  }
}

export interface AboutHomeData {
  title: {
    en: string;
    id: string;
  };
  desc_home: {
    en: string;
    id: string;
  };
  background_image: string;
}

export interface AboutHomeResponse {
  success: boolean;
  message: string;
  data: AboutHomeData;
}

export async function getAboutHome(): Promise<AboutHomeData | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/about/home`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about home: ${res.status}`);
    }

    const json: AboutHomeResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("Error fetching about home:", error);
    return null;
  }
}

export interface NewsHomeItem {
  title: {
    en: string;
    id: string;
  };
  slug: string;
  summary: {
    en: string;
    id: string;
  };
  image: string;
  date: string;
  count_view: string;
}

export async function getNewsHome(): Promise<NewsHomeItem[]> {
  if (!API_BASE_URL || !API_TOKEN) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/news/home`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch news home: ${res.status}`);
    }

    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching news home:", error);
    return [];
  }
}

export async function getMitras(): Promise<MitraItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/mitras`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) return [];

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching mitras:", error);
    return [];
  }
}
