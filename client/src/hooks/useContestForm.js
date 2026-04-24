import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { calcDuration, generateSlug } from '../utils/timeHelpers';
import { createContest, updateContest, deleteContest, fetchStudentRoster, createProblem, addProblemsToContest } from '../api/contestApi';

const TABS = ['Landing Page', 'Problems', 'Moderators', 'Participants'];
const GROUPS = ['First Year', 'Second Year', 'Open'];

const DEFAULT_FORM = {
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    organizer: '',
    participantGroup: '',
    notifyStart: false,
    notifyResults: false,
    bannerImageURL: '',
    description: '',
    isPublic: true,
    isDraft: false,
    markForAttendance: false,
};

export { TABS, GROUPS };

export function validateForm(data) {
    const errors = {};
    if (!data.name?.trim()) {
        errors.name = 'Contest name is required';
    }
    if (data.startDate && data.startTime && data.endDate && data.endTime) {
        const start = new Date(`${data.startDate}T${data.startTime}`);
        const end = new Date(`${data.endDate}T${data.endTime}`);
        if (start >= end) {
            errors.dates = 'End time must be after start time';
        }
    }
    return errors;
}

export function useContestForm(currentUser) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [activeTab, setActiveTab] = useState('Landing Page');
    const [contestCreated, setContestCreated] = useState(false);
    const [problems, setProblems] = useState([]);
    const [moderators, setModerators] = useState(() => {
        if (currentUser) {
            return [{
                name: currentUser.username || currentUser.name || 'You',
                role: 'Owner',
                email: currentUser.email || '',
                isCurrentUser: true,
            }];
        }
        return [];
    });
    const [participantsList, setParticipantsList] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [newProblemId, setNewProblemId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [savedSlug, setSavedSlug] = useState(null);
    const [savedContestId, setSavedContestId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('draftProblems');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setProblems(parsed);
                }
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('draftProblems', JSON.stringify(problems));
    }, [problems]);

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!form.participantGroup || form.participantGroup === 'Public') {
                setParticipantsList([]);
                return;
            }
            setIsLoadingParticipants(true);
            try {
                const students = await fetchStudentRoster(form.participantGroup);
                setParticipantsList(students || []);
            } catch (err) {
                console.error('Failed to fetch participants:', err);
                setParticipantsList([]);
            } finally {
                setIsLoadingParticipants(false);
            }
        };
        fetchParticipants();
    }, [form.participantGroup]);

    const duration = calcDuration(form.startDate, form.startTime, form.endDate, form.endTime);

    const handleFieldChange = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const handleCreateContest = useCallback(async () => {
        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const slug = generateSlug(form.name);
            const start_time = new Date(`${form.startDate}T${form.startTime}`).toISOString();
            const end_time = new Date(`${form.endDate}T${form.endTime}`).toISOString();

            const contestData = {
                name: form.name,
                slug,
                start_time,
                end_time,
                is_active: !form.isDraft,
                organizer: form.organizer,
                markForAttendance: form.markForAttendance,
                moderators: moderators.filter(m => !m.isCurrentUser).map(m => m.email),
                participantGroup: form.participantGroup,
                additionalParticipants: participantsList.map(p => p._id).filter(Boolean),
                notifyStart: form.notifyStart,
                notifyResults: form.notifyResults,
                bannerImageURL: form.bannerImageURL,
                description: form.description,
                isPublic: form.isPublic,
            };

            const response = await createContest(contestData);
            const contestId = response.contest._id;

            if (problems.length > 0) {
                console.log('Saving problems, count:', problems.length);
                const problemIds = [];
                for (let i = 0; i < problems.length; i++) {
                    const problem = problems[i];
                    const testCases = problem.testCases || [];
                    const formattedTestCases = testCases.map(tc => {
                        console.log('Test case:', tc);
                        return {
                            input: tc.input || '',
                            expected_output: tc.output || tc.expectedOutput || '',
                            is_sample: tc.hidden !== true,
                        };
                    });
                    try {
                        const problemData = {
                            title: problem.name,
                            description: problem.description || problem.name || '',
                            difficulty: (problem.difficulty || 'Medium').toUpperCase(),
                            category: problem.category || '',
                            test_cases: formattedTestCases,
                            contest_id: contestId,
                            order_index: i,
                        };
                        console.log('Calling createProblem API with:', problemData);
                        const createdProblem = await createProblem(problemData);
                        console.log('createProblem result:', createdProblem);
                        if (createdProblem && createdProblem._id) {
                            problemIds.push(createdProblem._id);
                        }
                    } catch (err) {
                        console.error('Failed to save problem:', problem.name, err.response?.data || err.message);
                    }
                }
                console.log('Problem IDs collected:', problemIds);
                if (problemIds.length > 0) {
                    console.log('Adding problems to contest:', contestId, problemIds);
                    await addProblemsToContest(contestId, problemIds);
                    console.log('Problems added to contest');
                }
            }

            setSavedSlug(slug);
            setSavedContestId(contestId);
            setContestCreated(true);
            setProblems([]);
            localStorage.removeItem('draftProblems');
            toast.success('Contest created successfully!', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } catch (err) {
            console.error('Create contest error:', err);
            toast.error(err.response?.data?.message || 'Failed to create contest. Please try again.', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [form, moderators, problems]);

    const handleDeleteContest = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const confirmDeleteContest = useCallback(async () => {
        if (!savedContestId) return;
        setIsSubmitting(true);
        try {
            await deleteContest(savedContestId);
            setContestCreated(false);
            setSavedSlug(null);
            setSavedContestId(null);
            setShowDeleteModal(false);
            toast.info('Contest deleted.', {
                position: 'bottom-right',
                autoClose: 2000,
                theme: 'dark',
            });
        } catch (err) {
            console.error('Delete contest error:', err);
            toast.error(err.response?.data?.message || 'Failed to delete contest. Please try again.', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [savedContestId]);

    const cancelDeleteContest = useCallback(() => {
        setShowDeleteModal(false);
    }, []);

    const handleUpdateContest = useCallback(async () => {
        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const slug = generateSlug(form.name);
            const start_time = new Date(`${form.startDate}T${form.startTime}`).toISOString();
            const end_time = new Date(`${form.endDate}T${form.endTime}`).toISOString();

            const contestData = {
                name: form.name,
                slug,
                start_time,
                end_time,
                is_active: !form.isDraft,
                organizer: form.organizer,
                markForAttendance: form.markForAttendance,
                moderators: moderators.filter(m => !m.isCurrentUser).map(m => m.email),
                participantGroup: form.participantGroup,
                additionalParticipants: participantsList.map(p => p._id).filter(Boolean),
                notifyStart: form.notifyStart,
                notifyResults: form.notifyResults,
                bannerImageURL: form.bannerImageURL,
                description: form.description,
                isPublic: form.isPublic,
            };

            await updateContest(savedContestId, contestData);

            if (problems.length > 0) {
                console.log('Updating contest - saving problems, count:', problems.length);
                const problemIds = [];
                for (let i = 0; i < problems.length; i++) {
                    const problem = problems[i];
                    const testCases = problem.testCases || [];
                    const formattedTestCases = testCases.map(tc => ({
                        input: tc.input || '',
                        expected_output: tc.output || tc.expectedOutput || '',
                        is_sample: tc.hidden !== true,
                    }));
                    try {
                        const problemData = {
                            title: problem.name,
                            description: problem.description || problem.name || '',
                            difficulty: (problem.difficulty || 'Medium').toUpperCase(),
                            category: problem.category || '',
                            test_cases: formattedTestCases,
                            contest_id: savedContestId,
                            order_index: i,
                        };
                        const createdProblem = await createProblem(problemData);
                        if (createdProblem && createdProblem._id) {
                            problemIds.push(createdProblem._id);
                        }
                    } catch (err) {
                        console.error('Failed to save problem during update:', problem.name, err);
                    }
                }
                if (problemIds.length > 0) {
                    await addProblemsToContest(savedContestId, problemIds);
                }
            }

            toast.success('Contest updated successfully!', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } catch (err) {
            console.error('Update contest error:', err);
            toast.error(err.response?.data?.message || 'Failed to update contest. Please try again.', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [form, moderators, problems, savedContestId]);

    const handleAddProblem = useCallback((problem) => {
        const nextId = String.fromCharCode(65 + problems.length);
        const entry = {
            id: nextId,
            name: problem.title,
            score: problem.score || 100,
            description: problem.description || '',
            difficulty: problem.difficulty || 'Medium',
            category: problem.category || '',
            testCases: problem.testCases || [],
        };
        setProblems((prev) => [...prev, entry]);
        setNewProblemId(nextId);
        toast.success('Problem added — it will be saved when the contest is published', {
            position: 'bottom-right',
            autoClose: 3000,
            theme: 'dark',
        });
        setTimeout(() => setNewProblemId(null), 3000);
    }, [problems.length]);

    return {
        form,
        duration,
        activeTab,
        contestCreated,
        savedSlug,
        savedContestId,
        setSavedSlug,
        setSavedContestId,
        problems,
        moderators,
        participantsList,
        panelOpen,
        newProblemId,
        isSubmitting,
        errors,
        showDeleteModal,
        isLoadingParticipants,
setForm,
        setProblems,
        setModerators,
        setParticipantsList,
        setPanelOpen,
        setContestCreated,
        setActiveTab,
        setErrors,
        handlers: {
            handleFieldChange,
            handleAddProblem,
            handleCreateContest,
            handleUpdateContest,
            handleDeleteContest,
            confirmDeleteContest,
            cancelDeleteContest,
        },
    };
}
