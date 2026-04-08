import { useState } from 'react';
import { useProfile, useUpdateProfile } from './useWhatsApp';
import { useAuth } from '../context/AuthContext';

export type FormMode = 'none' | 'details' | 'password';

export function useProfileAction() {
    const { refreshUser } = useAuth();
    const { data: user, isLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    
    const [formMode, setFormMode] = useState<FormMode>('none');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [message, setMessage] = useState('');

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const startEditDetails = () => {
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setEmail(user?.email || '');
        setFormMode('details');
        setMessage('');
    };

    const startEditPassword = () => {
        setPassword('');
        setConfirmPassword('');
        setFormMode('password');
        setMessage('');
    };

    const resetForm = () => {
        setFormMode('none');
        setMessage('');
        setShowConfirmModal(false);
    };

    const validateAndOpenModal = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (formMode === 'password') {
            const isValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
            if (!isValid) {
                setMessage('Password must be 8+ chars with 1 uppercase and 1 number.');
                return;
            }
            if (password !== confirmPassword) {
                setMessage('Passwords do not match.');
                return;
            }
        }

        setShowConfirmModal(true);
    };

    const executeUpdate = () => {
        setShowConfirmModal(false);
        const payload: any = {};
        if (formMode === 'details') {
            payload.firstName = firstName;
            payload.lastName = lastName;
            payload.email = email;
        } else if (formMode === 'password') {
            payload.password = password;
        }

        updateProfileMutation.mutate(payload, {
            onSuccess: () => {
                setMessage('Profile updated successfully');
                if (formMode === 'details') {
                    refreshUser({ 
                        firstName: payload.firstName, 
                        lastName: payload.lastName, 
                        email: payload.email,
                        fullName: `${payload.firstName} ${payload.lastName}`
                    });
                }
                setTimeout(() => {
                    setFormMode('none');
                    setMessage('');
                }, 1500);
            },
            onError: (err: any) => {
                setMessage(err.response?.data?.error || 'Update failed');
            }
        });
    };

    return {
        user,
        isLoading,
        formMode,
        setFormMode,
        showConfirmModal,
        setShowConfirmModal,
        message,
        setMessage,
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        startEditDetails,
        startEditPassword,
        resetForm,
        validateAndOpenModal,
        executeUpdate,
        isUpdating: updateProfileMutation.isPending
    };
}
