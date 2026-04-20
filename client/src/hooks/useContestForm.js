import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { calcDuration, generateSlug } from '../utils/timeHelpers';
import { createContest } from '../api/contestApi';

const TABS = ['Landing Page', 'Problems', 'Moderators', 'Participants'];
const GROUPS = ['First year', 'Second Year', 'Coding Club', 'Public'];
const MOCK_PARTICIPANTS = {
    'First year': [
        { id: 1, name: 'Lucas Scott', email: 'lucas.s@example.com' },
        { id: 2, name: 'Mia Wallace', email: 'mia.w@example.com' },
    ],
    'Second Year': [
        { id: 3, name: 'Sarah Connor', email: 'sarah.c@example.com' },
        { id: 4, name: 'John Doe', email: 'john.d@example.com' },
        { id: 5, name: 'Jane Smith', email: 'jane.s@example.com' },
    ],
    'Coding Club': [
        { id: 6, name: 'Evan You', email: 'evan.y@example.com' },
        { id: 7, name: 'Dan Abramov', email: 'dan.a@example.com' },
    ],
};

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

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (form.participantGroup && MOCK_PARTICIPANTS[form.participantGroup]) {
            setParticipantsList(MOCK_PARTICIPANTS[form.participantGroup] || []);
        } else {
            setParticipantsList([]);
        }
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
                is_active: true,
                // Include other relevant form fields if needed by backend later
            };

            await createContest(contestData);

            setSavedSlug(slug);
            setContestCreated(true);
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
    }, [form]);

    const handleDeleteContest = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const confirmDeleteContest = useCallback(() => {
        setContestCreated(false);
        setSavedSlug(null);
        setShowDeleteModal(false);
        toast.info('Contest deleted.', {
            position: 'bottom-right',
            autoClose: 2000,
            theme: 'dark',
        });
    }, []);

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
            toast.success('Contest updated successfully!', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } catch (err) {
            toast.error('Failed to update contest. Please try again.', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [form]);

    const handleAddProblem = useCallback((problem) => {
        const nextId = String.fromCharCode(65 + problems.length);
        const entry = {
            id: nextId,
            name: problem.title,
            score: problem.score || 100,
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
        problems,
        moderators,
        participantsList,
        panelOpen,
        newProblemId,
        isSubmitting,
        errors,
        showDeleteModal,
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
