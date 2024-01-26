import { SunFilledIcon, MoonFilledIcon } from './icons'
import cx from 'classix'
import { Button } from '@nextui-org/react'

export const ThemeSwitch = () => {
  return (
    <div
      className={cx(
        'w-auto h-auto',
        'bg-transparent',
        'rounded-lg',
        'flex items-center justify-center',
        'group-data-[selected=true]:bg-transparent',
        '!text-default-600 dark:!text-default-500',
        'pt-px',
        'px-0',
        'mx-0'
      )}
    >
      <div className="flex dark:hidden">
        <Button
          aria-label="Use Dark Mode"
          isIconOnly
          onClick={() => {
            setPreferredTheme('dark')
          }}
          size="sm"
          variant="light"
        >
          <MoonFilledIcon size={22} />
        </Button>
      </div>
      <div className="hidden dark:flex">
        <Button
          aria-label="Use Light Mode"
          isIconOnly
          onClick={() => {
            setPreferredTheme('light')
          }}
          size="sm"
          variant="light"
        >
          <SunFilledIcon size={22} />
        </Button>
      </div>
    </div>
  )
}

function setPreferredTheme(mode: 'dark' | 'light') {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
  }
}
