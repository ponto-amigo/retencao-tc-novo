// const $ = (s) => document.querySelector(s);
// const $$ = (s) => Array.from(document.querySelectorAll(s));
// const STORAGE_KEY = 'chat-story-studio-v3-reference';

// const DEFAULT_STATE = {
//   contact: {
//     name: 'Açaí Dois Unidos',
//     status: '',
//     avatar: '',
//     avatarLetter: ''
//   },
//   device: {
//     time: '10:54',
//     network: '5G',
//     battery: 35,
//     muted: true,
//     charging: true
//   },
//   chat: {
//     date: '12 de março de 2026',
//     showEncryption: true,
//     encryptionText: 'As mensagens e ligações são protegidas com a criptografia de ponta a ponta. Somente as pessoas que fazem parte da conversa podem ler, ouvir e compartilhar esse conteúdo. Saiba mais'
//   },
//   speed: 1,
//   messages: [
//     { id: cryptoId(), sender: 'incoming', type: 'text', text: 'tu ainda tá acordado?', time: '10:55', delay: 0.8, typing: 1.2, read: false, reaction: '', reply: '', image: '' },
//     { id: cryptoId(), sender: 'outgoing', type: 'text', text: 'tô kkkkk', time: '10:55', delay: 0.7, typing: 1.0, read: true, reaction: '', reply: '', image: '' },
//     { id: cryptoId(), sender: 'incoming', type: 'text', text: 'preciso te contar uma coisa', time: '10:56', delay: 1.0, typing: 1.6, read: false, reaction: '😳', reply: '', image: '' }
//   ]
// };

// let state = loadState();
// let playback = { token: 0, paused: false, cursor: 0, rendered: [] };
// let mediaRecorder = null;
// let recordedChunks = [];
// let activeStream = null;

// function cryptoId() {
//   return (globalThis.crypto?.randomUUID?.() || `m_${Date.now()}_${Math.random().toString(16).slice(2)}`);
// }

// function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

// function normalizeState(raw) {
//   const s = deepClone(DEFAULT_STATE);
//   if (!raw || typeof raw !== 'object') return s;
//   if (raw.contact) Object.assign(s.contact, raw.contact);
//   if (raw.device) Object.assign(s.device, raw.device);
//   if (raw.chat) Object.assign(s.chat, raw.chat);
//   if (Number(raw.speed)) s.speed = Number(raw.speed);
//   if (Array.isArray(raw.messages)) {
//     s.messages = raw.messages.map((m) => ({
//       id: m.id || cryptoId(),
//       sender: m.sender === 'outgoing' ? 'outgoing' : 'incoming',
//       type: ['text','audio','image','deleted','missedcall'].includes(m.type) ? m.type : 'text',
//       text: String(m.text ?? ''),
//       time: String(m.time ?? '10:55'),
//       delay: Math.max(0, Number(m.delay ?? 0.8)),
//       typing: Math.max(0, Number(m.typing ?? 1)),
//       read: !!m.read,
//       reaction: String(m.reaction ?? ''),
//       reply: String(m.reply ?? ''),
//       image: typeof m.image === 'string' ? m.image : ''
//     }));
//   }
//   return s;
// }

// function loadState() {
//   try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
//   catch { return deepClone(DEFAULT_STATE); }
// }
// function saveState() {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
// }

// function fileToDataUrl(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// function toast(message, error = false) {
//   const el = $('#toast');
//   el.textContent = message;
//   el.classList.toggle('error', error);
//   el.classList.add('show');
//   clearTimeout(toast._timer);
//   toast._timer = setTimeout(() => el.classList.remove('show'), 2200);
// }

// function bindStaticControls() {
//   $('#contactName').value = state.contact.name;
//   $('#contactStatus').value = state.contact.status;
//   $('#avatarLetter').value = state.contact.avatarLetter || ''; 
//   $('#chatDate').value = state.chat.date;
//   $('#deviceTime').value = state.device.time;
//   $('#network').value = state.device.network;
//   $('#batteryLevel').value = state.device.battery;
//   $('#mutedToggle').checked = state.device.muted;
//   $('#chargingToggle').checked = state.device.charging;
//   $('#encryptionToggle').checked = state.chat.showEncryption;
//   $('#encryptionText').value = state.chat.encryptionText;
//   $('#speedSelect').value = String(state.speed);

//   const bindings = [
//     ['#contactName', 'input', (e) => state.contact.name = e.target.value],
//     ['#avatarLetter', 'input', (e) => state.contact.avatarLetter = String(e.target.value || '').slice(0,1).toUpperCase()],
//     ['#contactStatus', 'input', (e) => state.contact.status = e.target.value],
//     ['#chatDate', 'input', (e) => state.chat.date = e.target.value],
//     ['#deviceTime', 'input', (e) => state.device.time = e.target.value],
//     ['#network', 'change', (e) => state.device.network = e.target.value],
//     ['#batteryLevel', 'input', (e) => state.device.battery = clamp(Number(e.target.value) || 1, 1, 100)],
//     ['#mutedToggle', 'change', (e) => state.device.muted = e.target.checked],
//     ['#chargingToggle', 'change', (e) => state.device.charging = e.target.checked],
//     ['#encryptionToggle', 'change', (e) => state.chat.showEncryption = e.target.checked],
//     ['#encryptionText', 'input', (e) => state.chat.encryptionText = e.target.value],
//     ['#speedSelect', 'change', (e) => state.speed = Number(e.target.value) || 1]
//   ];
//   bindings.forEach(([sel, event, fn]) => $(sel).addEventListener(event, (e) => {
//     fn(e); renderPhoneStatic(); saveState();
//   }));

//   $('#avatarInput').addEventListener('change', async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith('image/')) return toast('Escolha uma imagem.', true);
//     state.contact.avatar = await fileToDataUrl(file);
//     renderPhoneStatic();
//     saveState();
//   });

//   $('#addMessageBtn').addEventListener('click', () => {
//     state.messages.push({
//       id: cryptoId(), sender: 'incoming', type: 'text', text: 'Nova mensagem',
//       time: nextSuggestedTime(), delay: 0.8, typing: 1.0, read: false,
//       reaction: '', reply: '', image: ''
//     });
//     renderEditor(); renderAllMessages(); saveState();
//     requestAnimationFrame(() => $('#messageList').lastElementChild?.scrollIntoView({behavior:'smooth', block:'center'}));
//   });

//   $('#parseScriptBtn').addEventListener('click', parseQuickScript);
//   $('#playBtn').addEventListener('click', () => playScene(playback.cursor === 0 || playback.cursor >= state.messages.length));
//   $('#pauseBtn').addEventListener('click', togglePause);
//   $('#resetBtn').addEventListener('click', resetPlayback);
//   $('#recordModeBtn').addEventListener('click', toggleRecordingMode);
//   $('#exportPrintBtn').addEventListener('click', exportPhonePrint);
//   $('#recordBtn').addEventListener('click', toggleRecording);
//   $('#newBtn').addEventListener('click', newProject);
//   $('#exportBtn').addEventListener('click', exportProject);
//   $('#importBtn').addEventListener('click', () => $('#importFile').click());
//   $('#importFile').addEventListener('change', importProject);

//   document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape' && document.body.classList.contains('recording-mode')) toggleRecordingMode(false);
//   });
// }

// function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// function renderPhoneStatic() {
//   $('#stageContactName').textContent = state.contact.name || 'Contato';
//   $('#stageContactStatus').textContent = state.contact.status || '';
//   $('#statusTime').textContent = state.device.time || '10:54';
//   const network = state.device.network || '5G';
//   $('#networkLabel').textContent = network;
//   $('#networkRef5g')?.classList.toggle('hidden', network !== '5G');
//   $('#networkAltBlock')?.classList.toggle('hidden', network === '5G');

//   $('#muteIcon').classList.toggle('hidden', !state.device.muted);
//   $('#batteryBolt').classList.toggle('hidden', !state.device.charging);
//   $('#dateChip').textContent = state.chat.date || 'Hoje';
//   $('#encryptionCard').classList.toggle('hidden', !state.chat.showEncryption);
//   renderEncryptionText();
//   renderAvatar();
//   adjustMessagePadding();
// }

// function renderEncryptionText() {
//   const target = $('#encryptionCopy');
//   const txt = state.chat.encryptionText || '';
//   const lower = txt.toLowerCase();
//   const idx = lower.lastIndexOf('saiba mais');
//   target.innerHTML = '';
//   if (idx >= 0) {
//     target.append(document.createTextNode(txt.slice(0, idx)));
//     const strong = document.createElement('strong');
//     strong.textContent = txt.slice(idx);
//     target.append(strong);
//   } else {
//     target.textContent = txt;
//   }
// }

// function getAvatarTheme(seed) {
//   const palettes = [
//     { bg: '#0b3d2f', fg: '#28e36e' },
//     { bg: '#0b3247', fg: '#56bdf2' },
//     { bg: '#423123', fg: '#f3cd75' },
//     { bg: '#4b1431', fg: '#ff78ab' }
//   ];
//   const ch = String(seed || 'A').trim().toUpperCase().charCodeAt(0) || 65;
//   return palettes[ch % palettes.length];
// }

// function renderAvatar() {
//   const customLetter = String(state.contact.avatarLetter || '').trim().slice(0,1).toUpperCase();
//   const initials = customLetter || (state.contact.name || 'C').trim().slice(0,1).toUpperCase() || 'C';
//   const theme = getAvatarTheme(initials);
//   [['#avatarPreview','#avatarFallback'], ['#stageAvatar','#stageAvatarFallback']].forEach(([imgSel, fallbackSel]) => {
//     const img = $(imgSel); const fb = $(fallbackSel);
//     const holder = fb.parentElement;
//     if (state.contact.avatar) {
//       img.src = state.contact.avatar;
//       img.style.display = 'block';
//       fb.style.display = 'none';
//       holder.style.background = '';
//       holder.style.color = '';
//     } else {
//       img.removeAttribute('src');
//       img.style.display = 'none';
//       fb.style.display = '';
//       fb.textContent = initials;
//       holder.style.background = theme.bg;
//       holder.style.color = theme.fg;
//     }
//   });
// }

// function adjustMessagePadding() {
//   requestAnimationFrame(() => {
//     const overlays = $('.chat-overlays');
//     const view = $('#messageViewport');
//     const bottom = overlays.offsetTop + overlays.offsetHeight + 9;
//     view.style.paddingTop = `${Math.max(80, bottom)}px`;
//   });
// }

// function renderEditor() {
//   const list = $('#messageList');
//   list.innerHTML = '';
//   state.messages.forEach((msg, index) => list.appendChild(createMessageEditor(msg, index)));
// }

// function createMessageEditor(msg, index) {
//   const card = document.createElement('div');
//   card.className = `message-card ${msg.sender}`;
//   card.dataset.id = msg.id;
//   card.innerHTML = `
//     <div class="message-card-top">
//       <select class="m-sender" aria-label="Quem envia">
//         <option value="incoming" ${msg.sender==='incoming'?'selected':''}>Contato</option>
//         <option value="outgoing" ${msg.sender==='outgoing'?'selected':''}>Você</option>
//       </select>
//       <select class="m-type" aria-label="Tipo">
//         <option value="text" ${msg.type==='text'?'selected':''}>Texto</option>
//         <option value="image" ${msg.type==='image'?'selected':''}>Imagem</option>
//         <option value="audio" ${msg.type==='audio'?'selected':''}>Áudio</option>
//         <option value="deleted" ${msg.type==='deleted'?'selected':''}>Apagada</option>
//         <option value="missedcall" ${msg.type==='missedcall'?'selected':''}>Chamada</option>
//       </select>
//       <div class="message-card-actions"><span class="message-number">#${index+1}</span><button class="delete-message" title="Excluir">×</button></div>
//     </div>
//     <textarea class="m-text" placeholder="Digite a mensagem">${escapeHtml(msg.text)}</textarea>
//     <div class="image-upload-row ${msg.type==='image' ? '' : 'hidden'}">
//       <img class="image-thumb" alt="Imagem da mensagem" />
//       <button class="small-btn choose-image" type="button">Escolher imagem</button>
//       <input class="m-image" type="file" accept="image/*" hidden />
//     </div>
//     <div class="message-card-grid">
//       <label>Hora<input class="m-time" value="${escapeHtml(msg.time)}" maxlength="5" /></label>
//       <label>Espera (s)<input class="m-delay" type="number" min="0" step="0.1" value="${Number(msg.delay)}" /></label>
//       <label>Digitando (s)<input class="m-typing" type="number" min="0" step="0.1" value="${Number(msg.typing)}" /></label>
//       <label>Reação<input class="m-reaction" value="${escapeHtml(msg.reaction)}" placeholder="❤️" maxlength="6" /></label>
//       <label>Resposta a...<input class="m-reply" value="${escapeHtml(msg.reply)}" placeholder="texto citado" maxlength="80" /></label>
//       <label class="inline-check"><input class="m-read" type="checkbox" ${msg.read?'checked':''}/> ✓✓ azul</label>
//     </div>
//   `;

//   const img = card.querySelector('.image-thumb');
//   if (msg.image) { img.src = msg.image; img.style.display = 'block'; }

//   const refresh = (rerenderEditor = false) => {
//     msg.sender = card.querySelector('.m-sender').value;
//     msg.type = card.querySelector('.m-type').value;
//     msg.text = card.querySelector('.m-text').value;
//     msg.time = card.querySelector('.m-time').value;
//     msg.delay = Math.max(0, Number(card.querySelector('.m-delay').value) || 0);
//     msg.typing = Math.max(0, Number(card.querySelector('.m-typing').value) || 0);
//     msg.reaction = card.querySelector('.m-reaction').value;
//     msg.reply = card.querySelector('.m-reply').value;
//     msg.read = card.querySelector('.m-read').checked;
//     if (rerenderEditor) renderEditor();
//     renderAllMessages(); saveState();
//   };

//   card.querySelector('.m-sender').addEventListener('change', () => refresh(true));
//   card.querySelector('.m-type').addEventListener('change', () => refresh(true));
//   card.querySelector('.m-text').addEventListener('input', () => refresh(false));
//   card.querySelector('.m-time').addEventListener('input', () => refresh(false));
//   card.querySelector('.m-delay').addEventListener('change', () => refresh(false));
//   card.querySelector('.m-typing').addEventListener('change', () => refresh(false));
//   card.querySelector('.m-reaction').addEventListener('input', () => refresh(false));
//   card.querySelector('.m-reply').addEventListener('input', () => refresh(false));
//   card.querySelector('.m-read').addEventListener('change', () => refresh(false));
//   card.querySelector('.delete-message').addEventListener('click', () => {
//     state.messages = state.messages.filter((m) => m.id !== msg.id);
//     renderEditor(); renderAllMessages(); saveState();
//   });
//   card.querySelector('.choose-image').addEventListener('click', () => card.querySelector('.m-image').click());
//   card.querySelector('.m-image').addEventListener('change', async (e) => {
//     const file = e.target.files?.[0]; if (!file) return;
//     if (!file.type.startsWith('image/')) return toast('Escolha uma imagem.', true);
//     msg.image = await fileToDataUrl(file);
//     renderEditor(); renderAllMessages(); saveState();
//   });

//   return card;
// }

// function escapeHtml(text) {
//   return String(text ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
// }

// function makeTicks(read) {
//   const span = document.createElement('span');
//   span.className = `ticks ${read ? '' : 'gray'}`;
//   span.innerHTML = `<svg viewBox="0 0 18 11" aria-hidden="true"><path d="m1.5 5.8 3.2 3.1L10 3.2"></path><path d="m7 5.8 3.2 3.1L16.5 2"></path></svg>`;
//   return span;
// }

// function createBubble(msg, index = 0, messages = []) {
//   if (msg.type === 'missedcall') {
//     const sys = document.createElement('div');
//     sys.className = 'system-line';
//     sys.textContent = msg.text || (msg.sender === 'incoming' ? 'Chamada de voz perdida' : 'Chamada de voz');
//     return sys;
//   }

//   const prev = messages[index - 1];
//   const next = messages[index + 1];
//   const samePrev = !!(prev && prev.sender === msg.sender && prev.type !== 'missedcall');
//   const sameNext = !!(next && next.sender === msg.sender && next.type !== 'missedcall');

//   const row = document.createElement('div');
//   row.className = `bubble-row ${msg.sender} ${samePrev ? 'continued' : 'new-block'} ${sameNext ? 'has-next' : 'end-block'}`;
//   const bubble = document.createElement('div');
//   bubble.className = `message-bubble ${samePrev ? 'continued' : ''}`.trim();

//   if (msg.reply) {
//     const reply = document.createElement('div');
//     reply.className = 'reply-box';
//     reply.innerHTML = `<b>${msg.sender === 'outgoing' ? 'Contato' : 'Você'}</b>${escapeHtml(msg.reply)}`;
//     bubble.appendChild(reply);
//   }

//   if (msg.type === 'image' && msg.image) {
//     const img = document.createElement('img');
//     img.className = 'message-image';
//     img.src = msg.image;
//     img.alt = 'Imagem simulada enviada no chat';
//     bubble.appendChild(img);
//     if (msg.text) {
//       const cap = document.createElement('span'); cap.textContent = msg.text; bubble.appendChild(cap);
//     }
//   } else if (msg.type === 'audio') {
//     const audio = document.createElement('div'); audio.className = 'audio-ui';
//     audio.innerHTML = `<span class="audio-play">▶</span><span class="wave">${'<i></i>'.repeat(34)}</span><span class="audio-time">0:18</span>`;
//     bubble.appendChild(audio);
//   } else if (msg.type === 'deleted') {
//     const del = document.createElement('span'); del.className = 'deleted-copy'; del.textContent = '⊘ Esta mensagem foi apagada'; bubble.appendChild(del);
//   } else {
//     const text = document.createElement('span'); text.textContent = msg.text || ''; bubble.appendChild(text);
//   }

//   const meta = document.createElement('span');
//   meta.className = 'message-meta';
//   const time = document.createElement('span'); time.textContent = msg.time || '';
//   meta.appendChild(time);
//   if (msg.sender === 'outgoing') meta.appendChild(makeTicks(msg.read));
//   bubble.appendChild(meta);

//   if (msg.reaction) {
//     const reaction = document.createElement('span'); reaction.className = 'reaction-chip'; reaction.textContent = msg.reaction; bubble.appendChild(reaction);
//   }

//   row.appendChild(bubble);
//   return row;
// }

