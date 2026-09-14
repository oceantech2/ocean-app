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
  title,
  ...rest
}: ActionButtonProps) {
  const Icon = getActionIcon(variant);
  const classes = getActionButtonClasses(variant, context);
  const isRow = context === 'row';

  return (
    <button
      type={type}
      className={`${classes}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      aria-label={label}
      title={isRow ? (title ?? label) : title}
      {...rest}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!isRow && <span>{label}</span>}
    </button>
  );
}
