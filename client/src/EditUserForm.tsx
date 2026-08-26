import { useState, useEffect } from 'react';
import styles from './styles/EditUserForm.module.css';
import {
  getUsers,
  updateUser,
  deleteUser,
} from './services/userService';
import type { User, UserRole } from './types';

interface UserFormData {
  userUsername: string;
  userFullName: string;
  userPassword: string;
  userRole: UserRole;
}

const EMPTY_FORM: UserFormData = {
  userUsername: '',
  userFullName: '',
  userPassword: '',
  userRole: 'employee'
};

const EditUserForm = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setUsers(await getUsers());
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users');
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      setFormData(EMPTY_FORM);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setMessage('Please select a user to edit');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData: Record<string, string> = {};
      if (formData.userUsername) updateData.userUsername = formData.userUsername;
      if (formData.userFullName) updateData.userFullName = formData.userFullName;
      if (formData.userPassword) updateData.userPassword = formData.userPassword;
      if (formData.userRole) updateData.userRole = formData.userRole;

      await updateUser(selectedUserId, updateData);

      setMessage('User updated successfully!');
      fetchUsers();
      setFormData(prev => ({ ...prev, userPassword: '' }));
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage(`Error: ${(error as Error).message || 'Error updating user'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) {
      setMessage('Please select a user to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await deleteUser(selectedUserId);

      setMessage('User deleted successfully!');
      setSelectedUserId('');
      setFormData(EMPTY_FORM);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage(`Error: ${(error as Error).message || 'Error deleting user'}`);
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

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedUserId || loading}
            className={`${styles.button} ${(!selectedUserId || loading) ? styles.buttonDisabled : ''}`}
          >
            {loading ? 'Updating...' : 'Update User'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedUserId || loading}
            className={`${styles.button} ${(!selectedUserId || loading) ? styles.buttonDisabled : ''}`}
            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
