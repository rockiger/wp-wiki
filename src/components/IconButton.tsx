import { cx } from 'classix'
import { ButtonHTMLAttributes } from 'react'

export interface IconButtonProps {
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function IconButton({
  'aria-label': ariaLabel,
  children,
  className,
  isActive,
  size = 'lg',
  ...rest
}: IconButtonProps &
  React.DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cx(
        'active:scale-95 transition-transform flex rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link ',
        isActive &&
          'bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark',
        size === 'lg' && 'w-12 h-12',
        size === 'md' && 'w-12 h-12 lg:w-10 lg:h-10',
        size === 'sm' && 'w-12 h-12 lg:w-8 lg:h-8',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
