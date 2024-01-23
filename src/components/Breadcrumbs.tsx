import {
  Breadcrumbs as BreadcrumbsWrapper,
  BreadcrumbItem,
} from '@nextui-org/react'
import type { RouteItem } from './Sidebar'

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: RouteItem[] }) {
  if (!breadcrumbs.length) {
    return null
  }
  return (
    <BreadcrumbsWrapper maxItems={5}>
      {breadcrumbs.map(
        (crumb, i) =>
          crumb.path &&
          !crumb.skipBreadcrumb && (
            <BreadcrumbItem href={crumb.path} key={crumb.id}>
              {crumb.title}
            </BreadcrumbItem>
          )
      )}
    </BreadcrumbsWrapper>
  )
}

export default Breadcrumbs
