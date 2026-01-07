import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building2, User, Phone, MapPin } from 'lucide-react';
import { Button, Input, TextArea, Alert } from '../components/ui';
import { authAPI } from '../lib/api';
import { RegisterRequest } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    gstin: '',
    default_interest_rate: 2.0,
    default_tenure_days: 90,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register(formData);
      // Show success and redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-600 p-4 rounded-full">
              <Building2 size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gold Loan SaaS</h1>
          <p className="text-gray-600">Register your jewellery shop</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <UserPlus className="mr-2" size={28} />
            Create Your Account
          </h2>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Shop Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<Building2 size={20} />}
                  required
                  placeholder="e.g., Sri Krishna Jewellers"
                />

                <Input
                  label="Owner Name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  icon={<User size={20} />}
                  required
                  placeholder="e.g., Rajesh Kumar"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone size={20} />}
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail size={20} />}
                  required
                  placeholder="your@email.com"
                />

                <Input
                  label="GSTIN (Optional)"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="e.g., 29ABCDE1234F1Z5"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Shop Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows={3}
                    placeholder="Complete shop address with city and pincode"
                  />
                </div>
              </div>
            </div>

            {/* Default Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Default Loan Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Default Interest Rate (% per month)"
                  type="number"
                  step="0.1"
                  value={formData.default_interest_rate}
                  onChange={(e) => setFormData({ ...formData, default_interest_rate: parseFloat(e.target.value) })}
                  required
                  min="0.1"
                  max="10"
                />

                <Input
                  label="Default Tenure (days)"
                  type="number"
                  value={formData.default_tenure_days}
                  onChange={(e) => setFormData({ ...formData, default_tenure_days: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="365"
                />
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  icon={<Lock size={20} />}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={20} />}
                  required
                  minLength={8}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                Login Here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>🏦 Built for Indian Jewellery Shops 🇮🇳</p>
          <p className="mt-2">This is a private gold loan system. Not an NBFC.</p>
        </div>
      </div>
    </div>
  );
};
