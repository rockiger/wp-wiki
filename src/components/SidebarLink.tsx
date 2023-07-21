/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useEffect, Fragment } from 'react'
import * as React from 'react'
import { cx } from 'classix'
import { IconArrowRight, IconChevronRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

interface SidebarLinkProps {
  DisclosureButton?: React.ElementType
  href: string
  selected?: boolean
  title: string
  level: number
  isDraft: boolean | undefined
  icon?: React.ReactNode
  isExpanded?: boolean
  hideArrow?: boolean
  isPending: boolean
  onClick?: () => void
}

export default function SidebarLink({
  href: to,
  DisclosureButton,
  selected = false,
  title,
  isDraft,
  level,
  isExpanded,
  hideArrow,
  isPending,
  onClick,
}: SidebarLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (selected && ref && ref.current) {
      // @ts-ignore
      if (typeof ref.current.scrollIntoViewIfNeeded === 'function') {
        // @ts-ignore
        ref.current.scrollIntoViewIfNeeded()
      }
    }
  }, [ref, selected])

  let target = ''
  if (to.startsWith('https://')) {
    target = '_blank'
  }
  return (
    <Link
      to={to}
      ref={ref}
      title={title}
      target={target}
      aria-current={selected ? 'page' : undefined}
      onClick={onClick}
      className={cx(
        'pr-1 w-full rounded-none lg:rounded-r-2xl text-left h-12 hover:bg-gray-5 dark:hover:bg-gray-80 relative flex items-center justify-between text-base font-bold',
        level === 0 && !selected && 'text-primary dark:text-primary-dark',
        level > 0 &&
          !selected &&
          'text-base text-secondary dark:text-secondary-dark',
        selected &&
          'text-base text-link dark:text-link-dark bg-highlight dark:bg-highlight-dark border-blue-40 hover:bg-highlight hover:text-link dark:hover:bg-highlight-dark dark:hover:text-link-dark',
        isPending &&
          'dark:bg-gray-70 bg-gray-3 dark:hover:bg-gray-70 hover:bg-gray-3'
      )}
      style={{ paddingLeft: `${level + 1}rem` }}
    >
      {/* This here needs to be refactored ofc */}
      <span
        className={cx(
          'flex items-center py-2',
          isDraft && 'text-gray-400 dark:text-gray-500'
        )}
      >
        <span>{title}</span>{' '}
        {isDraft && (
          <span className="bg-gray-200 h-4 leading-4 ml-1 mt-[1px] px-1 rounded-full text-xs">
            Draft
          </span>
        )}
      </span>
      {isExpanded != null && !hideArrow && DisclosureButton && (
        <DisclosureButton
          className={cx(
            'flex rounded-full items-center justify-center w-11 h-11 hover:bg-primary/5 hover:dark:bg-primary-dark/5',
            isExpanded && 'text-link dark:text-link-dark',
            !isExpanded && 'text-tertiary dark:text-tertiary-dark'
          )}
        >
          <svg
            className={cx(
              'duration-100 ease-in transition',
              isExpanded && 'rotate-90 transform '
            )}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.86612 13.6161C6.37796 14.1043 6.37796 14.8957 6.86612 15.3839C7.35427 15.872 8.14572 15.872 8.63388 15.3839L13.1339 10.8839C13.622 10.3957 13.622 9.60428 13.1339 9.11612L8.63388 4.61612C8.14572 4.12797 7.35427 4.12797 6.86612 4.61612C6.37796 5.10428 6.37796 5.89573 6.86612 6.38388L10.4822 10L6.86612 13.6161Z"
              fill="currentColor"
            />
          </svg>
        </DisclosureButton>
      )}
    </Link>
  )
}
