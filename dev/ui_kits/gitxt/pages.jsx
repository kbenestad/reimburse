// gitxt — teletext for git. Pages addressed by 3-digit numbers; navigate by
// typing digits or clicking the coloured FASTEXT bar. Authentic teletext look.
const { useState, useEffect, useRef } = React;

// colour helpers (teletext palette)
const C = ({ children }) => <span style={{ color: '#3fe0e0' }}>{children}</span>;   // cyan
const Y = ({ children }) => <span style={{ color: '#f2d44a' }}>{children}</span>;   // yellow
const G = ({ children }) => <span style={{ color: '#5fd28a' }}>{children}</span>;   // green
const R = ({ children }) => <span style={{ color: '#ff6b6b' }}>{children}</span>;   // red
const M = ({ children }) => <span style={{ color: '#e07ad0' }}>{children}</span>;   // magenta
const W = ({ children }) => <span style={{ color: '#e8ecf0' }}>{children}</span>;   // white

const Row = ({ children, center }) => (
  <div className="tx-row" style={center ? { textAlign: 'center' } : null}>{children || '\u00A0'}</div>
);
// double-height title block
const Title = ({ color = '#3fe0e0', children }) => (
  <div className="tx-title" style={{ color }}>{children}</div>
);
const Link = ({ n, go, children }) => (
  <span className="tx-link" onClick={() => go(n)}><G>{n}</G> <W>{children}</W></span>
);

const PAGES = {
  100: { fast: [200, 300, 400, 100], render: (go) => (<>
    <Title>gitxt</Title>
    <Row><W>teletext for git</W> · <C>kBenestad</C></Row>
    <Row />
    <Row><Y>━━━━━━━━━━━━━━ index ━━━━━━━━━━━━━━</Y></Row>
    <Row />
    <Row><Link n={200} go={go}>repositories</Link></Row>
    <Row><Link n={300} go={go}>recent commits</Link></Row>
    <Row><Link n={400} go={go}>open issues</Link></Row>
    <Row><Link n={500} go={go}>build status</Link></Row>
    <Row><Link n={888} go={go}>help &amp; navigation</Link></Row>
    <Row />
    <Row><W>type a page number, or use the</W></Row>
    <Row><W>coloured buttons below.</W></Row>
  </>) },

  200: { fast: [210, 220, 300, 100], render: (go) => (<>
    <Title color="#f2d44a">repositories</Title>
    <Row><C>page 200</C> · <W>8 repos tracked</W></Row>
    <Row />
    <Row><Link n={210} go={go}>kbpkg&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link> <G>v2.4.0</G></Row>
    <Row><Link n={220} go={go}>gitxt&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link> <G>v0.3.0</G></Row>
    <Row><Link n={230} go={go}>mdcms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link> <Y>v0.6.1</Y></Row>
    <Row><Link n={240} go={go}>capcms&nbsp;&nbsp;&nbsp;&nbsp;</Link> <Y>v0.2.0</Y></Row>
    <Row><Link n={250} go={go}>invoice&nbsp;&nbsp;&nbsp;</Link> <G>v1.1.0</G></Row>
    <Row><Link n={260} go={go}>timesheet&nbsp;</Link> <G>v1.0.0</G></Row>
    <Row />
    <Row><W>select a repo for detail.</W></Row>
  </>) },

  210: { fast: [300, 400, 200, 100], render: (go) => (<>
    <Title>kbpkg</Title>
    <Row><C>repo 210</C> · <G>v2.4.0</G> · <W>main</W></Row>
    <Row />
    <Row><Y>git-based package manager</Y></Row>
    <Row />
    <Row><W>branch&nbsp;&nbsp;</W><G>main</G><W>&nbsp;&nbsp;↑0 ↓0</W></Row>
    <Row><W>commits&nbsp;</W><C>1,284</C></Row>
    <Row><W>open&nbsp;&nbsp;&nbsp;&nbsp;</W><R>3 issues</R></Row>
    <Row><W>build&nbsp;&nbsp;&nbsp;</W><G>● passing</G></Row>
    <Row />
    <Row><M>last:</M> <W>fix: resolve nested deps</W></Row>
    <Row><W>by karl · 1 day ago</W></Row>
  </>) },

  300: { fast: [310, 200, 400, 100], render: (go) => (<>
    <Title color="#5fd28a">recent commits</Title>
    <Row><C>page 300</C> · <W>all repos</W></Row>
    <Row />
    <Row><Y>a3f1</Y> <W>fix: resolve nested deps</W></Row>
    <Row><W>kbpkg · 1d</W></Row>
    <Row><Y>9c02</Y> <W>feat: number navigation</W></Row>
    <Row><W>gitxt · 2d</W></Row>
    <Row><Y>1e7d</Y> <W>chore: bump cms/md</W></Row>
    <Row><W>mdcms · 4d</W></Row>
    <Row><Y>b840</Y> <W>fix: locale rounding</W></Row>
    <Row><W>invoice · 5d</W></Row>
  </>) },

  400: { fast: [200, 300, 500, 100], render: (go) => (<>
    <Title color="#ff6b6b">open issues</Title>
    <Row><C>page 400</C> · <W>6 open</W></Row>
    <Row />
    <Row><R>#42</R> <W>resolve circular dep graph</W></Row>
    <Row><W>kbpkg · high</W></Row>
    <Row><R>#38</R> <W>page 9xx reserved range</W></Row>
    <Row><W>gitxt · low</W></Row>
    <Row><R>#31</R> <W>fr-NO plural forms</W></Row>
    <Row><W>mdcms · medium</W></Row>
  </>) },

  500: { fast: [200, 300, 400, 100], render: (go) => (<>
    <Title color="#5fd28a">build status</Title>
    <Row><C>page 500</C> · <W>last 24h</W></Row>
    <Row />
    <Row><G>● passing</G><W>&nbsp;&nbsp;kbpkg</W></Row>
    <Row><G>● passing</G><W>&nbsp;&nbsp;gitxt</W></Row>
    <Row><G>● passing</G><W>&nbsp;&nbsp;invoice</W></Row>
    <Row><Y>● pending</Y><W>&nbsp;&nbsp;mdcms</W></Row>
    <Row><R>● failing</R><W>&nbsp;&nbsp;capcms</W></Row>
    <Row />
    <Row><W>capcms: test timeout in</W></Row>
    <Row><W>case-export suite.</W></Row>
  </>) },

  888: { fast: [100, 200, 300, 100], render: (go) => (<>
    <Title color="#e07ad0">help</Title>
    <Row><C>page 888</C></Row>
    <Row />
    <Row><W>type any 3-digit page number</W></Row>
    <Row><W>to jump straight to it.</W></Row>
    <Row />
    <Row><G>100</G> <W>index</W></Row>
    <Row><G>200</G> <W>repositories</W></Row>
    <Row><G>300</G> <W>commits</W></Row>
    <Row />
    <Row><W>coloured buttons jump to the</W></Row>
    <Row><W>four pages shown at the foot.</W></Row>
  </>) },
};
// alias detail pages
[220, 230, 240, 250, 260, 310].forEach(n => { if (!PAGES[n]) PAGES[n] = PAGES[210]; });

Object.assign(window, { PAGES, C, Y, G, R, M, W, Row, Title });