// function renderAllMessages() {
//   const view = $('#messageViewport');
//   view.innerHTML = '';
//   state.messages.forEach((msg, index) => view.appendChild(createBubble(msg, index, state.messages)));
//   requestAnimationFrame(() => view.scrollTop = view.scrollHeight);
// }

// function renderPlaybackMessages() {
//   const view = $('#messageViewport');
//   view.innerHTML = '';
//   playback.rendered.forEach((msg, index) => view.appendChild(createBubble(msg, index, playback.rendered)));
//   requestAnimationFrame(() => view.scrollTo({top:view.scrollHeight, behavior:'smooth'}));
// }

// function nextSuggestedTime() {
//   const last = state.messages.at(-1)?.time || state.device.time || '10:54';
//   const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(last);
//   if (!m) return last;
//   let h = Number(m[1]); let min = Number(m[2]) + 1;
//   if (min >= 60) { min -= 60; h = (h + 1) % 24; }
//   return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
// }

// function parseQuickScript() {
//   const raw = $('#quickScript').value.trim();
//   if (!raw) return toast('Cole um roteiro primeiro.', true);
//   const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
//   const created = [];
//   let minuteOffset = 1;
//   lines.forEach((line) => {
//     const match = line.match(/^([^:]{1,30}):\s*(.*)$/);
//     if (!match) return;
//     const who = match[1].trim().toLowerCase();
//     const text = match[2].trim();
//     const outgoing = ['eu','me','você','voce','mim'].includes(who);
//     created.push({
//       id: cryptoId(), sender: outgoing ? 'outgoing' : 'incoming', type:'text', text,
//       time: addMinutes(state.device.time, minuteOffset), delay:0.8, typing: outgoing ? 0.9 : 1.25,
//       read: outgoing, reaction:'', reply:'', image:''
//     });
//     if (created.length % 2 === 0) minuteOffset++;
//   });
//   if (!created.length) return toast('Use linhas como “Contato: oi” e “Eu: oi”.', true);
//   state.messages = created;
//   renderEditor(); renderAllMessages(); saveState();
//   toast(`${created.length} mensagens criadas.`);
// }

// function addMinutes(time, offset) {
//   const m = /^(\d{1,2}):(\d{2})$/.exec(time || '10:54');
//   let h = m ? Number(m[1]) : 10; let min = m ? Number(m[2]) : 54;
//   min += offset;
//   h = (h + Math.floor(min / 60)) % 24;
//   min = ((min % 60) + 60) % 60;
//   return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
// }

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// async function waitPausable(ms, token) {
//   let left = ms;
//   let last = performance.now();
//   while (left > 0) {
//     if (token !== playback.token) return false;
//     await sleep(50);
//     const now = performance.now();
//     if (!playback.paused) left -= (now - last);
//     last = now;
//   }
//   return true;
// }

// async function playScene(fromStart = true) {
//   playback.token += 1;
//   const token = playback.token;
//   playback.paused = false;
//   $('#pauseBtn').textContent = 'Pausar';
//   $('#playBtn').textContent = '▶ Reproduzindo';

//   if (fromStart) {
//     playback.cursor = 0;
//     playback.rendered = [];
//     renderPlaybackMessages();
//   }

//   for (let i = playback.cursor; i < state.messages.length; i++) {
//     const msg = state.messages[i];
//     const speed = Math.max(.1, Number(state.speed) || 1);
//     if (!(await waitPausable((msg.delay || 0) * 1000 / speed, token))) return;

//     if (msg.typing > 0 && ['text','audio','image'].includes(msg.type)) {
//       $('#typingRow').classList.remove('hidden');
//       if (msg.sender === 'incoming' && state.contact.status) $('#stageContactStatus').textContent = 'digitando…';
//       if (!(await waitPausable(msg.typing * 1000 / speed, token))) return;
//       $('#typingRow').classList.add('hidden');
//       $('#stageContactStatus').textContent = state.contact.status || '';
//     }

//     playback.rendered.push(msg);
//     playback.cursor = i + 1;
//     renderPlaybackMessages();
//   }
//   $('#typingRow').classList.add('hidden');
//   $('#stageContactStatus').textContent = state.contact.status || '';
//   $('#playBtn').textContent = '▶ Reproduzir novamente';
// }

// function togglePause() {
//   playback.paused = !playback.paused;
//   $('#pauseBtn').textContent = playback.paused ? 'Continuar' : 'Pausar';
//   if (!playback.paused && playback.cursor < state.messages.length) playScene(false);
// }

// function resetPlayback() {
//   playback.token += 1;
//   playback.paused = false;
//   playback.cursor = 0;
//   playback.rendered = [];
//   $('#typingRow').classList.add('hidden');
//   $('#stageContactStatus').textContent = state.contact.status || '';
//   $('#playBtn').textContent = '▶ Reproduzir';
//   $('#pauseBtn').textContent = 'Pausar';
//   renderAllMessages();
// }

// function toggleRecordingMode(force) {
//   const on = typeof force === 'boolean' ? force : !document.body.classList.contains('recording-mode');
//   document.body.classList.toggle('recording-mode', on);
//   $('#recordModeBtn').textContent = on ? 'Sair do modo gravação' : '⛶ Modo gravação';
//   if (on) {
//     renderPhoneStatic();
//     setTimeout(adjustMessagePadding, 120);
//   }
// }



// function wait(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function videoReady(video) {
//   if (video.readyState >= 2 && video.videoWidth && video.videoHeight) return;
//   await new Promise((resolve, reject) => {
//     const timer = setTimeout(() => reject(new Error('A captura não iniciou a tempo.')), 8000);
//     const done = () => {
//       if (!video.videoWidth || !video.videoHeight) return;
//       clearTimeout(timer);
//       video.removeEventListener('loadedmetadata', done);
//       video.removeEventListener('canplay', done);
//       resolve();
//     };
//     video.addEventListener('loadedmetadata', done);
//     video.addEventListener('canplay', done);
//   });
// }

// function createCaptureOverlay(phone) {
//   const originalParent = phone.parentNode;
//   const originalNext = phone.nextSibling;
//   const originalStyle = phone.getAttribute('style');
//   const width = phone.clientWidth;
//   const height = phone.clientHeight;

//   const overlay = document.createElement('div');
//   overlay.className = 'export-capture-overlay';
//   overlay.id = 'exportCaptureOverlay';
//   document.body.appendChild(overlay);

//   overlay.appendChild(phone);
//   phone.style.width = `${width}px`;
//   phone.style.height = `${height}px`;
//   phone.style.minWidth = `${width}px`;
//   phone.style.minHeight = `${height}px`;
//   phone.style.maxWidth = 'none';
//   phone.style.maxHeight = 'none';
//   phone.style.borderRadius = '0';
//   phone.style.margin = '0';
//   phone.style.boxShadow = 'none';

//   const viewportW = window.visualViewport?.width || window.innerWidth;
//   const viewportH = window.visualViewport?.height || window.innerHeight;
//   const availableW = Math.max(100, viewportW - 16);
//   const availableH = Math.max(100, viewportH - 16);
//   const fit = Math.min(2.25, availableW / width, availableH / height);
//   phone.style.transformOrigin = 'center center';
//   phone.style.transform = `scale(${fit})`;

//   document.body.classList.add('export-capture-active');

//   return {
//     overlay,
//     width,
//     height,
//     fit,
//     restore() {
//       document.body.classList.remove('export-capture-active');
//       if (originalNext && originalNext.parentNode === originalParent) originalParent.insertBefore(phone, originalNext);
//       else originalParent.appendChild(phone);
//       if (originalStyle === null) phone.removeAttribute('style');
//       else phone.setAttribute('style', originalStyle);
//       overlay.remove();
//     }
//   };
// }

// async function captureCurrentTabFrame() {
//   if (!navigator.mediaDevices?.getDisplayMedia) {
//     throw new Error('Seu navegador não oferece captura de guia. Use Chrome ou Edge atualizado.');
//   }

//   let stream;
//   try {
//     stream = await navigator.mediaDevices.getDisplayMedia({
//       video: {
//         displaySurface: 'browser',
//         frameRate: { ideal: 5, max: 10 }
//       },
//       audio: false,
//       preferCurrentTab: true,
//       selfBrowserSurface: 'include',
//       surfaceSwitching: 'exclude',
//       systemAudio: 'exclude'
//     });
//   } catch (error) {
//     if (error?.name === 'NotAllowedError') throw new Error('Captura cancelada. Escolha “Esta guia” e clique em Compartilhar.');
//     throw error;
//   }

//   const track = stream.getVideoTracks()[0];
//   const settings = track?.getSettings?.() || {};
//   if (settings.displaySurface && settings.displaySurface !== 'browser') {
//     stream.getTracks().forEach((t) => t.stop());
//     throw new Error('Escolha “Esta guia” na janela de compartilhamento, não a tela inteira.');
//   }

//   const video = document.createElement('video');
//   video.muted = true;
//   video.playsInline = true;
//   video.srcObject = stream;
//   document.body.appendChild(video);

//   try {
//     await video.play();
//     await videoReady(video);
//     await wait(180);
//     return { video, stream };
//   } catch (error) {
//     stream.getTracks().forEach((t) => t.stop());
//     video.remove();
//     throw error;
//   }
// }

// async function exportPhonePrint() {
//   return exportPhonePrintV26();
// }

// async function toggleRecording() {
//   if (mediaRecorder?.state === 'recording') {
//     mediaRecorder.stop();
//     activeStream?.getTracks().forEach((t) => t.stop());
//     return;
//   }
//   if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
//     return toast('Este navegador não suporta gravação de tela.', true);
//   }
//   try {
//     toggleRecordingMode(true);
//     activeStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
//     const preferred = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
//     mediaRecorder = new MediaRecorder(activeStream, preferred ? { mimeType: preferred } : undefined);
//     recordedChunks = [];
//     mediaRecorder.ondataavailable = (e) => { if (e.data?.size) recordedChunks.push(e.data); };
//     mediaRecorder.onstop = () => {
//       const blob = new Blob(recordedChunks, {type: mediaRecorder.mimeType || 'video/webm'});
//       downloadBlob(blob, `conversa-simulada-${Date.now()}.webm`);
//       $('#recordBtn').textContent = '● Gravar WebM';
//       toast('Gravação salva em WebM.');
//     };
//     mediaRecorder.start(250);
//     $('#recordBtn').textContent = '■ Parar gravação';
//     toast('Gravando. Selecione esta aba/janela na captura do navegador.');
//   } catch (err) {
//     $('#recordBtn').textContent = '● Gravar WebM';
//     toast('A captura de tela foi cancelada.', true);
//   }
// }

// function newProject() {
//   if (!confirm('Criar um projeto novo? O projeto atual salvo no navegador será substituído.')) return;
//   state = deepClone(DEFAULT_STATE);
//   state.messages.forEach((m) => m.id = cryptoId());
//   saveState();
//   location.reload();
// }

// function exportProject() {
//   const exportable = deepClone(state);
//   // Disclosure is deliberately not a project setting; it is always present in the app.
//   downloadBlob(new Blob([JSON.stringify(exportable, null, 2)], {type:'application/json'}), `chat-story-${Date.now()}.json`);
// }

// async function importProject(e) {
//   const file = e.target.files?.[0]; if (!file) return;
//   try {
//     const parsed = JSON.parse(await file.text());
//     state = normalizeState(parsed);
//     saveState();
//     location.reload();
//   } catch {
//     toast('JSON inválido.', true);
//   } finally {
//     e.target.value = '';
//   }
// }

// function downloadBlob(blob, filename) {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
//   setTimeout(() => URL.revokeObjectURL(url), 1000);
// }

// // =============================================================================
// // V26 — PNG limpo em alta resolução + conversas em massa por Excel/CSV
// // =============================================================================
// let batchRows = [];
// let batchSourceName = '';
// let batchPreviewRestore = null;
// let batchMode = "generic";
// let batchCancelled = false;
// let captureCssCache = null;
// let captureAssetCache = new Map();

// function normalizeHeader(value) {
//   return String(value ?? '')
//     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//     .trim().toLowerCase()
//     .replace(/[^a-z0-9]+/g, '_')
//     .replace(/^_+|_+$/g, '');
// }

// function rowValue(row, ...keys) {
//   for (const key of keys) {
//     const normalized = normalizeHeader(key);
//     const value = row?.[normalized];
//     if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
//   }
//   return '';
// }

// function applyVariables(value, row) {
//   const source = String(value ?? '');
//   const replaceToken = (_, rawKey) => {
//     const key = normalizeHeader(rawKey);
//     if (!key) return _;
//     const found = row?.[key];
//     return found === undefined || found === null ? _ : String(found);
//   };
//   return source
//     .replace(/\{\{\s*([^{}]+?)\s*\}\}/g, replaceToken)
//     .replace(/\{\s*([^{}]+?)\s*\}/g, replaceToken);
// }

// function sanitizeFileName(name) {
//   return String(name || '')
//     .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
//     .replace(/\s+/g, ' ')
//     .replace(/[. ]+$/g, '')
//     .trim()
//     .slice(0, 150) || 'conversa';
// }

// function parseBooleanCell(value, fallback = false) {
//   if (value === undefined || value === null || String(value).trim() === '') return fallback;
//   return ['1','true','sim','s','yes','y','x'].includes(normalizeHeader(value));
// }

// function parseSender(value, fallback = 'incoming') {
//   const v = normalizeHeader(value);
//   if (['eu','voce','você','outgoing','enviado','saida','saindo'].map(normalizeHeader).includes(v)) return 'outgoing';
//   if (['contato','cliente','incoming','recebido','entrada','recebendo'].map(normalizeHeader).includes(v)) return 'incoming';
//   return fallback === 'outgoing' ? 'outgoing' : 'incoming';
// }

// function buildMessagesFromScriptText(script, row, deviceTime) {
//   const lines = String(script || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
//   const messages = [];
//   let minuteOffset = 1;
//   for (const line of lines) {
//     const match = line.match(/^([^:]{1,40}):\s*(.*)$/);
//     if (!match) continue;
//     const sender = parseSender(match[1], 'incoming');
//     messages.push({
//       id: cryptoId(), sender, type:'text', text:applyVariables(match[2], row),
//       time:addMinutes(deviceTime || '10:54', minuteOffset), delay:0.3, typing:0,
//       read:sender === 'outgoing', reaction:'', reply:'', image:''
//     });
//     if (messages.length % 2 === 0) minuteOffset += 1;
//   }
//   return messages;
// }

// function buildMessagesFromExcelColumns(baseMessages, row, deviceTime) {
//   const indices = Object.keys(row)
//     .map((key) => /^mensagem_(\d+)$/.exec(key))
//     .filter(Boolean)
//     .map((m) => Number(m[1]))
//     .sort((a,b) => a-b);
//   const unique = [...new Set(indices)];
//   if (!unique.length) return null;

//   const out = [];
//   unique.forEach((n, idx) => {
//     const text = rowValue(row, `mensagem_${n}`);
//     if (!text) return;
//     const base = baseMessages[idx] || {};
//     const sender = parseSender(rowValue(row, `lado_${n}`, `remetente_${n}`, `sender_${n}`), base.sender || 'incoming');
//     const typeRaw = normalizeHeader(rowValue(row, `tipo_${n}`) || base.type || 'text');
//     const type = ['text','audio','image','deleted','missedcall'].includes(typeRaw) ? typeRaw : 'text';
//     out.push({
//       id: cryptoId(),
//       sender,
//       type,
//       text: applyVariables(text, row),
//       time: applyVariables(rowValue(row, `hora_${n}`) || base.time || addMinutes(deviceTime || '10:54', idx + 1), row),
//       delay: Math.max(0, Number(rowValue(row, `espera_${n}`, `delay_${n}`) || base.delay || 0.3)),
//       typing: Math.max(0, Number(rowValue(row, `digitando_${n}`, `typing_${n}`) || base.typing || 0)),
//       read: parseBooleanCell(rowValue(row, `lida_${n}`, `read_${n}`), sender === 'outgoing'),
//       reaction: applyVariables(rowValue(row, `reacao_${n}`) || base.reaction || '', row),
//       reply: applyVariables(rowValue(row, `resposta_${n}`, `reply_${n}`) || base.reply || '', row),
//       image: base.image || ''
//     });
//   });
//   return out;
// }

// function buildStateForBatchRow(baseState, row) {
//   const out = deepClone(baseState);
//   const useName = $('#batchContactFromName')?.checked !== false;

//   const explicitContact = rowValue(row, 'contato', 'nome_contato');
//   const rowName = rowValue(row, 'nome');
//   if (explicitContact) out.contact.name = applyVariables(explicitContact, row);
//   else if (useName && rowName) out.contact.name = rowName;
//   else out.contact.name = applyVariables(out.contact.name, row);

//   out.contact.status = applyVariables(rowValue(row, 'status') || out.contact.status || '', row);
//   const avatarLetter = rowValue(row, 'avatar_letra', 'letra_avatar');
//   if (avatarLetter) out.contact.avatarLetter = avatarLetter.slice(0,1).toUpperCase();

//   out.device.time = applyVariables(rowValue(row, 'hora', 'hora_celular') || out.device.time || '10:54', row);
//   const network = rowValue(row, 'rede');
//   if (network) out.device.network = network;
//   const battery = Number(rowValue(row, 'bateria'));
//   if (Number.isFinite(battery) && battery > 0) out.device.battery = clamp(battery, 1, 100);
//   const muted = rowValue(row, 'silencioso');
//   if (muted) out.device.muted = parseBooleanCell(muted, out.device.muted);
//   const charging = rowValue(row, 'carregando');
//   if (charging) out.device.charging = parseBooleanCell(charging, out.device.charging);

//   out.chat.date = applyVariables(rowValue(row, 'data', 'data_exibida') || out.chat.date || 'Hoje', row);
//   const encryption = rowValue(row, 'mostrar_criptografia', 'criptografia');
//   if (encryption) out.chat.showEncryption = parseBooleanCell(encryption, out.chat.showEncryption);
//   out.chat.encryptionText = applyVariables(out.chat.encryptionText, row);

//   const useExcelMessages = $('#batchUseExcelMessages')?.checked !== false;
//   const script = rowValue(row, 'roteiro');
//   let messages = null;
//   if (useExcelMessages && script) messages = buildMessagesFromScriptText(script, row, out.device.time);
//   if (useExcelMessages && (!messages || !messages.length)) messages = buildMessagesFromExcelColumns(baseState.messages, row, out.device.time);

