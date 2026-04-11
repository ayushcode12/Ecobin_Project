import axios from 'axios';

const API_URL = 'http://localhost:8082/api';
const MODEL_API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const LOCAL_SCAN_ACTIVITY_KEY = 'ecobin_local_scan_activity';

const readLocalScanActivitySafe = () => {
    try {
        const raw = localStorage.getItem(LOCAL_SCAN_ACTIVITY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const saveLocalScanActivity = (requestPayload, responsePayload) => {
    const existing = readLocalScanActivitySafe();
    const entry = {
        id: `local-${Date.now()}`,
        textDescription: requestPayload?.textDescription || '',
        imageUrl: requestPayload?.imageUrl || 'https://placehold.co/400',
        categoryType: responsePayload?.categoryType || 'Unknown',
        matchedKeyword: responsePayload?.matchedKeyword || null,
        rulePriority: responsePayload?.rulePriority ?? null,
        pointsAwarded: responsePayload?.pointsAwarded ?? responsePayload?.pointsEarned ?? 0,
        createdAt: new Date().toISOString(),
        source: 'LOCAL_FALLBACK',
    };

    try {
        localStorage.setItem(LOCAL_SCAN_ACTIVITY_KEY, JSON.stringify([entry, ...existing].slice(0, 100)));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ecobin-scan-saved'));
        }
    } catch (error) {
        // ignore local fallback storage errors
    }
};

const categoryToBinColor = (categoryType) => {
    if (categoryType === 'Biodegradable') return 'Green';
    if (categoryType === 'Recyclable') return 'Blue';
    if (categoryType === 'Non-Biodegradable') return 'Black';
    return 'Grey';
};

const buildLiveStatusMessage = (categoryType, confidence) => {
    if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
        return 'Reading live camera frame...';
    }
    if (confidence >= 0.8) {
        return `Stable ${categoryType} detection. Confirm to award points.`;
    }
    if (confidence >= 0.6) {
        return `Model is leaning toward ${categoryType}. Hold the item steady.`;
    }
    return 'Detection is still uncertain. Keep the object inside the box.';
};

const buildLocalScanResponse = (entries) => ({
    data: Array.isArray(entries) ? entries : [],
});

const previewLiveWasteDirect = async (imageUrl) => {
    const response = await axios.post(`${MODEL_API_URL}/predict`, { image: imageUrl }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const categoryType = response?.data?.prediction || 'Unknown';
    const parsedConfidence = Number(response?.data?.confidence);
    const confidence = Number.isFinite(parsedConfidence) ? parsedConfidence : null;

    return {
        data: {
            categoryType,
            binColor: categoryToBinColor(categoryType),
            confidence,
            rawLabel: response?.data?.rawLabel || null,
            statusMessage: buildLiveStatusMessage(categoryType, confidence),
        },
    };
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto-logout on 401 (expired or invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('token');
            // Avoid redirect loop if already on login/signup
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

export const signup = async (user) => {
    return await api.post('/auth/signup', user);
};

export const getCurrentUser = async () => {
    return await api.get('/users/me');
};

export const getUserStats = async () => {
    return await api.get('/stats/me');
};

export const getRecentActivity = async (filters = {}) => {
    try {
        return await api.get('/scan/recent', { params: { limit: filters.limit || 8 } });
    } catch (error) {
        if (error?.response?.status === 403 || error?.response?.status === 404) {
            try {
                return await api.get('/scans/my', { params: filters });
            } catch (fallbackError) {
                return await api.get('/scan/my', { params: filters });
            }
        }
        if (error?.response?.status === 500) {
            return buildLocalScanResponse(readLocalScanActivitySafe().slice(0, 8));
        }
        throw error;
    }
};

export const scanWaste = async (textDescription, imageUrl) => {
    const payload = { textDescription, imageUrl };
    const response = await api.post('/scan', payload);
    saveLocalScanActivity(payload, response?.data || {});
    return response;
};

export const previewLiveWaste = async (imageUrl) => {
    try {
        return await api.post('/scan/live-preview', { imageUrl });
    } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            throw error;
        }
        return await previewLiveWasteDirect(imageUrl);
    }
};

export const getLeaderboard = async () => {
    return await api.get('/stats/leaderboard');
};

export const getCategories = async () => {
    return await api.get('/categories');
};

export const createWasteRequest = async (request) => {
    return await api.post('/requests', request);
};

export const getMyReports = async (filters = {}) => {
    return await api.get('/requests/my', { params: filters });
};

export const exportMyReportsCsv = async (filters = {}) => {
    return await api.get('/requests/my/export', { params: filters, responseType: 'blob' });
};

export const getAllWasteRequests = async () => {
    return await api.get('/requests');
};

export const updateWasteRequestStatus = async (id, statusUpdate) => {
    return await api.put(`/requests/${id}/status`, statusUpdate);
};

export const assignWastePickup = async (id, date) => {
    return await api.put(`/requests/${id}/pickup`, null, { params: { date } });
};

export const getMyScans = async (filters = {}) => {
    try {
        return await api.get('/scans/my', { params: filters });
    } catch (error) {
        if (error?.response?.status === 403 || error?.response?.status === 404) {
            return await api.get('/scan/my', { params: filters });
        }
        if (error?.response?.status === 500) {
            return buildLocalScanResponse(readLocalScanActivitySafe());
        }
        throw error;
    }
};

export const exportMyScansCsv = async (filters = {}) => {
    try {
        return await api.get('/scans/my/export', { params: filters, responseType: 'blob' });
    } catch (error) {
        if (error?.response?.status === 403 || error?.response?.status === 404) {
            return await api.get('/scan/my/export', { params: filters, responseType: 'blob' });
        }
        throw error;
    }
};

export const getRules = async (categoryType = '') => {
    return await api.get('/rules', {
        params: categoryType ? { categoryType } : {},
    });
};

export const createRule = async (rule) => {
    return await api.post('/rules', rule);
};

export const updateRule = async (id, rule) => {
    return await api.put(`/rules/${id}`, rule);
};

export const deleteRule = async (id) => {
    return await api.delete(`/rules/${id}`);
};

export const previewClassification = async (text) => {
    return await api.get('/rules/preview', { params: { text } });
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export default api;
