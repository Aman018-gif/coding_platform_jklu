import api from './client';

export const fetchPresets = async () => {
    const { data } = await api.get('/contests/presets');
    return data.presets;
};

export const fetchStudentRoster = async (group) => {
    const { data } = await api.get(`/users/students?group=${encodeURIComponent(group)}`);
    return data.students;
};

export const fetchMyContests = async () => {
    const { data } = await api.get('/contests/my');
    return data.contests || [];
};

export const createContest = async (contestData) => {
    const { data } = await api.post('/contests', contestData);
    return data;
};

export const updateContest = async (id, contestData) => {
    const { data } = await api.put(`/contests/${id}`, contestData);
    return data;
};

export const deleteContest = async (id) => {
    const { data } = await api.delete(`/contests/${id}`);
    return data;
};

export const fetchContestBySlug = async (slug) => {
    const { data } = await api.get(`/contests/slug/${slug}`);
    return data.contest;
};

export const fetchContestById = async (id) => {
    const { data } = await api.get(`/contests/${id}`);
    return data.contest;
};

export const addProblemsToContest = async (id, problemIds) => {
    const { data } = await api.post(`/contests/${id}/problems`, { problemIds });
    return data.contest;
};

export const createProblem = async (problemData) => {
    const { data } = await api.post('/problems', problemData);
    return data.problem;
};
