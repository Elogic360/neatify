import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/app/api';
import { useStore } from '@/app/store';
import {
    User,
    Mail,
    Phone,
    Shield,
    Lock,
    Edit3,
    Save,
    X,
    UserCircle,
    Key,
    ShieldCheck,
    Calendar,
    CreditCard,
    ShoppingBag
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser, setUser, theme } = useStore();
    const { showToast } = useToast();
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(currentUser?.username || '');
    const [fullName, setFullName] = useState(currentUser?.full_name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.updateProfile({
                username,
                full_name: fullName,
                phone
            });
            setUser(response.data);
            setIsEditing(false);
            showToast('Profile updated successfully', 'success');
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to update profile';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('Password changed successfully', 'success');
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to change password';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header Card */}
                <div className={`mb-8 rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-xl' : 'bg-white border-gray-100'
                    }`}>
                    <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-2xl border-4 flex items-center justify-center overflow-hidden shadow-xl transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-900' : 'bg-gray-100 border-white'
                                    }`}>
                                    <UserCircle className={`w-16 h-16 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                                </div>
                                {isDark && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isEditing
                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                        }`}
                                >
                                    {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold">{currentUser.full_name || currentUser.username}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 capitalize">
                                    <Shield size={14} className="text-emerald-500" />
                                    {currentUser.role} Account
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Joined {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className={`p-2 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100'
                            }`}>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'details'
                                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-sm')
                                        : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')
                                    }`}
                            >
                                <User size={18} />
                                Account Details
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mt-1 ${activeTab === 'password'
                                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-sm')
                                        : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')
                                    }`}
                            >
                                <Key size={18} />
                                Security & Password
                            </button>
                        </div>

                        {/* Quick Links */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
                            }`}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Account Overview</h3>
                            <div className="space-y-4">
                                <div
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => navigate('/orders')}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag size={20} className="text-orange-500" />
                                        <span className="text-sm font-medium">My Orders</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>0</span>
                                </div>
                                <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={20} className="text-blue-500" />
                                        <span className="text-sm font-medium">Payments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className={`h-full rounded-2xl border transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'
                            }`}>
                            {activeTab === 'details' ? (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-xl font-bold">Personal Information</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials</p>
                                        </div>
                                        {isEditing && (
                                            <span className="text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
                                                Editing Mode
                                            </span>
                                        )}
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-2">
                                                    <Mail size={14} /> Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={currentUser.email}
                                                    disabled
                                                    className={`w-full px-4 py-3 rounded-xl border opacity-60 cursor-not-allowed transition-all duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'
                                                        }`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-2">
                                                    <User size={14} /> Username
                                                </label>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    disabled={!isEditing || loading}
                                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                            ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                            : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                        } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-2">
                                                    <UserCircle size={14} /> Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    disabled={!isEditing || loading}
                                                    placeholder="Not set"
                                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                            ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                            : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                        } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-2">
                                                    <Phone size={14} /> Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={!isEditing || loading}
                                                    placeholder="Not set"
                                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                            ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                            : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                        } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 animate-fadeIn">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-70"
                                                >
                                                    {loading ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    ) : (
                                                        <><Save size={18} /> Save Changes</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            ) : (
                                <div className="p-8">
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold">Update Password</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep your account secure with a strong password</p>
                                    </div>

                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">Current Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        required
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                                ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                                : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                            }`}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">New Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                        <input
                                                            type="password"
                                                            required
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                                    ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                                    : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                                }`}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">Confirm New</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                        <input
                                                            type="password"
                                                            required
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 ${isDark
                                                                    ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                                    : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                                                                }`}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-70"
                                            >
                                                {loading ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                ) : (
                                                    <><ShieldCheck size={18} /> Update Security Settings</>
                                                )}
                                            </button>
                                        </div>

                                        <div className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-3 ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            <Lock size={16} className="mt-0.5 flex-shrink-0" />
                                            <p>
                                                Strong passwords should be at least 8 characters long and include a mix of uppercase letters, numbers, and symbols.
                                                Changing your password will NOT sign you out of other devices.
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
