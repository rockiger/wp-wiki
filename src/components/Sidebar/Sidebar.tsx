import { isEmpty, sortBy } from 'lodash'
import { useMemo } from 'react'
import { ScrollArea } from '../ScrollArea'
import SidebarNav from './SidebarNav'
import { Page, Space } from '../../api'

export interface RouteItem {
  id: string
  /** Page title (for the sidebar) */
  title: string
  /** Optional page description for heading */
  excerpt?: string
  /** Path to page */
  path?: string
  /** Whether the entry is a heading */
  heading?: boolean
  /** Whether the page is under construction */
  isDraft?: boolean
  /** Whether the page is younger than 10 days */
  isNew?: boolean
  /** Whether the page is private */
  isPrivate?: boolean
  /** List of sub-routes */
  routes?: RouteItem[]
  /** Adds a section header above the route item */
  hasSectionHeader?: boolean
  /** Title of section header */
  sectionHeader?: string
  /** Whether it should be omitted in breadcrumbs */
  skipBreadcrumb?: boolean
}

export default function Sidebar({
  pages,
  spaces,
}: {
  pages: Page[]
  spaces: Space[]
}) {
  const routeTrees = useMemo(() => {
    return createRouteTrees(pages, spaces)
  }, [pages, spaces])

  return (
    <div className="z-0 lg:h-[calc(100vh-121px)]">
      <ScrollArea className="relative overflow-hidden h-full pl-6 w-full lg:max-h-[calc(100vh_-_64px)]">
        {routeTrees.map((routeTree) => (
          <SidebarNav
            breadcrumbs={[]}
            key={routeTree.path}
            routeTree={routeTree}
          />
        ))}
      </ScrollArea>
    </div>
  )
}

export function createRouteTrees(pages: Page[], spaces: Space[]): RouteItem[] {
  if (isEmpty(pages)) {
    return []
  }
  const overviews = pages
    .filter((p) => p?.isOverview)
    .map((p) => {
      return {
        ...p,
        title: p.wikispace.name ?? p?.title,
      }
    })
  const subpages = sortBy(
    pages.filter((p) => !p?.isOverview),
    ['title', 'created']
  )

  return overviews.map((o) => createRouteTreesHelper(o as Page, subpages))
}

function createRouteTreesHelper(page: Page, subpages: Page[]): RouteItem {
  const children = subpages.filter((s) => s?.parentId === page?.id)
  const today = new Date()
  const created = new Date(page?.created)
  const difference =
    (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return {
    id: page.id.toString(),
    path: `/page/${page?.id}`,
    title: page?.title ?? '',
    isDraft: page?.status === 'draft',
    isNew: difference < 10,
    isPrivate: page?.status === 'private',
    routes: children.map((c) => createRouteTreesHelper(c, subpages)),
  }
}
