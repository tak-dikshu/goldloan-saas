import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="text-green-500" size={20} />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="text-red-500" size={20} />,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="text-yellow-500" size={20} />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="text-blue-500" size={20} />,
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border rounded-lg p-4 flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3 mt-0.5">{style.icon}</div>
      <div className={`flex-1 ${style.text} text-sm font-medium`}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-3 ${style.text} hover:opacity-70`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600"></div>
      <p className="mt-4 text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({
  message,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-lg">{message}</p>
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray' }) => {
  const styles = {
    primary: 'bg-amber-100 text-amber-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${styles[variant]}`}>
      {children}
    </span>
  );
};
