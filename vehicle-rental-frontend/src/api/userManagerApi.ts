import api from './axios'; // Import your team's custom axios instance

export const fetchDashboardData = async () => {
  const response = await api.get('/user-manager/dashboard');
  return response.data;
};

export const fetchKycQueue = async () => {
  const response = await api.get('/user-manager/kyc-queue');
  return response.data;
};

export const approveUserKyc = async (userId: string) => {
  const response = await api.put(`/user-manager/kyc-approve/${userId}`);
  return response.data;
};

export const rejectUserKyc = async (userId: string, reason: string) => {
  const response = await api.put(`/user-manager/kyc-reject/${userId}`, { reason });
  return response.data;
};