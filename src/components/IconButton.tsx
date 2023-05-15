import { cx } from 'classix'

export interface IconButtonProps {
  'aria-label'?: string
  children: React.ReactNode
  className?: string
  isActive?: boolean
  onClick?: (ev: React.MouseEvent) => void
  style?: React.CSSProperties
}

export default function IconButton({
  'aria-label': ariaLabel,
  children,
  className,
  isActive,
  onClick,
  style,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cx(
        'active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link ',
        isActive &&
          'bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark',
        className
      )}
      style={style}
    >
      {children}
    </button>
  )
}
