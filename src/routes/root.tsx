import { Suspense } from 'react'
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useNavigation,
} from 'react-router-dom'
import { pagesQuery, spacesQuery, useFetchPages, useFetchSpaces } from '../api'

import { cx } from 'classix'
import LoadingIcon from 'mdi-react/LoadingIcon'
import { QueryClient } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'
import { Cmdk } from '../components/cmdk'
import Sidebar from '../components/Sidebar'
import reactPress from '../reactPress'

export const loader =
  (queryClient: QueryClient) => async (_args: LoaderFunctionArgs) => {
    if (reactPress.user.ID === 0) {
      const urlParams = new URLSearchParams()
      urlParams.append('redirect_to', window.location.href)
      return redirect(`/login?${urlParams.toString()}`)
    }
    if (
      !['editor', 'admin'].some((role) => reactPress.user.roles.includes(role))
    ) {
      return redirect('/rights')
    }

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

export default function Root() {
  const { data: pages } = useFetchPages()
  const { data: spaces } = useFetchSpaces()
  const navigation = useNavigation()

  // Change later based on requirements
  let isHomePage = false

  return (
    <>
      <div className="relative flex flex-col">
        <Navbar pages={pages} spaces={spaces}></Navbar>
        <main className="relative mx-auto z-10 min-h-[calc(100vh_-_64px_-_108px)] mb-12 flex-grow">
          <div className="flex">
            <div className="hidden mt-8 overflow-visible pr-4 relative w-80 z-10 lg:block">
              <Sidebar pages={pages} spaces={spaces} />
            </div>
            {/* No fallback UI so need to be careful not to suspend directly inside. */}
            <Suspense fallback={null}>
              <div className="grow xl:col-span-8 lg:w-[calc(100vw-20rem)] mt-8">
                <div className="w-full">
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
