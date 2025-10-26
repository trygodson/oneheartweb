import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

const CustomButton = ({ type, className, children, onClick = () => null, disabled, loading }) => {
  return (
    <button
      disabled={disabled}
      type={type ?? 'button'}
      onClick={onClick}
      className={`py-4 text-sm px-12 rounded bg-primary disabled:!bg-primary/30 text-white font-medium !border border-primary disabled:!border-primary/30 disabled:!text-primary/30 text-primary ${className}`}
    >
      <div className="flex gap-3 items-center justify-center">
        {loading && (
          <span className="mr-1">
            <ImSpinner2 size={18} className="animate-spin" />
          </span>
        )}
        {children}
      </div>
    </button>
  );
};

export const CustomButton2 = ({
  type,
  className,
  children,
  onClick = () => null,
  icon = () => null,
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      disabled={disabled || loading}
      type={type ?? 'button'}
      style={{ opacity: disabled || loading ? 0.5 : 1 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-3xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm ${
        className ?? ''
      }`}
    >
      {loading ? (
        <span className="mr-1">
          <ImSpinner2 size={18} className="animate-spin" />
        </span>
      ) : (
        icon()
      )}
      {children}
    </button>
  );
};

export default CustomButton;