//   if (!messages || !messages.length) {
//     messages = baseState.messages.map((message) => ({
//       ...deepClone(message), id: cryptoId(),
//       text: applyVariables(message.text, row),
//       time: applyVariables(message.time, row),
//       reaction: applyVariables(message.reaction, row),
//       reply: applyVariables(message.reply, row)
//     }));
//   }
//   out.messages = messages.map(message => ({
//     ...message,
//     reaction: ''
//   }));
//   return normalizeState(out);
// }


// // Relatórios de retenção são exportados com BOM UTF-16LE e algumas linhas
// // totalmente envolvidas por aspas, contendo pares de aspas duplicados.
// // O CSV é lido localmente pelo navegador, sem envio para servidores.
// async function readReportText(file) {
//   const bytes = new Uint8Array(await file.arrayBuffer());
//   if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
//     return new TextDecoder('utf-16le').decode(bytes);
//   }
//   if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
//     return new TextDecoder('utf-16be').decode(bytes);
//   }
//   if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
//     return new TextDecoder('utf-8').decode(bytes);
//   }
//   try {
//     return new TextDecoder('utf-8', {fatal:true}).decode(bytes);
//   } catch {
//     return new TextDecoder('windows-1252').decode(bytes);
//   }
// }

// function fixWrappedRetentionCsv(text) {
//   const raw = String(text || '').replace(/^\uFEFF/, '');
//   const first = raw.split(/\r?\n/, 1)[0] || '';
//   if (!/^"[^"\r\n]*;""/.test(first)) return raw;
//   return raw.split(/\r?\n/).map((line) => {
//     if (line.startsWith('"') && line.endsWith('"')) {
//       return line.slice(1, -1).replace(/""/g, '"');
//     }
//     return line;
//   }).join('\n');
// }

// function isRetentionContractReport(rows) {
//   if (!rows.length) return false;
//   const first = rows[0];
//   return ['cliente','cpf_cliente','contrato','n_portabilidade','banco','loja','telefone']
//     .every((field) => Object.hasOwn(first, field));
// }

// function digitsOnly(value) { return String(value ?? '').replace(/\D/g, ''); }
// function finalCpf(value) {
//   const digits = digitsOnly(value), end = digits.slice(-5);
//   return end.length >= 3 ? `${end.slice(0,-2)}-${end.slice(-2)}` : end;
// }
// function lastFour(value) { return digitsOnly(value).slice(-4); }
// function formatContactPhone(value) {
//   let digits = digitsOnly(value);
//   if (digits.startsWith('55') && [12,13].includes(digits.length)) digits = digits.slice(2);
//   if (digits.length === 11) return `+55 ${digits.slice(0,2)} ${digits.slice(2,7)}-${digits.slice(7)}`;
//   if (digits.length === 10) return `+55 ${digits.slice(0,2)} ${digits.slice(2,6)}-${digits.slice(6)}`;
//   return String(value ?? '').trim();
// }
// function formattedToday() {
//   return new Intl.DateTimeFormat('pt-BR', {day:'numeric', month:'long', year:'numeric'}).format(new Date());
// }
// function readableDateToday() { return new Intl.DateTimeFormat('pt-BR').format(new Date()); }
// function distinctTexts(values) { return [...new Set(values.map((v) => String(v ?? '').trim()).filter(Boolean))]; }
// function joinPt(items) {
//   const valid = items.filter(Boolean);
//   if (valid.length < 2) return valid[0] || '';
//   if (valid.length === 2) return `${valid[0]} e ${valid[1]}`;
//   return `${valid.slice(0,-1).join(', ')} e ${valid[valid.length-1]}`;
// }

// // Os repertórios abaixo são os mesmos da automação Python fornecida pelo usuário.
// // Utilizados EXCLUSIVAMENTE para construir prévias fictícias com marca de SIMULAÇÃO.
// const PRIMEIRA_RESPOSTA_NEUTRAS = Object.freeze(["Pode.","Pode sim.","Sim, pode.","Pode mandar.","Manda sim.","Pode enviar.","Pode falar.","Pode seguir.","Pode continuar.","Pode prosseguir.","Sim, manda.","Ok, pode.","Ok, manda.","Certo, pode.","Tá bom, pode.","Tudo bem, pode.","Pode mandar sim.","Pode enviar sim.","pd sim","pd mandar","pode sim","pode mandar","manda aí","manda ai","pode falar sim","blz, pode mandar","beleza, manda aí","ok, manda aí","sim, pode mandar","pode enviar aí","pode mandar aí","ta bom, manda","tá bom, manda","certo, manda aí","pode sim, manda aí","sim sim, pode mandar","Tudo bem, pode mandar.","Pode sim, pode enviar.","Claro, pode mandar.","Tudo certo, pode enviar.","Pode prosseguir, por favor.","Sim, pode mandar a mensagem.","Pode enviar, sem problema.","Certo, pode me mandar.","Ok, pode enviar.","Pode sim, fico no aguardo.","Tá certo, pode mandar.","Beleza, pode enviar.","Pode enviar, estou acompanhando.","Sim, pode prosseguir.","Certo, pode seguir.","Sem problema, pode enviar.","Pode seguir com a mensagem.","Tudo certo por aqui, pode mandar.","Pode enviar os dados.","Pode mandar para eu conferir.","Pode prosseguir normalmente.","Sim, pode continuar.","Certo, estou aguardando.","Pode enviar quando quiser.","Pode mandar, estou vendo aqui.","Tudo bem, pode seguir.","Sim, manda por favor.","Pode encaminhar.","Pode enviar para mim.","Pode seguir, por gentileza.","Ok, pode prosseguir.","Pode mandar que eu verifico.","Certo, pode me enviar.","Pode mandar, está tudo bem.","Tudo bem, pode continuar.","Pode sim, estou aqui.","Pode mandar, estou acompanhando.","Pode enviar, vou olhar aqui.","Manda que eu confiro.","Pode seguir, estou acompanhando.","Sim, pode mandar por aqui.","Pode mandar as informações.","Certo, manda pra mim.","Pode mandar que eu vejo.","Ok, pode passar.","Pode passar as informações.","Pode sim, sem problema.","Sim, tranquilo.","Tranquilo, pode seguir.","Tá certo, pode passar.","Pode continuar por aqui.","Sim, pode enviar por aqui.","Pode mandar, por favor.","Certo, pode passar.","Tudo certo, manda aí.","Sim, pode falar.","Pode seguir sim."]);
// const PRIMEIRA_RESPOSTA_MANHA = Object.freeze(["Bom dia! Pode mandar.","Bom dia! Pode sim.","Bom dia, pode enviar.","Bom dia, manda aí.","Bom dia! Pode falar.","Bom dia, pode seguir.","Bom dia! Tudo bem, pode mandar.","Bom dia! Pode sim, pode enviar.","Bom dia, claro, pode mandar.","Bom dia! Tudo certo, pode prosseguir.","Bom dia, pode enviar sim.","Bom dia! Pode mandar, fico no aguardo.","Bom dia! Pode prosseguir.","Bom dia, pode me enviar.","Bom dia! Pode mandar os dados.","Bom dia, tudo certo. Pode seguir.","Bom dia! Pode enviar para eu conferir.","Bom dia, sem problema. Pode mandar.","Bom dia! Pode continuar, por favor.","Bom dia, pode encaminhar.","Bom dia! Sim, pode prosseguir.","Bom dia, estou acompanhando. Pode mandar.","Bom dia! Pode seguir normalmente.","Bom dia, pode mandar que eu verifico.","Bom dia, tranquilo. Pode mandar.","Bom dia! Manda aí.","Bom dia, pode passar.","Bom dia! Pode falar sim."]);
// const PRIMEIRA_RESPOSTA_TARDE = Object.freeze(["Boa tarde! Pode mandar.","Boa tarde! Pode sim.","Boa tarde, pode enviar.","Boa tarde, manda aí.","Boa tarde! Pode falar.","Boa tarde, pode seguir.","Boa tarde! Tudo bem, pode mandar.","Boa tarde! Pode sim, pode enviar.","Boa tarde, claro, pode mandar.","Boa tarde! Tudo certo, pode prosseguir.","Boa tarde, pode enviar sim.","Boa tarde! Pode mandar, fico no aguardo.","Boa tarde! Pode prosseguir.","Boa tarde, pode me enviar.","Boa tarde! Pode mandar os dados.","Boa tarde, tudo certo. Pode seguir.","Boa tarde! Pode enviar para eu conferir.","Boa tarde, sem problema. Pode mandar.","Boa tarde! Pode continuar, por favor.","Boa tarde, pode encaminhar.","Boa tarde! Sim, pode prosseguir.","Boa tarde, estou acompanhando. Pode mandar.","Boa tarde! Pode seguir normalmente.","Boa tarde, pode mandar que eu verifico.","Boa tarde, tranquilo. Pode mandar.","Boa tarde! Manda aí.","Boa tarde, pode passar.","Boa tarde! Pode falar sim."]);
// const SEGUNDA_RESPOSTA = Object.freeze(["Confirmo.","Sim, confirmo.","Confirmo sim.","Está correto, confirmo.","Tudo certo, confirmo.","Sim, está correto.","Pode prosseguir, confirmo.","Confirmado.","Certo, confirmo.","Sim, pode seguir.","Confirmo o cancelamento.","Está tudo certo, pode prosseguir.","Sim, confirmo o cancelamento.","Confirmo, está correto.","Correto, pode seguir.","Sim, pode dar continuidade.","Pode seguir, está confirmado.","Confirmado por mim.","Sim, tudo certo.","Está certo, pode prosseguir.","Pode continuar, confirmo.","Sim, essa informação está correta.","Confirmo essas informações.","Está correto, pode seguir.","Sim, está confirmado.","Pode dar andamento.","Confirmo, pode continuar.","Sim, pode concluir.","Tudo certo, pode concluir.","De acordo, pode prosseguir.","Sim, estou de acordo.","Correto, confirmo.","Confirmo e pode seguir.","Pode prosseguir com o cancelamento.","Sim, pode cancelar.","Confirmo que pode cancelar.","Certo, pode dar andamento.","Tudo certo por aqui, pode seguir.","Confirmado, pode prosseguir.","Sim, pode finalizar.","Pode finalizar, confirmo.","Está tudo correto.","Sim, essas informações conferem.","Confirmo os dados informados.","Pode continuar, está correto.","De acordo, confirmo.","Sim.","Sim, correto.","Isso, confirmo.","Isso mesmo.","Certo, confirmo.","Tá certo.","Tudo certo.","Pode seguir.","Pode concluir.","Pode finalizar.","Sim, pode.","Confirmado sim.","Ok, confirmo.","Beleza, confirmo.","Tá correto.","Sim, é isso.","Isso, pode seguir.","Certo, pode seguir.","Tudo certo, pode seguir.","Sim, pode continuar."]);

// const RECENT_RESPONSES = 18;

// function randomBetween(minimum, maximum) {
//   return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
// }
// function randomResponseUnique(options, history, avoid = '') {
//   const blocked = new Set(history.slice(-RECENT_RESPONSES));
//   if (avoid) blocked.add(avoid);
//   let candidates = options.filter((text) => !blocked.has(text));
//   if (!candidates.length) {
//     history.length = 0;
//     candidates = options.filter((text) => text !== avoid);
//     if (!candidates.length) candidates = [...options];
//   }
//   const chosen = candidates[randomBetween(0, candidates.length-1)];
//   history.push(chosen);
//   if (history.length > RECENT_RESPONSES*2) history.splice(0, history.length-RECENT_RESPONSES);
//   return chosen;
// }
// function randomConversationTimes() {
//   // Mesma regra Python: 08:00–18:00, intervalos [1,30], [1,5], [1,30], [1,5].
//   const min = 8*60, max = 18*60;
//   const gap1 = randomBetween(1,30);
//   const gap2 = randomBetween(1,5);
//   const gap3 = randomBetween(1,30);
//   const gapTop = randomBetween(1,5);
//   const first = randomBetween(min, max-gap1-gap2-gap3-gapTop);
//   const minutes = [first,first+gap1,first+gap1+gap2,first+gap1+gap2+gap3,first+gap1+gap2+gap3+gapTop];
//   return minutes.map((total)=>`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`);
// }
// function retentionReportToBatchRows(source) {
//   const groups = new Map();
//   for (let idx = 0; idx < source.length; idx++) {
//     const row = source[idx];
//     const cpf = digitsOnly(rowValue(row, 'cpf_cliente'));
//     const numero = String(rowValue(row, 'n_portabilidade')).replace(/\.0+$/, '');
//     const key = `${cpf || `SEMCPF_${idx}`}::${numero || `SEMNUM_${idx}`}`;
//     if (!groups.has(key)) groups.set(key, []);
//     groups.get(key).push(row);
//   }
//   const history1 = [];
//   const history2 = [];
//   let lastReply1 = '';
//   const result = [];
//   for (const group of groups.values()) {
//     const first = group[0];
//     const nome = rowValue(first, 'cliente');
//     const cpf = rowValue(first, 'cpf_cliente');
//     const numero = String(rowValue(first,'n_portabilidade')).replace(/\.0+$/,'');
//     const telefone = formatContactPhone(rowValue(first, 'telefone'));
//     const contratos = distinctTexts(group.map((r) => rowValue(r, 'contrato')));
//     const bancos = distinctTexts(group.map((r) => rowValue(r, 'banco')));
//     const nomeBanco = joinPt(bancos);
//     const contratoFinais = joinPt(contratos.map(lastFour));
//     const primeiroNome = nome.trim().split(/\s+/)[0] || 'cliente';
//     const primeiroNomeFormatado = primeiroNome;
//     const loja = rowValue(first, 'loja') || 'SEM_LOJA';
//     const [h1,h2,h3,h4,hTop] = randomConversationTimes();
//     const greeting = Number(h1.slice(0,2)) < 12 ? 'Bom dia' : 'Boa tarde';
//     const options1 = PRIMEIRA_RESPOSTA_NEUTRAS.concat(Number(h2.slice(0,2)) < 12 ? PRIMEIRA_RESPOSTA_MANHA : PRIMEIRA_RESPOSTA_TARDE);
//     const reply1 = randomResponseUnique(options1, history1, lastReply1);
//     const reply2 = randomResponseUnique(SEGUNDA_RESPOSTA, history2, reply1);
//     lastReply1 = reply1;
//     const abertura = `${greeting}, Sr.(a) ${primeiroNomeFormatado}. Conforme conversamos anteriormente por telefone, como o(a) senhor(a) não deseja prosseguir com a portabilidade, precisamos apenas confirmar essa decisão. Na sequência, enviarei os dados da solicitação para sua conferência. Pode confirmar se posso prosseguir?`;
//     const oficial = `Sr.(a) ${nome}, com final de CPF ${finalCpf(cpf)}, conforme sua aprovação, na data de hoje ${readableDateToday()}, estamos cancelando a sua solicitação de portabilidade de número ${numero}, efetuada pelo Banco ${nomeBanco}, referente ao(s) contrato(s) final(is) ${contratoFinais}, mediante oferta de refinanciamento. O Sr.(a) confirma?`;
//     result.push({
//       ...first,
//       nome, cpf, contato: telefone || 'Contato', avatar_letra: nome.slice(0,1).toUpperCase(),
//       numero, numero_portabilidade:numero, contrato: joinPt(contratos),
//       banco: nomeBanco, loja, empresa: nomeBanco, telefone,
//       data_exibida: formattedToday(), hora_celular: hTop,
//       status: 'Online',
//       rede: '4G+', bateria:'35', silencioso:'nao', carregando:'nao', mostrar_criptografia:'sim',
//       mensagem_1: abertura,
//       // Os textos foram sorteados; jamais são evidência de que um cliente respondeu.
//       mensagem_2: `${reply1}`,
//       mensagem_3: oficial,
//       mensagem_4: `${reply2}`,
//       lado_1:'eu', lado_2:'contato', lado_3:'eu', lado_4:'contato',
//       hora_1:h1, hora_2:h2, hora_3:h3, hora_4:h4,
//       espera_1:'0.8', espera_2:'1.0', espera_3:'0.8', espera_4:'1.0',
//       digitando_1:'1.2', digitando_2:'1.6', digitando_3:'1.2', digitando_4:'1.6',
//       lida_1:'sim', lida_2:'nao', lida_3:'sim', lida_4:'nao',
//       pasta: loja,
//       arquivo: `${contratos.join('_')} - ${nome} - ${cpf}`,
//       situacao_comprovacao:'SIMULAÇÃO DE DIÁLOGO - SEM CONFIRMAÇÃO REAL',
//       linhas_origem:String(group.length)
//     });
//   }
//   return result;
// }

// function parseCsvText(text) {
//   const sample = String(text || '').split(/\r?\n/).find((line) => line.trim()) || '';
//   const separators = [';', ',', '\t'];
//   let sep = ';';
//   let best = -1;
//   for (const candidate of separators) {
//     const count = (sample.match(new RegExp(candidate === '\t' ? '\\t' : `\\${candidate}`, 'g')) || []).length;
//     if (count > best) { best = count; sep = candidate; }
//   }

//   const rows = [];
//   let row = [], cell = '', quoted = false;
//   const src = String(text || '').replace(/^\uFEFF/, '');
//   for (let i = 0; i < src.length; i++) {
//     const ch = src[i];
//     if (ch === '"') {
//       if (quoted && src[i+1] === '"') { cell += '"'; i++; }
//       else quoted = !quoted;
//     } else if (ch === sep && !quoted) {
//       row.push(cell); cell = '';
//     } else if ((ch === '\n' || ch === '\r') && !quoted) {
//       if (ch === '\r' && src[i+1] === '\n') i++;
//       row.push(cell); cell = '';
//       if (row.some((v) => String(v).trim() !== '')) rows.push(row);
//       row = [];
//     } else {
//       cell += ch;
//     }
//   }
//   row.push(cell);
//   if (row.some((v) => String(v).trim() !== '')) rows.push(row);
//   return matrixToObjects(rows);
// }

// function excelColumnIndex(ref) {
//   const letters = String(ref || '').match(/^[A-Z]+/i)?.[0]?.toUpperCase() || 'A';
//   let n = 0;
//   for (const ch of letters) n = n * 26 + ch.charCodeAt(0) - 64;
//   return n - 1;
// }

// function xmlTextNodes(node, tagName) {
//   return Array.from(node?.getElementsByTagName(tagName) || []).map((n) => n.textContent || '').join('');
// }

