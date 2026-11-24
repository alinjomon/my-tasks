const STORAGE_KEY = "mytasks-items-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const taskCountLabel = document.getElementById("task-count-label");
const remainingLabel = document.getElementById("remaining-label");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " done" : ""}`;

    const check = document.createElement("button");
    check.className = "check-button";
    check.type = "button";
    check.setAttribute("aria-label", task.completed ? "Mark as pending" : "Mark as completed");
    check.textContent = task.completed ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const edit = document.createElement("button");
    edit.className = "icon-button";
    edit.type = "button";
    edit.textContent = "✎";
    edit.title = "Edit task";
    edit.setAttribute("aria-label", `Edit ${task.text}`);
    edit.addEventListener("click", () => editTask(task.id));

    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Delete task";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => deleteTask(task.id));

    actions.append(edit, remove);
    item.append(check, text, actions);
    list.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  totalCount.textContent = tasks.length;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
  taskCountLabel.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  remainingLabel.textContent = pending ? `${pending} task${pending === 1 ? "" : "s"} left to do` : "You're all caught up.";
  emptyState.hidden = visibleTasks.length !== 0;
  clearCompletedButton.hidden = completed === 0;
}

function addTask(text) {
  tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, completed: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const updated = prompt("Edit your task:", task.text);
  if (updated === null) return;
  const trimmed = updated.trim();
  if (!trimmed) return;
  tasks = tasks.map(item => item.id === id ? { ...item, text: trimmed } : item);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

const today = new Date();
document.getElementById("today-label").textContent = today.toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric"
}).toUpperCase();

renderTasks();
