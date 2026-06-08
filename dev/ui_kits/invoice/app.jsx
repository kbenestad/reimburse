// invoice app — sidebar shell, invoice list, invoice detail
const { Icon, Button, StatusBadge, Avatar, kr, useState } = window;

function Sidebar() {
  const nav = [
    { icon: 'file', label: 'Invoices', active: true },
    { icon: 'users', label: 'Clients' },
    { icon: 'chart', label: 'Reports' },
    { icon: 'settings', label: 'Settings' },
  ];
  const apps = [['inv', 'invoice', true], ['ts', 'timesheet', false], ['re', 'reimburse', false]];
  return (
    <aside className="iv-side">
      <div className="iv-brand">
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
          <rect x="16" y="8" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="3" opacity=".34" />
          <rect x="8" y="16" width="24" height="24" rx="6" fill="var(--accent)" />
        </svg>
        <span><span style={{ color: 'var(--accent)' }}>k</span>Benestad</span>
      </div>
      <div className="iv-appname">invoice</div>
      <nav className="iv-nav">
        {nav.map(n => (
          <a key={n.label} className={'iv-navitem' + (n.active ? ' is-active' : '')}>
            <Icon name={n.icon} size={17} /> {n.label}
          </a>
        ))}
      </nav>
      <div className="iv-switch">
        <div className="iv-switch__label">kBenestad apps</div>
        <div className="iv-switch__tiles">
          {apps.map(([k, label, on]) => (
            <div key={k} className={'iv-tile' + (on ? ' is-on' : '')} title={label}>{k}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function InvoiceList({ onOpen }) {
  const { invoices } = window.INVOICE_DATA;
  const [q, setQ] = useState('');
  const list = invoices.filter(i => (i.id + i.client).toLowerCase().includes(q.toLowerCase()));
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  return (
    <div className="iv-content">
      <div className="iv-topbar">
        <h1>Invoices</h1>
        <Button leftIcon={<Icon name="plus" size={16} />}>New invoice</Button>
      </div>
      <div className="iv-stats">
        <div className="iv-stat"><span className="iv-stat__k">Outstanding</span><span className="iv-stat__v">kr {kr(outstanding)}</span></div>
        <div className="iv-stat"><span className="iv-stat__k">Paid this period</span><span className="iv-stat__v">kr {kr(paid)}</span></div>
        <div className="iv-stat"><span className="iv-stat__k">Open invoices</span><span className="iv-stat__v">{invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').length}</span></div>
      </div>
      <div className="iv-search">
        <Icon name="search" size={16} style={{ color: 'var(--text-muted)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search invoices or clients…" />
      </div>
      <div className="kb-card" style={{ overflow: 'hidden' }}>
        <table className="iv-table">
          <thead>
            <tr><th>Invoice</th><th>Client</th><th>Status</th><th>Due</th><th className="num">Amount</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(inv => (
              <tr key={inv.id} onClick={() => onOpen(inv)}>
                <td className="mono">{inv.id}</td>
                <td>{inv.client}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td className="muted">{inv.due}</td>
                <td className="num mono">kr {kr(inv.amount)}</td>
                <td className="chev"><Icon name="chevron" size={15} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceDetail({ inv, onBack }) {
  const { from } = window.INVOICE_DATA;
  const subtotal = inv.items.reduce((s, [, qty, rate]) => s + qty * rate, 0);
  const vat = Math.round(subtotal * 0.25);
  const total = subtotal + vat;
  return (
    <div className="iv-content">
      <div className="iv-topbar">
        <button className="iv-back" onClick={onBack}><Icon name="back" size={16} /> Invoices</button>
        <div style={{ display: 'flex', gap: 10 }}>
          {inv.status !== 'paid' && <Button variant="secondary" leftIcon={<Icon name="check" size={16} />}>Mark paid</Button>}
          <Button variant="secondary" leftIcon={<Icon name="download" size={16} />}>PDF</Button>
          {inv.status === 'draft'
            ? <Button leftIcon={<Icon name="send" size={16} />}>Send</Button>
            : <Button leftIcon={<Icon name="send" size={16} />}>Resend</Button>}
        </div>
      </div>
      <div className="iv-sheet kb-card kb-card--raised">
        <div className="iv-sheet__head">
          <div>
            <div className="iv-sheet__no">{inv.id}</div>
            <StatusBadge status={inv.status} />
          </div>
          <div className="iv-sheet__from">
            <strong>{from.org}</strong>
            <span>{from.name}</span>
            <span>{from.email}</span>
            <span className="muted">{from.orgnr}</span>
          </div>
        </div>
        <div className="iv-sheet__parties">
          <div><span className="kb-eyebrow">Billed to</span><div className="iv-party">{inv.client}</div></div>
          <div className="iv-dates">
            <div><span className="kb-eyebrow">Issued</span><div>{inv.issued}</div></div>
            <div><span className="kb-eyebrow">Due</span><div>{inv.due}</div></div>
          </div>
        </div>
        <table className="iv-lines">
          <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
          <tbody>
            {inv.items.map(([desc, qty, rate], i) => (
              <tr key={i}><td>{desc}</td><td className="num mono">{qty}</td><td className="num mono">kr {kr(rate)}</td><td className="num mono">kr {kr(qty * rate)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="iv-totals">
          <div className="iv-totrow"><span>Subtotal</span><span className="mono">kr {kr(subtotal)}</span></div>
          <div className="iv-totrow"><span>VAT 25%</span><span className="mono">kr {kr(vat)}</span></div>
          <div className="iv-totrow iv-totrow--grand"><span>Total</span><span className="mono">kr {kr(total)}</span></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [inv, setInv] = useState(null);
  return (
    <div className="iv-app">
      <Sidebar />
      <main className="iv-main">
        {inv ? <InvoiceDetail inv={inv} onBack={() => setInv(null)} /> : <InvoiceList onOpen={setInv} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
