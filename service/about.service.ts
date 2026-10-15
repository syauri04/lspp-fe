const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export interface AboutDetailData {
  title: { en: string; id: string };
  desc_detail: { en: string; id: string };
  vision: { en: string; id: string };
  image_vision: string;
  mission: { en: string; id: string };
  image_mission: string;
  background_image: string;
}

export interface AboutDetailResponse {
  success: boolean;
  message: string;
  data: AboutDetailData;
}

export interface OrganizationMember {
  name: string;
  position: { en: string; id: string };
  photo: string;
  linkedin_url: string;
  instagram_url: string;
}

export interface OrganizationDivision {
  division_name: { en: string; id: string };
  members: OrganizationMember[];
}

export interface OrganizationResponse {
  success: boolean;
  message: string;
  data: OrganizationDivision[];
}

export interface TUKLocationItem {
  title: string;
  city: string;
  address: string;
  open_days: string;
  open_hours: string;
  google_maps_url: string;
}

export interface TUKLocationResponse {
  success: boolean;
  message: string;
  data: TUKLocationItem[];
}

export async function getAboutDetail(): Promise<AboutDetailData | null> {
  if (!API_BASE_URL || !API_TOKEN) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/about/detail`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Failed to fetch about detail: ${res.status}`);
    const json: AboutDetailResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("Error fetching about detail:", error);
    return null;
  }
}

export async function getOrganization(): Promise<OrganizationDivision[]> {
  if (!API_BASE_URL || !API_TOKEN) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/struktur-organisasi`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Failed to fetch organization: ${res.status}`);
    const json: OrganizationResponse = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching organization:", error);
    return [];
  }
}

export async function getTUKLocations(): Promise<TUKLocationItem[]> {
  if (!API_BASE_URL || !API_TOKEN) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/lokasi-tuk`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok)
      throw new Error(`Failed to fetch TUK locations: ${res.status}`);
    const json: TUKLocationResponse = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching TUK locations:", error);
    return [];
  }
}
