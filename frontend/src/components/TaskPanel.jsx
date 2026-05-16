import React from 'react';
const TaskPanel = ({ tasks, onStatusChange, isAdmin }) => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Assigned work</h2>
        </div>
        <span className="count-badge">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <article className="task-card" key={task._id}>
            <div className="task-title-row">
              <h3>{task.title}</h3>
              <span className={`priority ${task.priority}`}>{task.priority}</span>
            </div>
            {task.description && <p>{task.description}</p>}
            <div className="task-meta">
              <span>Assigned to {task.assignedTo?.name || 'Unknown'}</span>
              <select
                value={task.status}
                onChange={(event) => onStatusChange(task._id, event.target.value)}
                disabled={!isAdmin}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TaskPanel;
