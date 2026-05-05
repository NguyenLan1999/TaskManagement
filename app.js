document.addEventListener('DOMContentLoaded', () => {
    // State management
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let selectedDate = new Date().toISOString().split('T')[0];

    // Selectors
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const taskForm = document.getElementById('task-form');
    const dateFilter = document.getElementById('date-filter');
    const currentDateTitle = document.getElementById('current-date-title');
    const taskSummaryText = document.getElementById('task-summary-text');
    const statPercent = document.getElementById('stat-percent');
    const statDone = document.getElementById('stat-done');
    const statPending = document.getElementById('stat-pending');
    const progressCircle = document.getElementById('progress-circle');
    const taskModal = document.getElementById('task-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeBtns = document.querySelectorAll('.close-btn, .close-btn-action');

    // Init
    dateFilter.value = selectedDate;
    
    // Load initial data from Backend
    async function initData() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                const data = await response.json();
                tasks = data;
                updateUI();
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu từ server:', err);
            // Fallback về localStorage nếu server lỗi
            const localData = localStorage.getItem('tasks');
            if (localData) {
                tasks = JSON.parse(localData);
                updateUI();
            }
        }
    }
    
    initData();

    // Event Listeners
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tasks_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
    dateFilter.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        updateUI();
    });

    openModalBtn.addEventListener('click', () => {
        document.getElementById('task-date').value = selectedDate;
        taskModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            taskModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) taskModal.style.display = 'none';
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            title: document.getElementById('task-title').value,
            desc: document.getElementById('task-desc').value,
            date: document.getElementById('task-date').value,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        updateUI();
        taskForm.reset();
        taskModal.style.display = 'none';
    });

    // Functions
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        updateUI();
    }

    function toggleComplete(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveTasks();
        updateUI();
    }

    function updateUI() {
        // Filter tasks by date
        const filteredTasks = tasks.filter(t => t.date === selectedDate);
        
        // Update Title & Summary
        const dateObj = new Date(selectedDate);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        currentDateTitle.innerText = selectedDate === new Date().toISOString().split('T')[0] 
            ? `Hôm nay, ${dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}`
            : dateObj.toLocaleDateString('vi-VN', options);
        
        taskSummaryText.innerText = `Bạn có ${filteredTasks.length} công việc cho ngày này.`;

        // Render List
        taskList.innerHTML = '';
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <div class="checkbox-wrapper">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                        <div class="checkbox-custom"></div>
                    </div>
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.desc || 'Không có mô tả'}</div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon" onclick="removeTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }

        // Update Stats
        const done = filteredTasks.filter(t => t.completed).length;
        const pending = filteredTasks.length - done;
        const percent = filteredTasks.length > 0 ? Math.round((done / filteredTasks.length) * 100) : 0;

        statDone.innerText = done;
        statPending.innerText = pending;
        statPercent.innerText = `${percent}%`;
        progressCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
    }

    // Global access for inline events
    window.toggleTask = toggleComplete;
    window.removeTask = deleteTask;
});