// async function parseXlsxFile(file) {
//   if (!window.JSZip) throw new Error('Leitor XLSX não carregou. Abra o projeto pelo ABRIR.bat.');
//   const zip = await JSZip.loadAsync(await file.arrayBuffer());
//   const workbookFile = zip.file('xl/workbook.xml');
//   const relsFile = zip.file('xl/_rels/workbook.xml.rels');
//   if (!workbookFile || !relsFile) throw new Error('XLSX inválido: estrutura do Excel não encontrada.');

//   const parser = new DOMParser();
//   const workbook = parser.parseFromString(await workbookFile.async('text'), 'application/xml');
//   const sheets = workbook.getElementsByTagName('sheet');
//   if (!sheets.length) throw new Error('O Excel não possui planilhas.');
//   const relId = sheets[0].getAttribute('r:id') || sheets[0].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');

//   const rels = parser.parseFromString(await relsFile.async('text'), 'application/xml');
//   let target = '';
//   for (const rel of Array.from(rels.getElementsByTagName('Relationship'))) {
//     if (rel.getAttribute('Id') === relId) { target = rel.getAttribute('Target') || ''; break; }
//   }
//   if (!target) target = 'worksheets/sheet1.xml';
//   target = target.replace(/^\//, '');
//   const sheetPath = target.startsWith('xl/') ? target : `xl/${target}`;
//   const sheetFile = zip.file(sheetPath);
//   if (!sheetFile) throw new Error('Não foi possível abrir a primeira planilha do Excel.');

//   let shared = [];
//   const sharedFile = zip.file('xl/sharedStrings.xml');
//   if (sharedFile) {
//     const sharedDoc = parser.parseFromString(await sharedFile.async('text'), 'application/xml');
//     shared = Array.from(sharedDoc.getElementsByTagName('si')).map((si) => xmlTextNodes(si, 't'));
//   }

//   const sheetDoc = parser.parseFromString(await sheetFile.async('text'), 'application/xml');
//   const matrix = [];
//   for (const rowNode of Array.from(sheetDoc.getElementsByTagName('row'))) {
//     const row = [];
//     for (const cell of Array.from(rowNode.getElementsByTagName('c'))) {
//       const index = excelColumnIndex(cell.getAttribute('r'));
//       const type = cell.getAttribute('t') || '';
//       const v = cell.getElementsByTagName('v')[0]?.textContent ?? '';
//       let value = v;
//       if (type === 's') value = shared[Number(v)] ?? '';
//       else if (type === 'inlineStr') value = xmlTextNodes(cell, 't');
//       else if (type === 'b') value = v === '1' ? 'TRUE' : 'FALSE';
//       row[index] = value;
//     }
//     matrix.push(row);
//   }
//   return matrixToObjects(matrix);
// }

// function matrixToObjects(matrix) {
//   const rows = (matrix || []).filter((row) => Array.isArray(row) && row.some((v) => String(v ?? '').trim() !== ''));
//   if (rows.length < 2) return [];
//   const headers = rows[0].map((h, i) => normalizeHeader(h) || `coluna_${i+1}`);
//   const out = [];
//   rows.slice(1).forEach((values, idx) => {
//     const obj = { linha: String(idx + 2) };
//     headers.forEach((header, i) => obj[header] = values[i] === undefined || values[i] === null ? '' : String(values[i]));
//     if (Object.entries(obj).some(([k,v]) => k !== 'linha' && String(v).trim() !== '')) out.push(obj);
//   });
//   return out;
// }

// async function parseBatchFile(file) {
//   const name = String(file?.name || '').toLowerCase();
//   if (name.endsWith('.xlsx')) return parseXlsxFile(file);
//   if (name.endsWith('.csv')) return parseCsvText(fixWrappedRetentionCsv(await readReportText(file)));
//   throw new Error('Formato não suportado. Use .xlsx ou .csv.');
// }

// function updateBatchSummary() {
//   const summary = $('#batchFileSummary');
//   const columns = $('#batchColumns');
//   const preview = $('#previewBatchBtn');
//   const generate = $('#generateBatchBtn');
//   if (!batchRows.length) {
//     summary.textContent = 'Nenhum arquivo carregado.';
//     summary.classList.remove('ready');
//     columns.classList.add('hidden');
//     $('#batchReportMode')?.classList.add('hidden');
//     preview.disabled = true;
//     generate.disabled = true;
//     return;
//   }
//   const keys = Object.keys(batchRows[0]).filter((key) => key !== 'linha');
//   summary.textContent = `${batchSourceName} — ${batchRows.length} ${batchMode === 'retention' ? 'prévia(s) por CPF + portabilidade' : 'conversa(s)'} identificada(s).`;
//   $('#batchReportMode')?.classList.toggle('hidden', batchMode !== 'retention');
//   summary.classList.add('ready');
//   columns.innerHTML = `<strong>Variáveis detectadas:</strong> ${keys.map((key) => `<code>{${escapeHtml(key)}}</code>`).join(' ')}`;
//   columns.classList.remove('hidden');
//   preview.disabled = false;
//   generate.disabled = false;
// }

// async function onBatchFileChange(e) {
//   const file = e.target.files?.[0];
//   if (!file) return;
//   restoreBatchPreview();
//   const summary = $('#batchFileSummary');
//   summary.textContent = 'Lendo arquivo...';
//   summary.classList.remove('ready');
//   try {
//     const imported = await parseBatchFile(file);
//     batchMode = isRetentionContractReport(imported) ? 'retention' : 'generic';
//     batchRows = batchMode === 'retention' ? retentionReportToBatchRows(imported) : imported;
//     batchSourceName = file.name;
//     if (batchMode === 'retention') {
//       $('#batchFilename').value = '{contrato} - {nome} - {cpf}';
//       $('#batchUseExcelMessages').checked = true;
//       $('#batchContactFromName').checked = false;
//     }

//     if (!batchRows.length) throw new Error('Nenhuma linha de conversa foi encontrada após o cabeçalho.');
//     updateBatchSummary();
//     toast(`${batchRows.length} conversa(s) carregada(s).`);
//   } catch (error) {
//     batchRows = [];
//     batchMode = 'generic';
//     batchSourceName = '';
//     updateBatchSummary();
//     toast(error?.message || 'Não foi possível ler o arquivo.', true);
//   }
// }

// function restoreBatchPreview() {
//   if (!batchPreviewRestore) return false;
//   state = batchPreviewRestore;
//   batchPreviewRestore = null;
//   $('#phoneScreen')?.classList.remove('batch-fit-1', 'batch-fit-2', 'batch-fit-3');
//   renderEditor(); renderPhoneStatic(); renderAllMessages();
//   $('#previewBatchBtn').textContent = 'Pré-visualizar 1ª conversa';
//   return true;
// }

// function previewFirstBatchConversation() {
//   if (!batchRows.length) return toast('Carregue um Excel primeiro.', true);
//   if (batchPreviewRestore) {
//     restoreBatchPreview();
//     toast('Modelo original restaurado.');
//     return;
//   }
//   batchPreviewRestore = deepClone(state);
//   state = buildStateForBatchRow(batchPreviewRestore, batchRows[0]);
//   renderEditor(); renderPhoneStatic(); renderAllMessages();
//   fitBatchContentOrThrow().catch((err) => toast(err.message, true));
//   $('#previewBatchBtn').textContent = 'Voltar ao modelo';
//   toast('Prévia da primeira conversa aplicada.');
// }

// function nextPaint() {
//   return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
// }

// // Ajusta apenas casos excepcionais que não cabem no viewport do celular.
// // Nunca usa scroll para esconder o início da mensagem na imagem exportada.
// async function fitBatchContentOrThrow() {
//   const screen = $('#phoneScreen');
//   const view = $('#messageViewport');
//   if (!screen || !view) return;
//   const classes = ['batch-fit-1', 'batch-fit-2', 'batch-fit-3'];
//   screen.classList.remove(...classes);
//   for (let level = 0; level <= classes.length; level++) {
//     await nextPaint();
//     if (view.scrollHeight <= view.clientHeight + 2) {
//       view.scrollTop = 0;
//       return level;
//     }
//     if (level < classes.length) screen.classList.add(classes[level]);
//   }
//   // Não exporta silenciosamente imagens com parte das mensagens oculta.
//   throw new Error('Esta conversa tem textos demais para uma única captura; confira os dados antes de exportar.');
// }

// async function urlToDataUrl(url) {
//   if (!url || /^data:/i.test(url)) return url;
//   const absolute = new URL(url, location.href).href;
//   if (captureAssetCache.has(absolute)) return captureAssetCache.get(absolute);
//   const response = await fetch(absolute, { cache:'no-store' });
//   if (!response.ok) throw new Error(`Não foi possível carregar recurso do print: ${url}`);
//   const blob = await response.blob();
//   const data = await new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
//   captureAssetCache.set(absolute, data);
//   return data;
// }

// async function getCaptureCss() {
//   if (captureCssCache) return captureCssCache;
//   let css = '';
//   try {
//     const response = await fetch('styles.css?v=38', { cache:'no-store' });
//     if (response.ok) css = await response.text();
//   } catch {}
//   if (!css) {
//     try {
//       css = Array.from(document.styleSheets)
//         .flatMap((sheet) => Array.from(sheet.cssRules || []))
//         .map((rule) => rule.cssText).join('\n');
//     } catch {}
//   }
//   if (!css) throw new Error('Não foi possível preparar o CSS do print. Abra pelo ABRIR.bat.');

//   const urls = [...css.matchAll(/url\((['"]?)([^'"\)]+)\1\)/g)];
//   for (const match of urls) {
//     const raw = match[2].trim();
//     if (!raw || /^data:/i.test(raw) || raw.startsWith('#')) continue;
//     try {
//       const data = await urlToDataUrl(raw);
//       css = css.split(match[0]).join(`url("${data}")`);
//     } catch (error) {
//       console.warn('Recurso CSS não incorporado:', raw, error);
//     }
//   }
//   css += `\n.phone-screen{border-radius:0!important;box-shadow:none!important;transform:none!important;margin:0!important;}\n`;
//   captureCssCache = css;
//   return css;
// }

// function prepareMessageViewportClone(originalPhone, clonedPhone) {
//   const originalView = originalPhone.querySelector('#messageViewport');
//   const cloneView = clonedPhone.querySelector('#messageViewport');
//   if (!originalView || !cloneView) return;
//   const computed = getComputedStyle(originalView);
//   const scrolled = originalView.scrollTop || 0;
//   const content = document.createElement('div');
//   content.setAttribute('style', [
//     'position:absolute', 'left:0', 'right:0', `top:${-scrolled}px`,
//     `padding:${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
//     'display:flex', 'flex-direction:column', `gap:${computed.gap || '1px'}`,
//     'box-sizing:border-box', 'min-width:100%'
//   ].join(';'));
//   while (cloneView.firstChild) content.appendChild(cloneView.firstChild);
//   cloneView.style.padding = '0';
//   cloneView.style.overflow = 'hidden';
//   cloneView.appendChild(content);
// }

// async function inlineCloneImages(originalPhone, clonedPhone) {
//   const originals = Array.from(originalPhone.querySelectorAll('img'));
//   const clones = Array.from(clonedPhone.querySelectorAll('img'));
//   for (let i = 0; i < originals.length; i++) {
//     const source = originals[i].currentSrc || originals[i].src || originals[i].getAttribute('src') || '';
//     if (!source) continue;
//     try { clones[i].setAttribute('src', await urlToDataUrl(source)); }
//     catch (error) { console.warn('Imagem não incorporada no print:', source, error); }
//   }
// }

// async function capturePhoneCanvas(scale = 4) {
//   const phone = $('#phoneScreen');
//   if (!phone) throw new Error('Tela do celular não encontrada.');
//   const width = Math.round(phone.clientWidth);
//   const height = Math.round(phone.clientHeight);
//   if (!width || !height) throw new Error('A tela do celular está sem tamanho para captura.');

//   const clone = phone.cloneNode(true);
//   clone.classList.add('capture-clean');
//   clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
//   clone.style.width = `${width}px`;
//   clone.style.height = `${height}px`;
//   clone.style.minWidth = `${width}px`;
//   clone.style.minHeight = `${height}px`;
//   clone.style.maxWidth = 'none';
//   clone.style.maxHeight = 'none';
//   clone.style.borderRadius = '0';
//   clone.style.boxShadow = 'none';
//   clone.style.margin = '0';
//   prepareMessageViewportClone(phone, clone);
//   await inlineCloneImages(phone, clone);

//   const css = await getCaptureCss();
//   const serialized = new XMLSerializer().serializeToString(clone);
//   const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
//     `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">` +
//     `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
//     `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;margin:0;padding:0;overflow:hidden;background:#0b141a;">` +
//     `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>${serialized}</div></foreignObject></svg>`;

//   // IMPORTANTE: não use Blob URL aqui. No Chromium, um SVG que contém
//   // <foreignObject> carregado via blob: deixa o canvas como "tainted" e
//   // bloqueia canvas.toBlob(). Um data URL mantém a captura exportável.
//   const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
//   const image = new Image();
//   image.decoding = 'async';
//   await new Promise((resolve, reject) => {
//     image.onload = resolve;
//     image.onerror = () => reject(new Error('O navegador não conseguiu renderizar o print em alta resolução.'));
//     image.src = svgDataUrl;
//   });

//   const canvas = document.createElement('canvas');
//   canvas.width = width * scale;
//   canvas.height = height * scale;
//   const ctx = canvas.getContext('2d', { alpha:false });
//   if (!ctx) throw new Error('Canvas indisponível no navegador.');
//   ctx.imageSmoothingEnabled = true;
//   ctx.imageSmoothingQuality = 'high';
//   ctx.fillStyle = '#0b141a';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//   return canvas;
// }

// function canvasToPngBlob(canvas) {
//   return new Promise((resolve, reject) => {
//     canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível montar o PNG.')), 'image/png', 1);
//   });
// }

// async function exportPhonePrintV26() {
//   const button = $('#exportPrintBtn');
//   const oldLabel = button.textContent;
//   const scale = clamp(Number($('#printScale')?.value) || 4, 2, 4);
//   button.disabled = true;
//   button.textContent = `Gerando PNG ${scale}×...`;
//   try {
//     renderPhoneStatic(); renderAllMessages();
//     await nextPaint();
//     const canvas = await capturePhoneCanvas(scale);
//     const blob = await canvasToPngBlob(canvas);
//     const contact = sanitizeFileName(state.contact.name || 'conversa');
//     downloadBlob(blob, `print-${contact}-${Date.now()}.png`);
//     toast(`Print ${canvas.width}×${canvas.height}px exportado sem borda.`);
//   } catch (error) {
//     console.error('Erro ao exportar print V26:', error);
//     toast(error?.message || 'Não foi possível exportar o print.', true);
//   } finally {
//     button.disabled = false;
//     button.textContent = oldLabel;
//   }
// }

// function setBatchProgress(current, total, label) {
//   const wrap = $('#batchProgressWrap');
//   const pct = total ? Math.round((current / total) * 100) : 0;
//   wrap.classList.remove('hidden');
//   $('#batchProgressText').textContent = label || `${current} de ${total}`;
//   $('#batchProgressPercent').textContent = `${pct}%`;
//   $('#batchProgressBar').style.width = `${pct}%`;
// }

// async function generateBatchPrints() {
//   if (!batchRows.length) return toast('Carregue um relatório ou Excel primeiro.', true);
//   if (!window.JSZip) return toast('Gerador ZIP não carregado.', true);

//   const button = $('#generateBatchBtn');
//   const previewButton = $('#previewBatchBtn');
//   const cancelButton = $('#cancelBatchBtn');
//   const oldLabel = button.textContent;
//   const baseState = deepClone(batchPreviewRestore || state);
//   const restoreState = deepClone(state);
//   const scale = clamp(Number($('#printScale')?.value) || 2, 2, 4);
//   const filenamePattern = $('#batchFilename')?.value || '{contrato} - {nome} - {cpf}';
//   const usedNames = new Map();
//   const sourceBase = sanitizeFileName(batchSourceName.replace(/\.[^.]+$/, '') || 'conversas');
//   // Lotes pequenos geram 1 ZIP. Em grandes relatórios, evitamos manter centenas
//   // de PNGs em memória durante a compactação. Tudo sai com um único clique.
//   const maxPerZip = batchRows.length <= 80 ? batchRows.length : 50;
//   const zipTotal = Math.ceil(batchRows.length / maxPerZip);
//   const failures = [];
//   let successes = 0;
//   batchCancelled = false;

//   button.disabled = true;
//   previewButton.disabled = true;
//   $('#batchFile').disabled = true;
//   cancelButton?.classList.remove('hidden');
//   button.textContent = 'Gerando imagens...';
//   try {
//     // Carrega os recursos apenas uma vez; capturas posteriores reutilizam cache.
//     await getCaptureCss();
//     for (let chunk = 0; chunk < zipTotal; chunk++) {
//       if (batchCancelled) break;
//       const zip = new JSZip();
//       const manifest = [["linha","loja","cliente","cpf","portabilidade","contrato","arquivo","situacao"]];
//       const firstIndex = chunk * maxPerZip;
//       const end = Math.min(batchRows.length, firstIndex + maxPerZip);
//       let zipHasPng = false;
//       for (let i = firstIndex; i < end; i++) {
//         if (batchCancelled) break;
//         const row = batchRows[i];
//         const label = rowValue(row, 'nome', 'cliente') || `Linha ${i+1}`;
//         let lastError;
//         for (let attempt = 1; attempt <= 2; attempt++) {
//           try {
//             state = buildStateForBatchRow(baseState, row);
//             renderPhoneStatic(); renderAllMessages();
//             await fitBatchContentOrThrow();
//             setBatchProgress(i, batchRows.length, `Renderizando ${i+1}/${batchRows.length} — ${label}`);
//             const canvas = await capturePhoneCanvas(scale);
//             const png = await canvasToPngBlob(canvas);
//             // Libera explicitamente a memória gráfica antes da próxima captura.
//             canvas.width = 0; canvas.height = 0;

