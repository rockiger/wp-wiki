import { cx } from 'classix'

export interface IconButtonProps {
  children: React.ReactNode
  className?: string
  isActive?: boolean
  onClick?: () => void
}

export default function IconButton({
  children,
  className,
  isActive,
  onClick,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label="Use Dark Mode"
      onClick={onClick}
      className={cx(
        'active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link ',
        isActive &&
          'bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark',
        className
      )}
    >
      {children}
    </button>
  )
}
