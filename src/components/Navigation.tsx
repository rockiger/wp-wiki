import {
  Dispatch,
  SetStateAction,
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
import type { RouteItem } from '../routes/root'
import fulcrumLogo from '../assets/fulcrum.svg'
import SidebarNav from './SidebarNav'
import { SidebarRouteTree } from './SidebarRouteTree'
import * as Popover from '@radix-ui/react-popover'
import React from 'react'

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

interface NavigationProps {
  children: React.ReactNode
  isSearchFieldActive: boolean
  routeTrees: RouteItem[]
  toggleSearch: (action?: 'open' | 'close') => void
}

const Navigation = React.forwardRef(
  (
    {
      children,
      isSearchFieldActive,
      routeTrees,
      toggleSearch,
    }: NavigationProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const searchToggleRef = useRef<HTMLButtonElement>(null)
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

    // Set light mode
    useEffect(() => {
      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      if (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })

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
              <div
                className={cx(
                  'flex flex-1 relative justify-end items-center w-full md:justify-start 3xl:w-auto 3xl:shrink-0 3xl:justify-center'
                )}
              >
                {children}
              </div>
              <div className="text-base justify-center items-center flex 3xl:flex-1 flex-row 3xl:justify-end">
                {/* <div className="mx-2.5 gap-1.5 hidden lg:flex">
                <NavItem to="/learn">Learn</NavItem>
                <NavItem to="/reference/react">Reference</NavItem>
                <NavItem to="/community">Community</NavItem>
                <NavItem to="/blog">Blog</NavItem>
              </div> */}
                <div className="flex w-full md:hidden"></div>
                <div className="flex items-center -space-x-2.5 xs:space-x-0 ">
                  <div className="flex dark:hidden">
                    <button
                      type="button"
                      aria-label="Use Dark Mode"
                      onClick={() => {
                        setPreferredTheme('dark')
                      }}
                      className="active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link"
                    >
                      <Icon
                        path={mdiMoonWaningCrescent}
                        size={1}
                        rotate={-30}
                      />
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
                    {/* //? */}
                    {/* <div className="pl-3 xs:pl-5 xs:gap-0.5 xs:text-base overflow-x-auto flex flex-row lg:hidden text-base font-bold text-secondary dark:text-secondary-dark">
                    <NavItem url="/learn">Learn</NavItem>
                    <NavItem url="/reference/react">Reference</NavItem>
                    <NavItem url="/community">Community</NavItem>
                    <NavItem url="/blog">Blog</NavItem>
                  </div>
                  <div
                    role="separator"
                    className="ml-5 mt-4 mb-2 border-b border-border dark:border-border-dark"
                  /> */}
                    <ul>
                      {routeTrees.map((routeTree) => (
                        <SidebarRouteTree
                          key={routeTree.path}
                          routeTree={routeTree}
                          breadcrumbs={[]}
                          isForceExpanded={true}
                          level={0}
                        />
                      ))}
                    </ul>
                  </Suspense>
                </nav>
              </aside>
            </div>
          )}
        </div>
      </>
    )
  }
)
export default Navigation

function setBodyClasses() {
  const classList =
    'font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base'.split(
      ' '
    )
  document.body.classList.add(...classList)
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
