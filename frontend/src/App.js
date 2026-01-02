import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import WelcomePage from "./components/WelcomePage";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import CompleteProfile from "./components/CompleteProfile";
import VerifyOtp from "./components/VerifyOTP";
import Dashboard from "./components/Dashboard/Dashboard";
import Scheduler from "./components/Scheduler/Scheduler";
import ForgotPassword from "./components/ForgotPassword";
import VerifyResetOTP from "./components/VerifyResetOTP";
import ResetPassword from "./components/ResetPassword";
import RoadmapGenerator from "./components/Roadmap/RoadmapGenerator";
import RoadmapView from "./components/Roadmap/RoadmapView";
import RoadmapList from './components/Roadmap/RoadmapList';
import RoadmapProjects from './components/Roadmap/RoadmapProjects';
import LabHub from './components/Lab/LabHub';
import CodeSpace from './components/Lab/CodeSpace';
import ResourceHub from './components/Lab/ResourceHub';
import PublishResearch from './components/Lab/PublishResearch';
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
// Subscription & Billing Components
import PricingPage from './components/Subscription/PricingPage';
import SubscriptionStatus from './components/Subscription/SubscriptionStatus';
import CheckoutPage from './components/Billing/CheckoutPage';
import PaymentHistory from './components/Billing/PaymentHistory';
import { PortfolioEditor, ProjectManager } from './components/Portfolio';

export default function App() {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<StepForm />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
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
              <Route path="/roadmap/projects" element={<RoadmapProjects />} />
              <Route path="/lab" element={<LabHub />} />
              <Route path="/lab/code" element={<Navigate to="/lab/codespace" replace />} />
              <Route path="/lab/codespace" element={<CodeSpace />} />
              <Route path="/lab/resources" element={<ResourceHub />} />
              <Route path="/lab/publish" element={<PublishResearch />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/day" element={<DayTimeline />} />
              <Route path="/tasks/focus" element={<FocusMode />} />
              <Route path="/tasks/analytics" element={<Analytics />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/support" element={<SupportPage />} />
              {/* Subscription & Billing Routes */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/subscription" element={<SubscriptionStatus />} />
              <Route path="/billing/checkout" element={<CheckoutPage />} />
              <Route path="/billing/history" element={<PaymentHistory />} />
              <Route path="/portfolio/edit" element={<PortfolioEditor />} />
              <Route path="/projects" element={<ProjectManager />} />
            </Route>
          </Routes>
        </Router>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
