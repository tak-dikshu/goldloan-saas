import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calculator, Save, User, Scale, IndianRupee } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button, Input, Select, TextArea, Alert } from '../components/ui';
import { loanAPI, customerAPI } from '../lib/api';
import { Customer, CreateLoanRequest } from '../types';
import {
  calculateNetWeight,
  calculateGoldValue,
  calculateDueDate,
  formatCurrency,
  formatWeight,
} from '../utils/helpers';

const PURITY_OPTIONS = [
  { value: '24K', label: '24 Karat (99.9%)' },
  { value: '22K', label: '22 Karat (91.6%)' },
  { value: '18K', label: '18 Karat (75.0%)' },
  { value: '916', label: '916 (22K)' },
  { value: '750', label: '750 (18K)' },
];

const ORNAMENT_OPTIONS = [
  { value: 'Necklace', label: 'Necklace' },
  { value: 'Bangles', label: 'Bangles' },
  { value: 'Ring', label: 'Ring' },
  { value: 'Chain', label: 'Chain' },
  { value: 'Earrings', label: 'Earrings' },
  { value: 'Bracelet', label: 'Bracelet' },
  { value: 'Anklet', label: 'Anklet' },
  { value: 'Other', label: 'Other' },
];

export const CreateLoanPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Customer form
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  // Loan form
  const [loanData, setLoanData] = useState({
    customer_id: 0,
    ornament_type: 'Necklace',
    gross_weight: 0,
    stone_weight: 0,
    purity: '22K',
    rate_per_gram: 0,
    loan_amount: 0,
    interest_rate: 2.0,
    tenure_days: 90,
    start_date: new Date().toISOString().split('T')[0],
  });

  // Calculated values
  const netWeight = calculateNetWeight(loanData.gross_weight, loanData.stone_weight);
  const goldValue = calculateGoldValue(netWeight, loanData.rate_per_gram);
  const dueDate = calculateDueDate(loanData.start_date, loanData.tenure_days);
  const maxLoanAmount = Math.floor(goldValue * 0.75); // 75% of gold value

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.address) {
      setError('Please fill all customer details');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(newCustomer.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      const response = await customerAPI.create(newCustomer);
      const createdCustomer = response.data;
      setCustomers([createdCustomer, ...customers]);
      setSelectedCustomer(createdCustomer);
      setLoanData({ ...loanData, customer_id: createdCustomer.id });
      setShowNewCustomer(false);
      setNewCustomer({ name: '', phone: '', address: '', email: '' });
      setSuccess('Customer created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer || null);
    setLoanData({ ...loanData, customer_id: customerId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!loanData.customer_id) {
      setError('Please select a customer');
      return;
    }

    if (loanData.gross_weight <= 0) {
      setError('Gross weight must be greater than 0');
      return;
    }

    if (loanData.stone_weight >= loanData.gross_weight) {
      setError('Stone weight cannot be greater than or equal to gross weight');
      return;
    }

    if (loanData.rate_per_gram <= 0) {
      setError('Rate per gram must be greater than 0');
      return;
    }

    if (loanData.loan_amount <= 0) {
      setError('Loan amount must be greater than 0');
      return;
    }

    if (loanData.loan_amount > maxLoanAmount) {
      setError(`Loan amount cannot exceed ${formatCurrency(maxLoanAmount)} (75% of gold value)`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await loanAPI.create(loanData as CreateLoanRequest);
      const loan = response.data;
      
      // Success! Navigate to loan details
      navigate(`/loans/${loan.id}`, {
        state: { message: 'Loan created successfully!' },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create loan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={() => navigate('/loans')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Loan</h1>
            <p className="text-gray-600 mt-1">Fill in the details to create a new gold loan</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card title="Customer Details" actions={
            !showNewCustomer && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowNewCustomer(true)}
              >
                <Plus size={16} className="mr-1" />
                New Customer
              </Button>
            )
          }>
            {showNewCustomer ? (
              <div className="space-y-4">
                <Alert type="info" message="Create a new customer account" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Customer Name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    icon={<User size={20} />}
                    required
                    placeholder="Full name"
                  />
                  <Input
                    label="Phone Number"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    maxLength={10}
                    required
                    placeholder="10-digit mobile"
                  />
                  <Input
                    label="Email (Optional)"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                  <div className="md:col-span-2">
                    <TextArea
                      label="Address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      required
                      rows={2}
                      placeholder="Complete address"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={handleCreateCustomer}
                    isLoading={isLoading}
                  >
                    Create Customer
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowNewCustomer(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Select
                  label="Select Customer"
                  value={loanData.customer_id.toString()}
                  onChange={(e) => handleCustomerSelect(parseInt(e.target.value))}
                  options={[
                    { value: '0', label: 'Select a customer...' },
                    ...customers.map((c) => ({
                      value: c.id.toString(),
                      label: `${c.name} - ${c.phone}`,
                    })),
                  ]}
                  required
                />
                {selectedCustomer && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Gold Details */}
          <Card title="Gold Details" subtitle="Enter ornament specifications">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Ornament Type"
                value={loanData.ornament_type}
                onChange={(e) => setLoanData({ ...loanData, ornament_type: e.target.value })}
                options={ORNAMENT_OPTIONS}
                required
              />

              <Input
                label="Gross Weight (grams)"
                type="number"
                step="0.001"
                value={loanData.gross_weight || ''}
                onChange={(e) => setLoanData({ ...loanData, gross_weight: parseFloat(e.target.value) || 0 })}
                icon={<Scale size={20} />}
                required
                min="0.001"
              />

              <Input
                label="Stone Weight (grams)"
                type="number"
                step="0.001"
                value={loanData.stone_weight || ''}
                onChange={(e) => setLoanData({ ...loanData, stone_weight: parseFloat(e.target.value) || 0 })}
                icon={<Scale size={20} />}
                min="0"
              />

              <div className="md:col-span-3">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Net Weight:</span>
                    <span className="text-lg font-bold text-green-700">{formatWeight(netWeight)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Gross Weight - Stone Weight = Net Weight</p>
                </div>
              </div>

              <Select
                label="Purity"
                value={loanData.purity}
                onChange={(e) => setLoanData({ ...loanData, purity: e.target.value })}
                options={PURITY_OPTIONS}
                required
              />

              <Input
                label="Rate per Gram (₹)"
                type="number"
                step="1"
                value={loanData.rate_per_gram || ''}
                onChange={(e) => setLoanData({ ...loanData, rate_per_gram: parseFloat(e.target.value) || 0 })}
                icon={<IndianRupee size={20} />}
                required
                min="1"
                placeholder="e.g., 6000"
              />

              <div className="md:col-span-3">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Gold Value:</span>
                    <span className="text-lg font-bold text-amber-700">{formatCurrency(goldValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Max Loan (75%):</span>
                    <span className="text-lg font-bold text-amber-700">{formatCurrency(maxLoanAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Net Weight × Rate per Gram = Gold Value</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Loan Terms */}
          <Card title="Loan Terms" subtitle="Configure interest and tenure">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Loan Amount (₹)"
                type="number"
                step="1"
                value={loanData.loan_amount || ''}
                onChange={(e) => setLoanData({ ...loanData, loan_amount: parseFloat(e.target.value) || 0 })}
                icon={<IndianRupee size={20} />}
                required
                min="1"
                max={maxLoanAmount}
                placeholder="Enter loan amount"
              />

              <Input
                label="Interest Rate (% per month)"
                type="number"
                step="0.1"
                value={loanData.interest_rate || ''}
                onChange={(e) => setLoanData({ ...loanData, interest_rate: parseFloat(e.target.value) || 0 })}
                icon={<Calculator size={20} />}
                required
                min="0.1"
                max="10"
              />

              <Input
                label="Tenure (days)"
                type="number"
                value={loanData.tenure_days || ''}
                onChange={(e) => setLoanData({ ...loanData, tenure_days: parseInt(e.target.value) || 0 })}
                required
                min="1"
                max="365"
              />

              <Input
                label="Start Date"
                type="date"
                value={loanData.start_date}
                onChange={(e) => setLoanData({ ...loanData, start_date: e.target.value })}
                required
              />

              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                disabled
              />

              <div className="md:col-span-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Loan Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Principal Amount:</span>
                      <span className="ml-2 font-semibold">{formatCurrency(loanData.loan_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="ml-2 font-semibold">{loanData.interest_rate}% per month</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tenure:</span>
                      <span className="ml-2 font-semibold">{loanData.tenure_days} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Interest:</span>
                      <span className="ml-2 font-semibold">
                        {formatCurrency((loanData.loan_amount * loanData.interest_rate) / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!loanData.customer_id || isLoading}
            >
              <Save size={20} className="mr-2" />
              {isLoading ? 'Creating Loan...' : 'Create Loan'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/loans')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