//             let baseName = rowValue(row, 'arquivo', 'nome_arquivo') || applyVariables(filenamePattern, row);
//             baseName = sanitizeFileName(baseName || `conversa-${i+1}`);
//             const folder = batchMode === 'retention' ? `${sanitizeFileName(rowValue(row, 'pasta', 'loja')).slice(0,75)}/` : '';
//             const pathKey = `${folder}${baseName}`;
//             const count = usedNames.get(pathKey) || 0;
//             usedNames.set(pathKey, count + 1);
//             if (count) baseName += `-${count+1}`;
//             const filename = `${folder}${baseName}.png`;
//             zip.file(filename, png, {binary:true});
//             manifest.push([row.linha || String(i+2), row.loja || '', row.nome || '', row.cpf || '', row.numero || '', row.contrato || '', filename, row.situacao_comprovacao || 'SIMULAÇÃO']);
//             zipHasPng = true;
//             successes++;
//             lastError = null;
//             break;
//           } catch (error) {
//             lastError = error;
//             console.warn(`Tentativa ${attempt}/2, linha ${i+1}:`, error);
//           }
//         }
//         if (lastError) failures.push([i+1, label, String(lastError?.message || lastError)]);
//         setBatchProgress(i+1, batchRows.length, `${i+1}/${batchRows.length} — ${successes} concluídas; ${failures.length} erro(s)`);
//       }
//       if (zipHasPng) {
//         const escapeCsv = (value) => {
//           const raw = String(value ?? '');
//           const safe = /^[=+@\-]/.test(raw) ? `\'${raw}` : raw;
//           return `"${safe.replace(/"/g, '""')}"`;
//         };
//         const textCsv = '\uFEFF' + manifest.map((line) => line.map(escapeCsv).join(';')).join('\r\n');
//         zip.file('RELATORIO_DE_CONFERENCIA.csv', textCsv);
//         zip.file('LEIA-ME.txt', 'IMAGENS SIMULADAS - NÃO SÃO PRINTS REAIS DE CONVERSAS.\r\nOs dados cadastrais vêm do relatório anexado, mas não há confirmações de clientes nele.\r\nAs mensagens exibidas são textos propostos, não mensagens efetivamente enviadas.\r\n');
//         button.textContent = `Preparando ZIP ${chunk+1}/${zipTotal}...`;
//         const blob = await zip.generateAsync({type:'blob', compression:'STORE'}, (meta) => {
//           $('#batchProgressText').textContent = `Montando ZIP ${chunk+1}/${zipTotal} (${Math.round(meta.percent)}%)`;
//         });
//         const suffix = zipTotal > 1 ? `-parte-${String(chunk+1).padStart(2,'0')}-de-${String(zipTotal).padStart(2,'0')}` : '';
//         downloadBlob(blob, `previas-${sourceBase}${suffix}.zip`);
//       }
//       if (batchCancelled) break;
//     }
//     if (failures.length) {
//       console.table(failures.map(([linha, cliente, erro]) => ({linha, cliente, erro})));
//     }
//     setBatchProgress(successes + failures.length, batchRows.length,
//       batchCancelled ? `Interrompido: ${successes} geradas, ${failures.length} erros.` :
//       `Concluído: ${successes} imagens, ${failures.length} erros. ${zipTotal > 1 ? `${zipTotal} ZIPs organizados por loja.` : 'ZIP disponível.'}`);
//     toast(batchCancelled ? 'Geração interrompida.' : `${successes} imagens em lote geradas. ${failures.length} erro(s).`, !!failures.length);
//   } catch (error) {
//     console.error('Erro na geração em massa:', error);
//     toast(error?.message || 'Erro ao gerar as imagens em massa.', true);
//   } finally {
//     $('#phoneScreen')?.classList.remove('batch-fit-1', 'batch-fit-2', 'batch-fit-3');
//     state = restoreState;
//     renderEditor(); renderPhoneStatic(); renderAllMessages();
//     button.disabled = false;
//     previewButton.disabled = false;
//     $('#batchFile').disabled = false;
//     cancelButton?.classList.add('hidden');
//     button.textContent = oldLabel;
//     batchCancelled = false;
//   }
// }

// function bindBatchControls() {
//   $('#batchFile')?.addEventListener('change', onBatchFileChange);
//   $('#previewBatchBtn')?.addEventListener('click', previewFirstBatchConversation);
//   $('#generateBatchBtn')?.addEventListener('click', generateBatchPrints);
//   $('#cancelBatchBtn')?.addEventListener('click', () => { batchCancelled = true; });
//   updateBatchSummary();
// }

// function init() {
//   bindStaticControls();
//   bindBatchControls();
//   renderEditor();
//   renderPhoneStatic();
//   renderAllMessages();
//   window.addEventListener('resize', adjustMessagePadding);
// }

// init();






































const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const STORAGE_KEY = 'chat-story-studio-v3-reference';

const DEFAULT_STATE = {
  contact: {
    name: 'Açaí Dois Unidos',
    status: '',
    avatar: '',
    avatarLetter: ''
  },
  device: {
    time: '10:54',
    network: '5G',
    battery: 35,
    muted: true,
    charging: true
  },
  chat: {
    date: '12 de março de 2026',
    showEncryption: true,
    encryptionText: 'As mensagens e ligações são protegidas com a criptografia de ponta a ponta. Somente as pessoas que fazem parte da conversa podem ler, ouvir e compartilhar esse conteúdo. Saiba mais'
  },
  speed: 1,
  messages: [
    { id: cryptoId(), sender: 'incoming', type: 'text', text: 'tu ainda tá acordado?', time: '10:55', delay: 0.8, typing: 1.2, read: false, reaction: '', reply: '', image: '' },
    { id: cryptoId(), sender: 'outgoing', type: 'text', text: 'tô kkkkk', time: '10:55', delay: 0.7, typing: 1.0, read: true, reaction: '', reply: '', image: '' },
    { id: cryptoId(), sender: 'incoming', type: 'text', text: 'preciso te contar uma coisa', time: '10:56', delay: 1.0, typing: 1.6, read: false, reaction: '😳', reply: '', image: '' }
  ]
};

let state = loadState();
let playback = { token: 0, paused: false, cursor: 0, rendered: [] };
let mediaRecorder = null;
let recordedChunks = [];
let activeStream = null;

function cryptoId() {
  return (globalThis.crypto?.randomUUID?.() || `m_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

function normalizeState(raw) {
  const s = deepClone(DEFAULT_STATE);
  if (!raw || typeof raw !== 'object') return s;
  if (raw.contact) Object.assign(s.contact, raw.contact);
  if (raw.device) Object.assign(s.device, raw.device);
  if (raw.chat) Object.assign(s.chat, raw.chat);
  if (Number(raw.speed)) s.speed = Number(raw.speed);
  if (Array.isArray(raw.messages)) {
    s.messages = raw.messages.map((m) => ({
      id: m.id || cryptoId(),
      sender: m.sender === 'outgoing' ? 'outgoing' : 'incoming',
      type: ['text','audio','image','deleted','missedcall'].includes(m.type) ? m.type : 'text',
      text: String(m.text ?? ''),
      time: String(m.time ?? '10:55'),
      delay: Math.max(0, Number(m.delay ?? 0.8)),
      typing: Math.max(0, Number(m.typing ?? 1)),
      read: !!m.read,
      reaction: String(m.reaction ?? ''),
      reply: String(m.reply ?? ''),
      image: typeof m.image === 'string' ? m.image : ''
    }));
  }
  return s;
}

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return deepClone(DEFAULT_STATE); }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toast(message, error = false) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('error', error);
  el.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('show'), 2200);
}

function bindStaticControls() {
  $('#contactName').value = state.contact.name;
  $('#contactStatus').value = state.contact.status;
  $('#avatarLetter').value = state.contact.avatarLetter || ''; 
  $('#chatDate').value = state.chat.date;
  $('#deviceTime').value = state.device.time;
  $('#network').value = state.device.network;
  $('#batteryLevel').value = state.device.battery;
  $('#mutedToggle').checked = state.device.muted;
  $('#chargingToggle').checked = state.device.charging;
  $('#encryptionToggle').checked = state.chat.showEncryption;
  $('#encryptionText').value = state.chat.encryptionText;
  $('#speedSelect').value = String(state.speed);

  const bindings = [
    ['#contactName', 'input', (e) => state.contact.name = e.target.value],
    ['#avatarLetter', 'input', (e) => state.contact.avatarLetter = String(e.target.value || '').slice(0,1).toUpperCase()],
    ['#contactStatus', 'input', (e) => state.contact.status = e.target.value],
    ['#chatDate', 'input', (e) => state.chat.date = e.target.value],
    ['#deviceTime', 'input', (e) => state.device.time = e.target.value],
    ['#network', 'change', (e) => state.device.network = e.target.value],
    ['#batteryLevel', 'input', (e) => state.device.battery = clamp(Number(e.target.value) || 1, 1, 100)],
    ['#mutedToggle', 'change', (e) => state.device.muted = e.target.checked],
    ['#chargingToggle', 'change', (e) => state.device.charging = e.target.checked],
    ['#encryptionToggle', 'change', (e) => state.chat.showEncryption = e.target.checked],
    ['#encryptionText', 'input', (e) => state.chat.encryptionText = e.target.value],
    ['#speedSelect', 'change', (e) => state.speed = Number(e.target.value) || 1]
  ];
  bindings.forEach(([sel, event, fn]) => $(sel).addEventListener(event, (e) => {
    fn(e); renderPhoneStatic(); saveState();
  }));

  $('#avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Escolha uma imagem.', true);
    state.contact.avatar = await fileToDataUrl(file);
    renderPhoneStatic();
    saveState();
  });

  $('#addMessageBtn').addEventListener('click', () => {
    state.messages.push({
      id: cryptoId(), sender: 'incoming', type: 'text', text: 'Nova mensagem',
      time: nextSuggestedTime(), delay: 0.8, typing: 1.0, read: false,
      reaction: '', reply: '', image: ''
    });
    renderEditor(); renderAllMessages(); saveState();
    requestAnimationFrame(() => $('#messageList').lastElementChild?.scrollIntoView({behavior:'smooth', block:'center'}));
  });

  $('#parseScriptBtn').addEventListener('click', parseQuickScript);
  $('#playBtn').addEventListener('click', () => playScene(playback.cursor === 0 || playback.cursor >= state.messages.length));
  $('#pauseBtn').addEventListener('click', togglePause);
  $('#resetBtn').addEventListener('click', resetPlayback);
  $('#recordModeBtn').addEventListener('click', toggleRecordingMode);
  $('#exportPrintBtn').addEventListener('click', exportPhonePrint);
  $('#recordBtn').addEventListener('click', toggleRecording);
  $('#newBtn').addEventListener('click', newProject);
  $('#exportBtn').addEventListener('click', exportProject);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', importProject);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('recording-mode')) toggleRecordingMode(false);
  });
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function renderPhoneStatic() {
  $('#stageContactName').textContent = state.contact.name || 'Contato';
  $('#stageContactStatus').textContent = state.contact.status || '';
  $('#statusTime').textContent = state.device.time || '10:54';
  const network = state.device.network || '5G';
  $('#networkLabel').textContent = network;
  $('#networkRef5g')?.classList.toggle('hidden', network !== '5G');
  $('#networkAltBlock')?.classList.toggle('hidden', network === '5G');

  $('#muteIcon').classList.toggle('hidden', !state.device.muted);
  $('#batteryBolt').classList.toggle('hidden', !state.device.charging);
  $('#dateChip').textContent = state.chat.date || 'Hoje';
  $('#encryptionCard').classList.toggle('hidden', !state.chat.showEncryption);
  renderEncryptionText();
  renderAvatar();
  adjustMessagePadding();
}

function renderEncryptionText() {
  const target = $('#encryptionCopy');
  const txt = state.chat.encryptionText || '';
  const lower = txt.toLowerCase();
  const idx = lower.lastIndexOf('saiba mais');
  target.innerHTML = '';
  if (idx >= 0) {
    target.append(document.createTextNode(txt.slice(0, idx)));
    const strong = document.createElement('strong');
    strong.textContent = txt.slice(idx);
    target.append(strong);
  } else {
    target.textContent = txt;
  }
}

function getAvatarTheme(seed) {
  const palettes = [
    { bg: '#0b3d2f', fg: '#28e36e' },
    { bg: '#0b3247', fg: '#56bdf2' },
    { bg: '#423123', fg: '#f3cd75' },
    { bg: '#4b1431', fg: '#ff78ab' }
  ];
  const ch = String(seed || 'A').trim().toUpperCase().charCodeAt(0) || 65;
  return palettes[ch % palettes.length];
}

function renderAvatar() {
  const customLetter = String(state.contact.avatarLetter || '').trim().slice(0,1).toUpperCase();
  const initials = customLetter || (state.contact.name || 'C').trim().slice(0,1).toUpperCase() || 'C';
  const theme = getAvatarTheme(initials);
  [['#avatarPreview','#avatarFallback'], ['#stageAvatar','#stageAvatarFallback']].forEach(([imgSel, fallbackSel]) => {
    const img = $(imgSel); const fb = $(fallbackSel);
    const holder = fb.parentElement;
    if (state.contact.avatar) {
      img.src = state.contact.avatar;
      img.style.display = 'block';
      fb.style.display = 'none';
      holder.style.background = '';
      holder.style.color = '';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
      fb.style.display = '';
      fb.textContent = initials;
      holder.style.background = theme.bg;
      holder.style.color = theme.fg;
    }
  });
}

function adjustMessagePadding() {
  requestAnimationFrame(() => {
    const overlays = $('.chat-overlays');
    const view = $('#messageViewport');
    const bottom = overlays.offsetTop + overlays.offsetHeight + 9;
    view.style.paddingTop = `${Math.max(80, bottom)}px`;
  });
}

function renderEditor() {
  const list = $('#messageList');
  list.innerHTML = '';
  state.messages.forEach((msg, index) => list.appendChild(createMessageEditor(msg, index)));
}

function createMessageEditor(msg, index) {
  const card = document.createElement('div');
  card.className = `message-card ${msg.sender}`;
  card.dataset.id = msg.id;
  card.innerHTML = `
    <div class="message-card-top">
      <select class="m-sender" aria-label="Quem envia">
        <option value="incoming" ${msg.sender==='incoming'?'selected':''}>Contato</option>
        <option value="outgoing" ${msg.sender==='outgoing'?'selected':''}>Você</option>
      </select>
      <select class="m-type" aria-label="Tipo">
        <option value="text" ${msg.type==='text'?'selected':''}>Texto</option>
        <option value="image" ${msg.type==='image'?'selected':''}>Imagem</option>
        <option value="audio" ${msg.type==='audio'?'selected':''}>Áudio</option>
        <option value="deleted" ${msg.type==='deleted'?'selected':''}>Apagada</option>
        <option value="missedcall" ${msg.type==='missedcall'?'selected':''}>Chamada</option>
      </select>
      <div class="message-card-actions"><span class="message-number">#${index+1}</span><button class="delete-message" title="Excluir">×</button></div>
    </div>
    <textarea class="m-text" placeholder="Digite a mensagem">${escapeHtml(msg.text)}</textarea>
    <div class="image-upload-row ${msg.type==='image' ? '' : 'hidden'}">
      <img class="image-thumb" alt="Imagem da mensagem" />
      <button class="small-btn choose-image" type="button">Escolher imagem</button>
      <input class="m-image" type="file" accept="image/*" hidden />
    </div>
    <div class="message-card-grid">
      <label>Hora<input class="m-time" value="${escapeHtml(msg.time)}" maxlength="5" /></label>
      <label>Espera (s)<input class="m-delay" type="number" min="0" step="0.1" value="${Number(msg.delay)}" /></label>
      <label>Digitando (s)<input class="m-typing" type="number" min="0" step="0.1" value="${Number(msg.typing)}" /></label>
      <label>Reação<input class="m-reaction" value="${escapeHtml(msg.reaction)}" placeholder="❤️" maxlength="6" /></label>
      <label>Resposta a...<input class="m-reply" value="${escapeHtml(msg.reply)}" placeholder="texto citado" maxlength="80" /></label>
      <label class="inline-check"><input class="m-read" type="checkbox" ${msg.read?'checked':''}/> ✓✓ azul</label>
    </div>
  `;

  const img = card.querySelector('.image-thumb');
  if (msg.image) { img.src = msg.image; img.style.display = 'block'; }

  const refresh = (rerenderEditor = false) => {
    msg.sender = card.querySelector('.m-sender').value;
    msg.type = card.querySelector('.m-type').value;
    msg.text = card.querySelector('.m-text').value;
    msg.time = card.querySelector('.m-time').value;
    msg.delay = Math.max(0, Number(card.querySelector('.m-delay').value) || 0);
    msg.typing = Math.max(0, Number(card.querySelector('.m-typing').value) || 0);
    msg.reaction = card.querySelector('.m-reaction').value;
    msg.reply = card.querySelector('.m-reply').value;
    msg.read = card.querySelector('.m-read').checked;
    if (rerenderEditor) renderEditor();
    renderAllMessages(); saveState();
  };

  card.querySelector('.m-sender').addEventListener('change', () => refresh(true));
  card.querySelector('.m-type').addEventListener('change', () => refresh(true));
  card.querySelector('.m-text').addEventListener('input', () => refresh(false));
  card.querySelector('.m-time').addEventListener('input', () => refresh(false));
  card.querySelector('.m-delay').addEventListener('change', () => refresh(false));
  card.querySelector('.m-typing').addEventListener('change', () => refresh(false));
  card.querySelector('.m-reaction').addEventListener('input', () => refresh(false));
  card.querySelector('.m-reply').addEventListener('input', () => refresh(false));
  card.querySelector('.m-read').addEventListener('change', () => refresh(false));
  card.querySelector('.delete-message').addEventListener('click', () => {
    state.messages = state.messages.filter((m) => m.id !== msg.id);
    renderEditor(); renderAllMessages(); saveState();
  });
  card.querySelector('.choose-image').addEventListener('click', () => card.querySelector('.m-image').click());
  card.querySelector('.m-image').addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Escolha uma imagem.', true);
    msg.image = await fileToDataUrl(file);
    renderEditor(); renderAllMessages(); saveState();
  });

  return card;
}

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function makeTicks(read) {
  const span = document.createElement('span');
  span.className = `ticks ${read ? '' : 'gray'}`;
  span.innerHTML = `<svg viewBox="0 0 18 11" aria-hidden="true"><path d="m1.5 5.8 3.2 3.1L10 3.2"></path><path d="m7 5.8 3.2 3.1L16.5 2"></path></svg>`;
  return span;
}

function createBubble(msg, index = 0, messages = []) {
  if (msg.type === 'missedcall') {
    const sys = document.createElement('div');
    sys.className = 'system-line';
    sys.textContent = msg.text || (msg.sender === 'incoming' ? 'Chamada de voz perdida' : 'Chamada de voz');
    return sys;
  }

  const prev = messages[index - 1];
  const next = messages[index + 1];
  const samePrev = !!(prev && prev.sender === msg.sender && prev.type !== 'missedcall');
  const sameNext = !!(next && next.sender === msg.sender && next.type !== 'missedcall');

  const row = document.createElement('div');
  row.className = `bubble-row ${msg.sender} ${samePrev ? 'continued' : 'new-block'} ${sameNext ? 'has-next' : 'end-block'}`;
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${samePrev ? 'continued' : ''}`.trim();

  if (msg.reply) {
    const reply = document.createElement('div');
    reply.className = 'reply-box';
    reply.innerHTML = `<b>${msg.sender === 'outgoing' ? 'Contato' : 'Você'}</b>${escapeHtml(msg.reply)}`;
    bubble.appendChild(reply);
  }

  if (msg.type === 'image' && msg.image) {
    const img = document.createElement('img');
    img.className = 'message-image';
    img.src = msg.image;
    img.alt = 'Imagem simulada enviada no chat';
    bubble.appendChild(img);
    if (msg.text) {
      const cap = document.createElement('span'); cap.textContent = msg.text; bubble.appendChild(cap);
    }
  } else if (msg.type === 'audio') {
    const audio = document.createElement('div'); audio.className = 'audio-ui';
    audio.innerHTML = `<span class="audio-play">▶</span><span class="wave">${'<i></i>'.repeat(34)}</span><span class="audio-time">0:18</span>`;
    bubble.appendChild(audio);
  } else if (msg.type === 'deleted') {
    const del = document.createElement('span'); del.className = 'deleted-copy'; del.textContent = '⊘ Esta mensagem foi apagada'; bubble.appendChild(del);
  } else {
    const text = document.createElement('span'); text.textContent = msg.text || ''; bubble.appendChild(text);
  }

  const meta = document.createElement('span');
  meta.className = 'message-meta';
  const time = document.createElement('span'); time.textContent = msg.time || '';
  meta.appendChild(time);
  if (msg.sender === 'outgoing') meta.appendChild(makeTicks(msg.read));
  bubble.appendChild(meta);

  if (msg.reaction) {
    const reaction = document.createElement('span'); reaction.className = 'reaction-chip'; reaction.textContent = msg.reaction; bubble.appendChild(reaction);
  }

  row.appendChild(bubble);
  return row;
}

function renderAllMessages() {
  const view = $('#messageViewport');
  view.innerHTML = '';
  state.messages.forEach((msg, index) => view.appendChild(createBubble(msg, index, state.messages)));
  requestAnimationFrame(() => view.scrollTop = view.scrollHeight);
}

function renderPlaybackMessages() {
  const view = $('#messageViewport');
  view.innerHTML = '';
  playback.rendered.forEach((msg, index) => view.appendChild(createBubble(msg, index, playback.rendered)));
  requestAnimationFrame(() => view.scrollTo({top:view.scrollHeight, behavior:'smooth'}));
}

function nextSuggestedTime() {
  const last = state.messages.at(-1)?.time || state.device.time || '10:54';
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(last);
  if (!m) return last;
  let h = Number(m[1]); let min = Number(m[2]) + 1;
  if (min >= 60) { min -= 60; h = (h + 1) % 24; }
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}

function parseQuickScript() {
  const raw = $('#quickScript').value.trim();
  if (!raw) return toast('Cole um roteiro primeiro.', true);
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const created = [];
  let minuteOffset = 1;
  lines.forEach((line) => {
    const match = line.match(/^([^:]{1,30}):\s*(.*)$/);
    if (!match) return;
    const who = match[1].trim().toLowerCase();
    const text = match[2].trim();
    const outgoing = ['eu','me','você','voce','mim'].includes(who);
    created.push({
      id: cryptoId(), sender: outgoing ? 'outgoing' : 'incoming', type:'text', text,
      time: addMinutes(state.device.time, minuteOffset), delay:0.8, typing: outgoing ? 0.9 : 1.25,
      read: outgoing, reaction:'', reply:'', image:''
    });
    if (created.length % 2 === 0) minuteOffset++;
  });
  if (!created.length) return toast('Use linhas como “Contato: oi” e “Eu: oi”.', true);
  state.messages = created;
  renderEditor(); renderAllMessages(); saveState();
  toast(`${created.length} mensagens criadas.`);
}

function addMinutes(time, offset) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time || '10:54');
  let h = m ? Number(m[1]) : 10; let min = m ? Number(m[2]) : 54;
  min += offset;
  h = (h + Math.floor(min / 60)) % 24;
  min = ((min % 60) + 60) % 60;
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitPausable(ms, token) {
  let left = ms;
  let last = performance.now();
  while (left > 0) {
    if (token !== playback.token) return false;
    await sleep(50);
    const now = performance.now();
    if (!playback.paused) left -= (now - last);
    last = now;
  }
  return true;
}

