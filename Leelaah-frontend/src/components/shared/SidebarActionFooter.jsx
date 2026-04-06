import React from 'react';
import { useSelector } from 'react-redux';
import './SidebarActionFooter.css';

const SidebarActionFooter = ({
  onClick,
  icon: Icon,
  label,
  loadingLabel,
  isLoading = false,
  disabled = false,
  footerStyle,
  buttonTitle,
}) => {
  const { theme } = useSelector((state) => state.theme || { theme: 'Dark' });

  const isLightTheme = theme === 'Light' || (
    theme === 'Auto' &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    !window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const isDisabled = disabled || isLoading;

  return (
    <div className="sidebar-action-footer" style={footerStyle}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={buttonTitle || label}
        className={`sidebar-action-btn ${isLightTheme ? 'light' : 'dark'} ${isDisabled ? 'disabled' : ''}`}
      >
        {Icon ? <Icon size={18} /> : null}
        {isLoading ? loadingLabel || label : label}
      </button>
    </div>
  );
};

export default SidebarActionFooter;
