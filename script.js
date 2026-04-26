/* ═══════════════════════════════════════════════
   Syntax Club — script.js
   Fetches database.json and drives the entire site.
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
    const res = await fetch('database.json');
    if (!res.ok) throw new Error('Failed to load database.json');
    data = await res.json();
  } catch (err) {
    console.error('Syntax Club DB error:', err);
    return;
  }

  const { current_committee, committees } = data;

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
