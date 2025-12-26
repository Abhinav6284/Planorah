import React from 'react';
import { Link } from 'react-router-dom';

const ProfileCard = ({ user }) => {
    return (
        <Link to="/settings" className="block relative h-full w-full rounded-[30px] overflow-hidden group cursor-pointer">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                {/* Placeholder or User Image */}
                <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"}
                    alt="Profile"
                    className="w-full h-full object-cover opacity-80 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-6 left-6 text-white transform group-hover:translate-x-2 transition-transform duration-300">
                <h3 className="text-2xl font-serif font-medium leading-tight">
                    {user?.username || "Lora Piterson"}
                </h3>
                <p className="text-sm text-gray-200 mt-1 font-light opacity-90">
                    {user?.role || "Student"}
                </p>
            </div>

            {/* Stats Pill */}
            <div className="absolute bottom-6 right-6 group-hover:scale-110 transition-transform duration-300">
                <div className="backdrop-blur-md bg-white/20 border border-white/30 px-4 py-2 rounded-full text-white text-sm font-medium">
                    {user?.xp || 1200} XP
                </div>
            </div>
        </Link>
    );
};

export default ProfileCard;
