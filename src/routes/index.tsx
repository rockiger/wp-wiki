import { Navigate } from 'react-router-dom'
import { useFetchPages } from '../api'

export default function Index() {
  const { data: pages, refetch: pagesRefetch } = useFetchPages()
  const targetPage = pages.filter((page) => page.isOverview)[0]

  return <Navigate to={`/page/${targetPage?.id}`} />
}
