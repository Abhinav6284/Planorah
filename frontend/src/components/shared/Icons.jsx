import React from 'react';

export const Icon = ({ d, size = 16, stroke = 1.5, fill = 'none', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

export const IconSparkle = (p) => <Icon {...p} d={
  <>
    <path d="M12 3l1.8 4.8L18.6 9.6l-4.8 1.8L12 16.2l-1.8-4.8L5.4 9.6l4.8-1.8z" />
    <path d="M19 15l.7 1.9L21.6 17.6l-1.9.7L19 20.2l-.7-1.9L16.4 17.6l1.9-.7z" />
  </>
}/>;
export const IconCalendar = (p) => <Icon {...p} d={
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </>
}/>;
export const IconList = (p) => <Icon {...p} d={
  <>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </>
}/>;
export const IconHome = (p) => <Icon {...p} d={
  <>
    <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" />
  </>
}/>;
export const IconChat = (p) => <Icon {...p} d={
  <>
    <path d="M4 5h16v11H8l-4 4z" />
  </>
}/>;
export const IconBook = (p) => <Icon {...p} d={
  <>
    <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
    <path d="M4 4v12a4 4 0 0 0 4 4" />
  </>
}/>;
export const IconCheck = (p) => <Icon {...p} d={<path d="M5 12l4 4L19 7" />}/>;
export const IconArrowRight = (p) => <Icon {...p} d={<path d="M5 12h14M13 5l7 7-7 7" />}/>;
export const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}/>;
export const IconPlus = (p) => <Icon {...p} d={<path d="M12 5v14M5 12h14" />}/>;
export const IconSettings = (p) => <Icon {...p} d={
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.6l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>
}/>;
export const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>}/>;
export const IconBell = (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></>}/>;
export const IconMoon = (p) => <Icon {...p} d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}/>;
export const IconSun = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}/>;
export const IconSend = (p) => <Icon {...p} d={<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />}/>;
export const IconMore = (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>}/>;
export const IconFlame = (p) => <Icon {...p} d={<path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 2-3 2-5 0 0 2 1 2-3z M7 16a5 5 0 0 0 10 0c0 3-2 5-5 5s-5-2-5-5z" />}/>;
export const IconTrend = (p) => <Icon {...p} d={<path d="M3 17l6-6 4 4 8-8M14 7h7v7" />}/>;
export const IconZap = (p) => <Icon {...p} d={<path d="M13 2L3 14h7l-1 8 10-12h-7z" />}/>;
export const IconShield = (p) => <Icon {...p} d={<path d="M12 2l8 3v7c0 5-3 8-8 10-5-2-8-5-8-10V5z" />}/>;
export const IconBookmark = (p) => <Icon {...p} d={<path d="M6 3h12v18l-6-4-6 4z" />}/>;

export const IconPlanning = (p) => <Icon {...p} d={
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </>
}/>;

export const IconPhone = (p) => <Icon {...p} d={
  <>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </>
}/>;

export const IconCompass = (p) => <Icon {...p} d={
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </>
}/>;

export const IconHourglass = (p) => <Icon {...p} d={
  <>
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-5l-5-5 5-5V2" />
    <path d="M7 22v-5l5-5-5-5V2" />
  </>
}/>;
