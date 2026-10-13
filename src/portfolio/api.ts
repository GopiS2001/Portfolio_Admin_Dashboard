import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const api = endpoints.portfolio;

const swrOptions = { revalidateOnFocus: false, keepPreviousData: true };

/** GET a resource and keep it in the SWR cache. */
export function useResource<T>(url: string) {
  const { data, error, isLoading, mutate: refresh } = useSWR<T>(url, fetcher, swrOptions);
  return { data, error, isLoading, refresh };
}

/** Anything that changes website content also changes the dashboard counts. */
const touch = (url: string) => Promise.all([mutate(url), mutate(api.summary)]);

export async function createItem<T>(url: string, body: Partial<T>) {
  const res = await axios.post<T>(url, body);
  await touch(url);
  return res.data;
}

export async function updateItem<T>(url: string, id: number | string, body: Partial<T>) {
  const res = await axios.put<T>(`${url}/${id}`, body);
  await touch(url);
  return res.data;
}

export async function deleteItem(url: string, id: number | string) {
  await axios.delete(`${url}/${id}`);
  await touch(url);
}

export async function reorderItems(url: string, ids: number[]) {
  const res = await axios.patch(`${url}/reorder`, { ids });
  await mutate(url, res.data, { revalidate: false });
}

/** PUT a singleton (profile, settings). */
export async function saveSingleton<T>(url: string, body: Partial<T>) {
  const res = await axios.put<T>(url, body);
  await mutate(url, res.data, { revalidate: false });
  return res.data;
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post<{ url: string }>(api.uploads, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}
