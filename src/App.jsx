import { useState, useEffect } from "react";
import "./App.css";

// ---------- one task row (child component) ----------
function TaskItem({ task, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  function save() {
    const text = draft.trim();
    if (text === "") return; // don't allow an empty task
    onSave(task.id, text);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(task.text);
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  }

  if (isEditing) {
    return (
      <li className="task editing">
        <input
          className="edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Edit task"
          autoFocus
        />
        <div className="task-actions">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn" onClick={cancel}>Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className={task.done ? "task done" : "task"}>
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span>{task.text}</span>
      </label>
      <div className="task-actions">
        <button className="btn" onClick={() => setIsEditing(true)}>Edit</button>
        <button className="btn danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </li>
  );
}

// ---------- main app ----------
function App() {
  // load saved tasks the first time the app starts
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  // save tasks every time they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    const clean = text.trim();
    if (clean === "") return;
    setTasks([...tasks, { id: Date.now(), text: clean, done: false }]);
    setText("");
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function saveTask(id, newText) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTasks(tasks.filter((t) => !t.done));
  }

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const remaining = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - remaining;

  const emptyMessages = {
    all: "Your workspace is clear. Add a task to plan your day.",
    active: "Nothing left to do. Nice work.",
    done: "No finished tasks yet.",
  };

  return (
    <main className="app">
      <h1>TO DO LIST</h1>
      <p className="subtitle">
        {remaining === 1 ? "1 task left" : remaining + " tasks left"}
      </p>

      <form className="add-form" onSubmit={addTask}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New task"
        />
        <button className="btn primary" type="submit">Add task</button>
      </form>

      <div className="filters">
        {["all", "active", "done"].map((name) => (
          <button
            key={name}
            className={filter === name ? "btn selected" : "btn"}
            onClick={() => setFilter(name)}
          >
            {name === "all" ? "All" : name === "active" ? "Active" : "Done"}
          </button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <p className="empty">{emptyMessages[filter]}</p>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSave={saveTask}
            />
          ))}
        </ul>
      )}

      {doneCount > 0 && (
        <button className="btn clear" onClick={clearDone}>
          Clear {doneCount} finished {doneCount === 1 ? "task" : "tasks"}
        </button>
      )}
    </main>
  );
}

export default App;