async function playScene(fromStart = true) {
  playback.token += 1;
  const token = playback.token;
  playback.paused = false;
  $('#pauseBtn').textContent = 'Pausar';
  $('#playBtn').textContent = '▶ Reproduzindo';

  if (fromStart) {
    playback.cursor = 0;
    playback.rendered = [];
    renderPlaybackMessages();
  }

  for (let i = playback.cursor; i < state.messages.length; i++) {
    const msg = state.messages[i];
    const speed = Math.max(.1, Number(state.speed) || 1);
    if (!(await waitPausable((msg.delay || 0) * 1000 / speed, token))) return;

    if (msg.typing > 0 && ['text','audio','image'].includes(msg.type)) {
      $('#typingRow').classList.remove('hidden');
      if (msg.sender === 'incoming' && state.contact.status) $('#stageContactStatus').textContent = 'digitando…';
      if (!(await waitPausable(msg.typing * 1000 / speed, token))) return;
      $('#typingRow').classList.add('hidden');
      $('#stageContactStatus').textContent = state.contact.status || '';
    }

    playback.rendered.push(msg);
    playback.cursor = i + 1;
    renderPlaybackMessages();
  }
  $('#typingRow').classList.add('hidden');
  $('#stageContactStatus').textContent = state.contact.status || '';
  $('#playBtn').textContent = '▶ Reproduzir novamente';
}

function togglePause() {
  playback.paused = !playback.paused;
  $('#pauseBtn').textContent = playback.paused ? 'Continuar' : 'Pausar';
  if (!playback.paused && playback.cursor < state.messages.length) playScene(false);
}

function resetPlayback() {
  playback.token += 1;
  playback.paused = false;
  playback.cursor = 0;
  playback.rendered = [];
  $('#typingRow').classList.add('hidden');
  $('#stageContactStatus').textContent = state.contact.status || '';
  $('#playBtn').textContent = '▶ Reproduzir';
  $('#pauseBtn').textContent = 'Pausar';
  renderAllMessages();
}

function toggleRecordingMode(force) {
  const on = typeof force === 'boolean' ? force : !document.body.classList.contains('recording-mode');
  document.body.classList.toggle('recording-mode', on);
  $('#recordModeBtn').textContent = on ? 'Sair do modo gravação' : '⛶ Modo gravação';
  if (on) {
    renderPhoneStatic();
    setTimeout(adjustMessagePadding, 120);
  }
}



function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function videoReady(video) {
  if (video.readyState >= 2 && video.videoWidth && video.videoHeight) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('A captura não iniciou a tempo.')), 8000);
    const done = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', done);
      video.removeEventListener('canplay', done);
      resolve();
    };
    video.addEventListener('loadedmetadata', done);
    video.addEventListener('canplay', done);
  });
}

function createCaptureOverlay(phone) {
  const originalParent = phone.parentNode;
  const originalNext = phone.nextSibling;
  const originalStyle = phone.getAttribute('style');
  const width = phone.clientWidth;
  const height = phone.clientHeight;

  const overlay = document.createElement('div');
  overlay.className = 'export-capture-overlay';
  overlay.id = 'exportCaptureOverlay';
  document.body.appendChild(overlay);

  overlay.appendChild(phone);
  phone.style.width = `${width}px`;
  phone.style.height = `${height}px`;
  phone.style.minWidth = `${width}px`;
  phone.style.minHeight = `${height}px`;
  phone.style.maxWidth = 'none';
  phone.style.maxHeight = 'none';
  phone.style.borderRadius = '0';
  phone.style.margin = '0';
  phone.style.boxShadow = 'none';

  const viewportW = window.visualViewport?.width || window.innerWidth;
  const viewportH = window.visualViewport?.height || window.innerHeight;
  const availableW = Math.max(100, viewportW - 16);
  const availableH = Math.max(100, viewportH - 16);
  const fit = Math.min(2.25, availableW / width, availableH / height);
  phone.style.transformOrigin = 'center center';
  phone.style.transform = `scale(${fit})`;

  document.body.classList.add('export-capture-active');

  return {
    overlay,
    width,
    height,
    fit,
    restore() {
      document.body.classList.remove('export-capture-active');
      if (originalNext && originalNext.parentNode === originalParent) originalParent.insertBefore(phone, originalNext);
      else originalParent.appendChild(phone);
      if (originalStyle === null) phone.removeAttribute('style');
      else phone.setAttribute('style', originalStyle);
      overlay.remove();
    }
  };
}

async function captureCurrentTabFrame() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Seu navegador não oferece captura de guia. Use Chrome ou Edge atualizado.');
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        frameRate: { ideal: 5, max: 10 }
      },
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'exclude',
      systemAudio: 'exclude'
    });
  } catch (error) {
    if (error?.name === 'NotAllowedError') throw new Error('Captura cancelada. Escolha “Esta guia” e clique em Compartilhar.');
    throw error;
  }

  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings?.() || {};
  if (settings.displaySurface && settings.displaySurface !== 'browser') {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error('Escolha “Esta guia” na janela de compartilhamento, não a tela inteira.');
  }

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  document.body.appendChild(video);

  try {
    await video.play();
    await videoReady(video);
    await wait(180);
    return { video, stream };
  } catch (error) {
    stream.getTracks().forEach((t) => t.stop());
    video.remove();
    throw error;
  }
}

async function exportPhonePrint() {
  return exportPhonePrintV26();
}

async function toggleRecording() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    activeStream?.getTracks().forEach((t) => t.stop());
    return;
  }
  if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
    return toast('Este navegador não suporta gravação de tela.', true);
  }
  try {
    toggleRecordingMode(true);
    activeStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
    const preferred = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    mediaRecorder = new MediaRecorder(activeStream, preferred ? { mimeType: preferred } : undefined);
    recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data?.size) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, {type: mediaRecorder.mimeType || 'video/webm'});
      downloadBlob(blob, `conversa-simulada-${Date.now()}.webm`);
      $('#recordBtn').textContent = '● Gravar WebM';
      toast('Gravação salva em WebM.');
    };
    mediaRecorder.start(250);
    $('#recordBtn').textContent = '■ Parar gravação';
    toast('Gravando. Selecione esta aba/janela na captura do navegador.');
  } catch (err) {
    $('#recordBtn').textContent = '● Gravar WebM';
    toast('A captura de tela foi cancelada.', true);
  }
}

function newProject() {
  if (!confirm('Criar um projeto novo? O projeto atual salvo no navegador será substituído.')) return;
  state = deepClone(DEFAULT_STATE);
  state.messages.forEach((m) => m.id = cryptoId());
  saveState();
  location.reload();
}

function exportProject() {
  const exportable = deepClone(state);
  // Disclosure is deliberately not a project setting; it is always present in the app.
  downloadBlob(new Blob([JSON.stringify(exportable, null, 2)], {type:'application/json'}), `chat-story-${Date.now()}.json`);
}

