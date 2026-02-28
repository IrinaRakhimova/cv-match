import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const variantClass =
    variant === 'primary'
      ? styles.buttonPrimary
      : styles.buttonSecondary;

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Analyzing…' : children}
    </button>
  );
};