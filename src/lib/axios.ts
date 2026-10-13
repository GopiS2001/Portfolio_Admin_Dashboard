import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';
import { refreshSession, getFreshAccessToken } from 'src/auth/context/jwt/session';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Attach the in-memory access token, refreshing it first when it's about to expire. */
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getFreshAccessToken().catch(() => null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Access token expired or was refused: refresh once and retry. If the refresh itself
    // returns 401 the session has ended — refreshSession() signs the app out.
    const config = error?.config as RetriableConfig | undefined;
    if (error?.response?.status === 401 && config && !config._retried) {
      config._retried = true;
      try {
        const session = await refreshSession();
        if (session) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          return axiosInstance(config);
        }
      } catch {
        // Network error while refreshing — fall through and report the original error
      }
    }

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
