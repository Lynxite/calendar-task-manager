const calendarContainer = document.getElementById('calendar');
const monthYearDisplay = document.getElementById('month-year');
const taskDescInput = document.getElementById('task-desc');
const addTaskButton = document.getElementById('add-task');
const tasksContainer = document.getElementById('tasks-container');

const today = new Date();
let selectedDate = null;
let tasks = {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let isEditing;

function createCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push('');
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i);
  }
  const nextMonthDays = 35 - days.length;
  for (let i = 0; nextMonthDays && i < nextMonthDays; i++) {
    days.push('');
  }

  calendarContainer.innerHTML = '';
  days.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.textContent = day;

    if (day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      dayDiv.classList.add('today'); // Add a special class for today
    }

    if (day) {
      dayDiv.addEventListener('click', () => {
        selectDate(year, month, day);
      });
    }
    calendarContainer.appendChild(dayDiv);
  });

  monthYearDisplay.textContent = moment(new Date(year, month)).format('MMMM YYYY');
  addTaskActions();
}

function selectDate(year, month, day) {
  selectedDate = new Date(year, month, day);
  document.querySelectorAll('.day').forEach(dayDiv => {
    dayDiv.classList.remove('selected');
  });
  const selectedDayDiv = Array.from(document.querySelectorAll('.day'))
    .find(dayDiv => dayDiv.textContent == day);
  if (selectedDayDiv) selectedDayDiv.classList.add('selected');
  updateTasksList();
  addTaskActions();
}

function updateTasksList() {
  if (!selectedDate) return;
  const dateKey = moment(selectedDate).format('YYYY-MM-DD');
  const tasksForDate = tasks[dateKey] || [];
  tasksContainer.innerHTML = tasksForDate.map(task => `
    <div class="task">
      <div class="actions">
        <button class="delete"><img src="delete.png"></button>
        <button class="edit"><img src="edit.png"></button>
      </div>
      <span class="task-desc">${task}</span>
      <div class="white-line"></div> 
    </div>`).join('');
  addTaskActions();
}

function addTask() {
  if (!selectedDate) return;
  const dateKey = moment(selectedDate).format('YYYY-MM-DD');
  const taskDesc = taskDescInput.value.trim();
  if (!taskDesc) return;

  if (!tasks[dateKey]) {
    tasks[dateKey] = [];
  }
  tasks[dateKey].push(taskDesc);
  taskDescInput.value = '';
  updateTasksList();
  saveTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}

function changeMonth(diff) {
  currentMonth += diff;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  createCalendar(currentYear, currentMonth);
}

function addTaskActions() {
    //Edit Btn
  const editBtns = document.querySelectorAll('.edit');
  editBtns.forEach((editBtn) => editBtn.onclick = e => {
    const currentTask = e.target.closest('.task');
    const taskSpan = currentTask.querySelector('.task-desc');
    const editBtnImg = editBtn.querySelector('img');
    const dateKey = moment(selectedDate).format('YYYY-MM-DD');

    if (editBtnImg.getAttribute('src') === 'edit.png') {
      taskSpan.setAttribute('contenteditable', 'true');
      taskSpan.focus();
      editBtnImg.setAttribute('src', 'done.png');
    } else if (editBtnImg.getAttribute('src') === 'done.png') {
      const taskDesc = taskSpan.innerText || taskSpan.textContent;
      taskSpan.setAttribute('contenteditable', 'false');
      editBtnImg.setAttribute('src', 'edit.png');
      // Find and update the task in the tasks array
      const taskIndex = Array.from(tasksContainer.querySelectorAll('.task-desc')).indexOf(taskSpan);
      if (taskIndex !== -1) {
        tasks[dateKey][taskIndex] = taskDesc;
      }
      saveTasks(); // Save the updated tasks
    }
  });

  //Remove Btn
  const removeBtns = document.querySelectorAll('.delete');
  removeBtns.forEach((removeBtn)=>removeBtn.onclick = e=>{
    const currentTask = e.target.closest('.task');
    const taskSpan = currentTask.querySelector('.task-desc');
    const taskDesc = taskSpan.textContent || taskSpan.innerText;
    const dateKey = moment(selectedDate).format('YYYY-MM-DD');

    const confirmDialog = document.querySelector('.confirm');
    const taskInfo = document.querySelector('.task-name');
    taskInfo.textContent = `"${taskDesc}"`;
    confirmDialog.showModal();

    const confirmBtn = document.querySelector('.confirm-button');
    const cancelBtn = document.querySelector('.cancel-button');
    cancelBtn.addEventListener('click', ()=>{
      confirmDialog.close();
      taskInfo.textContent = ''
    });
    confirmBtn.addEventListener('click', ()=>{
      const taskIndex = tasks[dateKey].indexOf(taskDesc);
      if (taskIndex !== -1) {
        tasks[dateKey].splice(taskIndex, 1); 
      if (tasks[dateKey].length === 0) {
        delete tasks[dateKey]; 
      }
      saveTasks();
    }

      currentTask.remove();     
      confirmDialog.close();
      taskInfo.textContent = ''
    });
    
    /*document.addEventListener('click', (event)=>{
      const rect = confirmDialog.getBoundingClientRect();
      const isInDialog =rect.top <= event.clientY && event.clientY <= rect.bottom && rect.left <= event.clientX && event.clientX <= rect.right;

      if(!isInDialog){
        isInDialog.close();
      }
    })*/
  })


}

function changeYear(diff) {
  currentYear += diff;
  createCalendar(currentYear, currentMonth);
}

document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
document.getElementById('prev-year').addEventListener('click', () => changeYear(-1));
document.getElementById('next-year').addEventListener('click', () => changeYear(1));
addTaskButton.addEventListener('click', addTask);

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  createCalendar(currentYear, currentMonth);
});

