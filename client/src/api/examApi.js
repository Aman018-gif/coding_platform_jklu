import api from './client';

export const fetchMyExams = async () => {
    const { data } = await api.get('/exams/my');
    return data.exams || [];
};

export const fetchExamsForClass = async (classId) => {
    const { data } = await api.get(`/exams/class/${classId}`);
    return data.exams || [];
};

export const createExam = async (examData) => {
    const { data } = await api.post('/exams', examData);
    // useContestForm reads response.contest._id — map exam → contest key
    return { contest: data.exam };
};

export const updateExam = async (id, examData) => {
    const { data } = await api.put(`/exams/${id}`, examData);
    return data;
};

export const deleteExam = async (id) => {
    const { data } = await api.delete(`/exams/${id}`);
    return data;
};

export const fetchExamById = async (id) => {
    const { data } = await api.get(`/exams/${id}`);
    return data.exam;
};

export const fetchExamBySlug = async (slug) => {
    const { data } = await api.get(`/exams/slug/${slug}`);
    return data.exam;
};

export const addProblemsToExam = async (id, problemIds) => {
    const { data } = await api.post(`/exams/${id}/problems`, { problemIds });
    return data.exam;
};
