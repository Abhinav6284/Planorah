import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import SectionNav from './SectionNav';
import AvatarMenu from './AvatarMenu';
import AIVoicePanel from '../Mentoring/AIVoicePanel';
import WelcomeCoach from '../Onboarding/WelcomeCoach';
import { TourProvider } from '../Tour/TourContext';
import GuidedTour from '../Tour/GuidedTour';
import { userService } from '../../api/userService';

const REALTIME_ONBOARDING_INTRO_KEY = 'show_realtime_onboarding_intro';

const contextSourceFor = (pathname) => {
  if (pathname.startsWith('/path')) return 'roadmap';
  if (pathname.startsWith('/career')) return 'resume';
  if (pathname.startsWith('/mentor')) return 'assistant';
  if (pathname.startsWith('/today')) return 'dashboard';
  return 'general';
};

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  useEffect(() => {
    userService.getProfile().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(REALTIME_ONBOARDING_INTRO_KEY) === 'true' && location.pathname.startsWith('/today')) {
      sessionStorage.removeItem(REALTIME_ONBOARDING_INTRO_KEY);
      sessionStorage.removeItem('show_welcome_coach');
      setVoiceOpen(true);
      return;
    }
    const flag = sessionStorage.getItem('show_welcome_coach');
    if (flag) setWelcomeUser(flag === 'true' ? '' : flag);
  }, [location.pathname]);

  return (
    <TourProvider>
      <div className="flex min-h-screen bg-canvas font-sans text-fg">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center justify-between border-b border-line px-4 md:hidden">
            <Link to="/today" className="text-[15px] font-semibold tracking-[-0.02em]">planorah</Link>
            <AvatarMenu user={user} side="bottom" compact />
          </header>
          <SectionNav />
          <main className="flex-1 pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>

      {welcomeUser !== null && <WelcomeCoach userName={welcomeUser} onDone={() => setWelcomeUser(null)} />}
      <AIVoicePanel
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        contextSource={contextSourceFor(location.pathname)}
        autoStart={voiceOpen}
        onAutoStartHandled={() => {}}
        onSwitchToText={() => setVoiceOpen(false)}
      />
      {location.pathname.startsWith('/today') && <GuidedTour />}
    </TourProvider>
  );
}
