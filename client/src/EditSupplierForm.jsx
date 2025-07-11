import React, { useState, useEffect } from 'react';
import styles from './styles/EditUserForm.module.css'; // Reusing the same styles

const EditSupplierForm = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierEmail: '',
    supplierAddress: '',
    supplierNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const url = "http://localhost:5555/supplier";
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setMessage('Error fetching suppliers');
    }
  };

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);

    if (supplierId) {
      const selectedSupplier = suppliers.find(supplier => supplier._id === supplierId);
      if (selectedSupplier) {
        setFormData({
          supplierName: selectedSupplier.supplierName || '',
          supplierEmail: selectedSupplier.supplierEmail || '',
          supplierAddress: selectedSupplier.supplierAddress || '',
          supplierNumber: selectedSupplier.supplierNumber || ''
        });
      }
    } else {
      setFormData({
        supplierName: '',
        supplierEmail: '',
        supplierAddress: '',
        supplierNumber: ''
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

    if (!selectedSupplierId) {
      setMessage('Please select a supplier to edit');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData = {};
      if (formData.supplierName) updateData.supplierName = formData.supplierName;
      if (formData.supplierEmail) updateData.supplierEmail = formData.supplierEmail;
      if (formData.supplierAddress) updateData.supplierAddress = formData.supplierAddress;
      if (formData.supplierNumber) updateData.supplierNumber = formData.supplierNumber;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/supplier/${selectedSupplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Supplier updated successfully!');
        fetchSuppliers();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      setMessage('Error updating supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplierId) {
      setMessage('Please select a supplier to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/supplier/${selectedSupplierId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Supplier deleted successfully!');
        setSelectedSupplierId('');
        setFormData({
          supplierName: '',
          supplierEmail: '',
          supplierAddress: '',
          supplierNumber: ''
        });
        fetchSuppliers();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setMessage('Error deleting supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Supplier</h2>

      {message && (
        <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.formContainer}>
        {/* Supplier Selection Dropdown */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Select Supplier to Edit:
          </label>
          <select
            value={selectedSupplierId}
            onChange={handleSupplierSelect}
            className={styles.input}
          >
            <option value="">-- Select a supplier --</option>
            {suppliers.map(supplier => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.supplierName} ({supplier.supplierEmail})
              </option>
            ))}
          </select>
        </div>

        {/* Form Fields */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Supplier Name:
          </label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleInputChange}
            disabled={!selectedSupplierId}
            className={`${styles.input} ${!selectedSupplierId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Email:
          </label>
          <input
            type="email"
            name="supplierEmail"
            value={formData.supplierEmail}
            onChange={handleInputChange}
            disabled={!selectedSupplierId}
            className={`${styles.input} ${!selectedSupplierId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Address:
          </label>
          <textarea
            name="supplierAddress"
            value={formData.supplierAddress}
            onChange={handleInputChange}
            disabled={!selectedSupplierId}
            rows="3"
            className={`${styles.input} ${!selectedSupplierId ? styles.disabled : ''}`}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Phone Number:
          </label>
          <input
            type="text"
            name="supplierNumber"
            value={formData.supplierNumber}
            onChange={handleInputChange}
            disabled={!selectedSupplierId}
            maxLength="12"
            pattern="[0-9]*"
            className={`${styles.input} ${!selectedSupplierId ? styles.disabled : ''}`}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedSupplierId || loading}
            className={`${styles.button} ${(!selectedSupplierId || loading) ? styles.buttonDisabled : ''}`}
          >
            {loading ? 'Updating...' : 'Update Supplier'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedSupplierId || loading}
            className={`${styles.button} ${(!selectedSupplierId || loading) ? styles.buttonDisabled : ''}`}
            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
          >
            {loading ? 'Deleting...' : 'Delete Supplier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierForm;
