import React, { useState, useEffect } from 'react';
import { Building2, Lock, Save } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button, Input, TextArea, Alert } from '../components/ui';
import { authAPI, shopAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user, updateShop } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'shop' | 'password'>('shop');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [shopData, setShopData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    gstin: '',
    default_interest_rate: 0,
    default_tenure_days: 0,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user?.shop) {
      setShopData({
        name: user.shop.name,
        owner_name: user.shop.owner_name,
        phone: user.shop.phone,
        address: user.shop.address,
        gstin: user.shop.gstin || '',
        default_interest_rate: user.shop.default_interest_rate,
        default_tenure_days: user.shop.default_tenure_days,
      });
    }
  }, [user]);

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await shopAPI.update(shopData);
      updateShop(response.data);
      setSuccess('Shop profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your shop profile and account settings</p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'shop'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('shop')}
          >
            <Building2 size={20} className="inline mr-2" />
            Shop Profile
          </button>
          <button
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'password'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={20} className="inline mr-2" />
            Change Password
          </button>
        </div>

        {/* Shop Profile Tab */}
        {activeTab === 'shop' && (
          <form onSubmit={handleUpdateShop}>
            <Card title="Shop Information">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Shop Name"
                    value={shopData.name}
                    onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Owner Name"
                    value={shopData.owner_name}
                    onChange={(e) => setShopData({ ...shopData, owner_name: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={shopData.phone}
                    onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                    required
                    maxLength={10}
                  />
                  <Input
                    label="GSTIN (Optional)"
                    value={shopData.gstin}
                    onChange={(e) => setShopData({ ...shopData, gstin: e.target.value })}
                  />
                </div>

                <TextArea
                  label="Shop Address"
                  value={shopData.address}
                  onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                  required
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Default Interest Rate (% per month)"
                    type="number"
                    step="0.1"
                    value={shopData.default_interest_rate}
                    onChange={(e) => setShopData({ ...shopData, default_interest_rate: parseFloat(e.target.value) })}
                    required
                    min="0.1"
                    max="10"
                  />
                  <Input
                    label="Default Tenure (days)"
                    type="number"
                    value={shopData.default_tenure_days}
                    onChange={(e) => setShopData({ ...shopData, default_tenure_days: parseInt(e.target.value) })}
                    required
                    min="1"
                    max="365"
                  />
                </div>

                <Button type="submit" isLoading={isLoading}>
                  <Save size={20} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <Card title="Change Password">
              <div className="space-y-4">
                <Alert type="info" message="Choose a strong password with at least 8 characters" />
                
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  icon={<Lock size={20} />}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  icon={<Lock size={20} />}
                  required
                  minLength={8}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  icon={<Lock size={20} />}
                  required
                  minLength={8}
                />

                <Button type="submit" isLoading={isLoading}>
                  <Lock size={20} className="mr-2" />
                  Change Password
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* Legal Disclaimer */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Disclaimer</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-800 font-medium">
              ⚠️ This is a private gold loan management system. Not an NBFC (Non-Banking Financial Company).
            </p>
            <p className="text-xs text-gray-600 mt-2">
              This software is designed for private jewellery shops offering gold loans to their customers.
              It is not intended for licensed NBFCs or institutions regulated by RBI.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
