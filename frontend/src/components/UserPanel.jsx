import { Eye, Power } from 'lucide-react';
import React from 'react';

const UserPanel = ({ users, onToggleUser, onViewUser, isAdmin, currentUserId }) => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Team</p>
          <h2>Users and workload</h2>
        </div>
        <span className="count-badge">{users.length}</span>
      </div>

      <div className="user-list">
        {users.map((user) => (
          <article className="user-row" key={user.id}>
            <div>
              <div className="name-line">
                <strong>{user.name}</strong>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <span className="muted-text">{user.email}</span>
            </div>
            <div className="workload-pill">
              <b>{user.workload}</b>
              <span>{user.activeTaskCount} active</span>
            </div>
            {isAdmin && (
              <button
                className="icon-button"
                onClick={() => onViewUser(user)}
                title="View profile"
                type="button"
              >
                <Eye size={17} />
              </button>
            )}
            <button
              className={`icon-button ${user.isActive ? 'active' : 'muted'}`}
              onClick={() => onToggleUser(user)}
              disabled={!isAdmin || user.id === currentUserId}
              title={
                user.id === currentUserId
                  ? 'You cannot deactivate yourself'
                  : user.isActive
                    ? 'Set inactive'
                    : 'Set active'
              }
              type="button"
            >
              <Power size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default UserPanel;
