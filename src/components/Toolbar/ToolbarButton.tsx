import type { ReactNode } from 'react'

interface ToolbarButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  'data-testid'?: string
}

export function ToolbarButton({
  icon,
  label,
  onClick,
  isActive,
  disabled,
  'data-testid': dataTestId,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      disabled={disabled}
      data-testid={dataTestId}
      className={`p-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-blue-100 text-blue-600'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  )
}
