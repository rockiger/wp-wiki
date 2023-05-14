import { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from 'react-router-dom'
import {
  fetchPages,
  fetchSpaces,
  Page,
  postPage,
  Spaces,
  useFetchPages,
  useFetchSpaces,
} from '../api'

import Navigation from '../components/Navigation'
import { cx } from 'classix'
import SidebarNav from '../components/SidebarNav'
import _ from 'lodash'
import Search from '../components/Search'

//! Think about the better icons solution tabler or mdi

export function loader() {
  fetchPages()
  fetchSpaces()
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
  const { data: spaces, refetch: spacesRefetch } = useFetchSpaces()
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

  const onClickNewButton = async (ev: React.MouseEvent) => {
    ev.preventDefault()

    const title = window.prompt('New Pagename')
    if (title) {
      try {
        const page = await postPage({
          title: title,
          parentId: pageId ?? spaces[0]['overviewPage'] ?? '',
          spaceId: spaces[0]['id'],
        })
        pagesRefetch()
        spacesRefetch()
        navigate(`/page/${page.id}?edit`)
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
    return createRouteTrees(pages, spaces)
  }, [pages, spaces])

  console.log(isSearchFieldActive)

  return (
    <>
      <Navigation
        isSearchFieldActive={isSearchFieldActive}
        ref={searchToggleRef}
        routeTrees={routeTrees}
        toggleSearch={toggleSearch}
      >
        <Search
          clearSearch={clearSearch}
          isSearchFieldActive={isSearchFieldActive}
          pages={pages}
          ref={searchInputRef}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          toggleSearch={toggleSearch}
        />
      </Navigation>
      <div
        className={cx(
          hasColumns &&
            'grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc'
        )}
      >
        {showSidebar && (
          <div className="lg:-mt-16">
            <div className="lg:pt-16 fixed lg:sticky top-0 left-0 right-0 py-0 shadow lg:shadow-none">
              {routeTrees.map((routeTree) => (
                <SidebarNav
                  key={routeTree.path}
                  routeTree={routeTree}
                  breadcrumbs={[]}
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
              {navigation.state === 'loading' ? <p>Loading...</p> : <Outlet />}
            </article>
            <div
              className={cx(
                'self-stretch w-full',
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
          </main>
        </Suspense>
        <div className="-mt-16 hidden lg:max-w-xs 2xl:block">
          {/* //! TODO TOC, should probably go down the component tree */}
          {/* {showToc && toc.length > 0 && <Toc headings={toc} key={asPath} />} */}
        </div>
      </div>
    </>
  )
}
export function createRouteTrees(pages: Pages, spaces: Spaces): RouteItem[] {
  if (_.isEmpty(pages)) {
    return []
  }
  const overviews = pages
    .filter((p) => p?.isOverview)
    .map((p) => {
      const space = spaces.find((s) => s?.overviewPage === p?.id)
      return space ? { ...p, title: space?.name ?? p?.title } : p
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
