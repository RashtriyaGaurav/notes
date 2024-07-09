document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task');
    const taskList = document.getElementById('task-list');
    const addTaskButton = document.getElementById('add-task-button');

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task;
            const button = document.createElement('button');
            button.textContent = 'Delete';
            button.classList.add('delete-button');
            button.addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });
            li.appendChild(button);
            taskList.appendChild(li);
        });
    };

    const addTask = () => {
        if (newTaskInput.value.trim() !== '') {
            tasks.push(newTaskInput.value.trim());
            newTaskInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    addTaskButton.addEventListener('click', addTask);

    // Initial render
    renderTasks();
});
