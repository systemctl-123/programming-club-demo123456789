/* ═══════════════════════════════════════════════
   Statistics Programming Club — script.js
   Fetches database.json, achievements.json, and
   events.json to drive the entire site.
   To switch the active committee, change
   "current_committee" in database.json only.
═══════════════════════════════════════════════ */

const ICONS = {
  linkedin:   '🔗',
  github:     '⌥',
  facebook:   'ƒ',
  email:      '✉',
  codeforces: '◈'
};

/* ── Intersection observer for scroll reveals ── */
const ro = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); ro.unobserve(e.target); }
  }),
  { threshold: 0.07 }
);

function observeReveals(scope = document) {
  scope.querySelectorAll('.rv:not(.vis)').forEach(el => ro.observe(el));
}

/* ══════════════════════════════════════════════
   RENDER HELPERS
══════════════════════════════════════════════ */

/** Build a single executive card (current-exec page) */
function buildExecCard(member, session) {
  const card = document.createElement('div');
  card.className = 'ec' + (member.is_president ? ' pres' : '');
  card.dataset.m = member.id;

  const avatarEl = `<div class="eav">${member.initial}</div>`;
  const infoEl = `
    <div class="${member.is_president ? 'ei' : ''}">
      <div class="erl">${member.role_display}</div>
      <div class="enm">${member.name}</div>
      <div class="edp">${member.department}</div>
      ${member.is_president ? `<div class="ebi">${member.bio}</div>` : ''}
    </div>`;

  card.innerHTML = avatarEl + infoEl + `<div class="vh">click to view profile ↗</div>`;
  return card;
}

/** Build a past-executive year block (alumni page) */
function buildAlumniYear(committee) {
  const block = document.createElement('div');
  block.className = 'ay rv';

  const rowCards = committee.members.map(m => `
    <div class="ac2" data-m="${m.id}">
      <div class="aav">${m.initial}</div>
      <div>
        <div class="anm">${m.name}</div>
        <div class="arl">${m.role}</div>
      </div>
    </div>`).join('');

  block.innerHTML = `
    <div class="yl">${committee.label}</div>
    <div class="ar">${rowCards}</div>`;
  return block;
}

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
const overlay   = document.getElementById('ov');
const modalClose = document.getElementById('mc');

/* memberMap is populated after fetch */
let memberMap = {};

function openModal(id) {
  const m = memberMap[id];
  if (!m) return;

  document.getElementById('mav').textContent = m.initial;
  document.getElementById('mrl').textContent = m.role_display;
  document.getElementById('mnm').textContent = m.name;
  document.getElementById('mtgs').innerHTML  =
    [m.department, m.sessionLabel].map(t => `<span class="mtg">${t}</span>`).join('');
  document.getElementById('mbi').textContent = m.bio;
  document.getElementById('mso').innerHTML   =
    m.socials.map(s => `
      <a class="sl ${s.type}" href="${s.url}" target="_blank" rel="noopener noreferrer">
        <span>${ICONS[s.type] || '↗'}</span>${s.label}
      </a>`).join('');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/** Attach modal click to all [data-m] cards in a container */
function attachModalListeners(container) {
  container.querySelectorAll('[data-m]').forEach(card =>
    card.addEventListener('click', () => openModal(card.dataset.m))
  );
}

/* ══════════════════════════════════════════════
   SIDEBAR COLLAPSE
══════════════════════════════════════════════ */
const sidebar   = document.getElementById('sb');
const contentEl = document.getElementById('ct');

document.getElementById('sbt').addEventListener('click', () => {
  sidebar.classList.toggle('col');
  contentEl.classList.toggle('col');
});

document.getElementById("current-year").textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════
   PAGE ROUTER
══════════════════════════════════════════════ */
const pages   = document.querySelectorAll('.pg');
const navItems = document.querySelectorAll('.ni');
const mobItems = document.querySelectorAll('.mi');

function navigate(id) {
  pages.forEach(p    => p.classList.toggle('active', p.id === 'page-' + id));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === id));
  mobItems.forEach(n => n.classList.toggle('active', n.dataset.page === id));
  observeReveals(document.getElementById('page-' + id));
  window.scrollTo(0, 0);
  document.getElementById('mm').classList.remove('open');
}

navItems.forEach(n => n.addEventListener('click', () => navigate(n.dataset.page)));
mobItems.forEach(n => n.addEventListener('click', () => navigate(n.dataset.page)));

/* ── Mobile hamburger ── */
document.getElementById('hbg').addEventListener('click', () =>
  document.getElementById('mm').classList.toggle('open')
);

