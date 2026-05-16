import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import {
  ClipboardPlus,
  LogOut,
  Moon,
  RefreshCw,
  Sparkles,
  Sun,
  UserPlus,
  X
} from 'lucide-react';
import api from './api/client';
import StatCard from './components/StatCard';
import TaskPanel from './components/TaskPanel';
import UserPanel from './components/UserPanel';

const initialAuthForm = {
  name: '',
  email: '',
  password: ''
};

const initialTaskForm = {
  title: '',
  description: '',
  priority: 'medium'
};

const initialUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'member'
};

const getErrorMessage = (error) => {
  return error.response?.data?.message || 'Something went wrong';
};

const FlatDashboardIllustration = () => (
  <motion.div
    className="flat-illustration"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.2 }}
    aria-hidden="true"
  >
    <div className="illustration-window">
      <span />
      <span />
      <span />
    </div>
    <div className="illustration-board">
      <motion.div
        className="illustration-card card-one"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="illustration-card card-two"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="illustration-card card-three"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
    <div className="illustration-person">
      <span />
    </div>
  </motion.div>
);

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const isAdmin = currentUser?.role === 'admin';
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive).length;
    const activeTasks = tasks.filter((task) => task.status !== 'completed').length;
    const totalWorkload = users.reduce((sum, user) => sum + user.workload, 0);

    return { activeUsers, activeTasks, totalWorkload };
  }, [users, tasks]);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setCurrentUser(data.user);
  };

  const loadData = async () => {
    if (!localStorage.getItem('token')) return;

    const [usersResponse, tasksResponse] = await Promise.all([
      api.get('/users'),
      api.get('/tasks')
    ]);

    setUsers(usersResponse.data);
    setTasks(tasksResponse.data);
  };

  const showToast = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2400);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage('');

    try {
      await loadData();
      showToast('Dashboard refreshed successfully');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(getErrorMessage(error)));
  }, [token]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : authForm;
      const response = await api.post(url, payload);

      saveSession(response.data);
      setAuthForm(initialAuthForm);
      setMessage(authMode === 'login' ? 'Logged in successfully' : 'Account created');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
    setTasks([]);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/users', userForm);
      setUserForm(initialUserForm);
      setShowUserModal(false);
      await loadData();
      setMessage('User added');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleToggleUser = async (user) => {
    setMessage('');

    try {
      await api.patch(`/users/${user.id}/availability`, { isActive: !user.isActive });
      await loadData();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await api.post('/tasks', taskForm);
      setTaskForm(initialTaskForm);
      setShowTaskModal(false);
      await loadData();
      setMessage(`Task assigned to ${response.data.assignedTo.name}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setMessage('');

    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await loadData();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <main className="auth-layout">
        <button
          className="theme-toggle auth-theme-toggle"
          onClick={toggleTheme}
          type="button"
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
        <motion.section
          className="auth-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">Smart Task Assignment</p>
          <h1 >
            Assign work with{' '}
            <span className="accent-text">
              <Typewriter
                options={{
                  strings: ['calm precision.', 'fair workload.', 'smart balance.'],
                  autoStart: true,
                  loop: true,
                  delay: 48,
                  deleteSpeed: 32
                }}
              />
            </span>
          </h1>
          <p>
            The API scores active tasks by priority, checks availability, and chooses
            the lowest workload every time a new task is created.
          </p>
          <div className="hero-chips" aria-label="Assignment rules">
            <span>Priority scoring</span>
            <span>Availability aware</span>
            <span>Fair workload</span>
          </div>
          <FlatDashboardIllustration />
        </motion.section>

        <motion.section
          className="auth-panel"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="panel-glow" />
          <div className="tabs">
            <button
              className={authMode === 'login' ? 'selected' : ''}
              onClick={() => setAuthMode('login')}
              type="button"
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'selected' : ''}
              onClick={() => setAuthMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {authMode === 'register' && (
              <input
                value={authForm.name}
                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                placeholder="Name"
              />
            )}
            <input
              value={authForm.email}
              onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
              placeholder="Email"
              type="email"
            />
            <input
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              placeholder="Password"
              type="password"
            />
            <button className="primary wide" disabled={loading} type="submit">
              {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </motion.section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <nav className="navbar">
        <div className="brand-block">
          <span className="brand-mark">STA</span>
          <div>
            <strong>Smart Tasks</strong>
            <small>{isAdmin ? 'Admin workspace' : 'Member workspace'}</small>
          </div>
        </div>
        <div className="nav-actions">
          {isAdmin && (
            <>
              <button
                className="icon-button labelled"
                onClick={() => setShowUserModal(true)}
                type="button"
              >
                <UserPlus size={17} />
                Add user
              </button>
              <button
                className="icon-button labelled primary"
                onClick={() => setShowTaskModal(true)}
                type="button"
              >
                <ClipboardPlus size={17} />
                Assign task
              </button>
            </>
          )}
          <div className="welcome-user">
            <span>Welcome</span>
            <strong>{currentUser?.name}</strong>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button
            className={`icon-button ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            type="button"
          >
            <RefreshCw size={18} />
          </button>
          <button className="icon-button" onClick={handleLogout} title="Logout" type="button">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <motion.header
        className="topbar"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <p className="eyebrow with-icon">
            <Sparkles size={15} />
            Workload dashboard
          </p>
          <h1>
            Tasks, users, and{' '}
            <span className="accent-text">
              <Typewriter
                options={{
                  strings: ['fair assignment.', 'focused teams.', 'balanced work.'],
                  autoStart: true,
                  loop: true,
                  delay: 52,
                  deleteSpeed: 34
                }}
              />
            </span>
          </h1>
          <p>
            Logged in as <b>{currentUser?.name}</b>. New tasks are assigned from the
            backend by workload, active task count, and user age.
          </p>
        </div>
      </motion.header>

      {message && <p className="message dashboard-message">{message}</p>}
      {toast && <div className="toast">{toast}</div>}

      <motion.section
        className="stats-grid"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.05 }}
      >
        <StatCard label="Active users" value={stats.activeUsers} tone="green" />
        <StatCard label="Active tasks" value={stats.activeTasks} tone="blue" />
        <StatCard label="Total workload" value={stats.totalWorkload} tone="amber" />
      </motion.section>

      <motion.div
        className="content-grid"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <UserPanel
          users={users}
          onToggleUser={handleToggleUser}
          onViewUser={setSelectedUser}
          isAdmin={isAdmin}
          currentUserId={currentUser?.id}
        />
        <TaskPanel
          tasks={tasks}
          onStatusChange={handleStatusChange}
          isAdmin={isAdmin}
        />
      </motion.div>

      {showUserModal && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-label="Add user">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Team</p>
                <h2>Add user</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowUserModal(false)}
                title="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreateUser}>
              <label>
                Name
                <input
                  value={userForm.name}
                  onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
                  placeholder="Example: Amit"
                />
              </label>
              <label>
                Email
                <input
                  value={userForm.email}
                  onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                  placeholder="amit@example.com"
                  type="email"
                />
              </label>
              <label>
                Password
                <input
                  value={userForm.password}
                  onChange={(event) =>
                    setUserForm({ ...userForm, password: event.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  type="password"
                />
              </label>
              <label>
                Role
                <select
                  value={userForm.role}
                  onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button className="primary wide" type="submit">
                Create user
              </button>
            </form>
          </section>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-label="Assign task">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Assignment</p>
                <h2>Create task</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowTaskModal(false)}
                title="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreateTask}>
              <label>
                Task title
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  placeholder="Example: Prepare API docs"
                />
              </label>
              <label>
                Description
                <textarea
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, description: event.target.value })
                  }
                  placeholder="Short task details"
                />
              </label>
              <label>
                Priority
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </label>
              <button className="primary wide" type="submit">
                Auto-assign task
              </button>
            </form>
          </section>
        </div>
      )}

      {selectedUser && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal compact" role="dialog" aria-modal="true" aria-label="User profile">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>{selectedUser.name}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedUser(null)}
                title="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="profile-list">
              <div>
                <dt>Email</dt>
                <dd>{selectedUser.email}</dd>
              </div>
              {isAdmin && (
                <div>
                  <dt>Password</dt>
                  <dd>{selectedUser.password || 'Not available'}</dd>
                </div>
              )}
              <div>
                <dt>Role</dt>
                <dd>{selectedUser.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedUser.isActive ? 'Active' : 'Inactive'}</dd>
              </div>
              <div>
                <dt>Workload</dt>
                <dd>{selectedUser.workload} points</dd>
              </div>
              <div>
                <dt>Active tasks</dt>
                <dd>{selectedUser.activeTaskCount}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </main>
  );
};

export default App;
