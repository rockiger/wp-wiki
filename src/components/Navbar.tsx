'use client'

import { useRef, useState, FC, ReactNode } from 'react'
import {
  link,
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  Button,
  Kbd,
  Link,
} from '@nextui-org/react'
import { dataFocusVisibleClasses } from '@nextui-org/theme'
import { isAppleDevice } from '@react-aria/utils'
import { clsx } from '@nextui-org/shared-utils'
import { includes } from 'lodash'
import { useEffect } from 'react'
import { usePress } from '@react-aria/interactions'
import { useFocusRing } from '@react-aria/focus'
import { TbPlus as PlusIcon } from 'react-icons/tb'

//! import { DocsSidebar } from '@/components/docs/sidebar'

import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'

import fulcrumLogo from '../assets/fulcrum.svg'
import cx from 'classix'
import { ThemeSwitch } from './ThemeSwitch'
import { SearchLinearIcon } from './icons'
import { useCmdkStore } from './cmdk'
import { useQueryClient } from '@tanstack/react-query'
import { Page, Space, pagesQuery, postPage } from '../api'
import Sidebar from './Sidebar'

export interface NavbarProps {
  pages: Page[]
  spaces: Space[]
  children?: ReactNode
}

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true)
    })
  }, [])

  return isMounted
}

export const Navbar: FC<NavbarProps> = ({ children, pages, spaces }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean | undefined>(false)
  const [commandKey, setCommandKey] = useState<'ctrl' | 'command'>('command')
  const { pageId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const ref = useRef<HTMLElement>(null)

  const pathname = useLocation().pathname
  const cmdkStore = useCmdkStore()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    setCommandKey(isAppleDevice() ? 'command' : 'ctrl')
  }, [])

  const handleOpenCmdk = () => {
    cmdkStore.onOpen()
  }

  const onClickNewButton = () => {
    const helper = async (title: string) => {
      const page = await postPage({
        title: title,
        parentId: parseInt(pageId ?? '0'),
        spaceId: pages.filter((page) => page.isOverview)[0].wikispace.id,
      })
      queryClient.invalidateQueries({ queryKey: pagesQuery().queryKey })
      navigate(`/page/${page.id}?edit`)
    }
    const title = window.prompt('New Pagename')
    if (title) {
      try {
        helper(title)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const { pressProps } = usePress({
    onPress: handleOpenCmdk,
  })
  const { focusProps, isFocusVisible } = useFocusRing()

  const SearchButton = () => (
    <Button
      aria-label="Quick search"
      className="text-sm font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20"
      endContent={
        <Kbd className="hidden py-0.5 px-2 lg:inline-block" keys={commandKey}>
          K
        </Kbd>
      }
      startContent={
        <SearchLinearIcon
          className="text-base text-default-400 pointer-events-none flex-shrink-0"
          size={18}
          strokeWidth={2}
        />
      }
      onPress={handleOpenCmdk}
    >
      Quick Search...
    </Button>
  )

  if (pathname.includes('/examples')) {
    return null
  }

  const navLinkClasses = clsx(
    link({ color: 'foreground' }),
    'data-[active=true]:text-primary'
  )

  return (
    <NextUINavbar
      ref={ref}
      className={clsx({
        'z-[100001]': isMenuOpen,
      })}
      isBordered
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit mr-2 -mt-1.5">
          <NavLink
            aria-label="Home"
            className="flex justify-start items-center gap-2 tap-highlight-transparent transition-opacity active:opacity-50"
            to="/"
          >
            <img
              src={fulcrumLogo}
              alt="Fulcrum Logo"
              className={cx(
                'text-sm mr-0 w-6 h-6 text-link dark:text-link-dark flex origin-center transition-all ease-in-out'
              )}
            />
            <div className="h-5 text-xl md:h-6">Fulcrum</div>
          </NavLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start items-center">
          <NavbarItem>
            <Link
              className={navLinkClasses}
              color={includes('/page/15', pathname) ? 'primary' : 'foreground'}
              data-active={includes('/page/15', pathname)}
              href="/"
              isBlock
            >
              Homepage
            </Link>
          </NavbarItem>
        </ul>
        <NavbarItem>
          <Button
            aria-label="Add Page here"
            className="font-bold h-12 lg:h-10 bg-gradient-to-br from-blue-500 to-pink-500 border-small border-white/50 shadow-pink-500/30 text-white
                    sm:w-auto text-lg"
            onClick={onClickNewButton}
            title="Add Page"
          >
            New
            <PlusIcon />
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex w-full gap-2 sm:hidden" justify="end">
        <NavbarItem className="flex h-full items-center">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex h-full items-center">
          <button
            className={clsx(
              'transition-opacity p-1 hover:opacity-80 rounded-full cursor-pointer outline-none',
              // focus ring
              ...dataFocusVisibleClasses
            )}
            data-focus-visible={isFocusVisible}
            {...focusProps}
            {...pressProps}
          >
            <SearchLinearIcon className="h-5 mt-px text-default-600 w-5 dark:text-default-500" />
          </button>
        </NavbarItem>
        <NavbarItem className="w-10 h-full">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="w-full h-full pt-1"
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex">
          <SearchButton />
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="hidden sm:flex lg:hidden ml-4"
        />
      </NavbarContent>

      <NavbarMenu>
        <div
          className={cx('lg:fixed lg:top-20 mt-2 z-0 lg:h-[calc(100vh-121px)]')}
        >
          <Sidebar spaces={spaces} pages={pages} />
        </div>
        {children}
      </NavbarMenu>
    </NextUINavbar>
  )
}
