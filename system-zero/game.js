(() => {
  'use strict';

  const STORAGE_KEY = 'dunePearlSystemZero_v1';
  const TOTAL_SECONDS = 45 * 60;
  const TEAM_CODE = '638';

  const roles = {
    ops: {
      badge: 'ALPHA',
      callsign: 'Consultant Alpha',
      name: 'Doha Operations Centre',
      short: 'Doha Operations',
      digitIndex: 0,
      digit: '6',
      work: 'Leadership, finance, HR, marketing and central IT.',
      requirement: {
        user: 'Finance team',
        task: 'Reconcile reliable site totals for reporting',
        constraint: 'Records arrive from three locations and current totals require manual reconciliation',
        success: 'Finance can produce an agreed daily total without re-keying site figures'
      },
      evidence: [
        ['Staffing', '42 permanent staff work at the Doha Operations Centre.'],
        ['Function', 'Leadership, finance, HR, marketing and central IT are based here.'],
        ['Current difficulty', 'Finance manually reconciles site totals before reporting.']
      ]
    },
    marina: {
      badge: 'BRAVO',
      callsign: 'Consultant Bravo',
      name: 'Pearl Marina Hub',
      short: 'Pearl Marina',
      digitIndex: 1,
      digit: '3',
      work: 'Boat tours, watersports, equipment hire and guest check-in.',
      requirement: {
        user: 'Marina check-in staff',
        task: 'Check guests in near the boarding area',
        constraint: 'Staff work outdoors and booking details are currently re-entered',
        success: 'Staff can confirm a booking at the boarding area without entering the same guest details again'
      },
      evidence: [
        ['Staffing', '68 permanent staff work at the Pearl Marina Hub.'],
        ['Function', 'Boat tours, watersports, equipment hire and guest check-in happen here.'],
        ['Current difficulty', 'Marina staff re-enter guest details after an online booking.']
      ]
    },
    desert: {
      badge: 'CHARLIE',
      callsign: 'Consultant Charlie',
      name: 'Dune Desert Camp',
      short: 'Dune Desert Camp',
      digitIndex: 2,
      digit: '8',
      work: 'Tours, dining, overnight stays and corporate experiences.',
      requirement: {
        user: 'Camp arrival staff',
        task: 'Confirm arriving guests during a connection failure',
        constraint: 'The external connection is unreliable during busy evening events',
        success: 'Staff can access an authorised current arrival list during an outage and reconcile changes afterwards'
      },
      evidence: [
        ['Staffing', '91 permanent staff work at the Dune Desert Camp.'],
        ['Function', 'Tours, dining, overnight stays and corporate experiences happen here.'],
        ['Current difficulty', 'An internet outage can prevent staff seeing updated arrival lists.']
      ]
    }
  };

  const lockMeta = [
    ['L01', 'Know your client'],
    ['L02', 'Fact or fiction?'],
    ['L03', 'Build the argument'],
    ['L04', 'Define the requirement'],
    ['L05', 'Reconcile the records'],
    ['L06', 'Interrogate the human'],
    ['L07', 'Transfer and improve']
  ];

  const commonComms = {
    0: [
      ['SYSTEM', 'Recovery protocol requires consultant verification of each site before access is restored.', 'system'],
      ['BOARD', 'Please just tell us what to buy. We need this fixed tonight.', 'alert']
    ],
    1: [
      ['INCIDENT BOT', 'Warning: several messages mix supplied evidence with assumptions and proposed solutions.', 'system'],
      ['BOARD', 'Surely the camp just needs faster internet?', 'alert']
    ],
    2: [
      ['LEAD CONSULTANT', 'A feature is not an explanation. Link the claim to case evidence, a consequence and a limitation.', 'system']
    ],
    3: [
      ['SYSTEM', 'Premature product selection detected. Define what the system must achieve before naming technology.', 'alert']
    ],
    4: [
      ['GUEST SERVICES', 'One guest journey is appearing differently at different sites. Compare what your team can see.', 'system']
    ],
    5: [
      ['CAMP SUPERVISOR', 'Everyone keeps telling me what the solution is. Nobody has asked what actually happens when the link drops.', 'system']
    ],
    6: [
      ['BOARD', 'New evidence received. We need a recovery decision, but we also need to know what still requires investigation.', 'system']
    ]
  };

  const roleComms = {
    ops: {
      0: [['FINANCE', 'My team receives totals from every location. We still spend time reconciling them manually.', '']],
      4: [['FINANCE', 'Booking DP1842 appears in two extracts. The totals agree, but the guest details do not.', 'alert']]
    },
    marina: {
      0: [['MARINA DESK', 'The boarding queue is growing. Staff are checking the same guest details in more than one place.', '']],
      4: [['MARINA DESK', 'DP1842: marina activity confirmed. Dinner field is blank here.', 'alert']]
    },
    desert: {
      0: [['CAMP TEAM', 'External connection is unstable again. Evening arrivals have started.', '']],
      4: [['CAMP TEAM', 'DP1842 is on tonight\'s dinner list. We cannot confirm whether the marina record has the change.', 'alert']]
    }
  };

  let state = freshState();
  let selectedRole = null;
  let timerHandle = null;
  let audioEnabled = false;
  let audioCtx = null;

  const $ = (id) => document.getElementById(id);
  const introScreen = $('introScreen');
  const missionScreen = $('missionScreen');
  const completeScreen = $('completeScreen');
  const startButton = $('startButton');
  const resumeButton = $('resumeButton');
  const submitButton = $('submitButton');
  const nextButton = $('nextButton');
  const hintButton = $('hintButton');
  const feedback = $('feedback');
  const challengeBody = $('challengeBody');

  function freshState() {
    return {
      role: null,
      playerName: '',
      current: 0,
      completed: [],
      credibility: 100,
      assumption: 0,
      remaining: TOTAL_SECONDS,
      lastTick: null,
      running: false,
      hintUsed: {},
      mistakes: {},
      revealedDigit: false,
      finished: false
    };
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !roles[saved.role] || saved.finished) return null;
      return {...freshState(), ...saved};
    } catch (_) {
      return null;
    }
  }

  function clearSaved() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function beep(type = 'ok') {
    if (!audioEnabled) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = type === 'bad' ? 'sawtooth' : 'sine';
      osc.frequency.value = type === 'bad' ? 155 : type === 'unlock' ? 620 : 430;
      gain.gain.setValueAtTime(.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .18);
      osc.start(); osc.stop(audioCtx.currentTime + .2);
    } catch (_) {}
  }

  function initialise() {
    document.querySelectorAll('.role-card').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRole = btn.dataset.role;
        document.querySelectorAll('.role-card').forEach(b => b.classList.toggle('selected', b === btn));
        startButton.disabled = false;
      });
    });

    const saved = loadSaved();
    if (saved) {
      resumeButton.classList.remove('hidden');
      resumeButton.textContent = `RESUME ${roles[saved.role].badge} MISSION · LOCK ${String(saved.current + 1).padStart(2, '0')}`;
    }

    startButton.addEventListener('click', startNewMission);
    resumeButton.addEventListener('click', resumeMission);
    submitButton.addEventListener('click', submitCurrent);
    nextButton.addEventListener('click', nextChallenge);
    hintButton.addEventListener('click', useHint);
    $('resetButton').addEventListener('click', resetMission);
    $('playAgainButton').addEventListener('click', resetMission);
    $('soundToggle').addEventListener('click', toggleSound);
    $('evidenceButton').addEventListener('click', toggleEvidence);

    challengeBody.addEventListener('click', e => {
      const choice = e.target.closest('[data-choice]');
      if (choice) {
        const group = choice.dataset.group || 'main';
        document.querySelectorAll(`[data-choice][data-group="${group}"]`).forEach(c => c.classList.remove('selected'));
        choice.classList.add('selected');
      }
      const plan = e.target.closest('[data-plan]');
      if (plan) {
        document.querySelectorAll('[data-plan]').forEach(p => p.classList.remove('selected'));
        plan.classList.add('selected');
      }
    });
  }

  function startNewMission() {
    if (!selectedRole) return;
    clearSaved();
    state = freshState();
    state.role = selectedRole;
    state.playerName = $('playerName').value.trim();
    state.running = true;
    state.lastTick = Date.now();
    save();
    openMission();
  }

  function resumeMission() {
    const saved = loadSaved();
    if (!saved) return;
    state = saved;
    if (state.running && state.lastTick) {
      const elapsed = Math.floor((Date.now() - state.lastTick) / 1000);
      state.remaining = Math.max(0, state.remaining - elapsed);
    }
    state.running = true;
    state.lastTick = Date.now();
    save();
    openMission();
  }

  function openMission() {
    introScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    missionScreen.classList.remove('hidden');
    const role = roles[state.role];
    $('roleBadge').textContent = role.badge;
    $('locationName').textContent = role.name;
    renderLockRail();
    renderChallenge();
    updateHud();
    startTimer();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function startTimer() {
    clearInterval(timerHandle);
    timerHandle = setInterval(() => {
      if (!state.running || state.finished) return;
      state.remaining = Math.max(0, state.remaining - 1);
      state.lastTick = Date.now();
      if (state.remaining % 5 === 0) save();
      updateTimer();
    }, 1000);
  }

  function updateTimer() {
    const mins = Math.floor(state.remaining / 60);
    const secs = state.remaining % 60;
    $('timer').textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    $('timer').style.color = state.remaining <= 300 ? 'var(--red)' : 'var(--amber)';
  }

  function updateHud() {
    const integrity = Math.min(100, 17 + (state.completed.length * 11));
    $('integrityValue').textContent = integrity;
    $('integrityBar').style.width = `${integrity}%`;
    $('credibilityValue').textContent = state.credibility;
    $('credibilityBar').style.width = `${state.credibility}%`;
    $('assumptionValue').textContent = state.assumption;
    $('assumptionBar').style.width = `${state.assumption}%`;
    updateTimer();
    renderTeamCode();
  }

  function renderLockRail() {
    $('lockList').innerHTML = lockMeta.map((item, i) => {
      const complete = state.completed.includes(i);
      const current = state.current === i;
      return `<li class="${complete ? 'complete' : current ? 'current' : ''}">
        <span class="lock-num">${complete ? '✓' : String(i + 1).padStart(2,'0')}</span>
        <span><strong>${item[1]}</strong><small>${item[0]}</small></span>
      </li>`;
    }).join('');
  }

  function renderTeamCode() {
    const role = roles[state.role];
    const digits = ['?','?','?'];
    if (state.revealedDigit || state.current >= 4 || state.completed.includes(4)) digits[role.digitIndex] = role.digit;
    $('teamCode').textContent = digits.join(' · ');
  }

  function renderChallenge() {
    const i = state.current;
    const [lesson, title] = lockMeta[i];
    $('lessonLabel').textContent = `LOCK ${String(i + 1).padStart(2,'0')} · ${lesson}`;
    $('challengeTitle').textContent = title;
    $('phaseNumber').textContent = `${String(i + 1).padStart(2,'0')} / 07`;
    feedback.className = 'feedback hidden';
    feedback.innerHTML = '';
    submitButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    hintButton.disabled = !!state.hintUsed[i];
    hintButton.innerHTML = state.hintUsed[i] ? 'HINT ALREADY USED' : 'REQUEST HINT <span class="cost">−5 credibility</span>';

    const renderers = [renderLock1, renderLock2, renderLock3, renderLock4, renderLock5, renderLock6, renderLock7];
    renderers[i]();
    renderComms();
    renderEvidence();
    renderLockRail();
    updateHud();
  }

  function setNarrative(html) {
    $('narrative').innerHTML = html;
  }

  function renderLock1() {
    const role = roles[state.role];
    setNarrative(`<p><strong>19:42.</strong> The recovery console cannot verify your location. Choose the description that belongs to <strong>${role.name}</strong>.</p>`);
    const options = [
      ['Leadership, finance, HR, marketing and central IT.', state.role === 'ops'],
      ['Boat tours, watersports, equipment hire and guest check-in.', state.role === 'marina'],
      ['Tours, dining, overnight stays and corporate experiences.', state.role === 'desert'],
      ['Warehouse production, manufacturing and international freight.', false]
    ];
    challengeBody.innerHTML = `<h3>Verify the workplace</h3><p class="instruction">Use what you know about the organisation. Select the statement that accurately describes the work at your location.</p><div class="choice-grid">${options.map((o,i)=>`<button type="button" class="choice" data-choice="${o[1] ? 'correct':'wrong'}" data-group="main"><span class="choice-marker">${String.fromCharCode(65+i)}</span><span><strong>${o[0]}</strong></span></button>`).join('')}</div>`;
  }

  function renderLock2() {
    setNarrative(`<p>Incoming messages are being treated as if they are all facts. The recovery system refuses to continue until the evidence is decoded.</p>`);
    const statements = [
      ['Marina staff re-enter guest details after an online booking.', 'fact'],
      ['A faster internet package will solve the camp issue.', 'assumption'],
      ['Each site must still operate during disruption.', 'constraint'],
      ['Measured guest queue time has not been supplied.', 'missing']
    ];
    const opts = `<option value="">Classify…</option><option value="fact">FACT</option><option value="assumption">ASSUMPTION</option><option value="constraint">CONSTRAINT</option><option value="missing">MISSING EVIDENCE</option>`;
    challengeBody.innerHTML = `<h3>Classify the evidence</h3><p class="instruction">For each statement, decide what it represents. A proposed explanation is not automatically a fact.</p><div class="sort-grid">${statements.map((s,i)=>`<div class="sort-card"><p>${s[0]}</p><select id="sort${i}" data-answer="${s[1]}" aria-label="Classify statement ${i+1}">${opts}</select></div>`).join('')}</div>`;
  }

  function renderLock3() {
    setNarrative(`<p>The board has submitted a weak statement: <strong>“Cloud computing will solve all the company’s problems.”</strong> Rebuild it as a defensible reasoning chain.</p>`);
    const fields = [
      ['CLAIM', 'claim', ['Choose…','A shared booking record could reduce repeated entry','Cloud is always cheaper','All staff need new laptops']],
      ['CASE EVIDENCE', 'evidence', ['Choose…','Departments currently use separate systems and guest details are re-entered','Cloud systems are modern','The company operates in Qatar']],
      ['CONSEQUENCE', 'consequence', ['Choose…','Staff could spend less time re-keying the same guest information','The internet would never fail again','Every stakeholder would be satisfied']],
      ['LIMITATION', 'limitation', ['Choose…','A shared online service creates a dependency, so disruption and offline working still need planning','There are no meaningful limitations','The system should use the most expensive option']]
    ];
    challengeBody.innerHTML = `<h3>Claim → evidence → consequence → limitation</h3><p class="instruction">Choose the component in each column that creates the strongest evidence-based explanation.</p><div class="chain-grid">${fields.map((f,idx)=>`<div class="chain-column"><label for="chain${idx}">${f[0]}</label><select id="chain${idx}" data-key="${f[1]}">${f[2].map((x,j)=>`<option value="${j===1?'correct':j===0?'':'wrong'}">${x}</option>`).join('')}</select></div>`).join('')}</div>`;
  }

  function renderLock4() {
    const r = roles[state.role].requirement;
    setNarrative(`<p>A senior manager has pressed the emergency button marked <strong>BUY NEW TECHNOLOGY</strong>. The console blocks the request. Define the requirement first.</p>`);
    const allUsers = ['Finance team','Marina check-in staff','Camp arrival staff','Every customer'];
    const allTasks = ['Reconcile reliable site totals for reporting','Check guests in near the boarding area','Confirm arriving guests during a connection failure','Buy the newest available device'];
    const allConstraints = ['Records arrive from three locations and current totals require manual reconciliation','Staff work outdoors and booking details are currently re-entered','The external connection is unreliable during busy evening events','The company must use cloud computing'];
    const allSuccess = ['Finance can produce an agreed daily total without re-keying site figures','Staff can confirm a booking at the boarding area without entering the same guest details again','Staff can access an authorised current arrival list during an outage and reconcile changes afterwards','The system looks modern'];
    const row = (id,label,items,correct) => `<div class="requirement-row"><label for="${id}">${label}</label><select id="${id}" data-correct="${escapeHtml(correct)}"><option value="">Choose…</option>${items.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('')}</select></div>`;
    challengeBody.innerHTML = `<h3>Build a testable requirement</h3><p class="instruction">Select the user, task, real constraint and measurable success condition that fit your location. Do not select a product.</p><div class="requirement-builder">${row('reqUser','USER',allUsers,r.user)}${row('reqTask','TASK',allTasks,r.task)}${row('reqConstraint','CONSTRAINT',allConstraints,r.constraint)}${row('reqSuccess','SUCCESS MEASURE',allSuccess,r.success)}</div>`;
  }

  function renderLock5() {
    const role = roles[state.role];
    state.revealedDigit = true;
    save();
    setNarrative(`<p>Guest record <strong>DP1842</strong> is inconsistent across the company. Your location has recovered one digit of the emergency code. The other locations have the rest.</p>`);
    const cards = state.role === 'ops' ? [
      ['OPS-77','Two extracts exist for DP1842. Totals agree, guest details do not.'],
      ['FIN-12','Site totals are currently reconciled manually before reporting.'],
      ['LOCAL DIGIT',`Your recovered digit is ${role.digit}. It is the FIRST digit.`]
    ] : state.role === 'marina' ? [
      ['MAR-31','DP1842: marina activity confirmed. Dinner field is blank.'],
      ['BOOKING LOG','Guest details were originally entered through the online booking route.'],
      ['LOCAL DIGIT',`Your recovered digit is ${role.digit}. It is the SECOND digit.`]
    ] : [
      ['DES-88','DP1842 appears on tonight’s dinner list at the camp.'],
      ['OUTAGE LOG','The latest online arrival list cannot currently be confirmed.'],
      ['LOCAL DIGIT',`Your recovered digit is ${role.digit}. It is the THIRD digit.`]
    ];
    challengeBody.innerHTML = `<h3>Reconcile before you repair</h3><p class="instruction">The evidence establishes an information-flow problem, but not its technical cause. Speak to the consultants at the other two locations and enter the three-digit team code.</p><div class="record-grid">${cards.map(c=>`<div class="record-card"><span class="record-id">${c[0]}</span><p>${c[1]}</p></div>`).join('')}</div><div class="code-input"><label for="teamCodeInput">TEAM CODE</label><input id="teamCodeInput" inputmode="numeric" maxlength="3" autocomplete="off" aria-label="Three digit team recovery code"></div><p class="multi-note">No teammates available? A hint can reveal the missing digits, but it costs credibility.</p>`;
    updateHud();
  }

  function renderLock6() {
    setNarrative(`<p><strong>Fatima Al-Kuwari, Camp Operations Supervisor</strong>, is on the emergency channel. Choose the three neutral questions most likely to produce evidence that could change a recommendation.</p>`);
    const qs = [
      ['q0','What tasks become impossible or slower when the external connection fails?',true],
      ['q1','Wouldn’t a new tablet solve the camp’s problems?',false],
      ['q2','How do staff currently confirm arrivals during an outage?',true],
      ['q3','Do you like the existing system?',false],
      ['q4','How often does the connection fail, how long does it last, and when is it most disruptive?',true],
      ['q5','Would you agree that cloud computing is the obvious solution?',false]
    ];
    challengeBody.innerHTML = `<h3>Ask before you explain</h3><p class="instruction">Select exactly three questions. Avoid leading questions that contain the answer you hope to hear.</p><div class="question-grid">${qs.map(q=>`<div class="question-card"><input type="checkbox" id="${q[0]}" data-correct="${q[2]}"><label for="${q[0]}">${q[1]}</label></div>`).join('')}</div><div id="npcResponse" class="npc-response"><strong>FATIMA:</strong> “Ask me what you need to know. Just don’t decide my answer for me.”</div>`;
  }

  function renderLock7() {
    setNarrative(`<p>New evidence has arrived. The board wants an immediate recovery plan. First decide what should happen to earlier claims, then choose the most defensible plan.</p>`);
    const rows = [
      ['“The camp needs faster internet.”','investigate','No measured performance requirement or failure cause has yet established that conclusion.'],
      ['“Each site must continue operating during disruption.”','keep','This is a supplied operational constraint.'],
      ['“Move everything to the cloud and the problem disappears.”','change','The statement ignores connectivity dependency and continuity planning.']
    ];
    const options = `<option value="">Choose action…</option><option value="keep">KEEP</option><option value="change">CHANGE</option><option value="remove">REMOVE</option><option value="investigate">INVESTIGATE</option>`;
    const plans = [
      ['A','Upgrade the internet at every site immediately, then investigate whether anything else is needed.'],
      ['B','Replace the current devices with tablets and move all booking activity to a cloud service.'],
      ['C','Investigate the missing performance evidence, define shared guest-information requirements, plan controlled offline continuity for disruption, test with affected users and stage any chosen implementation.'],
      ['D','Keep all current systems unchanged because changing technology creates risk.']
    ];
    challengeBody.innerHTML = `<h3>Revise when the evidence changes</h3><p class="instruction">A strong consultant changes a claim when the evidence demands it.</p><div class="revision-grid">${rows.map((r,i)=>`<div class="revision-card"><h4>${r[0]}</h4><p>${r[2]}</p><select id="rev${i}" data-answer="${r[1]}">${options}</select></div>`).join('')}</div><h3 style="margin-top:24px">Final recovery decision</h3><p class="instruction">Select the plan that best reflects the evidence from the incident. A recommendation can include further investigation.</p><div class="final-plan-grid">${plans.map(p=>`<button type="button" class="final-plan" data-plan="${p[0]}"><strong>PLAN ${p[0]}</strong><p>${p[1]}</p></button>`).join('')}</div>`;
  }

  function renderComms() {
    const i = state.current;
    const messages = [...(commonComms[i] || []), ...((roleComms[state.role] || {})[i] || [])];
    $('commsFeed').innerHTML = messages.map(m=>`<div class="message ${m[2] || ''}"><span class="sender">${m[0]}</span><p>${m[1]}</p></div>`).join('');
  }

  function renderEvidence() {
    const role = roles[state.role];
    const general = [
      ['Company scale','201 permanent staff · 18 guest experiences · approximately 46,000 annual bookings.'],
      ['Shared challenge','Departments use separate systems and guest information must move between locations.'],
      ['Continuity','The board wants one coherent guest experience, but each site must still operate during disruption.']
    ];
    const items = [...role.evidence, ...general];
    $('evidencePanel').innerHTML = items.map(e=>`<div class="evidence-item"><strong>${e[0]}</strong><p>${e[1]}</p></div>`).join('');
  }

  function toggleEvidence() {
    const panel = $('evidencePanel');
    const btn = $('evidenceButton');
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    btn.setAttribute('aria-expanded', String(opening));
    btn.querySelector('span').textContent = opening ? '−' : '+';
  }

  function submitCurrent() {
    const checks = [checkLock1, checkLock2, checkLock3, checkLock4, checkLock5, checkLock6, checkLock7];
    const result = checks[state.current]();
    if (result.ok) completeCurrent(result.message);
    else failAttempt(result.message, result.assumptionPenalty || 5);
  }

  function checkLock1() {
    const choice = challengeBody.querySelector('.choice.selected');
    if (!choice) return {ok:false,message:'Select the workplace description that belongs to your location.',assumptionPenalty:0};
    return choice.dataset.choice === 'correct' ? {ok:true,message:'Location verified. You identified the actual work before considering technology.'} : {ok:false,message:'That work belongs to a different organisation or Dune & Pearl location. Re-check the client evidence.',assumptionPenalty:5};
  }

  function checkLock2() {
    const selects = [...challengeBody.querySelectorAll('select[data-answer]')];
    if (selects.some(s=>!s.value)) return {ok:false,message:'Classify all four statements before submitting.',assumptionPenalty:0};
    const wrong = selects.filter(s=>s.value !== s.dataset.answer).length;
    return wrong === 0 ? {ok:true,message:'Evidence decoded. You separated supplied facts, a constraint, a missing measure and an unsupported assumption.'} : {ok:false,message:`${wrong} classification${wrong>1?'s are':' is'} still unsafe. Remember: an attractive solution does not become evidence because it sounds plausible.`,assumptionPenalty:15};
  }

  function checkLock3() {
    const selects = [...challengeBody.querySelectorAll('.chain-column select')];
    if (selects.some(s=>!s.value)) return {ok:false,message:'Complete all four parts of the reasoning chain.',assumptionPenalty:0};
    const ok = selects.every(s=>s.value === 'correct');
    return ok ? {ok:true,message:'Reasoning chain accepted. The claim is supported by case evidence, explains a consequence and recognises a limitation.'} : {ok:false,message:'The chain contains a weak or unsupported step. More words do not create stronger analysis. Every part must follow from the evidence.',assumptionPenalty:8};
  }

  function checkLock4() {
    const selects = [...challengeBody.querySelectorAll('.requirement-builder select')];
    if (selects.some(s=>!s.value)) return {ok:false,message:'Build the complete requirement before submitting.',assumptionPenalty:0};
    const ok = selects.every(s=>s.value === s.dataset.correct);
    return ok ? {ok:true,message:'Requirement accepted. You defined the user, task, real constraint and measurable success condition without naming a product.'} : {ok:false,message:'That combination does not describe the requirement at your location. Check whether you selected a task or accidentally selected a solution.',assumptionPenalty:10};
  }

  function checkLock5() {
    const input = $('teamCodeInput');
    if (!input.value.trim()) return {ok:false,message:'You have your local digit. Ask the other two locations for theirs and enter the full three-digit code.',assumptionPenalty:0};
    return input.value.trim() === TEAM_CODE ? {ok:true,message:'Records compared across all three locations. The evidence establishes inconsistent information flow, not yet a proven technical cause.'} : {ok:false,message:'Recovery code rejected. Do not guess. Exchange the local digits with the other consultants and put them in location order: Doha · Marina · Desert.',assumptionPenalty:3};
  }

  function checkLock6() {
    const boxes = [...challengeBody.querySelectorAll('.question-card input')];
    const selected = boxes.filter(b=>b.checked);
    if (selected.length !== 3) return {ok:false,message:'Select exactly three questions.',assumptionPenalty:0};
    const ok = selected.every(b=>b.dataset.correct === 'true');
    if (ok) {
      $('npcResponse').innerHTML = '<strong>FATIMA:</strong> “During an outage we can still greet arrivals, but we cannot reliably see late booking changes. Failures are most disruptive during busy evening events. We need an agreed fallback list and a way to reconcile changes when the link returns.”';
      return {ok:true,message:'Interview evidence accepted. Neutral questions produced information that can genuinely change the recommendation.'};
    }
    return {ok:false,message:'At least one selected question is leading or too vague. A neutral question should not push the interviewee towards your preferred solution.',assumptionPenalty:12};
  }

  function checkLock7() {
    const revisions = [...challengeBody.querySelectorAll('.revision-card select')];
    if (revisions.some(s=>!s.value)) return {ok:false,message:'Decide what to do with all three earlier claims before choosing the final plan.',assumptionPenalty:0};
    const revisionsOk = revisions.every(s=>s.value === s.dataset.answer);
    const plan = challengeBody.querySelector('.final-plan.selected');
    if (!plan) return {ok:false,message:'Select a final recovery plan.',assumptionPenalty:0};
    const planOk = plan.dataset.plan === 'C';
    if (revisionsOk && planOk) return {ok:true,message:'Board authorisation accepted. You revised weak claims, protected supplied constraints and chose an evidence-led route that includes continuity, testing and further investigation.'};
    if (!revisionsOk) return {ok:false,message:'One of the earlier claims is being handled incorrectly. Keep established constraints, change overconfident claims and investigate conclusions that the evidence has not yet established.',assumptionPenalty:10};
    return {ok:false,message:'That plan jumps too quickly to a product, avoids necessary change, or treats an unproven cause as established. Choose the route that starts from requirements and evidence.',assumptionPenalty:15};
  }

  function completeCurrent(message) {
    beep('unlock');
    if (!state.completed.includes(state.current)) state.completed.push(state.current);
    state.credibility = Math.min(100, state.credibility + 2);
    state.lastTick = Date.now();
    save();
    showFeedback('success', `<strong>LOCK ${String(state.current + 1).padStart(2,'0')} CLEARED.</strong> ${message}`);
    submitButton.classList.add('hidden');
    hintButton.disabled = true;
    if (state.current === 6) {
      nextButton.textContent = 'AUTHORISE RECOVERY →';
    } else {
      nextButton.innerHTML = 'UNLOCK NEXT PHASE <span>→</span>';
    }
    nextButton.classList.remove('hidden');
    renderLockRail();
    updateHud();
  }

  function failAttempt(message, assumptionPenalty = 5) {
    beep('bad');
    const i = state.current;
    state.mistakes[i] = (state.mistakes[i] || 0) + 1;
    state.credibility = Math.max(0, state.credibility - 7);
    state.assumption = Math.min(100, state.assumption + assumptionPenalty);
    state.lastTick = Date.now();
    save();
    showFeedback('error', `<strong>CONSULTANT ERROR.</strong> ${message} <span style="color:var(--muted)">Credibility −7.</span>`);
    updateHud();
  }

  function showFeedback(type, html) {
    feedback.className = `feedback ${type}`;
    feedback.innerHTML = html;
    feedback.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function nextChallenge() {
    if (state.current >= 6) {
      finishMission();
      return;
    }
    state.current += 1;
    state.lastTick = Date.now();
    save();
    renderChallenge();
    $('challengeConsole').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function useHint() {
    const i = state.current;
    if (state.hintUsed[i]) return;
    state.hintUsed[i] = true;
    state.credibility = Math.max(0, state.credibility - 5);
    const hints = [
      'Ignore technology for a moment. What does this site actually do?',
      'Facts are supplied. Constraints limit the solution. Missing evidence is something the brief says you do not yet have. “This will solve it” is usually a claim, not evidence.',
      'The strongest chain uses the Dune & Pearl case, not a generic benefit of technology. The limitation should be credible even if the proposal works.',
      'A requirement says what must be achieved. Look for the user and task at your own location, then pair them with a real constraint and something you could test.',
      `Solo fallback: the full team code is ${TEAM_CODE}. In team play, each location should supply one digit.`,
      'Ask what happens, how staff cope, how often it happens and what evidence exists. Avoid questions beginning with “Wouldn’t…” or “Would you agree…”.',
      'A supplied continuity requirement should stay. “Faster internet will solve it” needs investigation. “Cloud solves everything” needs changing. The final plan should define, investigate, test and stage rather than buy first.'
    ];
    save();
    beep('ok');
    showFeedback('warning', `<strong>HINT.</strong> ${hints[i]} <span style="color:var(--muted)">Credibility −5.</span>`);
    hintButton.disabled = true;
    hintButton.textContent = 'HINT ALREADY USED';
    updateHud();
  }

  function finishMission() {
    state.finished = true;
    state.running = false;
    state.lastTick = Date.now();
    save();
    clearInterval(timerHandle);
    missionScreen.classList.add('hidden');
    completeScreen.classList.remove('hidden');
    $('finalCredibility').textContent = state.credibility;
    $('finalAssumption').textContent = `${state.assumption}%`;
    const mins = Math.floor(state.remaining / 60), secs = state.remaining % 60;
    $('finalTime').textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    const role = roles[state.role];
    const who = state.playerName ? `${escapeHtml(state.playerName)}, ` : '';
    $('completeMessage').innerHTML = `${who}you restored <strong>${role.short}</strong> by understanding the organisation before choosing the technology.`;
    renderBadges();
    clearSaved();
    beep('unlock');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderBadges() {
    const badges = ['🏅 Evidence Hunter'];
    if (state.assumption <= 25) badges.push('🏅 Assumption Assassin');
    if ((state.mistakes[5] || 0) === 0) badges.push('🏅 Neutral Interrogator');
    if ((state.mistakes[6] || 0) === 0) badges.push('🏅 Didn’t Just Buy New Wi-Fi');
    if (state.remaining > 0) badges.push('🏅 Deadline Defender');
    if (state.credibility >= 80) badges.push('🏅 Boardroom Survivor');
    $('badgeList').innerHTML = badges.map(b=>`<span class="badge">${b}</span>`).join('');
  }

  function resetMission() {
    const active = !introScreen.classList.contains('hidden') ? false : true;
    if (active && !confirm('Reset System Zero and erase saved progress on this device?')) return;
    clearInterval(timerHandle);
    clearSaved();
    state = freshState();
    selectedRole = null;
    document.querySelectorAll('.role-card').forEach(b=>b.classList.remove('selected'));
    $('playerName').value = '';
    startButton.disabled = true;
    resumeButton.classList.add('hidden');
    missionScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    introScreen.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function toggleSound() {
    audioEnabled = !audioEnabled;
    const btn = $('soundToggle');
    btn.textContent = `Sound: ${audioEnabled ? 'on' : 'off'}`;
    btn.setAttribute('aria-pressed', String(audioEnabled));
    if (audioEnabled) beep('ok');
  }

  initialise();
})();
