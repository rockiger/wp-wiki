import { Chip, Link } from '@nextui-org/react'
import { cx } from 'classix'
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { usePress } from 'react-aria'
import scrollIntoView from 'scroll-into-view-if-needed'

interface SidebarLinkProps {
  href: string
  selected?: boolean
  title: string
  level?: number
  isDraft: boolean | undefined
  isNew?: boolean
  icon?: React.ReactNode
  isExpanded?: boolean
  hideArrow?: boolean
  showDot?: boolean
}

export default function SidebarLink({
  href,
  selected = false,
  title,
  isDraft,
  isNew,
  level,
  showDot = false,
}: SidebarLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  const { pressProps } = usePress({
    onPress: (ev) => {
      // blocks onPress event from propagating
    },
  })
  useEffect(() => {
    if (selected && ref && ref.current) {
      scrollIntoView(ref.current, {
        behavior: 'smooth',
        block: 'nearest',
        scrollMode: 'if-needed',
        inline: 'nearest',
      })
    }
  }, [ref, selected])

  return (
    //@ts-expect-error
    <Link
      className={cx(
        'flex',
        !!showDot &&
          "before:mr-4 before:content-[''] before:block before:bg-default-300 before:w-1 before:h-1 before:rounded-full"
      )}
      color={selected ? 'primary' : 'foreground'}
      href={href}
      ref={ref}
      title={title}
      style={{
        paddingLeft: level ? `${level + (showDot ? 0.45 : 0)}rem` : undefined,
      }}
      {...pressProps}
    >
      <span>{title}</span>
      {isDraft && (
        <Chip
          className="ml-1 py-1 text-tiny text-default-400 bg-default-100/50"
          color="default"
          size="sm"
          variant="flat"
        >
          Draft
        </Chip>
      )}
      {isNew && !isDraft && (
        <Chip
          className="ml-1 py-1 text-tiny"
          color="primary"
          size="sm"
          variant="flat"
        >
          New
        </Chip>
      )}
    </Link>
  )
}
