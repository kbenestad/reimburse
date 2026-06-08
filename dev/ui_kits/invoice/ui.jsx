// invoice UI primitives + icons (mirrors design-system components via .kb-* classes)
const { useState } = React;

const ICONS = {
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h8M8 9h2',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  chart: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-9',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 6 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.4A1.7 1.7 0 0 0 11 2.1V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9.4a1.7 1.7 0 0 0 2.1 1.6H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M5 21h14',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  check: 'M20 6 9 17l-5-5',
  search: 'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  chevron: 'm9 6 6 6-6 6',
  back: 'm15 18-6-6 6-6',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
};

function Icon({ name, size = 16, strokeWidth = 2, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}><path d={ICONS[name]} /></svg>;
}

function Button({ variant = 'primary', size, leftIcon, className = '', children, ...rest }) {
  const cls = ['kb-btn', `kb-btn--${variant}`, size && `kb-btn--${size}`, className].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{leftIcon}{children}</button>;
}

const STATUS_TONE = { paid: 'success', sent: 'accent', draft: 'neutral', overdue: 'danger' };
function StatusBadge({ status }) {
  return <span className={`kb-badge kb-badge--${STATUS_TONE[status]}`}><span className="kb-badge__dot" />{status}</span>;
}

function Avatar({ name = '', size = 32, square }) {
  const initials = name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <span className={'kb-avatar' + (square ? ' kb-avatar--square' : '')} style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>;
}

const kr = (n) => n.toLocaleString('nb-NO');

Object.assign(window, { Icon, Button, StatusBadge, Avatar, kr, useState });
