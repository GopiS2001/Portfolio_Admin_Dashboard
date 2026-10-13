import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Optional: Add token (if using auth)
 *
 axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*
*/

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nest validation errors come back as an array of messages
    const raw = error?.response?.data?.message;
    const message =
      (Array.isArray(raw) ? raw.join(', ') : raw) || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  portfolio: {
    summary: '/api/dashboard/summary',
    snapshot: '/api/site/snapshot',
    health: '/api/health',
    profile: '/api/profile',
    settings: '/api/settings',
    sections: '/api/sections',
    stats: '/api/stats',
    aboutParagraphs: '/api/about-paragraphs',
    highlights: '/api/highlights',
    skillGroups: '/api/skill-groups',
    marquee: '/api/marquee',
    experiences: '/api/experiences',
    projects: '/api/projects',
    messages: '/api/messages',
    uploads: '/api/uploads',
    account: '/api/auth/account',
    password: '/api/auth/password',
  },
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
} as const;
