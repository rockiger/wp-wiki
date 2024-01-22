import { Suspense, useCallback, useRef, useState } from 'react'
import {
  LoaderFunctionArgs,
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from 'react-router-dom'
import {
  pagesQuery,
  postPage,
  spacesQuery,
  useFetchPages,
  useFetchSpaces,
} from '../api'

import { cx } from 'classix'
import '../components/Search/react.css'
import LoadingIcon from 'mdi-react/LoadingIcon'
import PlusIcon from 'mdi-react/PlusIcon'
import { QueryClient } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'
import { Cmdk } from '../components/cmdk'
import Sidebar from '../components/Sidebar'

export const loader =
  (queryClient: QueryClient) => async (_args: LoaderFunctionArgs) => {
    const spacesQ = spacesQuery()
    const pagesQ = pagesQuery()

    return {
      spaces:
        queryClient.getQueryData(spacesQ.queryKey) ??
        (await queryClient.fetchQuery(spacesQ)),
      pages:
        queryClient.getQueryData(pagesQ.queryKey) ??
        (await queryClient.fetchQuery(pagesQ)),
    }
  }

export type RouteTag =
  | 'foundation'
  | 'intermediate'
  | 'advanced'
  | 'experimental'
  | 'deprecated'

export default function Root() {
  const [isSearchFieldActive, setIsSearchFieldActive] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const { data: pages } = useFetchPages()
  const { data: spaces } = useFetchSpaces()
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

  const onClickNewButton = () => {
    const helper = async (title: string) => {
      const page = await postPage({
        title: title,
        parentId: parseInt(pageId ?? '0'),
        spaceId: pages.filter((page) => page.isOverview)[0].wikispace.id,
      })
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
  let isHomePage = false

  return (
    <>
      <div className="relative flex flex-col">
        <Navbar routes={[]} />
        <main className="relative mx-auto z-10 px-6 min-h-[calc(100vh_-_64px_-_108px)] mb-12 flex-grow">
          <div className="flex">
            <div className="hidden mt-8 overflow-visible pr-4 relative w-64 z-10 lg:block">
              <Sidebar pages={pages} spaces={spaces} />
            </div>
            {/* No fallback UI so need to be careful not to suspend directly inside. */}
            <Suspense fallback={null}>
              <div className="grow w-[calc(100vw-16rem-3rem)] xl:col-span-8 lg:px-16 mt-10">
                <div className="w-full prose prose-neutral">
                  {navigation.state === 'loading' ? (
                    <div className="flex justify-center w-full">
                      <LoadingIcon className="animate-spin h-8 mt-16 w-8" />
                    </div>
                  ) : (
                    <Outlet />
                  )}
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
                </div>
              </div>
            </Suspense>
          </div>
        </main>
      </div>
      <Cmdk pages={pages} />
    </>
  )
}
