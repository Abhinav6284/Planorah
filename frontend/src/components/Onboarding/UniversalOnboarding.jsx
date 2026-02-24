import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "./OnboardingLayout";
import api from "../../api/axios";

// Education stage options
const EDUCATION_STAGES = [
    { value: 'class_9_10', label: 'Class 9-10', icon: '📚' },
    { value: 'class_11_12', label: 'Class 11-12', icon: '🎓' },
    { value: 'undergraduate', label: 'Undergraduate (Bachelor\'s degree)', icon: '🎯' },
    { value: 'postgraduate', label: 'Postgraduate (Master\'s degree)', icon: '🔬' },
    { value: 'phd_research', label: 'PhD / Research', icon: '🧪' },
    { value: 'professional', label: 'Professional / Other', icon: '💼' },
];

// Board options for Class 9-10 and 11-12
const BOARD_OPTIONS = [
    { value: 'cbse', label: 'CBSE' },
    { value: 'icse', label: 'ICSE' },
    { value: 'state_board', label: 'State Board' },
    { value: 'other', label: 'Other' },
];

// Stream options for Class 11-12
const STREAM_OPTIONS = [
    { value: 'science_pcm', label: 'Science (PCM)' },
    { value: 'science_pcb', label: 'Science (PCB)' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'arts_humanities', label: 'Arts / Humanities' },
    { value: 'other', label: 'Other / Not sure' },
];

// Exam focus for Class 11-12
const EXAM_FOCUS = [
    { value: 'cbse', label: 'CBSE' },
    { value: 'icse', label: 'ICSE' },
    { value: 'state_board', label: 'State Board' },
    { value: 'jee_neet', label: 'JEE / NEET' },
    { value: 'other_competitive', label: 'Other competitive exams' },
];

