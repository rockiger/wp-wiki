import { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useNavigation, useParams } from 'react-router-dom'
import { fetchPages, Page, postPage, useFetchPages } from '../api'

import Navigation from '../components/Navigation'
import { cx } from 'classix'
import SidebarNav from '../components/SidebarNav'
import _ from 'lodash'
import Search from '../components/Search'
import '../components/Search/react.css'
import MagnifyIcon from 'mdi-react/MagnifyIcon'
import LoadingIcon from 'mdi-react/LoadingIcon'
import PlusIcon from 'mdi-react/PlusIcon'

export function loader() {
  fetchPages()
  return {}
}

export type RouteTag =
  | 'foundation'
  | 'intermediate'
  | 'advanced'
  | 'experimental'
  | 'deprecated'

export interface RouteItem {
  /** Page title (for the sidebar) */
  title: string
  /** Optional page description for heading */
  excerpt?: string
  /* Additional meta info for page tagging */
  tags?: RouteTag[]
  /** Path to page */
  path?: string
  /** Whether the entry is a heading */
  heading?: boolean
  /** Whether the page is under construction */
  isDraft?: boolean
  /** List of sub-routes */
  routes?: RouteItem[]
  /** Adds a section header above the route item */
  hasSectionHeader?: boolean
  /** Title of section header */
  sectionHeader?: string
  /** Whether it should be omitted in breadcrumbs */
  skipBreadcrumb?: boolean
}

export interface Routes {
  /** List of routes */
  routes: RouteItem[]
}
type Pages = Page[]

export default function Root() {
  const [isSearchFieldActive, setIsSearchFieldActive] = useState(false)
  const [opened, setOpened] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const { data: pages, refetch: pagesRefetch } = useFetchPages()
  const { pageId } = useParams()
  const navigate = useNavigate()
  const navigation = useNavigation()

  const toggleSearch = useCallback(
    (action?: 'open' | 'close') => {
      if (action === 'open') {
        setIsSearchFieldActive(true)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      } else if (action === 'close') {
        setIsSearchFieldActive(false)
        searchToggleRef.current?.focus()
      } else {
        isSearchFieldActive ? toggleSearch('close') : toggleSearch('open')
      }
    },
    [isSearchFieldActive, searchInputRef, setIsSearchFieldActive]
  )

  const clearSearch = useCallback(() => {
    setSearchValue('')
    searchInputRef.current?.focus()
  }, [searchInputRef, setSearchValue])

  const onClickNewButton = () => {
    const helper = async (title: string) => {
      const page = await postPage({
        title: title,
        parentId:
          (pageId as string) ??
          pages.filter((page) => page.isOverview)[0] ??
          '',
        spaceId: pages.filter((page) => page.isOverview)[0].fulcrumSpace?.id,
      })
      pagesRefetch()
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

  // Change later based on requirements
  let hasColumns = true
  let isHomePage = false
  let showSidebar = true
  let showToc = true

  const routeTrees = useMemo(() => {
    return createRouteTrees(pages)
  }, [pages])

  return (
    <>
      <Navigation
        isSearchFieldActive={isSearchFieldActive}
        ref={searchToggleRef}
        routeTrees={routeTrees}
        toggleSearch={toggleSearch}
      >
        <Search pages={pages}>
          {(isSearchActive, setIsSearchFieldActive) => (
            <div className="flex md:hidden">
              <button
                aria-label="Search"
                type="button"
                className="active:scale-95 transition-transform flex md:hidden w-12 h-12 rounded-full items-center justify-center hover:bg-secondary-button hover:dark:bg-secondary-button-dark outline-link"
                onClick={(ev) => {
                  setIsSearchFieldActive(true)
                  ev.stopPropagation()
                }}
              >
                <MagnifyIcon className="align-middle w-5 h-5" size={1} />
              </button>
            </div>
          )}
        </Search>
      </Navigation>
      <div
        className={cx(
          hasColumns &&
            'grid grid-cols-only-content lg:grid-cols-sidebar-content'
        )}
      >
        {showSidebar && (
          <div className="Sidebar lg:-mt-16">
            <div className="lg:pt-16 fixed lg:sticky top-0 left-0 right-0 py-0 shadow lg:shadow-none">
              {routeTrees.map((routeTree) => (
                <SidebarNav
                  breadcrumbs={[]}
                  key={routeTree.path}
                  routeTree={routeTree}
                />
              ))}
            </div>
          </div>
        )}
        {/* No fallback UI so need to be careful not to suspend directly inside. */}
        <Suspense fallback={null}>
          <main className="min-w-0 isolate">
            <article
              className="break-words font-normal text-primary dark:text-primary-dark"
              key={pageId}
            >
              {navigation.state === 'loading' ? (
                <div className="flex justify-center w-full">
                  <LoadingIcon className="animate-spin h-8 mt-16 w-8" />
                </div>
              ) : (
                <Outlet />
              )}
            </article>
            <div
              className={cx(
                'hidden self-stretch w-full',
                isHomePage && 'bg-wash dark:bg-gray-95 mt-[-1px]'
              )}
            >
              {!isHomePage && (
                <div className="mx-auto w-full px-5 sm:px-12 md:px-12 pt-10 md:pt-12 lg:pt-10">
                  {
                    <hr className="max-w-7xl mx-auto border-border dark:border-border-dark" />
                  }
                </div>
              )}
              <div
                className={cx(
                  'py-12 px-5 sm:px-12 md:px-12 sm:py-12 md:py-16 lg:py-14',
                  isHomePage && 'lg:pt-0'
                )}
              >
                {/* //? footer */}
                {/*<Footer />*/}
              </div>
            </div>
            <button
              aria-label="Add Page here"
              className="fixed right-5 bottom-4 h-12 lg:h-10 sm:w-auto justify-center active:scale-[.98] transition-transform inline-flex font-bold items-center outline-none focus:outline-none focus-visible:outline focus-visible:outline-link focus:outline-offset-2 focus-visible:dark:focus:outline-link-dark leading-snug bg-link text-white hover:bg-opacity-80 text-lg py-3 rounded-full pl-5 pr-3"
              onClick={onClickNewButton}
              title="Add Page"
            >
              New
              <PlusIcon />
            </button>
          </main>
        </Suspense>
      </div>
    </>
  )
}
export function createRouteTrees(pages: Pages): RouteItem[] {
  if (_.isEmpty(pages)) {
    return []
  }
  const overviews = pages
    .filter((p) => p?.isOverview)
    .map((p) => {
      return { ...p, title: p.fulcrumSpace?.name ?? p?.title }
    })
  const subpages = pages.filter((p) => !p?.isOverview)

  return overviews.map((o) => createRouteTreesHelper(o as Page, subpages))
}

function createRouteTreesHelper(overview: Page, subpages: Page[]): RouteItem {
  const children = subpages.filter((s) => s?.parentId === overview?.id)
  return {
    path: `/page/${overview?.id}`,
    title: overview?.title ?? '',
    isDraft: overview?.status === 'draft',
    routes: children.map((c) => createRouteTreesHelper(c, subpages)),
  }
}
