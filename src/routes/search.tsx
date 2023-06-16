import IconWorldSearch from 'mdi-react/SearchWebIcon'
import ExclamationIcon from 'mdi-react/ExclamationIcon'

import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import { fetchPages, useFetchPages } from '../api'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchTerm = url.searchParams.get('q')
  const pages = await fetchPages(searchTerm ?? '')
  // pages is still neeed, to use the loading state in the component
  return { searchTerm, pages }
}

export default function Search() {
  const { searchTerm } = useLoaderData() as Awaited<ReturnType<typeof loader>>
  const { data: pages } = useFetchPages(searchTerm ?? '')

  return (
    <div className="p-8">
      <h1 className="mt-0 text-primary dark:text-primary-dark -mx-.5 break-words text-5xl font-display font-bold leading-tight">
        Search
      </h1>

      {(() => {
        if (!searchTerm) {
          return (
            <div className="flex flex-col items-center mt-16">
              <IconWorldSearch className="text-slate-400 w-20 h-20" />
              <div className="mt-12 text-center text-bold text-4xl">
                Find what you need
              </div>
              <div className="mt-4 text-center text-lg text-slate-400">
                Search for keywords in the title, the content or the tags of any
                page.
              </div>
            </div>
          )
        }
        if (pages.length === 0) {
          return (
            <div className="flex flex-col items-center mt-16">
              <ExclamationIcon className="text-slate-400 w-20 h-20" />
              <div className="mt-12 text-center text-bold text-4xl">
                We couldn't find any results for your search.
              </div>
              <div className="mt-4 text-center text-lg text-slate-400">
                Try to search for different or less keywords or try to use more
                common terms.
              </div>
            </div>
          )
        }
        return (
          <div className="flex flex-col items-center mt-16">
            {pages.map((p) => (
              <div className="mb-4 w-full">
                <Link to={`/page/${p.id}`}>
                  <h3 className="font-bold">{p.title}</h3>
                </Link>
                <div className="text-md text-slate-400">
                  {p.modified
                    ? Intl.DateTimeFormat().format(new Date(p.modified))
                    : ''}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: p.excerpt ?? '' }}
                  className="text-md [&>*:first-of-type]:mt-0 [&>*:last-of-type]:mb-0"
                />
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
