// document.getElementById("save").addEventListener("click", () => {

//     const token = document.getElementById("token").value.trim();
//     const owner = document.getElementById("owner").value.trim();
//     const repo = document.getElementById("repo").value.trim();

//     chrome.storage.sync.set({
//         token,
//         owner,
//         repo
//     }, () => {
//         alert("Saved Successfully!");
//     });

// });


// popup.js
// Handles loading/saving the GitHub connection fields and drives the
// save button's liquid ripple + morph-to-check animation.

const tokenInput = document.getElementById('token');
const ownerInput = document.getElementById('owner');
const repoInput  = document.getElementById('repo');
const form       = document.getElementById('form');
const saveBtn    = document.getElementById('save');
const statusEl   = document.getElementById('status');

const STORAGE_KEY = 'githubConnection';

// Use chrome.storage.sync when running as an extension; fall back to an
// in-memory store so this popup also previews fine outside an extension host.
const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync)
  ? {
      get: (keys) => new Promise((resolve) => chrome.storage.sync.get(keys, resolve)),
      set: (obj)  => new Promise((resolve) => chrome.storage.sync.set(obj, resolve)),
    }
  : (() => {
      const mem = {};
      return {
        get: (keys) => Promise.resolve({ [keys]: mem[keys] }),
        set: (obj)  => { Object.assign(mem, obj); return Promise.resolve(); },
      };
    })();

async function loadSaved() {
  const result = await storage.get(STORAGE_KEY);
  const saved = result[STORAGE_KEY];
  if (!saved) return;
  if (saved.token) tokenInput.value = saved.token;
  if (saved.owner) ownerInput.value = saved.owner;
  if (saved.repo)  repoInput.value  = saved.repo;
}

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('is-error', isError);
  statusEl.classList.add('show');
  window.clearTimeout(showStatus._t);
  showStatus._t = window.setTimeout(() => {
    statusEl.classList.remove('show');
  }, 2600);
}

function spawnRipple(event) {
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 1.4;

  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top  = `${event.clientY - rect.top - size / 2}px`;

  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function playSavedAnimation() {
  saveBtn.classList.add('is-saved');
  const label = saveBtn.querySelector('.btn-label');
  const prevLabel = label.textContent;
  label.textContent = 'Connected';

  window.setTimeout(() => {
    saveBtn.classList.remove('is-saved');
    label.textContent = prevLabel;
  }, 1800);
}

saveBtn.addEventListener('click', spawnRipple);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = tokenInput.value.trim();
  const owner = ownerInput.value.trim();
  const repo  = repoInput.value.trim();

  if (!token || !owner || !repo) {
    showStatus('Fill in every field before saving.', true);
    return;
  }

  try {
    await storage.set({ [STORAGE_KEY]: { token, owner, repo } });
    playSavedAnimation();
    showStatus(`Connected to ${owner}/${repo}`);
  } catch (err) {
    showStatus('Could not save. Try again.', true);
  }
});

loadSaved();