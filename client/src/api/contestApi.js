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
