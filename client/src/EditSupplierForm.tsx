import { useState, useEffect } from 'react';
import styles from './styles/EditUserForm.module.css'; // Reusing the same styles
import {
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from './services/inventoryService';
import type { Supplier } from './types';

interface SupplierFormData {
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  supplierNumber: string;
}

const EMPTY_FORM: SupplierFormData = {
  supplierName: '',
  supplierEmail: '',
  supplierAddress: '',
  supplierNumber: ''
};

const EditSupplierForm = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [formData, setFormData] = useState<SupplierFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuppliers = async () => {
    try {
      setSuppliers(await getSuppliers());
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setMessage('Error fetching suppliers');
    }
  };

  const handleSupplierSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      setFormData(EMPTY_FORM);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      setMessage('Please select a supplier to edit');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData: Partial<SupplierFormData> = {};
      if (formData.supplierName) updateData.supplierName = formData.supplierName;
      if (formData.supplierEmail) updateData.supplierEmail = formData.supplierEmail;
      if (formData.supplierAddress) updateData.supplierAddress = formData.supplierAddress;
      if (formData.supplierNumber) updateData.supplierNumber = formData.supplierNumber;

      await updateSupplier(selectedSupplierId, updateData);

      setMessage('Supplier updated successfully!');
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      setMessage(`Error: ${(error as Error).message || 'Error updating supplier'}`);
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
      await deleteSupplier(selectedSupplierId);

      setMessage('Supplier deleted successfully!');
      setSelectedSupplierId('');
      setFormData(EMPTY_FORM);
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setMessage(`Error: ${(error as Error).message || 'Error deleting supplier'}`);
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
            rows={3}
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
            maxLength={12}
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
