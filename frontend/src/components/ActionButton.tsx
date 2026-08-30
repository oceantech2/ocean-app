import { ButtonHTMLAttributes } from 'react';
import { getActionIcon } from './actionIcons';
import { ActionContext, ActionVariant, getActionButtonClasses } from '../utils/actionButtonStyles';

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant: ActionVariant;
  context: ActionContext;
  label: string;
}

export default function ActionButton({
  variant,
  context,
  label,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ActionButtonProps) {
  const Icon = getActionIcon(variant);
  const classes = getActionButtonClasses(variant, context);

  return (
    <button
      type={type}
      className={`${classes}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      aria-label={label}
      {...rest}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
