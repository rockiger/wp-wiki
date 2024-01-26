import { Suspense } from 'react'
import { SidebarRouteTree } from './SidebarRouteTree'

import type { RouteItem } from './Sidebar'

declare global {
  interface Window {
    __theme: string
    __setPreferredTheme: (theme: string) => void
  }
}

export default function SidebarNav({
  breadcrumbs,
  routeTree,
}: {
  breadcrumbs: RouteItem[]
  routeTree: RouteItem
}) {
  // HACK. Fix up the data structures instead.
  /* if ((routeTree as any).routes.length === 1) {
    routeTree = (routeTree as any).routes[0]
  } */

  return (
    <aside>
      <nav role="navigation">
        {/* No fallback UI so need to be careful not to suspend directly inside. */}
        <Suspense fallback={null}>
          <ul>
            <SidebarRouteTree
              routeTree={routeTree}
              breadcrumbs={breadcrumbs}
              isForceExpanded={false}
              level={0}
            />
          </ul>
        </Suspense>
      </nav>
    </aside>
  )
}
