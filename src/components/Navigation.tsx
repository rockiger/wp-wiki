import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { cx } from 'classix'
import Icon from '@mdi/react'
import {
  mdiClose,
  mdiMagnify,
  mdiMenu,
  mdiMoonWaningCrescent,
  mdiWhiteBalanceSunny,
} from '@mdi/js'
import { NavLink, NavLinkProps } from 'react-router-dom'

import fulcrumLogo from '../assets/fulcrum.svg'

declare global {
  interface Window {
    __theme: string
    __setPreferredTheme: (theme: string) => void
  }
}

function Link({ to, children, ...props }: NavLinkProps) {
  return (
    <NavLink
      to={to}
      className="inline text-primary dark:text-primary-dark hover:text-link hover:dark:text-link-dark border-b border-link border-opacity-0 hover:border-opacity-100 duration-100 ease-in transition leading-normal"
      {...props}
    >
      {children}
    </NavLink>
  )
}

function NavItem({ url, children }: any) {
  return (
    <div className="flex flex-auto sm:flex-1">
      <Link
        to={url}
        className={({ isActive }) =>
          cx(
            'active:scale-95 transition-transform w-full text-center outline-link py-1.5 px-1.5 xs:px-3 sm:px-4 rounded-full capitalize',
            !isActive && 'hover:bg-primary/5 hover:dark:bg-primary-dark/5',
            isActive &&
              'bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark'
          )
        }
      >
        {children}
      </Link>
    </div>
  )
}