/* ══════════════════════════════════════════════
   DATA FETCH & PAGE RENDER
══════════════════════════════════════════════ */
async function init() {
  let data;
  try {
    const res = await fetch('resources/database.json');
    if (!res.ok) throw new Error('Failed to load database.json');
    data = await res.json();
  } catch (err) {
    console.error('Syntax Club DB error:', err);
    return;
  }

  const { current_committee, committees } = data;

  /* ── Dynamic home stats ── */
  const totalYears   = committees.length;
  /* Fix: use total_members only if explicitly set (even 0 is valid); else count members array */
  const totalMembers = committees
    .filter(c => c.session === current_committee)
    .slice(0, 1) // Ensure we only ever look at the first match
    .reduce((_, c) => Number(c.total_members ?? c.members.length), 0);

  const setStatEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setStatEl('stat-years',   totalYears);
  setStatEl('stat-members', totalMembers);

  /* Build memberMap: id → member + sessionLabel for modal tags */
  committees.forEach(committee => {
    committee.members.forEach(member => {
      memberMap[member.id] = { ...member, sessionLabel: committee.label };
    });
  });

  /* ── Render CURRENT EXECUTIVES page ── */
  const currentCommittee = committees.find(c => c.session === current_committee);

  if (currentCommittee) {
    const grid   = document.getElementById('exec-grid');
    const badge  = document.getElementById('exec-session-badge');
    const badgeText = document.getElementById('exec-session-text');

    if (badgeText) badgeText.textContent = `Active Session · ${currentCommittee.label}`;

    currentCommittee.members.forEach(member => {
      grid.appendChild(buildExecCard(member, currentCommittee.label));
    });

    attachModalListeners(grid);
  }

  /* ── Render PAST EXECUTIVES page ── */
  const pastContainer = document.getElementById('alumni-content');
  const pastCommittees = committees.filter(c => c.session !== current_committee);

  pastCommittees.forEach(committee => {
    const block = buildAlumniYear(committee);
    pastContainer.appendChild(block);
    attachModalListeners(block);
  });

  /* Trigger reveals on already-visible page (home) */
  observeReveals();
}

init();

/* ══════════════════════════════════════════════
   ACHIEVEMENTS — fetch & render
══════════════════════════════════════════════ */
const MEDAL_ICON = { gold: '🥇', silver: '🥈', bronze: '🥉', special: '🏆', community: '🎖️' };

async function loadAchievements() {
  let data;
  try {
    const res = await fetch('resources/achievements.json');
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    console.warn('achievements.json not found or invalid.');
    return;
  }

  /* Tally strip */
  const tally = document.getElementById('ach-tally');
  if (tally && data.tally) {
    tally.innerHTML = data.tally.map(t => `
      <div class="tc2">
        <div class="tn2">${t.value}</div>
        <div class="tl2">// ${t.label.toUpperCase()}</div>
      </div>`).join('');
  }

  /* Achievement cards */
  const grid = document.getElementById('ach-grid');
  if (!grid || !data.achievements) return;
  grid.innerHTML = '';

  data.achievements.forEach(a => {
    const card = document.createElement('div');
    card.className = `ach ${a.tier || ''}`;
    card.innerHTML = `
      <div class="ai">${MEDAL_ICON[a.tier] || '🏅'}</div>
      <div class="ayr">${a.year} · ${a.category.toUpperCase()}</div>
      <div class="atl">${a.title}</div>
      <div class="aev">${a.event}</div>
      <div class="amm"><strong>${a.team_label}:</strong> ${a.team}</div>`;
    grid.appendChild(card);
  });

  observeReveals(document.getElementById('page-ach'));
}

/* ══════════════════════════════════════════════
   EVENTS — fetch & render
══════════════════════════════════════════════ */
const TAG_CLASS = { upcoming: 'tup', workshop: 'two', contest: 'tco', seminar: 'tse', other: 'tup' };
const TAG_LABEL = { upcoming: 'UPCOMING', workshop: 'WORKSHOP', contest: 'CONTEST', seminar: 'SEMINAR', other: 'EVENT' };
const MONTHS    = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// Parses "2:00 PM" → { hours: 14, minutes: 0 }
function parseTimeString(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0; // midnight

  return { hours, minutes };
}

function getCountdown(dateStr, timeStr) {
  const now = new Date();

  // Combine date and time into one Date object (local time)
  const evDate = new Date(dateStr);                 // e.g., 2026-05-12T00:00:00 local
  const parsed = parseTimeString(timeStr);
  if (parsed) {
    evDate.setHours(parsed.hours, parsed.minutes, 0, 0);
  } else {
    // Fallback: if time parsing fails, default to end of day
    evDate.setHours(23, 59, 59, 0);
  }

  const diff = evDate - now;
  if (diff < 0) return { label: 'Past', past: true };

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  if (days > 0)  return { label: `${days}d ${hours}h to go`, past: false };
  if (hours > 0) return { label: `${hours}h to go`, past: false };
  return { label: `${mins}m to go`, past: false };
}

