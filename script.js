const taskInput = document.getElementById('taskInput');
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const completedSection = document.getElementById('completedSection');
    const taskColumns = document.getElementById('taskColumns');
    const tasksSection = document.getElementById('tasksSection');
    const toggleTimestamp = document.getElementById('toggleTimestamp');
    const taskSummaryBar = document.getElementById('taskSummaryBar');
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');
    const progressRing = document.getElementById('progressRing');
    const progressLabel = document.getElementById('progressLabel');
    const confettiBurst = document.getElementById('confettiBurst');
    const taskBoard = document.getElementById('taskBoard');
    const dashboardGrid = document.getElementById('dashboardGrid');
    const leftPanel = document.getElementById('leftPanel');
    const toggleTaskbar = document.getElementById('toggleTaskbar');
    const clockCircle = document.getElementById('clockCircle');
    const optionsPanel = document.getElementById('optionsPanel');
    const stopwatchText = document.getElementById('stopwatchText');
    const welcomePanel = document.getElementById('welcomePanel');
    const welcomeText = document.getElementById('welcomeText');
    const inputPanel = document.getElementById('inputPanel');

    let tasks = JSON.parse(localStorage.getItem('galaxyTasks')) || [];
    let currentFilter = 'all';
    let stopwatchSeconds = 0;
    let stopwatchRunning = true;

    function formatDateTime(ms) {
      const d = new Date(ms);
      return d.toLocaleDateString() + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function formatDuration(ms) {
      const totalSec = Math.max(1, Math.floor(ms / 1000));
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      return `${mins}m ${String(secs).padStart(2,'0')}s`;
    }

    function saveTasks() {
      localStorage.setItem('galaxyTasks', JSON.stringify(tasks));
      showWelcomeSequence();
      renderTasks();
    }

    function initDarkMode() {
      const darkBtn = document.getElementById('darkIconBtn');
      if (localStorage.getItem('galaxyDarkMode') === '1') {
        document.body.classList.add('dark');
        if (darkBtn) darkBtn.textContent = '☀';
      }
    }

    function addTask() {
      const text = taskInput.value.trim();
      if (!text) return;
      const now = Date.now();
      tasks.push({ text, done: false, createdAt: formatDateTime(now), createdMs: now, completedAt: null, completedMs: null });
      taskInput.value = '';
      saveTasks();
    }

    function animateProgressRing() {
      progressRing.classList.remove('ring-animate');
      void progressRing.offsetWidth;
      progressRing.classList.add('ring-animate');
    }

    function toggleTask(index) {
      tasks[index].done = !tasks[index].done;
      tasks[index].completedAt = tasks[index].done ? formatDateTime(Date.now()) : null;
      tasks[index].completedMs = tasks[index].done ? Date.now() : null;
      animateProgressRing();
      saveTasks();
    }

    function clearAllTasks() {
      tasks = [];
      saveTasks();
    }

    function deleteTask(index) {
      tasks.splice(index, 1);
      saveTasks();
    }

    function animateDarkIcon() {
      const btn = document.getElementById('darkIconBtn');
      if (!btn) return;
      btn.animate([
        { transform: 'scale(1) rotate(0deg)', boxShadow: '0 0 0 rgba(123,97,255,0)' },
        { transform: 'scale(0.88) rotate(-18deg)', boxShadow: '0 0 22px rgba(123,97,255,0.28)' },
        { transform: 'scale(1.12) rotate(18deg)', boxShadow: '0 0 28px rgba(0,242,254,0.25)' },
        { transform: 'scale(1) rotate(0deg)', boxShadow: '0 0 18px rgba(123,97,255,0.18)' }
      ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
    }

    function toggleDarkMode() {
      document.body.classList.toggle('dark');
      localStorage.setItem('galaxyDarkMode', document.body.classList.contains('dark') ? '1' : '0');
      const btn = document.getElementById('darkIconBtn');
      if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀' : '🌙';
    }

    function sortTasksAZ() {
      tasks.sort((a, b) => a.text.localeCompare(b.text));
      saveTasks();
    }

    function celebrateAllDone() {
      confettiBurst.innerHTML = '';
      for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = ['#ff4ecd','#00f2fe','#ffd166','#7b61ff','#ff6b6b'][Math.floor(Math.random()*5)];
        piece.style.animationDelay = (Math.random() * 0.8) + 's';
        piece.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
        confettiBurst.appendChild(piece);
      }
      setTimeout(() => confettiBurst.innerHTML = '', 3500);
    }

    function toggleStopwatch() { stopwatchRunning = !stopwatchRunning; }
    function resetStopwatch() { stopwatchSeconds = 0; stopwatchText.textContent = '00:00'; stopwatchRunning = true; }

    function updateClockAndStopwatch() {
      if (stopwatchRunning && tasks.length) stopwatchSeconds++;
      const mins = String(Math.floor(stopwatchSeconds / 60)).padStart(2,'0');
      const rem = String(stopwatchSeconds % 60).padStart(2,'0');
      stopwatchText.textContent = `${mins}:${rem}`;
    }
    setInterval(updateClockAndStopwatch, 1000);

    function showWelcomeSequence() {
      const shouldShow = tasks.length === 0;
      if (!shouldShow) {
        welcomePanel.style.display = 'none';
        inputPanel.style.display = 'block';
        return;
      }
      inputPanel.style.display = 'none';
      welcomePanel.style.display = 'flex';
      const msg = 'BK welcome you in GALAXY Program';
      let i = 0;
      welcomeText.textContent = '';
      const timer = setInterval(() => {
        if(i < msg.length) {
            welcomeText.textContent += msg[i];
            i++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            welcomePanel.style.display = 'none';
            inputPanel.style.display = 'block';
          }, 900);
        }
      }, 65);
    }

    function renderTasks() {
      pendingList.innerHTML = '';
      completedList.innerHTML = '';
      let completed = 0;

      tasks.forEach((task, index) => {
        if (task.done) completed++;

        const li = document.createElement('li');
        li.className = task.done ? 'done' : '';
        li.innerHTML = `
          <div style="flex:1; cursor:pointer; min-width:0; overflow-wrap:break-word; padding-right:10px;" onclick="toggleTask(${index})">
              <span>${index + 1}. ${task.text}</span>
              ${toggleTimestamp.checked ? `<div style="font-size:0.75rem; opacity:0.75; margin-top:4px;">${task.done ? 'Completed: ' + task.completedAt + ' • ⏱ Took: ' + formatDuration((task.completedMs || Date.now()) - (task.createdMs || Date.now())) : 'Added: ' + task.createdAt}</div>` : ''}
            </div>
          <div class="task-actions">
            ${!task.done ? `<button class="small-btn" onclick="toggleTask(${index})">✔</button>` : ''}
            <button class="small-btn" onclick="deleteTask(${index})">✕</button>
          </div>
        `;
        (task.done ? completedList : pendingList).appendChild(li);
      });
      
      completedSection.style.display = completed > 0 ? 'block' : 'none';
      const pending = tasks.length - completed;
      
      // Inline JS styles are now overridden by CSS !important on mobile devices
      taskColumns.style.gridTemplateColumns = (completed > 0 && pending > 0) ? '1fr 1fr' : '1fr';
      tasksSection.style.display = pending > 0 ? 'block' : 'none';
      
      pendingCount.textContent = pending;
      const pendingCard = document.getElementById('pendingCard');
      if (pendingCard) pendingCard.style.display = pending === 0 ? 'none' : 'block';
      completedCount.textContent = completed;
      
      taskSummaryBar.style.display = tasks.length > 0 && toggleTaskbar.checked ? 'block' : 'none';
      optionsPanel.style.display = tasks.length > 0 ? 'block' : 'none';
      taskBoard.style.display = tasks.length > 0 ? 'block' : 'none';
      
      dashboardGrid.style.gridTemplateColumns = tasks.length > 0 ? 'minmax(420px, 520px) 1fr' : '1fr';
      leftPanel.style.margin = tasks.length > 0 ? '0' : '0 auto';
      
      const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
      progressLabel.textContent = `${progress}%`;
      progressRing.style.background = `conic-gradient(from -90deg, rgba(255,255,255,0.18) 0deg, rgba(0,242,254,0.45) ${Math.max(0, progress * 3.6 - 18)}deg, rgba(255,78,205,0.42) ${progress * 3.6}deg, rgba(255,255,255,0.06) ${progress * 3.6}deg 360deg)`;
      progressRing.style.transition = 'background 0.6s ease, transform 0.3s ease';
      
      if (stopwatchText) updateClockAndStopwatch();
      if (tasks.length > 0 && completed === tasks.length) celebrateAllDone();
    }

    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addTask();
    });

    initDarkMode();
    showWelcomeSequence();
    renderTasks();