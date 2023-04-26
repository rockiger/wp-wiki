import { Suspense, useRef, useState } from 'react'
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
  Space,
  useFetchPages,
  useFetchSpaces,
} from '../api'

import Navigation from '../components/Navigation'
import { cx } from 'classix'

//! Thenk about the better icons solution tabler or mdi

export function loader() {
  fetchPages()
  fetchSpaces()
  return {}
}

type Pages = Page[]
type Spaces = Space[]

export default function Root() {
  const [opened, setOpened] = useState(false)
  const [autoCompleteValue, setAutoCompleteValue] = useState('')
  const autoCompleteRef = useRef<HTMLInputElement>(null)
  const { data: pages, refetch: pagesRefetch } = useFetchPages()
  const { data: spaces, refetch: spacesRefetch } = useFetchSpaces()
  const { pageId } = useParams()
  const navigate = useNavigate()
  const navigation = useNavigation()

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

  return (
    <>
      <Navigation />
      <div
        className={cx(
          hasColumns &&
            'grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc'
        )}
      >
        {showSidebar && (
          <div className="lg:-mt-16">
            <div className="lg:pt-16 fixed lg:sticky top-0 left-0 right-0 py-0 shadow lg:shadow-none">
              {/* //! TODO Sidebar nav */}
              {/* <SidebarNav
                key={section}
                routeTree={routeTree}
                breadcrumbs={breadcrumbs}
              /> */}
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
                {/* //! */}
                {/*<Footer />*/}
              </div>
            </div>
          </main>
        </Suspense>
        <div className="-mt-16 hidden lg:max-w-xs 2xl:block">
          {/* //! Should probably go down the component tree */}
          {/* {showToc && toc.length > 0 && <Toc headings={toc} key={asPath} />} */}
        </div>
      </div>
    </>
  )
}
