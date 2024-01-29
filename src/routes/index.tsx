import { Navigate } from 'react-router-dom'
import { useFetchPages } from '../api'

export default function Index() {
  const { data: pages } = useFetchPages()
  const targetPage = pages.filter((page) => page.isOverview)[0]

  if (targetPage) {
    return <Navigate to={`/page/${targetPage?.id}`} />
  }
  return null
}
