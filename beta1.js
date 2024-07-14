document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const timetableForm = document.getElementById('timetableForm');
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    const timetableNameInput = document.getElementById('timetableNameInput');
    const editButton = document.getElementById('editButton');
    const addTimetableButton = document.getElementById('addTimetableButton');
    const deleteTimetableButton = document.getElementById('deleteTimetableButton');
    const timetableSelector = document.getElementById('timetableSelector');

    let currentTimetable = null;

    loadTimetables();
    loadTasks();

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        const task = {
            text: taskText,
            startTime: startTime,
            endTime: endTime,
            completed: false
        };

        addTaskToList(task);
        saveTask(task);
        taskInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
    });

    timetableForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const timetableName = timetableNameInput.value;

        const timetable = {
            name: timetableName,
            tasks: []
        };

        saveTimetable(timetable);
        loadTimetables();
        timetableNameInput.value = '';
        timetableForm.classList.add('hidden');
    });

    editButton.addEventListener('click', function() {
        taskForm.classList.toggle('hidden');
        deleteTimetableButton.classList.toggle('hidden');
        const listItems = taskList.querySelectorAll('li');
        listItems.forEach(li => li.classList.toggle('edit-mode'));
        if (taskForm.classList.contains('hidden')) {
            editButton.textContent = 'Edit';
        } else {
            editButton.textContent = 'Home';
        }
    });

    addTimetableButton.addEventListener('click', function() {
        timetableForm.classList.toggle('hidden');
    });

    deleteTimetableButton.addEventListener('click', function() {
        if (currentTimetable && confirm('Are you sure you want to delete this timetable?')) {
            deleteTimetable(currentTimetable);
            loadTimetables();
            taskList.innerHTML = '';
        }
    });

    timetableSelector.addEventListener('change', function() {
        currentTimetable = timetableSelector.value;
        loadTasks();
    });

    function addTaskToList(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.startTime} - ${task.endTime}: ${task.text}</span>
            <button class="delete-button">Delete</button>
        `;

        li.querySelector('input[type="checkbox"]').addEventListener('change', function() {
            task.completed = !task.completed;
            li.classList.toggle('completed');
            updateTasks();
        });

        li.querySelector('.delete-button').addEventListener('click', function() {
            taskList.removeChild(li);
            updateTasks();
        });

        if (task.completed) {
            li.classList.add('completed');
        }

        taskList.appendChild(li);
    }

    function saveTask(task) {
        if (currentTimetable) {
            const timetables = getTimetables();
            const timetable = timetables.find(t => t.name === currentTimetable);
            timetable.tasks.push(task);
            localStorage.setItem('timetables', JSON.stringify(timetables));
        }
    }

    function getTasks() {
        if (currentTimetable) {
            const timetables = getTimetables();
            const timetable = timetables.find(t => t.name === currentTimetable);
            return timetable ? timetable.tasks : [];
        }
        return [];
    }

    function updateTasks() {
        if (currentTimetable) {
            const tasks = [];
            taskList.querySelectorAll('li').forEach(li => {
                const checkbox = li.querySelector('input[type="checkbox"]');
                const span = li.querySelector('span');
                const [time, ...text] = span.textContent.split(': ');
                const [startTime, endTime] = time.split(' - ');

                tasks.push({
                    text: text.join(': '),
                    startTime: startTime,
                    endTime: endTime,
                    completed: checkbox.checked
                });
            });

            const timetables = getTimetables();
            const timetable = timetables.find(t => t.name === currentTimetable);
            timetable.tasks = tasks;
            localStorage.setItem('timetables', JSON.stringify(timetables));
        }
    }

    function loadTasks() {
        taskList.innerHTML = '';
        const tasks = getTasks();
        tasks.forEach(task => addTaskToList(task));
    }

    function saveTimetable(timetable) {
        const timetables = getTimetables();
        timetables.push(timetable);
        localStorage.setItem('timetables', JSON.stringify(timetables));
    }

    function deleteTimetable(timetableName) {
        const timetables = getTimetables();
        const updatedTimetables = timetables.filter(t => t.name !== timetableName);
        localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
        currentTimetable = null;
    }

    function getTimetables() {
        const timetables = localStorage.getItem('timetables');
        return timetables ? JSON.parse(timetables) : [];
    }

    function loadTimetables() {
        timetableSelector.innerHTML = '<option value="" disabled selected>Select Timetable</option>';
        const timetables = getTimetables();
        timetables.forEach(timetable => {
            const option = document.createElement('option');
            option.value = timetable.name;
            option.textContent = timetable.name;
            timetableSelector.appendChild(option);
        });
    }
});