export default function UniversalOnboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [educationStage, setEducationStage] = useState('');
    const [formData, setFormData] = useState({
        // Common fields
        education_stage: '',
        weekly_hours: 5,
        validation_mode: 'mixed',
        onboarding_accepted_terms: false,

        // Class 9-10 fields
        class_9_10_current_class: '',
        class_9_10_board: '',
        comfort_mathematics: '',
        comfort_science: '',
        comfort_english: '',
        comfort_social: '',
        confusion_areas: [],
        daily_study_time: '',
        parent_access: '',

        // Class 11-12 fields
        class_11_12_current_class: '',
        class_11_12_stream: '',
        class_11_12_exam_focus: '',
        class_11_12_subjects_enjoyed: [],
        class_11_12_help_needed: '',
        profile_consent: '',

        // Undergraduate fields
        ug_degree: '',
        ug_year: '',
        ug_skills: [],
        ug_aiming_for: '',

        // Postgraduate/PhD fields
        pg_specialization: '',
        pg_intent: '',

        // Personal info
        name: '',
        phone_number: '',
        date_of_birth: '',
    });

    // Dynamic step generation based on education stage
    const getSteps = () => {
        const baseSteps = [
            { id: 'welcome', title: 'Welcome to Planora' },
            { id: 'education_stage', title: 'Your Education Stage' },
        ];

        if (educationStage === 'class_9_10') {
            return [
                ...baseSteps,
                { id: 'class_9_10_basics', title: 'Basic Details' },
                { id: 'subject_comfort', title: 'Subject Comfort' },
                { id: 'confusion_check', title: 'Confusion Areas' },
                { id: 'study_reality', title: 'Study Reality' },
                { id: 'support_visibility', title: 'Support & Visibility' },
                { id: 'reality_check', title: 'Reality Check' },
                { id: 'personal', title: 'Personal Information' },
            ];
        } else if (educationStage === 'class_11_12') {
            return [
                ...baseSteps,
                { id: 'class_11_12_details', title: 'Academic Details' },
                { id: 'interest_mapping', title: 'Interest Mapping' },
                { id: 'career_confusion', title: 'Career Direction' },
                { id: 'time_commitment', title: 'Time Commitment' },
                { id: 'early_profile', title: 'Profile Building' },
                { id: 'reality_check', title: 'Reality Check' },
                { id: 'personal', title: 'Personal Information' },
            ];
        } else if (educationStage === 'undergraduate') {
            return [
                ...baseSteps,
                { id: 'ug_degree_info', title: 'Degree Information' },
                { id: 'ug_current_skills', title: 'Current Skills' },
                { id: 'ug_direction', title: 'Career Direction' },
                { id: 'time_commitment', title: 'Time Commitment' },
                { id: 'reality_check', title: 'Reality Check' },
                { id: 'personal', title: 'Personal Information' },
            ];
        } else if (educationStage === 'postgraduate' || educationStage === 'phd_research') {
            return [
                ...baseSteps,
                { id: 'pg_focus', title: 'Focus & Intent' },
                { id: 'validation_preference', title: 'Validation Preference' },
                { id: 'time_commitment', title: 'Time Commitment' },
                { id: 'reality_check', title: 'Reality Check' },
                { id: 'personal', title: 'Personal Information' },
            ];
        } else if (educationStage === 'professional') {
            return [
                ...baseSteps,
                { id: 'validation_preference', title: 'Validation Preference' },
                { id: 'time_commitment', title: 'Time Commitment' },
                { id: 'reality_check', title: 'Reality Check' },
                { id: 'personal', title: 'Personal Information' },
            ];
        }

        return baseSteps;
    };

    const steps = getSteps();
    const currentStepId = steps[currentStep]?.id;

    // Update education stage when selected
    useEffect(() => {
        if (!formData.education_stage || formData.education_stage === educationStage) {
            return;
        }
        setEducationStage(formData.education_stage);
        // Reset to education_stage step when changing
        setCurrentStep((prevStep) => (prevStep > 1 ? 1 : prevStep));
    }, [formData.education_stage, educationStage]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const canProceed = () => {
        switch (currentStepId) {
            case 'welcome':
                return true;
            case 'education_stage':
                return !!formData.education_stage;
            case 'class_9_10_basics':
                return formData.class_9_10_current_class && formData.class_9_10_board;
            case 'subject_comfort':
                return formData.comfort_mathematics && formData.comfort_science &&
                    formData.comfort_english && formData.comfort_social;
            case 'confusion_check':
                return true; // Optional
            case 'study_reality':
                return !!formData.daily_study_time;
            case 'support_visibility':
                return !!formData.parent_access;
            case 'class_11_12_details':
                return formData.class_11_12_current_class && formData.class_11_12_stream &&
                    formData.class_11_12_exam_focus;
            case 'interest_mapping':
                return formData.class_11_12_subjects_enjoyed && formData.class_11_12_subjects_enjoyed.length > 0;
            case 'career_confusion':
                return !!formData.class_11_12_help_needed;
            case 'time_commitment':
                return formData.weekly_hours > 0;
            case 'early_profile':
                return !!formData.profile_consent;
            case 'ug_degree_info':
                return formData.ug_degree && formData.ug_year;
            case 'ug_current_skills':
                return formData.ug_skills && formData.ug_skills.length > 0;
            case 'ug_direction':
                return !!formData.ug_aiming_for;
            case 'pg_focus':
                return formData.pg_specialization && formData.pg_intent;
            case 'validation_preference':
                return !!formData.validation_mode;
            case 'reality_check':
                return formData.onboarding_accepted_terms;
            case 'personal':
                return formData.name && formData.phone_number && formData.date_of_birth;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepare onboarding_data based on education stage
            const onboardingData = {};

            if (educationStage === 'class_9_10') {
                onboardingData.class_9_10_current_class = formData.class_9_10_current_class;
                onboardingData.class_9_10_board = formData.class_9_10_board;
                onboardingData.comfort_mathematics = formData.comfort_mathematics;
                onboardingData.comfort_science = formData.comfort_science;
                onboardingData.comfort_english = formData.comfort_english;
                onboardingData.comfort_social = formData.comfort_social;
                onboardingData.confusion_areas = formData.confusion_areas;
                onboardingData.daily_study_time = formData.daily_study_time;
                onboardingData.parent_access = formData.parent_access;
            } else if (educationStage === 'class_11_12') {
                onboardingData.class_11_12_current_class = formData.class_11_12_current_class;
                onboardingData.class_11_12_stream = formData.class_11_12_stream;
                onboardingData.class_11_12_exam_focus = formData.class_11_12_exam_focus;
                onboardingData.class_11_12_subjects_enjoyed = formData.class_11_12_subjects_enjoyed;
                onboardingData.class_11_12_help_needed = formData.class_11_12_help_needed;
                onboardingData.profile_consent = formData.profile_consent;
            } else if (educationStage === 'undergraduate') {
                onboardingData.ug_degree = formData.ug_degree;
                onboardingData.ug_year = formData.ug_year;
                onboardingData.ug_skills = formData.ug_skills;
                onboardingData.ug_aiming_for = formData.ug_aiming_for;
            } else if (educationStage === 'postgraduate' || educationStage === 'phd_research') {
                onboardingData.pg_specialization = formData.pg_specialization;
                onboardingData.pg_intent = formData.pg_intent;
            }

            const payload = {
                education_stage: formData.education_stage,
                weekly_hours: formData.weekly_hours,
                validation_mode: formData.validation_mode,
                onboarding_accepted_terms: formData.onboarding_accepted_terms,
                onboarding_data: onboardingData,
                name: formData.name,
                phone_number: formData.phone_number,
                date_of_birth: formData.date_of_birth,
            };

            await api.patch("users/update-profile/", payload);

            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding submission error:', error);
            window.dispatchEvent(new CustomEvent('app-error', {
                detail: { message: 'Failed to complete onboarding. Please try again.' }
            }));
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStepId) {
            case 'welcome':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                        >
                            <h2 className="text-3xl font-bold text-gray-900">Welcome to Planora! 🎉</h2>
                            <p className="text-lg text-gray-600">
                                Let's personalize your learning journey. This will only take a few minutes.
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">What we'll cover:</h3>
                                <ul className="text-left space-y-2 text-gray-700">
                                    <li>• Your current education stage and goals</li>
                                    <li>• Your interests and areas where you need help</li>
                                    <li>• How much time you can dedicate to learning</li>
                                    <li>• Your preferences for tracking progress</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'education_stage':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">What's your current education stage?</h2>
                            <p className="text-gray-600">This helps us customize your experience</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {EDUCATION_STAGES.map((stage) => (
                                <motion.button
                                    key={stage.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChange('education_stage', stage.value)}
                                    className={`p-6 rounded-lg border-2 transition-all text-left ${formData.education_stage === stage.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-3xl">{stage.icon}</span>
                                        <span className="font-semibold text-lg">{stage.label}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                );

            case 'class_9_10_basics':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Let's start with the basics</h2>
                            <p className="text-gray-600">Tell us about your current class and board</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Which class are you in?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['9', '10'].map((cls) => (
                                        <button
                                            key={cls}
                                            onClick={() => handleChange('class_9_10_current_class', cls)}
                                            className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.class_9_10_current_class === cls
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            Class {cls}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Which board are you studying under?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {BOARD_OPTIONS.map((board) => (
                                        <button
                                            key={board.value}
                                            onClick={() => handleChange('class_9_10_board', board.value)}
                                            className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.class_9_10_board === board.value
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            {board.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'subject_comfort':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">How comfortable are you with these subjects?</h2>
                            <p className="text-gray-600">Be honest - this helps us help you better</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { field: 'comfort_mathematics', label: 'Mathematics', icon: '🔢' },
                                { field: 'comfort_science', label: 'Science', icon: '🔬' },
                                { field: 'comfort_english', label: 'English', icon: '📚' },
                                { field: 'comfort_social', label: 'Social Studies', icon: '🌍' },
                            ].map((subject) => (
                                <div key={subject.field} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900">
                                        {subject.icon} {subject.label}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'very_comfortable', label: 'Very comfortable' },
                                            { value: 'okay', label: 'Okay' },
                                            { value: 'difficult', label: 'Difficult' },
                                        ].map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => handleChange(subject.field, level.value)}
                                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData[subject.field] === level.value
                                                    ? 'border-black bg-gray-900 text-white'
                                                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                    }`}
                                            >
                                                {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'confusion_check':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">What confuses you the most?</h2>
                            <p className="text-gray-600">Select all that apply (optional)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Understanding concepts',
                                'Solving problems',
                                'Remembering formulas',
                                'Time management',
                                'Exam preparation',
                                'Taking notes',
                                'Staying motivated',
                                'Balancing subjects',
                            ].map((area) => (
                                <button
                                    key={area}
                                    onClick={() => handleMultiSelect('confusion_areas', area)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.confusion_areas?.includes(area)
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'study_reality':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Let's be real about study time</h2>
                            <p className="text-gray-600">How much do you actually study per day (outside of school)?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { value: 'less_than_1_hour', label: 'Less than 1 hour' },
                                { value: '1_2_hours', label: '1-2 hours' },
                                { value: '2_3_hours', label: '2-3 hours' },
                                { value: '3_plus_hours', label: '3+ hours' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('daily_study_time', option.value)}
                                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.daily_study_time === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'support_visibility':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Would you like parent access?</h2>
                            <p className="text-gray-600">Parents can see your progress (but not your content)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { value: 'yes', label: 'Yes, share with parents' },
                                { value: 'maybe_later', label: 'Maybe later' },
                                { value: 'no', label: 'No, keep it private' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('parent_access', option.value)}
                                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.parent_access === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'class_11_12_details':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Academic Details</h2>
                            <p className="text-gray-600">Tell us about your current academic status</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Which class are you in?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['11', '12'].map((cls) => (
                                        <button
                                            key={cls}
                                            onClick={() => handleChange('class_11_12_current_class', cls)}
                                            className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.class_11_12_current_class === cls
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            Class {cls}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Which stream are you in?
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {STREAM_OPTIONS.map((stream) => (
                                        <button
                                            key={stream.value}
                                            onClick={() => handleChange('class_11_12_stream', stream.value)}
                                            className={`p-4 rounded-lg border-2 font-semibold text-left transition-all ${formData.class_11_12_stream === stream.value
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            {stream.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    What exams are you focusing on?
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {EXAM_FOCUS.map((exam) => (
                                        <button
                                            key={exam.value}
                                            onClick={() => handleChange('class_11_12_exam_focus', exam.value)}
                                            className={`p-4 rounded-lg border-2 font-semibold text-left transition-all ${formData.class_11_12_exam_focus === exam.value
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            {exam.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'interest_mapping':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">What subjects do you enjoy?</h2>
                            <p className="text-gray-600">Select all that apply</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Physics',
                                'Chemistry',
                                'Mathematics',
                                'Biology',
                                'Computer Science',
                                'Economics',
                                'Accounts',
                                'Business Studies',
                                'History',
                                'Political Science',
                                'Geography',
                                'Psychology',
                                'English',
                                'Other Languages',
                            ].map((subject) => (
                                <button
                                    key={subject}
                                    onClick={() => handleMultiSelect('class_11_12_subjects_enjoyed', subject)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.class_11_12_subjects_enjoyed?.includes(subject)
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'career_confusion':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Where do you need the most help?</h2>
                            <p className="text-gray-600">Pick your biggest challenge right now</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { value: 'career_options', label: 'Understanding career options' },
                                { value: 'college_selection', label: 'Selecting the right college/course' },
                                { value: 'exam_prep', label: 'Preparing for competitive exams' },
                                { value: 'skills_building', label: 'Building relevant skills' },
                                { value: 'time_management', label: 'Managing time effectively' },
                                { value: 'study_strategy', label: 'Creating a study strategy' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('class_11_12_help_needed', option.value)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.class_11_12_help_needed === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'time_commitment':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">How many hours per week can you dedicate?</h2>
                            <p className="text-gray-600">Be realistic - quality matters more than quantity</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 5, label: '3-5 hours/week', desc: 'Light commitment' },
                                { value: 8, label: '6-10 hours/week', desc: 'Moderate commitment' },
                                { value: 13, label: '11-15 hours/week', desc: 'Serious commitment' },
                                { value: 20, label: '15+ hours/week', desc: 'Heavy commitment' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('weekly_hours', option.value)}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.weekly_hours === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="font-semibold">{option.label}</div>
                                    <div className={`text-sm ${formData.weekly_hours === option.value ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {option.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'early_profile':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Build your professional profile</h2>
                            <p className="text-gray-600">Would you like help building a portfolio/resume?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { value: 'yes', label: 'Yes, help me build it' },
                                { value: 'maybe_later', label: 'Maybe later' },
                                { value: 'no', label: 'Not interested' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('profile_consent', option.value)}
                                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.profile_consent === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'ug_degree_info':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Your Degree Information</h2>
                            <p className="text-gray-600">Tell us about your current program</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    What degree are you pursuing?
                                </label>
                                <input
                                    type="text"
                                    value={formData.ug_degree}
                                    onChange={(e) => handleChange('ug_degree', e.target.value)}
                                    placeholder="e.g., B.Tech in Computer Science, B.Com, BA Psychology"
                                    className="onboarding-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Which year are you in?
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['1', '2', '3', '4'].map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleChange('ug_year', year)}
                                            className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.ug_year === year
                                                ? 'border-black bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            Year {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'ug_current_skills':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">What skills do you have?</h2>
                            <p className="text-gray-600">Select all that apply (technical or non-technical)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Programming/Coding',
                                'Data Analysis',
                                'Design (UI/UX)',
                                'Writing/Content Creation',
                                'Video Editing',
                                'Social Media Marketing',
                                'Public Speaking',
                                'Leadership',
                                'Project Management',
                                'Research',
                                'Foreign Languages',
                                'Teaching/Tutoring',
                                'Photography',
                                'Music/Arts',
                            ].map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => handleMultiSelect('ug_skills', skill)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.ug_skills?.includes(skill)
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'ug_direction':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">What are you aiming for?</h2>
                            <p className="text-gray-600">What's your immediate goal after graduation?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { value: 'job_placement', label: 'Get a good job/placement' },
                                { value: 'higher_studies', label: 'Pursue higher studies (Masters/MBA)' },
                                { value: 'startup_business', label: 'Start my own business/startup' },
                                { value: 'competitive_exams', label: 'Prepare for competitive exams (UPSC, CAT, etc.)' },
                                { value: 'freelancing', label: 'Freelancing / Independent work' },
                                { value: 'still_exploring', label: 'Still exploring options' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('ug_aiming_for', option.value)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.ug_aiming_for === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'pg_focus':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Your Focus & Intent</h2>
                            <p className="text-gray-600">Tell us about your research or specialization</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    What's your specialization/research area?
                                </label>
                                <input
                                    type="text"
                                    value={formData.pg_specialization}
                                    onChange={(e) => handleChange('pg_specialization', e.target.value)}
                                    placeholder="e.g., Machine Learning, Organic Chemistry, Clinical Psychology"
                                    className="onboarding-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    What's your primary intent?
                                </label>
                                <textarea
                                    value={formData.pg_intent}
                                    onChange={(e) => handleChange('pg_intent', e.target.value)}
                                    placeholder="e.g., Publish research papers, Build expertise in my field, Transition to industry"
                                    rows={4}
                                    className="onboarding-textarea"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'validation_preference':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">How do you want to track progress?</h2>
                            <p className="text-gray-600">Choose your validation preference</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                {
                                    value: 'automatic',
                                    label: 'Automatic Validation',
                                    desc: 'AI checks your work automatically - fast and convenient'
                                },
                                {
                                    value: 'manual',
                                    label: 'Manual Validation',
                                    desc: 'You mark tasks complete yourself - full control'
                                },
                                {
                                    value: 'mixed',
                                    label: 'Mixed (Recommended)',
                                    desc: 'Combination of both - flexible and balanced'
                                },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleChange('validation_mode', option.value)}
                                    className={`p-5 rounded-lg border-2 text-left transition-all ${formData.validation_mode === option.value
                                        ? 'border-black bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="font-semibold text-lg mb-1">{option.label}</div>
                                    <div className={`text-sm ${formData.validation_mode === option.value ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {option.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'reality_check':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Quick Summary</h2>
                            <p className="text-gray-600">Review your choices before we proceed</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                            <div>
                                <span className="font-semibold text-gray-900">Education Stage: </span>
                                <span className="text-gray-700">
                                    {EDUCATION_STAGES.find(s => s.value === formData.education_stage)?.label}
                                </span>
                            </div>

                            <div>
                                <span className="font-semibold text-gray-900">Weekly Commitment: </span>
                                <span className="text-gray-700">{formData.weekly_hours} hours/week</span>
                            </div>

                            <div>
                                <span className="font-semibold text-gray-900">Validation Mode: </span>
                                <span className="text-gray-700 capitalize">{formData.validation_mode}</span>
                            </div>

                            {educationStage === 'class_9_10' && (
                                <>
                                    <div>
                                        <span className="font-semibold text-gray-900">Class: </span>
                                        <span className="text-gray-700">{formData.class_9_10_current_class}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">Board: </span>
                                        <span className="text-gray-700 uppercase">{formData.class_9_10_board}</span>
                                    </div>
                                </>
                            )}

                            {educationStage === 'class_11_12' && (
                                <>
                                    <div>
                                        <span className="font-semibold text-gray-900">Class: </span>
                                        <span className="text-gray-700">{formData.class_11_12_current_class}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">Stream: </span>
                                        <span className="text-gray-700">
                                            {STREAM_OPTIONS.find(s => s.value === formData.class_11_12_stream)?.label}
                                        </span>
                                    </div>
                                </>
                            )}

                            {educationStage === 'undergraduate' && (
                                <>
                                    <div>
                                        <span className="font-semibold text-gray-900">Degree: </span>
                                        <span className="text-gray-700">{formData.ug_degree}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">Year: </span>
                                        <span className="text-gray-700">{formData.ug_year}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.onboarding_accepted_terms}
                                    onChange={(e) => handleChange('onboarding_accepted_terms', e.target.checked)}
                                    className="onboarding-checkbox"
                                />
                                <span className="text-sm text-gray-700">
                                    I understand this is a personalized learning journey, and I commit to being honest about my progress.
                                    I can update my preferences anytime from settings.
                                </span>
                            </label>
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Just a few more details</h2>
                            <p className="text-gray-600">We need these for your account</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="onboarding-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => handleChange('phone_number', e.target.value)}
                                    placeholder="+91 1234567890"
                                    className="onboarding-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                    className="onboarding-input"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <OnboardingLayout
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={currentStep > 0 ? handleBack : null}
        >
            <div className="max-w-3xl mx-auto w-full">
                {renderStep()}

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${canProceed()
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${canProceed() && !loading
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Completing...' : 'Complete Onboarding'}
                        </button>
                    )}
                </div>

                {/* Step indicator */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                </div>
            </div>
        </OnboardingLayout>
    );
}
