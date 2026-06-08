// kbpkg screens — Header, install command, registry list, package detail.
const { Icon, Button, Badge, Tag, Avatar, Lockup, useState } = window;

function Header({ view, onHome }) {
  const nav = ['Packages', 'Docs', 'Changelog'];
  return (
    <header className="kb-header">
      <Lockup onClick={onHome} />
      <nav className="kb-nav">
        {nav.map((n, i) => (
          <a key={n} className={'kb-nav__item' + (i === 0 ? ' is-active' : '')} onClick={onHome}>{n}</a>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="secondary" size="sm" leftIcon={<Icon name="plus" size={15} />}>Publish</Button>
        <Avatar name="Karl Benestad" size={30} />
      </div>
    </header>
  );
}

function CopyCommand({ id }) {
  const [copied, setCopied] = useState(false);
  const cmd = `kbpkg add ${id}`;
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div className="kb-cmd">
      <span className="kb-cmd__prompt">$</span>
      <code className="kb-cmd__text">{cmd}</code>
      <button className="kb-cmd__copy" onClick={copy} aria-label="Copy command">
        <Icon name={copied ? 'check' : 'copy'} size={15} />
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

function PackageRow({ pkg, onOpen }) {
  return (
    <div className="kb-pkg" onClick={() => onOpen(pkg)}>
      <span className="kb-avatar kb-avatar--square" style={{ width: 40, height: 40, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
        <Icon name="box" size={20} />
      </span>
      <div className="kb-pkg__body">
        <div className="kb-pkg__top">
          <span className="kb-pkg__name">{pkg.name}</span>
          <Badge tone="accent">v{pkg.version}</Badge>
        </div>
        <p className="kb-pkg__desc">{pkg.desc}</p>
        <div className="kb-pkg__tags">{pkg.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
      </div>
      <div className="kb-pkg__meta">
        <span><Icon name="download" size={14} /> {pkg.installs}</span>
        <span><Icon name="clock" size={14} /> {pkg.updated}</span>
      </div>
    </div>
  );
}

function Registry({ onOpen }) {
  const all = window.KBPKG_PACKAGES;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(null);
  const tags = [...new Set(all.flatMap(p => p.tags))].slice(0, 8);
  const list = all.filter(p => {
    const matchQ = !q || (p.name + ' ' + p.desc).toLowerCase().includes(q.toLowerCase());
    const matchT = !filter || p.tags.includes(filter);
    return matchQ && matchT;
  });
  return (
    <div className="kb-page">
      <div className="kb-hero">
        <span className="kb-eyebrow">kbpkg registry</span>
        <h1 className="kb-hero__title">A package manager for me.</h1>
        <p className="kb-hero__sub">Git-based packages for the kBenestad apps. Install anything with one command.</p>
        <div className="kb-search">
          <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search packages…" />
        </div>
        <div className="kb-filters">
          <Tag onClick={() => setFilter(null)} active={!filter}>all</Tag>
          {tags.map(t => <Tag key={t} onClick={() => setFilter(t === filter ? null : t)} active={t === filter}>{t}</Tag>)}
        </div>
      </div>
      <div className="kb-listhead">
        <span>{list.length} package{list.length === 1 ? '' : 's'}</span>
        <span>sorted by recently updated</span>
      </div>
      <div className="kb-list">
        {list.map(p => <PackageRow key={p.id} pkg={p} onOpen={onOpen} />)}
        {list.length === 0 && <div className="kb-empty">No packages match “{q}”.</div>}
      </div>
    </div>
  );
}

function MetaRow({ icon, label, children }) {
  return (
    <div className="kb-meta__row">
      <span className="kb-meta__label"><Icon name={icon} size={15} /> {label}</span>
      <span className="kb-meta__val">{children}</span>
    </div>
  );
}

function PackagePage({ pkg, onHome, onOpen }) {
  const [tab, setTab] = useState('readme');
  const tabs = [
    { id: 'readme', label: 'Readme' },
    { id: 'versions', label: `Versions` },
    { id: 'deps', label: 'Dependencies' },
  ];
  return (
    <div className="kb-page">
      <div className="kb-crumb"><a onClick={onHome}>Packages</a><Icon name="chevronR" size={14} /><span>{pkg.name}</span></div>
      <div className="kb-pkghead">
        <div>
          <h1 className="kb-pkghead__name">{pkg.name} <Badge tone="accent">v{pkg.version}</Badge></h1>
          <p className="kb-pkghead__desc">{pkg.desc}</p>
        </div>
        <Badge tone="success" dot>published</Badge>
      </div>
      <CopyCommand id={pkg.id} />
      <div className="kb-cols">
        <div className="kb-main">
          <div className="kb-tabs">
            {tabs.map(t => <button key={t.id} className="kb-tab" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
          </div>
          <div className="kb-tabpanel">
            {tab === 'readme' && (
              <div className="kb-prose">
                <h3>{pkg.name}</h3>
                <p>{pkg.readme}</p>
                <p>Install with <code>kbpkg add {pkg.id}</code> and import what you need. Licensed under {pkg.license}.</p>
              </div>
            )}
            {tab === 'versions' && (
              <div className="kb-versions">
                {pkg.versions.map(([v, when], i) => (
                  <div key={v} className="kb-version">
                    <span className="kb-version__v">v{v}{i === 0 && <Badge tone="success">latest</Badge>}</span>
                    <span className="kb-version__when">{when}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'deps' && (
              <div className="kb-versions">
                {pkg.dependencies.length === 0 && <div className="kb-empty" style={{ padding: '20px 0' }}>No dependencies — this package is self-contained.</div>}
                {pkg.dependencies.map(([d, range]) => {
                  const dp = window.KBPKG_PACKAGES.find(p => p.id === d);
                  return (
                    <div key={d} className="kb-version" style={{ cursor: dp ? 'pointer' : 'default' }} onClick={() => dp && onOpen(dp)}>
                      <span className="kb-version__v" style={{ fontFamily: 'var(--font-mono)' }}>{d}</span>
                      <span className="kb-version__when" style={{ fontFamily: 'var(--font-mono)' }}>{range}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <aside className="kb-side">
          <Button variant="primary" leftIcon={<Icon name="download" size={16} />} style={{ width: '100%' }}>Install</Button>
          <div className="kb-meta">
            <MetaRow icon="box" label="Version">v{pkg.version}</MetaRow>
            <MetaRow icon="scale" label="License">{pkg.license}</MetaRow>
            <MetaRow icon="drive" label="Size">{pkg.size}</MetaRow>
            <MetaRow icon="layers" label="Dependencies">{pkg.deps}</MetaRow>
            <MetaRow icon="branch" label="Repository"><a className="kb-link" href="#">{pkg.repo} <Icon name="external" size={13} /></a></MetaRow>
            <MetaRow icon="user" label="Owner"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Avatar name={pkg.owner} size={22} /> {pkg.owner}</span></MetaRow>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { Header, Registry, PackagePage });
