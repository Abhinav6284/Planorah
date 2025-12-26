import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import WelcomePage from "./components/WelcomePage";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyOtp from "./components/VerifyOTP";
import Dashboard from "./components/Dashboard/Dashboard";
import Scheduler from "./components/Scheduler/Scheduler";
import ForgotPassword from "./components/ForgotPassword";
import VerifyResetOTP from "./components/VerifyResetOTP";
import ResetPassword from "./components/ResetPassword";
import RoadmapGenerator from "./components/Roadmap/RoadmapGenerator";
import RoadmapView from "./components/Roadmap/RoadmapView";
import RoadmapList from './components/Roadmap/RoadmapList';
import LabHub from './components/Lab/LabHub';
import CodeStudio from './components/Lab/CodeStudio';
import ResourceHub from './components/Lab/ResourceHub';
import TaskList from './components/Tasks/TaskList';
import DayTimeline from './components/Tasks/DayTimeline';
import FocusMode from './components/Tasks/FocusMode';
import Analytics from './components/Tasks/Analytics';
import StepForm from './components/Onboarding/StepForm';
import ResumeBuilder from './components/Resume/ResumeBuilder';
import ResumeList from './components/Resume/ResumeList';
import ATSScanner from './components/Resume/ATSScanner';
import JobFinder from './components/Jobs/JobFinder';
import MockInterviewComingSoon from './components/Interview/MockInterviewComingSoon';
import Layout from './components/Layout';
import ProfilePage from './components/Settings/ProfilePage';
import GitHubCallback from './components/GitHubCallback';
import AIAssistant from './components/Assistant/AIAssistant';
import SupportPage from './components/Support/SupportPage';
import SpotifyCallback from './components/Auth/SpotifyCallback';
import YouTubeCallback from './components/Auth/YouTubeCallback';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<StepForm />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/github/callback" element={<GitHubCallback />} />
          <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
          <Route path="/auth/youtube/callback" element={<YouTubeCallback />} />

          {/* Protected App Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/roadmap/generate" element={<RoadmapGenerator />} />
            <Route path="/resume" element={<ResumeList />} />
            <Route path="/resume/new" element={<ResumeBuilder />} />
            <Route path="/resume/:id" element={<ResumeBuilder />} />
            <Route path="/ats" element={<ATSScanner />} />
            <Route path="/jobs" element={<JobFinder />} />
            <Route path="/interview" element={<MockInterviewComingSoon />} />
            <Route path="/roadmap/:id" element={<RoadmapView />} />
            <Route path="/roadmap/list" element={<RoadmapList />} />
            <Route path="/lab" element={<LabHub />} />
            <Route path="/lab/code" element={<CodeStudio />} />
            <Route path="/lab/resources" element={<ResourceHub />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/day" element={<DayTimeline />} />
            <Route path="/tasks/focus" element={<FocusMode />} />
            <Route path="/tasks/analytics" element={<Analytics />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}