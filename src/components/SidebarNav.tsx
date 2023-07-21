/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import { Suspense } from 'react'
import * as React from 'react'
import cx from 'classix'
import { SidebarRouteTree } from './SidebarRouteTree'

import type { RouteItem } from '../routes/root'

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
    <div className="sticky top-0 lg:bottom-0 lg:h-[calc(100vh-4rem)]">
      <div
        className="overflow-y-scroll no-bg-scrollbar grow bg-wash dark:bg-wash-dark"
        style={{
          overscrollBehavior: 'contain',
        }}
      >
        <aside className="lg:grow flex-col w-full pb-8 lg:pb-0 lg:max-w-xs z-10 hidden lg:block">
          <nav
            role="navigation"
            style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
            className="w-full lg:h-auto grow pr-0 lg:pr-5 pt-6 lg:pb-16 md:pt-4 lg:pt-2 scrolling-touch scrolling-gpu"
          >
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
      </div>
    </div>
  )
}
