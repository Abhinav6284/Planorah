import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { ToastProvider } from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { DashboardSkeleton } from "./components/common/Skeleton";

// Eagerly loaded (critical auth path)
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from './components/Layout';

// Lazy-loaded (non-critical, code-split)
const WelcomePage = lazy(() => import("./components/WelcomePage"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const CompleteProfile = lazy(() => import("./components/CompleteProfile"));
const VerifyOtp = lazy(() => import("./components/VerifyOTP"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Scheduler = lazy(() => import("./components/Scheduler/Scheduler"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const VerifyResetOTP = lazy(() => import("./components/VerifyResetOTP"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const RoadmapGenerator = lazy(() => import("./components/Roadmap/RoadmapGenerator"));
const RoadmapView = lazy(() => import("./components/Roadmap/RoadmapView"));
const RoadmapList = lazy(() => import('./components/Roadmap/RoadmapList'));
const RoadmapProjects = lazy(() => import('./components/Roadmap/RoadmapProjects'));
const LabHub = lazy(() => import('./components/Lab/LabHub'));
const CodeSpace = lazy(() => import('./components/Lab/CodeSpace'));
const ResourceHub = lazy(() => import('./components/Lab/ResourceHub'));
const PublishResearch = lazy(() => import('./components/Lab/PublishResearch'));
const TaskList = lazy(() => import('./components/Tasks/TaskList'));
const DayTimeline = lazy(() => import('./components/Tasks/DayTimeline'));
const FocusMode = lazy(() => import('./components/Tasks/FocusMode'));
const Analytics = lazy(() => import('./components/Tasks/Analytics'));
const StepForm = lazy(() => import('./components/Onboarding/StepForm'));
const UniversalOnboarding = lazy(() => import('./components/Onboarding/UniversalOnboarding'));
const ResumeBuilder = lazy(() => import('./components/Resume/ResumeBuilder'));
const ResumeList = lazy(() => import('./components/Resume/ResumeList'));
const ATSScanner = lazy(() => import('./components/Resume/ATSScanner'));
const CompiledResumeView = lazy(() => import('./components/Resume/CompiledResumeView'));
const CompiledResumeList = lazy(() => import('./components/Resume/CompiledResumeList'));
const JobFinder = lazy(() => import('./components/Jobs/JobFinder'));
const MockInterviewComingSoon = lazy(() => import('./components/Interview/MockInterviewComingSoon'));
const ProfilePage = lazy(() => import('./components/Settings/ProfilePage'));
const GitHubCallback = lazy(() => import('./components/GitHubCallback'));
const AIAssistant = lazy(() => import('./components/Assistant/AIAssistant'));
const SupportPage = lazy(() => import('./components/Support/SupportPage'));
const SpotifyCallback = lazy(() => import('./components/Auth/SpotifyCallback'));
const YouTubeCallback = lazy(() => import('./components/Auth/YouTubeCallback'));
// Subscription & Billing Components
const PricingPage = lazy(() => import('./components/Subscription/PricingPage'));
const SubscriptionStatus = lazy(() => import('./components/Subscription/SubscriptionStatus'));
const CheckoutPage = lazy(() => import('./components/Billing/CheckoutPage'));
const PaymentHistory = lazy(() => import('./components/Billing/PaymentHistory'));
// Portfolio - lazy imported individually since barrel export doesn't support lazy
const PortfolioEditor = lazy(() => import('./components/Portfolio').then(m => ({ default: m.PortfolioEditor })));
const ProjectManager = lazy(() => import('./components/Portfolio').then(m => ({ default: m.ProjectManager })));
const PublicPortfolio = lazy(() => import('./components/Portfolio').then(m => ({ default: m.PublicPortfolio })));

export default function App() {
  // Subdomain detection logic
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Logic to determine if we are on a user subdomain
  // On production: username.planorah.me
  // On local: username.localhost (if configured)
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const domainParts = isLocal ? 1 : 2; // planorah.me (2) vs localhost (1)

  let subdomain = null;
  if (parts.length > domainParts) {
    const potentialSubdomain = parts[0];
    if (potentialSubdomain !== 'www' && potentialSubdomain !== 'planorah') {
      subdomain = potentialSubdomain;
    }
  }

  // If we are on a subdomain, show the public portfolio
  if (subdomain) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <SubscriptionProvider>
            <Router>
              <ErrorBoundary>
                <Suspense fallback={<DashboardSkeleton />}>
                  <Routes>
                    <Route path="*" element={<PublicPortfolio subdomain={subdomain} />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Router>
          </SubscriptionProvider>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <SubscriptionProvider>
          <Router>
            <ErrorBoundary>
              <Suspense fallback={<DashboardSkeleton />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<WelcomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/onboarding" element={<UniversalOnboarding />} />
                  <Route path="/onboarding/legacy" element={<StepForm />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/github/callback" element={<GitHubCallback />} />
                  <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
                  <Route path="/auth/youtube/callback" element={<YouTubeCallback />} />

                  {/* Public Portfolio Route - No Auth Required */}
                  <Route path="/p/:slug" element={<PublicPortfolio />} />

                  {/* Public Support Page - No Auth Required */}
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/contact" element={<Navigate to="/support" replace />} />

                  {/* Protected App Routes */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scheduler" element={<Scheduler />} />
                    <Route path="/roadmap/generate" element={<RoadmapGenerator />} />
                    <Route path="/resume" element={<ResumeList />} />
                    <Route path="/resume/new" element={<ResumeBuilder />} />
                    <Route path="/resume/:id" element={<ResumeBuilder />} />
                    <Route path="/resume/compiled" element={<CompiledResumeList />} />
                    <Route path="/resume/compiled/:versionId" element={<CompiledResumeView />} />
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
                    {/* Subscription & Billing Routes */}
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/subscription" element={<SubscriptionStatus />} />
                    <Route path="/billing/checkout" element={<CheckoutPage />} />
                    <Route path="/billing/history" element={<PaymentHistory />} />
                    <Route path="/portfolio/edit" element={<PortfolioEditor />} />
                    <Route path="/projects" element={<ProjectManager />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Router>
        </SubscriptionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
