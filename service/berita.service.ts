const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export interface NewsItem {
  title: { en: string; id: string };
  slug: string;
  summary: { en: string; id: string };
  image: string;
  date: string;
  count_view: string;
}

export interface NewsDetailItem extends Omit<NewsItem, "count_view"> {
  content: { en: string; id: string };
  source: string;
}

export interface NewsListResponse {
  success: boolean;
  message: string;
  data: NewsItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface NewsDetailResponse {
  success: boolean;
  message: string;
  data: NewsDetailItem;
}

export interface FetchNewsParams {
  search?: string;
  category_id?: string;
  sort?: "latest" | "oldest" | "popular";
  page?: number;
}

export async function getNewsList(
  params: FetchNewsParams = {},
): Promise<NewsListResponse | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;

  try {
    const url = new URL(`${API_BASE_URL}/news/home`);
    if (params.search) url.searchParams.append("search", params.search);
    if (params.category_id)
      url.searchParams.append("category_id", params.category_id);
    if (params.sort) url.searchParams.append("sort", params.sort);
    if (params.page) url.searchParams.append("page", params.page.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Failed to fetch news list: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching news list:", error);
    return null;
  }
}

export async function getNewsDetail(
  slug: string,
): Promise<NewsDetailItem | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/news/${slug}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Failed to fetch news detail: ${res.status}`);
    const json: NewsDetailResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error(`Error fetching news detail for slug ${slug}:`, error);
    return null;
  }
}
