# Statistics Programming Club Website

<div>
  <img src="favicon.svg">
</div>
<br>

> Official website for the **Programming Club**, Department of Statistics, University of Chittagong.

---

## 👥 Repo Maintainers

Hi, I'm **Naim [2021-22]**, the creator of this website. If you ever have the opportunity to maintain this repo, drop your name below. 🙌

| Name | Role | Year |
|---|---|---|
| *Muhammad N. Naim* | Creator | *2026* |

---

## 📁 Project Structure

```
home/
├── index.html            # Main website (all 7 pages)
├── style.css             # All styling
├── script.js             # All logic — fetches and renders all JSON data
├── favicon.svg           # Club logo
├── README.md             # You are here
└── resources/            # ⭐ All data files and visual editors live here
    ├── database.json             # Executive member / committee data
    ├── achievements.json         # Achievements + tally strip data
    ├── events.json               # Upcoming events
    ├── projects.json             # Club projects
    ├── database-editor.html      # Visual editor → database.json
    ├── achievements-editor.html  # Visual editor → achievements.json
    ├── events-editor.html        # Visual editor → events.json
    └── projects-editor.html      # Visual editor → projects.json
```

> **The golden rule:** Files inside `resources/` are the only files you need to edit for routine updates. You should never need to touch `index.html`, `style.css`, or `script.js` just to update content.

---

## 🚀 Running the Site Locally

The site fetches JSON files dynamically, so it works best when served over HTTP. Most modern browsers will open it directly — but if `index.html` doesn't load correctly when you double-click it, try one of the following:

