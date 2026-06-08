// kbpkg UI primitives — mirror the kBenestad design-system components using the
// real .kb-* classes from components.css (linked via styles.css). Self-contained
// so the kit renders anywhere, not only inside the Design System tab.
const { useState } = React;

const ICONS = {
  search: 'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M5 21h14',
  copy: 'M9 9h10v10H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M20 6 9 17l-5-5',
  box: 'M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8ZM3.3 7 12 12l8.7-5M12 22V12',
  branch: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  terminal: 'm4 17 6-6-6-6M12 19h8',
  chevronR: 'm9 6 6 6-6 6',
  external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  scale: 'M12 3v18M3 7h18M7 7l-3 7a3 3 0 0 0 6 0L7 7Zm10 0-3 7a3 3 0 0 0 6 0l-3-7ZM5 21h14',
  drive: 'M22 12H2M5.5 6h13l3 6v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6l3.5-6ZM6 16h.01M10 16h.01',
  layers: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',
  plus: 'M12 5v14M5 12h14',
};

function Icon({ name, size = 16, strokeWidth = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      <path d={ICONS[name]} />
    </svg>
  );
}

function Button({ variant = 'primary', size, iconOnly, leftIcon, className = '', children, ...rest }) {
  const cls = ['kb-btn', `kb-btn--${variant}`, size && `kb-btn--${size}`, iconOnly && 'kb-btn--icon', className].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{leftIcon}{children}</button>;
}

function Badge({ tone = 'neutral', dot, children }) {
  return <span className={`kb-badge kb-badge--${tone}`}>{dot && <span className="kb-badge__dot" />}{children}</span>;
}

function Tag({ children, onClick, active }) {
  return <span className="kb-tag" onClick={onClick}
    style={onClick ? { cursor: 'pointer', borderColor: active ? 'var(--accent)' : undefined, color: active ? 'var(--accent-soft-text)' : undefined, background: active ? 'var(--accent-soft)' : undefined } : undefined}>{children}</span>;
}

function Avatar({ name = '', size = 32, square }) {
  const initials = name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <span className={'kb-avatar' + (square ? ' kb-avatar--square' : '')} style={{ width: size, height: size, fontSize: size * 0.4 }}>{initials}</span>;
}

// Brand lockup (stack mark + wordmark)
function Lockup({ onClick }) {
  return (
    <span onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
        <rect x="16" y="8" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="3" opacity=".34" />
        <rect x="8" y="16" width="24" height="24" rx="6" fill="var(--accent)" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>
        <span style={{ color: 'var(--accent)' }}>k</span>Benestad
      </span>
    </span>
  );
}

Object.assign(window, { Icon, Button, Badge, Tag, Avatar, Lockup, useState });
