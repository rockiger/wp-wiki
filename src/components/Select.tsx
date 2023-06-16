import React from 'react'
import * as Select from '@radix-ui/react-select'
import cx from 'classix'

import ChevronDownIcon from 'mdi-react/ChevronDownIcon'
import ChevronUpIcon from 'mdi-react/ChevronUpIcon'

const SelectDemo = ({ editor, size = 'lg', className = '' }) => (
  <Select.Root open={true}>
    <Select.Trigger
      className={cx(
        'active:scale-95 transition-transform flex rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link pl-4 pr-3',
        'focus:bg-highlight focus:dark:bg-highlight-dark focus:text-link focus:dark:text-link-dark',
        'data-[state=open]:bg-highlight data-[state=open]:dark:bg-highlight-dark data-[state=open]:text-link data-[state=open]:dark:text-link-dark',
        size === 'lg' && 'h-12',
        size === 'md' && 'h-12 lg:h-10',
        size === 'sm' && 'h-12 lg:h-8',
        className
      )}
      aria-label="Food"
    >
      <Select.Value placeholder="Select a fruit…" />
      <Select.Icon>
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        className="olg:-m-5 h-full shadow-nav dark:shadow-nav-dark lg:rounded-2xl bg-wash dark:bg-gray-95 w-full flex grow flex-col mt-2 w-fit"
        onCloseAutoFocus={(ev) => {
          ev.preventDefault()
          editor?.commands.focus()
        }}
        position="popper"
        style={{
          maxHeight: 'var(--radix-select-content-available-height)',
          minWidth: 'var(--radix-select-trigger-width)',
        }}
      >
        <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="p-[5px]">
          <Select.Group>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
)

const SelectItem = React.forwardRef(
  (
    {
      children,
      className,
      ...props
    }: {
      children: React.ReactNode
      className?: string
      value: string
      disabled?: boolean
    },
    forwardedRef: React.ForwardedRef<HTMLDivElement>
  ) => {
    console.log(props)
    return (
      <Select.Item
        className={cx(
          'leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-4 relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-primary/5 data-[highlighted]:dark:bg-primary-dark/5 ',
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    )
  }
)

export default SelectDemo