**Option 1 — Python (recommended):**
```bash
# Navigate into the project folder first
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

**Option 2 — Node.js (`npx serve`):**
```bash
# Navigate into the project folder first
npx serve .
```

**Option 3 — VS Code Live Server:**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, and select **"Open with Live Server"**.

---

## 🗄️ Understanding the JSON Files

All data files live inside `resources/`. Here is the full schema for each.

---

### `resources/database.json`

```json
{
  "current_committee": "2026-27",

  "committees": [
    {
      "session":       "2026-27",
      "label":         "2026 – 2027",
      "total_members": 60,
      "members": [ ... ]
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `current_committee` | `string` | Must exactly match a `session` value. Determines which committee is **Current Executives** and which are **Past Executives**. |
| `committees` | `array` | All committees, newest first. |
| `session` | `string` | Unique ID — no spaces (e.g. `"2026-27"`). |
| `label` | `string` | Display label shown on the website (e.g. `"2026 – 2027"`). |
| `total_members` | `number` | **Optional.** Total member count used in the home page stats. If omitted, the site counts the `members` array length automatically. Set this manually if your committee has members not listed individually in the JSON. |
| `members` | `array` | List of member objects (see below). |

> **Home page stats logic:**
> - `// YEARS` = number of committees in the file (one committee = one academic year)
> - `// MEMBERS` = `total_members` of the current committee (falls back to `members.length` if `total_members` is not set)
> - `// PROJECTS` = count of entries in `projects.json`

#### Member Object

```json
{
  "id":           "22-088",
  "initial":      "N",
  "role":         "Head of Course Coordinator",
  "role_display": "// HEAD OF COURSE COORDINATOR",
  "name":         "Muhammad N. Naim",
  "department":   "Stat - Year 3",
  "is_president": false,
  "bio":          "Short bio shown in the profile popup.",
  "socials": [
    { "type": "linkedin",   "label": "LinkedIn",   "url": "https://linkedin.com/in/..." },
    { "type": "github",     "label": "GitHub",     "url": "https://github.com/..." },
    { "type": "facebook",   "label": "Facebook",   "url": "https://facebook.com/..." },
    { "type": "email",      "label": "Email",      "url": "mailto:name@example.com" },
    { "type": "codeforces", "label": "Codeforces", "url": "https://codeforces.com/profile/..." }
  ]
}
```

| Field | Description |
|---|---|
| `id` | Unique slug — use session + roll (e.g. `"22-088"`). Must be unique across **all** committees. |
| `initial` | Single letter shown in the avatar card. |
| `role` | Short role name shown on alumni compact cards (e.g. `"Vice President"`). |
| `role_display` | Role shown on the full executive card with `//` prefix (e.g. `"// VICE PRESIDENT"`). |
| `is_president` | `true` gives this member the wide featured card. Only one per committee should be `true`. |
| `bio` | 1–3 sentence bio shown in the profile popup modal. |
| `socials` | Array of social link objects. Supported `type` values: `linkedin`, `github`, `facebook`, `email`, `codeforces`, `twitter`, `instagram`, `website`. |

---

### `resources/achievements.json`

```json
{
  "tally": [
    { "value": "8", "label": "Gold"   },
    { "value": "9", "label": "Silver" }
  ],
  "achievements": [
    {
      "title":      "1st Place — National Statistics Olympiad",
      "event":      "Bangladesh National Statistics Olympiad",
      "category":   "Olympiad",
      "year":       "2024",
      "tier":       "gold",
      "team_label": "Team",
      "team":       "Name A, Name B"
    }
  ]
}
```

| Field | Description |
|---|---|
| `tally` | Array of `{ value, label }` objects displayed in the tally strip. Add as many as you like. |
| `tier` | Controls card accent colour. Supported: `gold`, `silver`, `bronze`, `special`, `community`. |
| `category` | Short label shown on the card (e.g. `"Hackathon"`, `"Research"`). |
| `team_label` | Prefix before the team string (e.g. `"Team"`, `"Project"`, `"Member"`, `"Authors"`). |

> The order achievements appear on the website matches the order in the JSON file. Use the **⠿ drag handles** in the achievements-editor to reorder them visually.

---

### `resources/events.json`

```json
{
  "note": "Events are posted to our Facebook group 1 week in advance.",
  "events": [
    {
      "id":            "ev-001",
      "title":         "Python for Data Analysis — Workshop",
      "date":          "2025-05-12",
      "time":          "2:00 PM",
      "location":      "Room 406, Science Faculty Building",
      "audience":      "All levels welcome",
      "type":          "workshop",
      "register_link": "https://forms.google.com/...",
      "details_link":  "https://facebook.com/events/..."
    }
  ]
}
```

| Field | Description |
|---|---|
| `date` | ISO format `YYYY-MM-DD`. Events are **automatically sorted by date ascending** — nearest first. |
| `type` | Controls the tag colour. Supported: `upcoming`, `workshop`, `contest`, `seminar`, `other`. |
| `register_link` | **Optional.** If provided, a green **Register** button appears on the event row. |
| `details_link` | **Optional.** If provided, a blue **View Details** button appears — link this to your Facebook or LinkedIn event page. |
| `note` | Footer text shown below the events list. |

> **Important behaviours:**
> - **Past events are automatically hidden** from the website. They remain in the JSON for your records but won't be displayed.
> - A **countdown badge** (e.g. `5d 4h to go`) is shown on every upcoming event.
> - The **nearest upcoming event** is highlighted with a green left border.

---

### `resources/projects.json`

```json
{
  "projects": [
    {
      "id": "proj-0001",
      "title": "Club Website",
      "description": "This very website \u2014 an open-source, data-driven static site for the Statistics Programming Club. All content is managed through JSON files with a custom visual editor.",
      "status": "active",
      "tags": ["HTML", "CSS", "JavaScript", "JSON"],
      "members": "Muhammad N. Naim",
      "year": "2026",
      "link": "https://github.com/MdNadratanNaim",
      "demo_link": "#"
    }
  ]
}
```

| Field | Description |
|---|---|
| `status` | Controls the status badge. Supported: `active`, `completed`, `research`. |
| `tags` | Array of technology/language tags shown as chips on the card. |
| `link` | **Optional.** Repo URL — shown as a green **Repo ↗** button. Omit to hide. |
| `demo_link` | **Optional.** Live demo, web interface, or DOI link — shown as a purple **Demo ↗** button. Omit to hide. |

---

## 🛠️ Resource Editors (`resources/`)

Every JSON file has a matching visual editor. They auto-load their JSON file when served locally. You can also drag-and-drop a file onto the load screen of any editor. **Clicking the logo** in any editor reloads the page.

| Editor | Edits | URL (local) |
|---|---|---|
| `database-editor.html` | `database.json` | `http://localhost:8000/resources/database-editor.html` |
| `achievements-editor.html` | `achievements.json` | `http://localhost:8000/resources/achievements-editor.html` |
| `events-editor.html` | `events.json` | `http://localhost:8000/resources/events-editor.html` |
| `projects-editor.html` | `projects.json` | `http://localhost:8000/resources/projects-editor.html` |

All editors link to each other via the topbar navigation.

### What you can do in the editors

| Action | Where |
|---|---|
| Switch active (current) committee | **database-editor** → Active Committee dropdown |
| Add / delete a committee | **database-editor** → `+ Add Committee` |
| Set `total_members` for a committee | **database-editor** → field inside each committee block |
| Add / edit / delete members | **database-editor** → expand a committee → manage cards |
| Reorder members within a committee | **database-editor** → drag the `⠿` handle on any member card |
| Add / edit / delete achievements | **achievements-editor** → `+ Add Achievement` |
| Edit the tally strip | **achievements-editor** → Tally Strip section |
| Reorder achievements | **achievements-editor** → drag the `⠿` handle |
| Add / edit / delete events | **events-editor** → `+ Add Event` |
| Set register / details links on an event | **events-editor** → fields inside each event card |
| Reorder events | **events-editor** → drag the `⠿` handle *(note: website always re-sorts by date)* |
| Add / edit / delete projects | **projects-editor** → `+ Add Project` |
| Set repo or demo/DOI link on a project | **projects-editor** → Repo Link / Demo Link fields |
| Reorder projects | **projects-editor** → drag the `⠿` handle |
| Preview JSON live | Right panel of any editor — updates as you type |
| Export | **⬇ Export [file].json** in the topbar |
| Copy JSON to clipboard | **📋 Copy JSON** in the topbar |

> ⚠️ The editors do **not** write directly to the repo. You must export the file, replace it in `resources/`, and commit.

---

## 📅 How to Transition to a New Academic Year

### Step 1 — Open the database editor
```
http://localhost:8000/resources/database-editor.html
```

### Step 2 — Add a new committee
Click **+ Add Committee** and fill in:
- **Session ID:** `2027-28` *(no spaces, hyphens only)*
- **Display Label:** `2027 – 2028`

### Step 3 — Add new executives
Expand the new committee block → click **+ Add Member** for each person. Fill in their details. Use the `⠿` handle to drag members into the preferred display order.

### Step 4 — Set total_members
Fill in the **Total Members** field with the actual headcount (including members not individually listed in the JSON).

### Step 5 — Set it as the active committee
In the **Active Committee** dropdown, select `2027-28`. The old committee moves to Past Executives automatically.

### Step 6 — Export and commit
Click **⬇ Export database.json**, replace `resources/database.json` in your repo, then commit:
```bash
git add resources/database.json
git commit -m "chore: update to 2027-28 committee [by <your name>]"
git push
```

---

## ➕ Adding or Editing Content Manually (Advanced)

> ⚠️ Manual JSON editing is error-prone. **Use the editors in `resources/`** unless you are comfortable with JSON syntax.

**Common mistakes to avoid:**
- Forgetting a comma after `}` before the next object in an array
- Using the same `id` for two members across any committee
- Setting `is_president: true` for more than one member in the same committee
- Leaving `current_committee` pointing to a session ID that doesn't exist in `committees`
- Using spaces in a `session` ID

Validate your JSON at [jsonlint.com](https://jsonlint.com) before saving.

---

## 🌐 Maintenance of GitHub repo

**After updating data files:**
```bash
git add resources/
git commit -m "update: [brief description] [by <your name>]"
git push
```

**After updating static pages or navigation:**
```bash
git add index.html
git commit -m "update: [brief description] [by <your name>]"
git push
```

**After updating styles or logic:**
```bash
git add style.css script.js
git commit -m "update: [brief description] [by <your name>]"
git push
```

GitHub Pages redeploys automatically within a minute or two.

---

## 📄 Pages Overview

| Page | Sidebar icon | Content source |
|---|---|---|
| Home | `~/` | Static HTML — stats pulled live from all JSON files |
| Current Executives | `{}` | `database.json` → `current_committee` |
| Past Executives | `[]` | `database.json` → all non-current committees |
| Projects | `⬡` | `projects.json` → `projects[]`, max 3 per row |
| Achievements | `★` | `achievements.json` → `tally[]` + `achievements[]` |
| Events | `›_` | `events.json` → upcoming events only, sorted by date, with countdown |
| About / Join | `?` | Static HTML in `index.html` |

---

## 🎨 Customising the Site

### Changing the accent color
Open `style.css` and update the `--ac` variable:
```css
:root {
  --ac: #00d97e;  /* replace with your preferred color */
}
```

### Changing the home page terminal snippet
Edit the `.tbody` section inside `<!-- HOME -->` in `index.html`. The terminal uses syntax-highlighting class names: `t-kw` (keywords), `t-fn` (functions), `t-str` (strings), `t-num` (numbers), `t-cm` (comments).

### Adding a new page
1. Add a `<li>` nav item to both `.nis` (desktop sidebar) and `.mm` (mobile menu) in `index.html`.
2. Add a `<section class="pg" id="page-yourpage">` block in the content area.
3. The router in `script.js` handles navigation via `data-page` attributes automatically — no JS change needed for static pages.
4. For a data-driven page: add a JSON file to `resources/`, write a `loadYourPage()` function in `script.js` that fetches it and renders into a container element, then call it at the bottom of the file.

### Adding a new event type
In `script.js`, add the new type to `TAG_CLASS` and `TAG_LABEL`. In `style.css`, add a `.tyourtype` rule following the pattern of `.tup`, `.two`, `.tco`. In `events-editor.html`, add the option to the `<select>` inside `buildEvCard()`.

### Adding a new project status
In `script.js`, add to `STATUS_CLASS` and `STATUS_LABEL`. In `style.css`, add a `.proj-status.yourstatus` rule. In `projects-editor.html`, add the option to the `<select>` inside `buildCard()`.

---

**Thank you for reading**