async function importProject(e) {
  const file = e.target.files?.[0]; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    state = normalizeState(parsed);
    saveState();
    location.reload();
  } catch {
    toast('JSON inválido.', true);
  } finally {
    e.target.value = '';
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =============================================================================
// V26 — PNG limpo em alta resolução + conversas em massa por Excel/CSV
// =============================================================================
let batchRows = [];
let batchSourceName = '';
let batchPreviewRestore = null;
let batchMode = "generic";
let batchCancelled = false;
let captureCssCache = null;
let captureAssetCache = new Map();

function normalizeHeader(value) {
  return String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function rowValue(row, ...keys) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    const value = row?.[normalized];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function applyVariables(value, row) {
  const source = String(value ?? '');
  const replaceToken = (_, rawKey) => {
    const key = normalizeHeader(rawKey);
    if (!key) return _;
    const found = row?.[key];
    return found === undefined || found === null ? _ : String(found);
  };
  return source
    .replace(/\{\{\s*([^{}]+?)\s*\}\}/g, replaceToken)
    .replace(/\{\s*([^{}]+?)\s*\}/g, replaceToken);
}

function sanitizeFileName(name) {
  return String(name || '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 150) || 'conversa';
}

function parseBooleanCell(value, fallback = false) {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  return ['1','true','sim','s','yes','y','x'].includes(normalizeHeader(value));
}

function parseSender(value, fallback = 'incoming') {
  const v = normalizeHeader(value);
  if (['eu','voce','você','outgoing','enviado','saida','saindo'].map(normalizeHeader).includes(v)) return 'outgoing';
  if (['contato','cliente','incoming','recebido','entrada','recebendo'].map(normalizeHeader).includes(v)) return 'incoming';
  return fallback === 'outgoing' ? 'outgoing' : 'incoming';
}

function buildMessagesFromScriptText(script, row, deviceTime) {
  const lines = String(script || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const messages = [];
  let minuteOffset = 1;
  for (const line of lines) {
    const match = line.match(/^([^:]{1,40}):\s*(.*)$/);
    if (!match) continue;
    const sender = parseSender(match[1], 'incoming');
    messages.push({
      id: cryptoId(), sender, type:'text', text:applyVariables(match[2], row),
      time:addMinutes(deviceTime || '10:54', minuteOffset), delay:0.3, typing:0,
      read:sender === 'outgoing', reaction:'', reply:'', image:''
    });
    if (messages.length % 2 === 0) minuteOffset += 1;
  }
  return messages;
}

function buildMessagesFromExcelColumns(baseMessages, row, deviceTime) {
  const indices = Object.keys(row)
    .map((key) => /^mensagem_(\d+)$/.exec(key))
    .filter(Boolean)
    .map((m) => Number(m[1]))
    .sort((a,b) => a-b);
  const unique = [...new Set(indices)];
  if (!unique.length) return null;

  const out = [];
  unique.forEach((n, idx) => {
    const text = rowValue(row, `mensagem_${n}`);
    if (!text) return;
    const base = baseMessages[idx] || {};
    const sender = parseSender(rowValue(row, `lado_${n}`, `remetente_${n}`, `sender_${n}`), base.sender || 'incoming');
    const typeRaw = normalizeHeader(rowValue(row, `tipo_${n}`) || base.type || 'text');
    const type = ['text','audio','image','deleted','missedcall'].includes(typeRaw) ? typeRaw : 'text';
    out.push({
      id: cryptoId(),
      sender,
      type,
      text: applyVariables(text, row),
      time: applyVariables(rowValue(row, `hora_${n}`) || base.time || addMinutes(deviceTime || '10:54', idx + 1), row),
      delay: Math.max(0, Number(rowValue(row, `espera_${n}`, `delay_${n}`) || base.delay || 0.3)),
      typing: Math.max(0, Number(rowValue(row, `digitando_${n}`, `typing_${n}`) || base.typing || 0)),
      read: parseBooleanCell(rowValue(row, `lida_${n}`, `read_${n}`), sender === 'outgoing'),
      reaction: applyVariables(rowValue(row, `reacao_${n}`) || base.reaction || '', row),
      reply: applyVariables(rowValue(row, `resposta_${n}`, `reply_${n}`) || base.reply || '', row),
      image: base.image || ''
    });
  });
  return out;
}

function buildStateForBatchRow(baseState, row) {
  const out = deepClone(baseState);
  const useName = $('#batchContactFromName')?.checked !== false;

  const explicitContact = rowValue(row, 'contato', 'nome_contato');
  const rowName = rowValue(row, 'nome');
  if (explicitContact) out.contact.name = applyVariables(explicitContact, row);
  else if (useName && rowName) out.contact.name = rowName;
  else out.contact.name = applyVariables(out.contact.name, row);

  out.contact.status = applyVariables(rowValue(row, 'status') || out.contact.status || '', row);
  const avatarLetter = rowValue(row, 'avatar_letra', 'letra_avatar');
  if (avatarLetter) out.contact.avatarLetter = avatarLetter.slice(0,1).toUpperCase();

  out.device.time = applyVariables(rowValue(row, 'hora', 'hora_celular') || out.device.time || '10:54', row);
  const network = rowValue(row, 'rede');
  if (network) out.device.network = network;
  const battery = Number(rowValue(row, 'bateria'));
  if (Number.isFinite(battery) && battery > 0) out.device.battery = clamp(battery, 1, 100);
  const muted = rowValue(row, 'silencioso');
  if (muted) out.device.muted = parseBooleanCell(muted, out.device.muted);
  const charging = rowValue(row, 'carregando');
  if (charging) out.device.charging = parseBooleanCell(charging, out.device.charging);

  out.chat.date = applyVariables(rowValue(row, 'data', 'data_exibida') || out.chat.date || 'Hoje', row);
  const encryption = rowValue(row, 'mostrar_criptografia', 'criptografia');
  if (encryption) out.chat.showEncryption = parseBooleanCell(encryption, out.chat.showEncryption);
  out.chat.encryptionText = applyVariables(out.chat.encryptionText, row);

  const useExcelMessages = $('#batchUseExcelMessages')?.checked !== false;
  const script = rowValue(row, 'roteiro');
  let messages = null;
  if (useExcelMessages && script) messages = buildMessagesFromScriptText(script, row, out.device.time);
  if (useExcelMessages && (!messages || !messages.length)) messages = buildMessagesFromExcelColumns(baseState.messages, row, out.device.time);

  if (!messages || !messages.length) {
    messages = baseState.messages.map((message) => ({
      ...deepClone(message), id: cryptoId(),
      text: applyVariables(message.text, row),
      time: applyVariables(message.time, row),
      reaction: applyVariables(message.reaction, row),
      reply: applyVariables(message.reply, row)
    }));
  }
  out.messages = messages.map(message => ({
    ...message,
    reaction: ''
  }));
  return normalizeState(out);
}


// Relatórios de retenção são exportados com BOM UTF-16LE e algumas linhas
// totalmente envolvidas por aspas, contendo pares de aspas duplicados.
// O CSV é lido localmente pelo navegador, sem envio para servidores.
async function readReportText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes);
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes);
  }
  try {
    return new TextDecoder('utf-8', {fatal:true}).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

function fixWrappedRetentionCsv(text) {
  const raw = String(text || '').replace(/^\uFEFF/, '');
  const first = raw.split(/\r?\n/, 1)[0] || '';
  if (!/^"[^"\r\n]*;""/.test(first)) return raw;
  return raw.split(/\r?\n/).map((line) => {
    if (line.startsWith('"') && line.endsWith('"')) {
      return line.slice(1, -1).replace(/""/g, '"');
    }
    return line;
  }).join('\n');
}

function isRetentionContractReport(rows) {
  if (!rows.length) return false;
  const first = rows[0];
  return ['cliente','cpf_cliente','contrato','n_portabilidade','banco','loja','telefone']
    .every((field) => Object.hasOwn(first, field));
}

function digitsOnly(value) { return String(value ?? '').replace(/\D/g, ''); }
function finalCpf(value) {
  const digits = digitsOnly(value), end = digits.slice(-5);
  return end.length >= 3 ? `${end.slice(0,-2)}-${end.slice(-2)}` : end;
}
function lastFour(value) { return digitsOnly(value).slice(-4); }
function formatContactPhone(value) {
  let digits = digitsOnly(value);
  if (digits.startsWith('55') && [12,13].includes(digits.length)) digits = digits.slice(2);
  if (digits.length === 11) return `+55 ${digits.slice(0,2)} ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `+55 ${digits.slice(0,2)} ${digits.slice(2,6)}-${digits.slice(6)}`;
  return String(value ?? '').trim();
}
function formattedToday() {
  return new Intl.DateTimeFormat('pt-BR', {day:'numeric', month:'long', year:'numeric'}).format(new Date());
}
function readableDateToday() { return new Intl.DateTimeFormat('pt-BR').format(new Date()); }
function distinctTexts(values) { return [...new Set(values.map((v) => String(v ?? '').trim()).filter(Boolean))]; }
function joinPt(items) {
  const valid = items.filter(Boolean);
  if (valid.length < 2) return valid[0] || '';
  if (valid.length === 2) return `${valid[0]} e ${valid[1]}`;
  return `${valid.slice(0,-1).join(', ')} e ${valid[valid.length-1]}`;
}

// Os repertórios abaixo são os mesmos da automação Python fornecida pelo usuário.
// Utilizados EXCLUSIVAMENTE para construir prévias fictícias com marca de SIMULAÇÃO.
const PRIMEIRA_RESPOSTA_NEUTRAS = Object.freeze(["Pode.","Pode sim.","Sim, pode.","Pode mandar.","Manda sim.","Pode enviar.","Pode falar.","Pode seguir.","Pode continuar.","Pode prosseguir.","Sim, manda.","Ok, pode.","Ok, manda.","Certo, pode.","Tá bom, pode.","Tudo bem, pode.","Pode mandar sim.","Pode enviar sim.","pode sim","pode mandar","manda pfv","pode falar sim","blz, pode mandar","beleza, manda aí","ok, manda aí","sim, pode mandar","pode enviar aí","pode mandar aí","ta bom, manda","tá bom, manda","certo, manda aí","pode sim, manda aí","sim sim, pode mandar","Tudo bem, pode mandar.","Pode sim, pode enviar.","Claro, pode mandar.","Tudo certo, pode enviar.","Pode prosseguir, por favor.","Sim, pode mandar a mensagem.","Pode enviar, sem problema.","Certo, pode me mandar.","Ok, pode enviar.","Pode sim, fico no aguardo.","Tá certo, pode mandar.","Beleza, pode enviar.","Pode enviar, estou acompanhando.","Sim, pode prosseguir.","Certo, pode seguir.","Sem problema, pode enviar.","Pode seguir com a mensagem.","Tudo certo por aqui, pode mandar.","Pode enviar os dados.","Pode mandar para eu conferir.","Pode prosseguir normalmente.","Sim, pode continuar.","Certo, estou aguardando.","Pode enviar quando quiser.","Pode mandar, estou vendo aqui.","Tudo bem, pode seguir.","Sim, manda por favor.","Pode encaminhar.","Pode enviar para mim.","Pode seguir, por gentileza.","Ok, pode prosseguir.","Pode mandar que eu verifico.","Certo, pode me enviar.","Pode mandar, está tudo bem.","Tudo bem, pode continuar.","Pode sim, estou aqui.","Pode mandar, estou acompanhando.","Pode enviar, vou olhar aqui.","Manda que eu confiro.","Pode seguir, estou acompanhando.","Sim, pode mandar por aqui.","Pode mandar as informações.","Certo, manda pra mim.","Pode mandar que eu vejo.","Ok, pode passar.","Pode passar as informações.","Pode sim, sem problema.","Sim, tranquilo.","Tranquilo, pode seguir.","Tá certo, pode passar.","Pode continuar por aqui.","Sim, pode enviar por aqui.","Pode mandar, por favor.","Certo, pode passar.","Tudo certo, manda aí.","Sim, pode falar.","Pode seguir sim."]);
const PRIMEIRA_RESPOSTA_MANHA = Object.freeze(["Bom dia! Pode mandar.","Bom dia! Pode sim.","Bom dia, pode enviar.","Bom dia, manda aí.","Bom dia! Pode falar.","Bom dia, pode seguir.","Bom dia! Tudo bem, pode mandar.","Bom dia! Pode sim, pode enviar.","Bom dia, claro, pode mandar.","Bom dia! Tudo certo, pode prosseguir.","Bom dia, pode enviar sim.","Bom dia! Pode mandar, fico no aguardo.","Bom dia! Pode prosseguir.","Bom dia, pode me enviar.","Bom dia! Pode mandar os dados.","Bom dia, tudo certo. Pode seguir.","Bom dia! Pode enviar para eu conferir.","Bom dia, sem problema. Pode mandar.","Bom dia! Pode continuar, por favor.","Bom dia, pode encaminhar.","Bom dia! Sim, pode prosseguir.","Bom dia, estou acompanhando. Pode mandar.","Bom dia! Pode seguir normalmente.","Bom dia, pode mandar que eu verifico.","Bom dia, tranquilo. Pode mandar.","Bom dia! Manda aí.","Bom dia, pode passar.","Bom dia! Pode falar sim."]);
const PRIMEIRA_RESPOSTA_TARDE = Object.freeze(["Boa tarde! Pode mandar.","Boa tarde! Pode sim.","Boa tarde, pode enviar.","Boa tarde, manda aí.","Boa tarde! Pode falar.","Boa tarde, pode seguir.","Boa tarde! Tudo bem, pode mandar.","Boa tarde! Pode sim, pode enviar.","Boa tarde, claro, pode mandar.","Boa tarde! Tudo certo, pode prosseguir.","Boa tarde, pode enviar sim.","Boa tarde! Pode mandar, fico no aguardo.","Boa tarde! Pode prosseguir.","Boa tarde, pode me enviar.","Boa tarde! Pode mandar os dados.","Boa tarde, tudo certo. Pode seguir.","Boa tarde! Pode enviar para eu conferir.","Boa tarde, sem problema. Pode mandar.","Boa tarde! Pode continuar, por favor.","Boa tarde, pode encaminhar.","Boa tarde! Sim, pode prosseguir.","Boa tarde, estou acompanhando. Pode mandar.","Boa tarde! Pode seguir normalmente.","Boa tarde, pode mandar que eu verifico.","Boa tarde, tranquilo. Pode mandar.","Boa tarde! Manda aí.","Boa tarde, pode passar.","Boa tarde! Pode falar sim."]);
const SEGUNDA_RESPOSTA = Object.freeze(["Confirmo.","Sim, confirmo.","Confirmo sim.","Está correto, confirmo.","Tudo certo, confirmo.","Sim, está correto.","Pode prosseguir, confirmo.","Confirmado.","Certo, confirmo.","Sim, pode seguir.","Confirmo o cancelamento.","Está tudo certo, pode prosseguir.","Sim, confirmo o cancelamento.","Confirmo, está correto.","Correto, pode seguir.","Sim, pode dar continuidade.","Pode seguir, está confirmado.","Confirmado por mim.","Sim, tudo certo.","Está certo, pode prosseguir.","Pode continuar, confirmo.","Sim, essa informação está correta.","Confirmo essas informações.","Está correto, pode seguir.","Sim, está confirmado.","Pode dar andamento.","Confirmo, pode continuar.","Sim, pode concluir.","Tudo certo, pode concluir.","De acordo, pode prosseguir.","Sim, estou de acordo.","Correto, confirmo.","Confirmo e pode seguir.","Pode prosseguir com o cancelamento.","Sim, pode cancelar.","Confirmo que pode cancelar.","Certo, pode dar andamento.","Tudo certo por aqui, pode seguir.","Confirmado, pode prosseguir.","Sim, pode finalizar.","Pode finalizar, confirmo.","Está tudo correto.","Sim, essas informações conferem.","Confirmo os dados informados.","Pode continuar, está correto.","De acordo, confirmo.","Sim.","Sim, correto.","Isso, confirmo.","Isso mesmo.","Certo, confirmo.","Tá certo.","Tudo certo.","Pode seguir.","Pode concluir.","Pode finalizar.","Sim, pode.","Confirmado sim.","Ok, confirmo.","Beleza, confirmo.","Tá correto.","Sim, é isso.","Isso, pode seguir.","Certo, pode seguir.","Tudo certo, pode seguir.","Sim, pode continuar."]);

const RECENT_RESPONSES = 18;

function randomBetween(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
function randomResponseUnique(options, history, avoid = '') {
  const blocked = new Set(history.slice(-RECENT_RESPONSES));
  if (avoid) blocked.add(avoid);
  let candidates = options.filter((text) => !blocked.has(text));
  if (!candidates.length) {
    history.length = 0;
    candidates = options.filter((text) => text !== avoid);
    if (!candidates.length) candidates = [...options];
  }
  const chosen = candidates[randomBetween(0, candidates.length-1)];
  history.push(chosen);
  if (history.length > RECENT_RESPONSES*2) history.splice(0, history.length-RECENT_RESPONSES);
  return chosen;
}
function randomConversationTimes() {
  // Janela de 08:00 a 14:00 (inclusive); intervalos aleatórios [1,30], [1,5], [1,30], [1,5].
  const min = 8*60, max = 14*60;
  const gap1 = randomBetween(1,30);
  const gap2 = randomBetween(1,5);
  const gap3 = randomBetween(1,30);
  const gapTop = randomBetween(1,5);
  const first = randomBetween(min, max-gap1-gap2-gap3-gapTop);
  const minutes = [first,first+gap1,first+gap1+gap2,first+gap1+gap2+gap3,first+gap1+gap2+gap3+gapTop];
  return minutes.map((total)=>`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`);
}


function obterDataSimulacao(row) {
  const valor = String(rowValue(row, 'data_conversa') || '').trim();
  let data = new Date();

  if (valor) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

    if (!partes) {
      throw new Error(
        `Data inválida: "${valor}". Use DD/MM/AAAA em data_conversa.`
      );
    }

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);

    data = new Date(ano, mes - 1, dia, 12);

    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      throw new Error(`Data inexistente: "${valor}".`);
    }
  }

  return {
    curta: new Intl.DateTimeFormat('pt-BR').format(data),
    extensa: new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(data)
  };
}


function retentionReportToBatchRows(source) {
  const groups = new Map();
  for (let idx = 0; idx < source.length; idx++) {
    const row = source[idx];
    const cpf = digitsOnly(rowValue(row, 'cpf_cliente'));
    const numero = String(rowValue(row, 'n_portabilidade')).replace(/\.0+$/, '');
    const key = `${cpf || `SEMCPF_${idx}`}::${numero || `SEMNUM_${idx}`}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const history1 = [];
  const history2 = [];
  let lastReply1 = '';
  const result = [];
  for (const group of groups.values()) {
    const first = group[0];
    const dataSimulacao = obterDataSimulacao(first);
    const nome = rowValue(first, 'cliente');
    const cpf = rowValue(first, 'cpf_cliente');
    const numero = String(rowValue(first,'n_portabilidade')).replace(/\.0+$/,'');
    const telefone = formatContactPhone(rowValue(first, 'telefone'));
    const contratos = distinctTexts(group.map((r) => rowValue(r, 'contrato')));
    const bancos = distinctTexts(group.map((r) => rowValue(r, 'banco')));
    const nomeBanco = joinPt(bancos);
    const contratoFinais = joinPt(contratos.map(lastFour));
    const primeiroNome = nome.trim().split(/\s+/)[0] || 'cliente';
    const primeiroNomeFormatado = primeiroNome;
    const loja = rowValue(first, 'loja') || 'SEM_LOJA';
    const [h1,h2,h3,h4,hTop] = randomConversationTimes();
    const greeting = Number(h1.slice(0,2)) < 12 ? 'Bom dia' : 'Boa tarde';
    const options1 = PRIMEIRA_RESPOSTA_NEUTRAS.concat(Number(h2.slice(0,2)) < 12 ? PRIMEIRA_RESPOSTA_MANHA : PRIMEIRA_RESPOSTA_TARDE);
    const reply1 = randomResponseUnique(options1, history1, lastReply1);
    const reply2 = randomResponseUnique(SEGUNDA_RESPOSTA, history2, reply1);
    lastReply1 = reply1;
    const abertura = `${greeting}, Sr.(a) ${primeiroNomeFormatado}. Conforme conversamos anteriormente por telefone, como o(a) senhor(a) não deseja prosseguir com a portabilidade, precisamos apenas confirmar essa decisão. Na sequência, enviarei os dados da solicitação para sua conferência. Pode confirmar se posso prosseguir?`;
    // const oficial = `Sr.(a) ${nome}, com final de CPF ${finalCpf(cpf)}, conforme sua aprovação, na data de hoje ${readableDateToday()}, estamos cancelando a sua solicitação de portabilidade de número ${numero}, efetuada pelo Banco ${nomeBanco}, referente ao(s) contrato(s) final(is) ${contratoFinais}, mediante oferta de refinanciamento. O Sr.(a) confirma?`;
    const oficial = `Sr.(a) ${nome}, com final de CPF ${finalCpf(cpf)}, conforme sua aprovação, na data de hoje ${readableDateToday()}, estamos cancelando a(s) sua(s) solicitação(ões) de portabilidade do número ${numero}, efetuada(s) pelo Banco ${nomeBanco}, referente ao(s) contrato(s) final(is) ${contratoFinais}, mediante oferta de refinanciamento. O Sr.(a) confirma?`;
    result.push({
      ...first,
      nome, cpf, contato: telefone || 'Contato', avatar_letra: nome.slice(0,1).toUpperCase(),
      numero, numero_portabilidade:numero, contrato: joinPt(contratos),
      banco: nomeBanco, loja, empresa: nomeBanco, telefone,
      data_exibida: formattedToday(), hora_celular: hTop,
      status: 'Online',
      rede: '4G+', bateria:'35', silencioso:'nao', carregando:'nao', mostrar_criptografia:'sim',
      mensagem_1: abertura,
      // Os textos foram sorteados; jamais são evidência de que um cliente respondeu.
      mensagem_2: `${reply1}`,
      mensagem_3: oficial,
      mensagem_4: `${reply2}`,
      lado_1:'eu', lado_2:'contato', lado_3:'eu', lado_4:'contato',
      hora_1:h1, hora_2:h2, hora_3:h3, hora_4:h4,
      espera_1:'0.8', espera_2:'1.0', espera_3:'0.8', espera_4:'1.0',
      digitando_1:'1.2', digitando_2:'1.6', digitando_3:'1.2', digitando_4:'1.6',
      lida_1:'sim', lida_2:'nao', lida_3:'sim', lida_4:'nao',
      pasta: loja,
      arquivo: `${contratos.join('_')} - ${nome} - ${cpf}`,
      situacao_comprovacao:'SIMULAÇÃO DE DIÁLOGO - SEM CONFIRMAÇÃO REAL',
      linhas_origem:String(group.length)
    });
  }
  return result;
}

function parseCsvText(text) {
  const sample = String(text || '').split(/\r?\n/).find((line) => line.trim()) || '';
  const separators = [';', ',', '\t'];
  let sep = ';';
  let best = -1;
  for (const candidate of separators) {
    const count = (sample.match(new RegExp(candidate === '\t' ? '\\t' : `\\${candidate}`, 'g')) || []).length;
    if (count > best) { best = count; sep = candidate; }
  }

  const rows = [];
  let row = [], cell = '', quoted = false;
  const src = String(text || '').replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      if (quoted && src[i+1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === sep && !quoted) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && src[i+1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => String(v).trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((v) => String(v).trim() !== '')) rows.push(row);
  return matrixToObjects(rows);
}

function excelColumnIndex(ref) {
  const letters = String(ref || '').match(/^[A-Z]+/i)?.[0]?.toUpperCase() || 'A';
  let n = 0;
  for (const ch of letters) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}

function xmlTextNodes(node, tagName) {
  return Array.from(node?.getElementsByTagName(tagName) || []).map((n) => n.textContent || '').join('');
}

async function parseXlsxFile(file) {
  if (!window.JSZip) throw new Error('Leitor XLSX não carregou. Abra o projeto pelo ABRIR.bat.');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const workbookFile = zip.file('xl/workbook.xml');
  const relsFile = zip.file('xl/_rels/workbook.xml.rels');
  if (!workbookFile || !relsFile) throw new Error('XLSX inválido: estrutura do Excel não encontrada.');

  const parser = new DOMParser();
  const workbook = parser.parseFromString(await workbookFile.async('text'), 'application/xml');
  const sheets = workbook.getElementsByTagName('sheet');
  if (!sheets.length) throw new Error('O Excel não possui planilhas.');
  const relId = sheets[0].getAttribute('r:id') || sheets[0].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');

  const rels = parser.parseFromString(await relsFile.async('text'), 'application/xml');
  let target = '';
  for (const rel of Array.from(rels.getElementsByTagName('Relationship'))) {
    if (rel.getAttribute('Id') === relId) { target = rel.getAttribute('Target') || ''; break; }
  }
  if (!target) target = 'worksheets/sheet1.xml';
  target = target.replace(/^\//, '');
  const sheetPath = target.startsWith('xl/') ? target : `xl/${target}`;
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) throw new Error('Não foi possível abrir a primeira planilha do Excel.');

  let shared = [];
  const sharedFile = zip.file('xl/sharedStrings.xml');
  if (sharedFile) {
    const sharedDoc = parser.parseFromString(await sharedFile.async('text'), 'application/xml');
    shared = Array.from(sharedDoc.getElementsByTagName('si')).map((si) => xmlTextNodes(si, 't'));
  }

  const sheetDoc = parser.parseFromString(await sheetFile.async('text'), 'application/xml');
  const matrix = [];
  for (const rowNode of Array.from(sheetDoc.getElementsByTagName('row'))) {
    const row = [];
    for (const cell of Array.from(rowNode.getElementsByTagName('c'))) {
      const index = excelColumnIndex(cell.getAttribute('r'));
      const type = cell.getAttribute('t') || '';
      const v = cell.getElementsByTagName('v')[0]?.textContent ?? '';
      let value = v;
      if (type === 's') value = shared[Number(v)] ?? '';
      else if (type === 'inlineStr') value = xmlTextNodes(cell, 't');
      else if (type === 'b') value = v === '1' ? 'TRUE' : 'FALSE';
      row[index] = value;
    }
    matrix.push(row);
  }
  return matrixToObjects(matrix);
}

function matrixToObjects(matrix) {
  const rows = (matrix || []).filter((row) => Array.isArray(row) && row.some((v) => String(v ?? '').trim() !== ''));
  if (rows.length < 2) return [];
  const headers = rows[0].map((h, i) => normalizeHeader(h) || `coluna_${i+1}`);
  const out = [];
  rows.slice(1).forEach((values, idx) => {
    const obj = { linha: String(idx + 2) };
    headers.forEach((header, i) => obj[header] = values[i] === undefined || values[i] === null ? '' : String(values[i]));
    if (Object.entries(obj).some(([k,v]) => k !== 'linha' && String(v).trim() !== '')) out.push(obj);
  });
  return out;
}

async function parseBatchFile(file) {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.xlsx')) return parseXlsxFile(file);
  if (name.endsWith('.csv')) return parseCsvText(fixWrappedRetentionCsv(await readReportText(file)));
  throw new Error('Formato não suportado. Use .xlsx ou .csv.');
}

function updateBatchSummary() {
  const summary = $('#batchFileSummary');
  const columns = $('#batchColumns');
  const preview = $('#previewBatchBtn');
  const generate = $('#generateBatchBtn');
  if (!batchRows.length) {
    summary.textContent = 'Nenhum arquivo carregado.';
    summary.classList.remove('ready');
    columns.classList.add('hidden');
    $('#batchReportMode')?.classList.add('hidden');
    preview.disabled = true;
    generate.disabled = true;
    return;
  }
  const keys = Object.keys(batchRows[0]).filter((key) => key !== 'linha');
  summary.textContent = `${batchSourceName} — ${batchRows.length} ${batchMode === 'retention' ? 'prévia(s) por CPF + portabilidade' : 'conversa(s)'} identificada(s).`;
  $('#batchReportMode')?.classList.toggle('hidden', batchMode !== 'retention');
  summary.classList.add('ready');
  columns.innerHTML = `<strong>Variáveis detectadas:</strong> ${keys.map((key) => `<code>{${escapeHtml(key)}}</code>`).join(' ')}`;
  columns.classList.remove('hidden');
  preview.disabled = false;
  generate.disabled = false;
}

async function onBatchFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  restoreBatchPreview();
  const summary = $('#batchFileSummary');
  summary.textContent = 'Lendo arquivo...';
  summary.classList.remove('ready');
  try {
    const imported = await parseBatchFile(file);
    batchMode = isRetentionContractReport(imported) ? 'retention' : 'generic';
    batchRows = batchMode === 'retention' ? retentionReportToBatchRows(imported) : imported;
    batchSourceName = file.name;
    if (batchMode === 'retention') {
      $('#batchFilename').value = '{contrato} - {nome} - {cpf}';
      $('#batchUseExcelMessages').checked = true;
      $('#batchContactFromName').checked = false;
    }

    if (!batchRows.length) throw new Error('Nenhuma linha de conversa foi encontrada após o cabeçalho.');
    updateBatchSummary();
    toast(`${batchRows.length} conversa(s) carregada(s).`);
  } catch (error) {
    batchRows = [];
    batchMode = 'generic';
    batchSourceName = '';
    updateBatchSummary();
    toast(error?.message || 'Não foi possível ler o arquivo.', true);
  }
}

function restoreBatchPreview() {
  if (!batchPreviewRestore) return false;
  state = batchPreviewRestore;
  batchPreviewRestore = null;
  $('#phoneScreen')?.classList.remove('batch-fit-1', 'batch-fit-2', 'batch-fit-3');
  renderEditor(); renderPhoneStatic(); renderAllMessages();
  $('#previewBatchBtn').textContent = 'Pré-visualizar 1ª conversa';
  return true;
}

function previewFirstBatchConversation() {
  if (!batchRows.length) return toast('Carregue um Excel primeiro.', true);
  if (batchPreviewRestore) {
    restoreBatchPreview();
    toast('Modelo original restaurado.');
    return;
  }
  batchPreviewRestore = deepClone(state);
  state = buildStateForBatchRow(batchPreviewRestore, batchRows[0]);
  renderEditor(); renderPhoneStatic(); renderAllMessages();
  fitBatchContentOrThrow().catch((err) => toast(err.message, true));
  $('#previewBatchBtn').textContent = 'Voltar ao modelo';
  toast('Prévia da primeira conversa aplicada.');
}

function nextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

// Ajusta apenas casos excepcionais que não cabem no viewport do celular.
// Nunca usa scroll para esconder o início da mensagem na imagem exportada.
async function fitBatchContentOrThrow() {
  const screen = $('#phoneScreen');
  const view = $('#messageViewport');
  if (!screen || !view) return;
  const classes = ['batch-fit-1', 'batch-fit-2', 'batch-fit-3'];
  screen.classList.remove(...classes);
  for (let level = 0; level <= classes.length; level++) {
    await nextPaint();
    if (view.scrollHeight <= view.clientHeight + 2) {
      view.scrollTop = 0;
      return level;
    }
    if (level < classes.length) screen.classList.add(classes[level]);
  }
  // Não exporta silenciosamente imagens com parte das mensagens oculta.
  throw new Error('Esta conversa tem textos demais para uma única captura; confira os dados antes de exportar.');
}

async function urlToDataUrl(url) {
  if (!url || /^data:/i.test(url)) return url;
  const absolute = new URL(url, location.href).href;
  if (captureAssetCache.has(absolute)) return captureAssetCache.get(absolute);
  const response = await fetch(absolute, { cache:'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar recurso do print: ${url}`);
  const blob = await response.blob();
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  captureAssetCache.set(absolute, data);
  return data;
}

async function getCaptureCss() {
  if (captureCssCache) return captureCssCache;
  let css = '';
  try {
    const response = await fetch('styles.css?v=38', { cache:'no-store' });
    if (response.ok) css = await response.text();
  } catch {}
  if (!css) {
    try {
      css = Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules || []))
        .map((rule) => rule.cssText).join('\n');
    } catch {}
  }
  if (!css) throw new Error('Não foi possível preparar o CSS do print. Abra pelo ABRIR.bat.');

  const urls = [...css.matchAll(/url\((['"]?)([^'"\)]+)\1\)/g)];
  for (const match of urls) {
    const raw = match[2].trim();
    if (!raw || /^data:/i.test(raw) || raw.startsWith('#')) continue;
    try {
      const data = await urlToDataUrl(raw);
      css = css.split(match[0]).join(`url("${data}")`);
    } catch (error) {
      console.warn('Recurso CSS não incorporado:', raw, error);
    }
  }
  css += `\n.phone-screen{border-radius:0!important;box-shadow:none!important;transform:none!important;margin:0!important;}\n`;
  captureCssCache = css;
  return css;
}

function prepareMessageViewportClone(originalPhone, clonedPhone) {
  const originalView = originalPhone.querySelector('#messageViewport');
  const cloneView = clonedPhone.querySelector('#messageViewport');
  if (!originalView || !cloneView) return;
  const computed = getComputedStyle(originalView);
  const scrolled = originalView.scrollTop || 0;
  const content = document.createElement('div');
  content.setAttribute('style', [
    'position:absolute', 'left:0', 'right:0', `top:${-scrolled}px`,
    `padding:${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
    'display:flex', 'flex-direction:column', `gap:${computed.gap || '1px'}`,
    'box-sizing:border-box', 'min-width:100%'
  ].join(';'));
  while (cloneView.firstChild) content.appendChild(cloneView.firstChild);
  cloneView.style.padding = '0';
  cloneView.style.overflow = 'hidden';
  cloneView.appendChild(content);
}

async function inlineCloneImages(originalPhone, clonedPhone) {
  const originals = Array.from(originalPhone.querySelectorAll('img'));
  const clones = Array.from(clonedPhone.querySelectorAll('img'));
  for (let i = 0; i < originals.length; i++) {
    const source = originals[i].currentSrc || originals[i].src || originals[i].getAttribute('src') || '';
    if (!source) continue;
    try { clones[i].setAttribute('src', await urlToDataUrl(source)); }
    catch (error) { console.warn('Imagem não incorporada no print:', source, error); }
  }
}

async function capturePhoneCanvas(scale = 4) {
  const phone = $('#phoneScreen');
  if (!phone) throw new Error('Tela do celular não encontrada.');
  const width = Math.round(phone.clientWidth);
  const height = Math.round(phone.clientHeight);
  if (!width || !height) throw new Error('A tela do celular está sem tamanho para captura.');

  const clone = phone.cloneNode(true);
  clone.classList.add('capture-clean');
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxWidth = 'none';
  clone.style.maxHeight = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  prepareMessageViewportClone(phone, clone);
  await inlineCloneImages(phone, clone);

  const css = await getCaptureCss();
  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">` +
    `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;margin:0;padding:0;overflow:hidden;background:#0b141a;">` +
    `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>${serialized}</div></foreignObject></svg>`;

  // IMPORTANTE: não use Blob URL aqui. No Chromium, um SVG que contém
  // <foreignObject> carregado via blob: deixa o canvas como "tainted" e
  // bloqueia canvas.toBlob(). Um data URL mantém a captura exportável.
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const image = new Image();
  image.decoding = 'async';
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('O navegador não conseguiu renderizar o print em alta resolução.'));
    image.src = svgDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d', { alpha:false });
  if (!ctx) throw new Error('Canvas indisponível no navegador.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#0b141a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível montar o PNG.')), 'image/png', 1);
  });
}

async function exportPhonePrintV26() {
  const button = $('#exportPrintBtn');
  const oldLabel = button.textContent;
  const scale = clamp(Number($('#printScale')?.value) || 4, 2, 4);
  button.disabled = true;
  button.textContent = `Gerando PNG ${scale}×...`;
  try {
    renderPhoneStatic(); renderAllMessages();
    await nextPaint();
    const canvas = await capturePhoneCanvas(scale);
    const blob = await canvasToPngBlob(canvas);
    const contact = sanitizeFileName(state.contact.name || 'conversa');
    downloadBlob(blob, `print-${contact}-${Date.now()}.png`);
    toast(`Print ${canvas.width}×${canvas.height}px exportado sem borda.`);
  } catch (error) {
    console.error('Erro ao exportar print V26:', error);
    toast(error?.message || 'Não foi possível exportar o print.', true);
  } finally {
    button.disabled = false;
    button.textContent = oldLabel;
  }
}

function setBatchProgress(current, total, label) {
  const wrap = $('#batchProgressWrap');
  const pct = total ? Math.round((current / total) * 100) : 0;
  wrap.classList.remove('hidden');
  $('#batchProgressText').textContent = label || `${current} de ${total}`;
  $('#batchProgressPercent').textContent = `${pct}%`;
  $('#batchProgressBar').style.width = `${pct}%`;
}

async function generateBatchPrints() {
  if (!batchRows.length) return toast('Carregue um relatório ou Excel primeiro.', true);
  if (!window.JSZip) return toast('Gerador ZIP não carregado.', true);

  const button = $('#generateBatchBtn');
  const previewButton = $('#previewBatchBtn');
  const cancelButton = $('#cancelBatchBtn');
  const oldLabel = button.textContent;
  const baseState = deepClone(batchPreviewRestore || state);
  const restoreState = deepClone(state);
  const scale = clamp(Number($('#printScale')?.value) || 2, 2, 4);
  const filenamePattern = $('#batchFilename')?.value || '{contrato} - {nome} - {cpf}';
  const usedNames = new Map();
  const sourceBase = sanitizeFileName(batchSourceName.replace(/\.[^.]+$/, '') || 'conversas');
  // Lotes pequenos geram 1 ZIP. Em grandes relatórios, evitamos manter centenas
  // de PNGs em memória durante a compactação. Tudo sai com um único clique.
  const maxPerZip = Math.min(batchRows.length, 500);
  const zipTotal = Math.ceil(batchRows.length / maxPerZip);
  const failures = [];
  let successes = 0;
  batchCancelled = false;

  button.disabled = true;
  previewButton.disabled = true;
  $('#batchFile').disabled = true;
  cancelButton?.classList.remove('hidden');
  button.textContent = 'Gerando imagens...';
  try {
    // Carrega os recursos apenas uma vez; capturas posteriores reutilizam cache.
    await getCaptureCss();
    for (let chunk = 0; chunk < zipTotal; chunk++) {
      if (batchCancelled) break;
      const zip = new JSZip();
      const manifest = [["linha","loja","cliente","cpf","portabilidade","contrato","arquivo","situacao"]];
      const firstIndex = chunk * maxPerZip;
      const end = Math.min(batchRows.length, firstIndex + maxPerZip);
      let zipHasPng = false;
      for (let i = firstIndex; i < end; i++) {
        if (batchCancelled) break;
        const row = batchRows[i];
        const label = rowValue(row, 'nome', 'cliente') || `Linha ${i+1}`;
        let lastError;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            state = buildStateForBatchRow(baseState, row);
            renderPhoneStatic(); renderAllMessages();
            await fitBatchContentOrThrow();
            setBatchProgress(i, batchRows.length, `Renderizando ${i+1}/${batchRows.length} — ${label}`);
            const canvas = await capturePhoneCanvas(scale);
            const png = await canvasToPngBlob(canvas);
            // Libera explicitamente a memória gráfica antes da próxima captura.
            canvas.width = 0; canvas.height = 0;

            let baseName = rowValue(row, 'arquivo', 'nome_arquivo') || applyVariables(filenamePattern, row);
            baseName = sanitizeFileName(baseName || `conversa-${i+1}`);
            const folder = batchMode === 'retention' ? `${sanitizeFileName(rowValue(row, 'pasta', 'loja')).slice(0,75)}/` : '';
            const pathKey = `${folder}${baseName}`;
            const count = usedNames.get(pathKey) || 0;
            usedNames.set(pathKey, count + 1);
            if (count) baseName += `-${count+1}`;
            const filename = `${folder}${baseName}.png`;
            zip.file(filename, png, {binary:true});
            manifest.push([row.linha || String(i+2), row.loja || '', row.nome || '', row.cpf || '', row.numero || '', row.contrato || '', filename, row.situacao_comprovacao || 'SIMULAÇÃO']);
            zipHasPng = true;
            successes++;
            lastError = null;
            break;
          } catch (error) {
            lastError = error;
            console.warn(`Tentativa ${attempt}/2, linha ${i+1}:`, error);
          }
        }
        if (lastError) failures.push([i+1, label, String(lastError?.message || lastError)]);
        setBatchProgress(i+1, batchRows.length, `${i+1}/${batchRows.length} — ${successes} concluídas; ${failures.length} erro(s)`);
      }
      if (zipHasPng) {
        const escapeCsv = (value) => {
          const raw = String(value ?? '');
          const safe = /^[=+@\-]/.test(raw) ? `\'${raw}` : raw;
          return `"${safe.replace(/"/g, '""')}"`;
        };
        const textCsv = '\uFEFF' + manifest.map((line) => line.map(escapeCsv).join(';')).join('\r\n');
        zip.file('RELATORIO_DE_CONFERENCIA.csv', textCsv);
        zip.file('LEIA-ME.txt', 'IMAGENS SIMULADAS - NÃO SÃO PRINTS REAIS DE CONVERSAS.\r\nOs dados cadastrais vêm do relatório anexado, mas não há confirmações de clientes nele.\r\nAs mensagens exibidas são textos propostos, não mensagens efetivamente enviadas.\r\n');
        button.textContent = `Preparando ZIP ${chunk+1}/${zipTotal}...`;
        const blob = await zip.generateAsync({type:'blob', compression:'STORE'}, (meta) => {
          $('#batchProgressText').textContent = `Montando ZIP ${chunk+1}/${zipTotal} (${Math.round(meta.percent)}%)`;
        });
        const suffix = zipTotal > 1 ? `-parte-${String(chunk+1).padStart(2,'0')}-de-${String(zipTotal).padStart(2,'0')}` : '';
        downloadBlob(blob, `previas-${sourceBase}${suffix}.zip`);
      }
      if (batchCancelled) break;
    }
    if (failures.length) {
      console.table(failures.map(([linha, cliente, erro]) => ({linha, cliente, erro})));
    }
    setBatchProgress(successes + failures.length, batchRows.length,
      batchCancelled ? `Interrompido: ${successes} geradas, ${failures.length} erros.` :
      `Concluído: ${successes} imagens, ${failures.length} erros. ${zipTotal > 1 ? `${zipTotal} ZIPs organizados por loja.` : 'ZIP disponível.'}`);
    toast(batchCancelled ? 'Geração interrompida.' : `${successes} imagens em lote geradas. ${failures.length} erro(s).`, !!failures.length);
  } catch (error) {
    console.error('Erro na geração em massa:', error);
    toast(error?.message || 'Erro ao gerar as imagens em massa.', true);
  } finally {
    $('#phoneScreen')?.classList.remove('batch-fit-1', 'batch-fit-2', 'batch-fit-3');
    state = restoreState;
    renderEditor(); renderPhoneStatic(); renderAllMessages();
    button.disabled = false;
    previewButton.disabled = false;
    $('#batchFile').disabled = false;
    cancelButton?.classList.add('hidden');
    button.textContent = oldLabel;
    batchCancelled = false;
  }
}

function bindBatchControls() {
  $('#batchFile')?.addEventListener('change', onBatchFileChange);
  $('#previewBatchBtn')?.addEventListener('click', previewFirstBatchConversation);
  $('#generateBatchBtn')?.addEventListener('click', generateBatchPrints);
  $('#cancelBatchBtn')?.addEventListener('click', () => { batchCancelled = true; });
  updateBatchSummary();
}

function init() {
  bindStaticControls();
  bindBatchControls();
  renderEditor();
  renderPhoneStatic();
  renderAllMessages();
  window.addEventListener('resize', adjustMessagePadding);
}

init();
