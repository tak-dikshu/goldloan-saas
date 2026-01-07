import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, Phone, MapPin, FileText } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button, Input, Modal, TextArea, Loading, EmptyState, Alert } from '../components/ui';
import { customerAPI } from '../lib/api';
import { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.address.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const response = await customerAPI.create(formData);
      setCustomers([response.data, ...customers]);
      setShowModal(false);
      setFormData({ name: '', phone: '', address: '', email: '' });
      setSuccess('Customer added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading text="Loading customers..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
            <Plus size={20} className="mr-2" />
            Add Customer
          </Button>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Search */}
        <Card>
          <Input
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} />}
          />
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </Card>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <EmptyState
              message={searchTerm ? 'No customers match your search' : 'No customers yet'}
              icon={<User size={48} className="text-gray-300" />}
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} hover className="cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <User size={24} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <Phone size={14} className="mr-2" />
                          {customer.phone}
                        </p>
                        <p className="flex items-center">
                          <MapPin size={14} className="mr-2" />
                          {customer.address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/loans/create?customer=${customer.id}`);
                  }}>
                    <FileText size={16} className="mr-1" />
                    New Loan
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Customer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Customer</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User size={20} />}
            required
            placeholder="Customer's full name"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone size={20} />}
            required
            maxLength={10}
            placeholder="10-digit mobile number"
          />

          <Input
            label="Email (Optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />

          <TextArea
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            rows={3}
            placeholder="Complete address with city and pincode"
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};