function Kbd(props: { children?: React.ReactNode; wide?: boolean }) {
  const { wide, ...rest } = props
  const width = wide ? 'w-10' : 'w-5'

  return (
    <kbd
      className={`${width} h-5 border border-transparent mr-1 bg-wash dark:bg-wash-dark text-gray-30 align-middle p-0 inline-flex justify-center items-center text-xs text-center rounded-md`}
      {...rest}
    />
  )
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollParentRef = useRef<HTMLDivElement>(null)

  useEffect(setBodyClasses, [])

  // While the overlay is open, disable body scroll.
  useEffect(() => {
    if (isOpen) {
      const preferredScrollParent = scrollParentRef.current!
      disableBodyScroll(preferredScrollParent)
      return () => enableBodyScroll(preferredScrollParent)
    } else {
      return undefined
    }
  }, [isOpen])

  // Also close the overlay if the window gets resized past mobile layout.
  // (This is also important because we don't want to keep the body locked!)
  useEffect(() => {
    const media = window.matchMedia(`(max-width: 1023px)`)

    function closeIfNeeded() {
      if (!media.matches) {
        setIsOpen(false)
      }
    }

    closeIfNeeded()
    media.addEventListener('change', closeIfNeeded)
    return () => {
      media.removeEventListener('change', closeIfNeeded)
    }
  }, [])

  const scrollDetectorRef = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsScrolled(!entry.isIntersecting)
        })
      },
      {
        root: null,
        rootMargin: `0px 0px`,
        threshold: 0,
      }
    )
    observer.observe(scrollDetectorRef.current!)
    return () => observer.disconnect()
  }, [])

  const [showSearch, setShowSearch] = useState(false)
  const onOpenSearch = useCallback(() => {
    startTransition(() => {
      setShowSearch(true)
    })
  }, [])
  const onCloseSearch = useCallback(() => {
    setShowSearch(false)
  }, [])

  //! Style scrollbars
  return (
    <>
      <div ref={scrollDetectorRef} />
      <div
        className={cx(
          isOpen
            ? 'h-screen sticky top-0 lg:bottom-0 lg:h-screen flex flex-col shadow-nav dark:shadow-nav-dark z-20'
            : 'z-50 sticky top-0'
        )}
      >
        <nav
          className={cx(
            'duration-300 backdrop-filter backdrop-blur-lg backdrop-saturate-200 transition-shadow bg-opacity-90 items-center w-full flex justify-between bg-wash dark:bg-wash-dark dark:bg-opacity-95 px-1.5 lg:pr-5 lg:pl-4 z-50',
            (isScrolled || isOpen) && 'dark:shadow-nav-dark shadow-nav'
          )}
        >
          <div className="h-16 w-full gap-0 sm:gap-3 flex items-center justify-between">
            <div className="3xl:flex-1 flex flex-row ">
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setIsOpen(!isOpen)}
                className={cx(
                  'active:scale-95 transition-transform flex lg:hidden w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link',
                  isOpen && 'text-link dark:text-link-dark'
                )}
              >
                {isOpen ? (
                  <Icon path={mdiClose} size={1} />
                ) : (
                  <Icon path={mdiMenu} size={1} />
                )}
              </button>
              <div className="3xl:flex-1 flex align-center">
                <NavLink
                  to="/"
                  className={`active:scale-95 overflow-hidden transition-transform relative items-center text-primary dark:text-primary-dark p-1 whitespace-nowrap outline-link rounded-full 3xl:rounded-xl inline-flex text-lg font-normal gap-2`}
                >
                  <img
                    src={fulcrumLogo}
                    alt="Fulcrum Logo"
                    className={cx(
                      'text-sm mr-0 w-8 h-8 text-link dark:text-link-dark flex origin-center transition-all ease-in-out'
                    )}
                  />
                  <span className="sr-only 3xl:not-sr-only">Fulcrum</span>
                </NavLink>
              </div>
            </div>
            <div className="hidden md:flex flex-1 justify-center items-center w-full 3xl:w-auto 3xl:shrink-0 3xl:justify-center">
              <button
                type="button"
                className={cx(
                  'flex 3xl:w-[56rem] 3xl:mx-0 relative pl-4 pr-1 py-1 h-10 bg-gray-30/20 dark:bg-gray-40/20 outline-none focus:outline-link betterhover:hover:bg-opacity-80 pointer items-center text-left w-full text-gray-30 rounded-full align-middle text-base'
                )}
                onClick={onOpenSearch}
              >
                <Icon
                  path={mdiMagnify}
                  className="mr-3 align-middle text-gray-30 shrink-0 group-betterhover:hover:text-gray-70"
                  size={1}
                />
                Search
                {/* //! Todo search input */}
                <span className="ml-auto hidden sm:flex item-center mr-1">
                  {window.navigator.platform.includes('Mac') ? (
                    <Kbd data-platform="mac">⌘</Kbd>
                  ) : (
                    <Kbd data-platform="win" wide>
                      Ctrl
                    </Kbd>
                  )}
                  <Kbd>K</Kbd>
                </span>
              </button>
            </div>
            <div className="text-base justify-center items-center gap-1.5 flex 3xl:flex-1 flex-row 3xl:justify-end">
              {/* <div className="mx-2.5 gap-1.5 hidden lg:flex">
                <NavItem to="/learn">Learn</NavItem>
                <NavItem to="/reference/react">Reference</NavItem>
                <NavItem to="/community">Community</NavItem>
                <NavItem to="/blog">Blog</NavItem>
              </div> */}
              <div className="flex w-full md:hidden"></div>
              <div className="flex items-center -space-x-2.5 xs:space-x-0 ">
                <div className="flex md:hidden">
                  <button
                    aria-label="Search"
                    type="button"
                    className="active:scale-95 transition-transform flex md:hidden w-12 h-12 rounded-full items-center justify-center hover:bg-secondary-button hover:dark:bg-secondary-button-dark outline-link"
                    onClick={onOpenSearch}
                  >
                    <Icon
                      path={mdiMagnify}
                      className="align-middle w-5 h-5"
                      size={1}
                    />
                  </button>
                </div>
                <div className="flex dark:hidden">
                  <button
                    type="button"
                    aria-label="Use Dark Mode"
                    onClick={() => {
                      setPreferredTheme('dark')
                    }}
                    className="active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link"
                  >
                    <Icon path={mdiMoonWaningCrescent} size={1} rotate={-30} />
                  </button>
                </div>
                <div className="hidden dark:flex">
                  <button
                    type="button"
                    aria-label="Use Light Mode"
                    onClick={() => {
                      setPreferredTheme('light')
                    }}
                    className="active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link"
                  >
                    <Icon path={mdiWhiteBalanceSunny} size={1} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {isOpen && (
          <div
            ref={scrollParentRef}
            className="overflow-y-scroll isolate no-bg-scrollbar lg:w-[342px] grow bg-wash dark:bg-wash-dark"
          >
            <aside
              className={cx(
                `lg:grow lg:flex flex-col w-full pb-8 lg:pb-0 lg:max-w-xs z-50`,
                isOpen ? 'block z-40' : 'hidden lg:block'
              )}
            >
              <nav
                role="navigation"
                style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
                className="w-full lg:h-auto grow pr-0 lg:pr-5 pt-4 lg:py-6 md:pt-4 lg:pt-4 scrolling-touch scrolling-gpu"
              >
                {/* No fallback UI so need to be careful not to suspend directly inside. */}
                <Suspense fallback={null}>
                  <div className="pl-3 xs:pl-5 xs:gap-0.5 xs:text-base overflow-x-auto flex flex-row lg:hidden text-base font-bold text-secondary dark:text-secondary-dark">
                    <NavItem url="/learn">Learn</NavItem>
                    <NavItem url="/reference/react">Reference</NavItem>
                    <NavItem url="/community">Community</NavItem>
                    <NavItem url="/blog">Blog</NavItem>
                  </div>
                  <div
                    role="separator"
                    className="ml-5 mt-4 mb-2 border-b border-border dark:border-border-dark"
                  />
                  //! Fill menu
                  {/* <SidebarRouteTree
                    // Don't share state between the desktop and mobile versions.
                    // This avoids unnecessary animations and visual flicker.
                    key={isOpen ? 'mobile-overlay' : 'desktop-or-hidden'}
                    routeTree={routeTree}
                    breadcrumbs={breadcrumbs}
                    isForceExpanded={isOpen}
                  /> */}
                </Suspense>
              </nav>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

function setBodyClasses() {
  const classList =
    'font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base'.split(
      ' '
    )
  document.body.classList.add(...classList)
}

function setPreferredTheme(mode: 'dark' | 'light') {
  //! TODO: Add logic for persisting mode look at _document
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}