async function loadEvents() {
  let data;
  try {
    const res = await fetch('resources/events.json');
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    console.warn('events.json not found or invalid.');
    return;
  }

  const list = document.getElementById('events-list');
  const note = document.getElementById('events-note');
  if (!list || !data.events) return;
  list.innerHTML = '';

  if (note && data.note) note.textContent = `// ${data.note}`;

  /* Sort by date ascending — nearest first; skip past events */
  const sorted = [...data.events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(ev => !getCountdown(ev.date, ev.time).past);

  if (!sorted.length) {
    list.innerHTML = `<div style="font-family:var(--fm);font-size:.8rem;color:var(--mut);padding:2rem 1.5rem;">// No upcoming events at the moment. Check back soon.</div>`;
    observeReveals(document.getElementById('page-events'));
    return;
  }

  sorted.forEach((ev, idx) => {
    const d          = new Date(ev.date);
    const mon        = MONTHS[d.getMonth()];
    const day        = d.getDate();
    const tag        = ev.type || 'upcoming';
    const countdown  = getCountdown(ev.date, ev.time);
    const isNearest  = idx === 0;

    const registerHtml = ev.register_link
      ? `<a class="ev-action-link register" href="${ev.register_link}" target="_blank" rel="noopener noreferrer">✎ Register</a>`
      : '';
    const detailsHtml = ev.details_link
      ? `<a class="ev-action-link details" href="${ev.details_link}" target="_blank" rel="noopener noreferrer">↗ View Details</a>`
      : '';
    const actionsHtml = (registerHtml || detailsHtml)
      ? `<div class="ev-actions">${registerHtml}${detailsHtml}</div>`
      : '';

    const row = document.createElement('div');
    row.className = 'ev' + (isNearest ? ' ev-nearest' : '');
    row.innerHTML = `
      <div><div class="emo">${mon}</div><div class="edy">${day}</div></div>
      <div>
        <div class="et">${ev.title}</div>
        <div class="em">${ev.time} · ${ev.location} · ${ev.audience}</div>
        ${actionsHtml}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem;flex-shrink:0">
        <div class="etag ${TAG_CLASS[tag] || 'tup'}">${TAG_LABEL[tag] || tag.toUpperCase()}</div>
        <div class="ev-countdown ${countdown.past ? 'past' : ''}">${countdown.label}</div>
      </div>`;
    list.appendChild(row);
  });

  observeReveals(document.getElementById('page-events'));
}

loadAchievements();
loadEvents();

/* ══════════════════════════════════════════════
   PROJECTS — fetch & render
══════════════════════════════════════════════ */
const STATUS_CLASS = { active:'active', completed:'completed', archived:'archived', research:'research' };
const STATUS_LABEL = { active:'● ACTIVE', completed:'◆ COMPLETED', archived:'◇ ARCHIVED', research:'◈ RESEARCH' };

async function loadProjects() {
  let data;
  try {
    const res = await fetch('resources/projects.json');
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    console.warn('resources/projects.json not found or invalid.');
    return;
  }

  const grid = document.getElementById('proj-grid');
  if (!grid || !data.projects) return;
  grid.innerHTML = '';

  /* Update projects stat on home page */
  const statProjects = document.getElementById('stat-projects');
  if (statProjects) statProjects.textContent = data.projects.length;

  data.projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'proj-card';
    const statusCls = STATUS_CLASS[p.status] || 'active';
    const statusLbl = STATUS_LABEL[p.status] || '● ACTIVE';
    const tags = (p.tags || []).map(t => `<span class="proj-tag">${t}</span>`).join('');

    const repoHtml = p.link
      ? `<a class="proj-link repo" href="${p.link}" target="_blank" rel="noopener noreferrer">⌥ Repo ↗</a>`
      : '';
    const demoHtml = p.demo_link
      ? `<a class="proj-link demo" href="${p.demo_link}" target="_blank" rel="noopener noreferrer">⬡ Demo ↗</a>`
      : '';
    const linksHtml = (repoHtml || demoHtml)
      ? `<div class="proj-links">${repoHtml}${demoHtml}</div>`
      : '';

    card.innerHTML = `
      <div class="proj-status ${statusCls}">
        <span class="proj-status-dot"></span>${statusLbl}
      </div>
      <div class="proj-title">${p.title}</div>
      <div class="proj-desc">${p.description}</div>
      <div class="proj-tags">${tags}</div>
      <div class="proj-footer">
        <span class="proj-members">👥 ${p.members}</span>
        ${linksHtml}
      </div>`;
    grid.appendChild(card);
  });

  observeReveals(document.getElementById('page-projects'));
}

loadProjects();
