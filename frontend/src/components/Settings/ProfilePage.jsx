import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../api/userService';
import ProgressGauge from './ProgressGauge';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState({
        name: "",
        role: "",
        bio: "",
        email: "",
        avatar: null
    });
    const [editForm, setEditForm] = useState({});
    const [preview, setPreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isOAuth, setIsOAuth] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchData();
        checkUserAuthType();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, statisticsData] = await Promise.all([
                userService.getProfile(),
                userService.getStatistics()
            ]);

            const profile = profileData.profile || {};
            const userData = {
                name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
                username: profileData.username,
                role: profile.target_role || "Student",
                bio: profile.bio || "Passionate about learning and building the future. 🚀",
                email: profileData.email,
                avatar: profile.avatar,
                field: profile.field_of_study || 'Technology',
                level: profile.experience_level || 'Intermediate',
            };
            setUser(userData);

            if (profile.avatar) {
                setPreview(profile.avatar.startsWith('http') ? profile.avatar : `/api${profile.avatar}`);
            }

            setStats(statisticsData);
        } catch (error) {
            console.error("Failed to fetch profile data", error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserAuthType = async () => {
        try {
            const authData = await userService.checkAuthType();
            setIsOAuth(authData.is_oauth);
        } catch (error) {
            console.error('Failed to check auth type', error);
        }
    };

    const openEditModal = () => {
        setEditForm({ ...user });
        setEditPreview(preview);
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm({ ...editForm, avatarFile: file });
            setEditPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('target_role', editForm.role);
            formData.append('bio', editForm.bio);
            if (editForm.avatarFile) {
                formData.append('avatar', editForm.avatarFile);
            }

            await userService.updateProfile(formData);

            // Update local state
            setUser({ ...user, ...editForm });
            if (editPreview) setPreview(editPreview);

            setMessage({ type: 'success', text: 'Profile updated!' });
            setTimeout(() => {
                setShowEditModal(false);
                setMessage(null);
            }, 1500);
        } catch (error) {
            console.error("Failed to save profile", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            setDeleteError(isOAuth ? 'Please type DELETE to confirm' : 'Please enter your password to confirm deletion');
            return;
        }

        setDeleting(true);
        setDeleteError('');

        try {
            await userService.deleteAccount(deletePassword, isOAuth);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login', { state: { message: 'Account deleted successfully' } });
        } catch (error) {
            console.error("Failed to delete account", error);
            setDeleteError(error.response?.data?.details || error.response?.data?.error || 'Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                                    <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                    {/* Left Side - Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="relative group">
                                            <div className="w-40 h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                                                {editPreview ? (
                                                    <img src={editPreview} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
                                                )}
                                            </div>
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-2xl">
                                                <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-white text-sm font-semibold">Change Photo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 text-center mt-3">Click to upload</p>
                                    </div>

                                    {/* Right Side - Form Fields */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                        {/* Display Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Display Name</label>
                                            <input
                                                name="name"
                                                value={editForm.name || ''}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                                placeholder="Your display name"
                                            />
                                        </div>

                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Username</label>
                                            <input
                                                name="username"
                                                value={editForm.username || ''}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                                            <input
                                                name="email"
                                                value={editForm.email || ''}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Role / Title</label>
                                            <input
                                                name="role"
                                                value={editForm.role || ''}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                                placeholder="e.g. CS Student"
                                            />
                                        </div>

                                        {/* Bio - Full Width */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={editForm.bio || ''}
                                                onChange={handleEditChange}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white resize-none"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        {/* Message */}
                                        {message && (
                                            <div className={`col-span-2 text-sm text-center py-3 rounded-xl ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Delete Account
                                </h2>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 mb-6">
                                    <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-2">⚠️ This action is permanent!</p>
                                    <p className="text-red-600/80 dark:text-red-400/80 text-sm">
                                        All your data including roadmaps, tasks, progress, and settings will be permanently deleted and cannot be recovered.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {isOAuth ? 'Type DELETE to confirm' : 'Enter your password to confirm'}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOAuth(!isOAuth);
                                                setDeletePassword('');
                                                setDeleteError('');
                                            }}
                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            {isOAuth ? "Using Password?" : "Login via Google/GitHub?"}
                                        </button>
                                    </div>
                                    <input
                                        type={isOAuth ? "text" : "password"}
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder={isOAuth ? "DELETE" : "••••••••"}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-red-400 dark:focus:border-red-600 outline-none transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {deleteError && (
                                    <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                        {deleteError}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                                >
                                    {deleting ? 'Deleting...' : 'Delete My Account'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">{user.role}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mb-4">{user.bio}</p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-200 dark:border-gray-800">
                                    📚 {user.field}
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-200 dark:border-gray-800">
                                    ⭐ {user.level}
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-200 dark:border-gray-800">
                                    🔥 {stats?.streak?.current || 0} Day Streak
                                </span>
                            </div>
                        </div>

                        {/* Actions & Quick Stats */}
                        <div className="flex flex-col items-end gap-4">
                            <button
                                onClick={openEditModal}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                            <div className="flex gap-8 border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overview?.total_roadmaps || 0}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">Roadmaps</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overview?.completed_tasks || 0}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.time_stats?.total_hours || 0}h</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">Learning</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                    {[
                        { icon: "✅", label: "Total Tasks", value: stats?.overview?.total_tasks || 0, sub: `${stats?.overview?.completed_tasks || 0} completed` },
                        { icon: "🎯", label: "Completion Rate", value: `${stats?.overview?.completion_rate || 0}%`, sub: "Overall progress" },
                        { icon: "🔥", label: "Current Streak", value: `${stats?.streak?.current || 0} days`, sub: `Best: ${stats?.streak?.longest || 0} days` },
                        { icon: "📊", label: "Active Roadmaps", value: stats?.overview?.total_roadmaps || 0, sub: `${stats?.overview?.total_milestones || 0} milestones` },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">{stat.label}</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">{stat.sub}</div>
                                </div>
                                <div className="text-2xl">{stat.icon}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overall Progress */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Overall Progress</h2>
                            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                                <ProgressGauge percentage={stats?.overview?.completion_rate || 0} label="Completion Rate" size="lg" />
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Not Started", value: stats?.overview?.pending_tasks || 0 },
                                        { label: "In Progress", value: stats?.overview?.in_progress_tasks || 0 },
                                        { label: "Completed", value: stats?.overview?.completed_tasks || 0 },
                                        { label: "This Week", value: stats?.time_stats?.weekly_completed || 0 },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">{item.label}</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Roadmaps Progress */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Active Roadmaps</h2>
                            <div className="space-y-4">
                                {stats?.roadmaps?.length > 0 ? stats.roadmaps.map((roadmap, i) => (
                                    <div key={roadmap.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{roadmap.title}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded">{roadmap.category}</span>
                                                    <span className="text-xs px-2 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded">{roadmap.difficulty}</span>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white ml-4">{roadmap.progress}%</div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                            <motion.div className="bg-gray-900 dark:bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${roadmap.progress}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{roadmap.completed_tasks} / {roadmap.total_tasks} tasks</div>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8">No roadmaps yet</div>}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                            <div className="space-y-2">
                                {stats?.recent_activity?.length > 0 ? stats.recent_activity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'completed' ? 'bg-green-500' : activity.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">{activity.title}</div>
                                            <div className="text-xs text-gray-500">{activity.roadmap} • {new Date(activity.updated_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                            {activity.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8">No recent activity</div>}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Preferences */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⚙️ Preferences</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Theme</h4>
                                    <p className="text-xs text-gray-500 mt-1">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                                </div>
                                <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-lg">
                                    <button onClick={() => theme === 'dark' && toggleTheme()} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-black' : ''}`}>☀️</button>
                                    <button onClick={() => theme === 'light' && toggleTheme()} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-black' : ''}`}>🌙</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Skills */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {stats?.skills?.length > 0 ? stats.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">{skill}</span>
                                )) : <div className="text-sm text-gray-500">Start roadmaps to build skills!</div>}
                            </div>
                        </motion.div>

                        {/* Time Stats */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⏱️ Time Investment</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.time_stats?.total_hours || 0}h</div>
                                    <div className="text-sm text-gray-500">Total Learning Time</div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.time_stats?.avg_task_minutes || 0}m</div>
                                    <div className="text-sm text-gray-500">Average per Task</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Logout & Delete Account */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🚪 Account</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('access_token');
                                        localStorage.removeItem('refresh_token');
                                        navigate('/login');
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
