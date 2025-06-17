import React, { useState, useEffect } from 'react';
import styles from './styles/EditUserForm.module.css';

const EditUserForm = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({
    userUsername: '',
    userFullName: '',
    userPassword: '',
    userRole: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const url = "http://localhost:5555/users";
    try {
      // const response = await fetch(url);
      const response = await fetch(url, {
        method: "GET",
        // needed for all fetch if u want to deal with session/auth/cookies
        credentials: "include",
      })
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users');
    }
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);

    if (userId) {
      const selectedUser = users.find(user => user._id === userId);
      if (selectedUser) {
        setFormData({
          userUsername: selectedUser.userUsername || '',
          userFullName: selectedUser.userFullName || '',
          userPassword: '',
          userRole: selectedUser.userRole || 'employee'
        });
      }
    } else {
      setFormData({
        userUsername: '',
        userFullName: '',
        userPassword: '',
        userRole: 'employee'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      setMessage('Please select a user to edit');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData = {};
      if (formData.userUsername) updateData.userUsername = formData.userUsername;
      if (formData.userFullName) updateData.userFullName = formData.userFullName;
      if (formData.userPassword) updateData.userPassword = formData.userPassword;
      if (formData.userRole) updateData.userRole = formData.userRole;

      const response = await fetch(`/api/users/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('User updated successfully!');
        fetchUsers();
        setFormData(prev => ({ ...prev, userPassword: '' }));
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit User</h2>

      {message && (
        <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.formContainer}>
        {/* User Selection Dropdown */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Select User to Edit:
          </label>
          <select
            value={selectedUserId}
            onChange={handleUserSelect}
            className={styles.input}
          >
            <option value="">-- Select a user --</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.userFullName} ({user.userUsername})
              </option>
            ))}
          </select>
        </div>

        {/* Form Fields */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Username:
          </label>
          <input
            type="text"
            name="userUsername"
            value={formData.userUsername}
            onChange={handleInputChange}
            disabled={!selectedUserId}
            className={`${styles.input} ${!selectedUserId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Full Name:
          </label>
          <input
            type="text"
            name="userFullName"
            value={formData.userFullName}
            onChange={handleInputChange}
            disabled={!selectedUserId}
            className={`${styles.input} ${!selectedUserId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            New Password (leave blank to keep current):
          </label>
          <input
            type="password"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleInputChange}
            disabled={!selectedUserId}
            placeholder="Enter new password or leave blank"
            className={`${styles.input} ${!selectedUserId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Role:
          </label>
          <select
            name="userRole"
            value={formData.userRole}
            onChange={handleInputChange}
            disabled={!selectedUserId}
            className={`${styles.input} ${!selectedUserId ? styles.disabled : ''}`}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedUserId || loading}
          className={`${styles.button} ${(!selectedUserId || loading) ? styles.buttonDisabled : ''}`}
        >
          {loading ? 'Updating...' : 'Update User'}
        </button>
      </div>
    </div>
  );
};

export default EditUserForm;
