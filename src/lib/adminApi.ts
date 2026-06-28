import api from './api';

export type UserRole = 'USER' | 'ADMIN' | 'EXPERT';
export type UserGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER';

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER' | null;
  role: UserRole;
  grade: UserGrade;
  exp: number;
  banned: boolean;
  bannedAt: string | null;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminReportedPost {
  id: number;
  title: string;
  authorNickname: string;
  category: string;
  reportCount: number;
  isHidden: boolean;
  createdAt: string;
}

export interface MaintenanceStatus {
  active: boolean;
  currentlyActive: boolean;
  startAt: string | null;
  endAt: string | null;
  message: string | null;
  updatedAt: string;
}

export const maintenanceApi = {
  get: () => api.get<MaintenanceStatus>('/api/maintenance'),
  update: (data: { active: boolean; startAt: string | null; endAt: string | null; message: string | null }) =>
    api.put<MaintenanceStatus>('/api/admin/maintenance', data),
};

export interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const noticeApi = {
  getAll: () => api.get<Notice[]>('/api/notices'),
  create: (data: { title: string; content: string }) => api.post<Notice>('/api/admin/notices', data),
  update: (id: number, data: { title: string; content: string }) => api.put<Notice>(`/api/admin/notices/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/notices/${id}`),
};

export const adminReportApi = {
  getReportedPosts: (params?: { page?: number; size?: number }) =>
    api.get<Page<AdminReportedPost>>('/api/admin/reports/posts', { params }),

  hidePost: (id: number) =>
    api.post<AdminReportedPost>(`/api/admin/reports/posts/${id}/hide`),

  deletePost: (id: number) =>
    api.delete(`/api/admin/reports/posts/${id}`),
};

export interface AdminPostSummary {
  id: number;
  title: string;
  category: string;
  isAnonymous: boolean;
  authorNickname: string;
  totalVoteCount: number;
  voteOptionCount: number;
  isResultHidden: boolean;
  voteExpiresAt: string | null;
  createdAt: string;
}

export const featuredPostApi = {
  get: () => api.get<AdminPostSummary>('/api/admin/featured-post'),
  set: (postId: number) => api.put<AdminPostSummary>('/api/admin/featured-post', { postId }),
  clear: () => api.delete('/api/admin/featured-post'),
};

export const adminPostApi = {
  getPosts: (params?: { page?: number; size?: number; category?: string; keyword?: string }) =>
    api.get<Page<AdminPostSummary>>('/api/posts', {
      params: { ...params, sort: 'createdAt,desc' },
    }),
};

export interface AdminMessage {
  id: number;
  content: string;
  createdAt: string;
}

export const adminUserApi = {
  getUsers: (params: { search?: string; banned?: boolean; page?: number; size?: number }) =>
    api.get<Page<AdminUser>>('/api/admin/users', { params }),

  getUser: (id: number) =>
    api.get<AdminUser>(`/api/admin/users/${id}`),

  ban: (id: number) =>
    api.post<AdminUser>(`/api/admin/users/${id}/ban`),

  unban: (id: number) =>
    api.post<AdminUser>(`/api/admin/users/${id}/unban`),

  changeRole: (id: number, role: UserRole) =>
    api.patch<AdminUser>(`/api/admin/users/${id}/role`, { role }),

  getMessages: (id: number) =>
    api.get<AdminMessage[]>(`/api/admin/users/${id}/messages`),

  sendMessage: (id: number, content: string) =>
    api.post<AdminMessage>(`/api/admin/users/${id}/messages`, { content }),
};
