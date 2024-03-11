import { Accordion, AccordionItem } from '@nextui-org/react'
import { cx } from 'classix'
import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import { isEmpty } from 'lodash'

import type { RouteItem } from './Sidebar'
import SidebarLink from './SidebarLink'

interface SidebarRouteTreeProps {
  isForceExpanded: boolean
  breadcrumbs: RouteItem[]
  routeTree: RouteItem
  level: number
}

export function SidebarRouteTree({
  isForceExpanded,
  breadcrumbs,
  routeTree,
  level,
}: SidebarRouteTreeProps) {
  const { pathname: slug } = useLocation()
  const path = routeTree?.path ?? ''
  const routes = routeTree.routes as RouteItem[]
  const title = routeTree.title
  const selected = slug === path

  let listItem = null
  if (!isEmpty(routes)) {
    listItem = (
      <li key={`${title}-${path}-${level}-heading`}>
        <Accordion
          className="px-0 w-full"
          itemClasses={{
            base: 'base',
            content: 'overflow-x-hidden py-0 content',
            heading: `heading`,
            trigger: `flex-row-reverse pl-${
              level * 4
            } py-0 hover:opacity-80 trigger`,
          }}
          defaultExpandedKeys={['15']}
          isCompact
        >
          <AccordionItem
            key={routeTree.id}
            title={
              <SidebarLink
                key={`${title}-${path}-${level}-link`}
                href={path}
                selected={selected}
                title={title}
                isDraft={routeTree.isDraft}
                isNew={routeTree.isNew}
                isPrivate={routeTree.isPrivate}
                hideArrow={!routes.length}
              />
            }
            aria-label={title}
            onPress={() => {
              /* is need to block onPress event from propagating */
            }}
          >
            <ul className={cx('flex flex-col gap-3 first:mt-3')}>
              {routes.map((rt) => (
                <SidebarRouteTree
                  key={`${rt.title}-${rt.path}-${rt.path}`}
                  isForceExpanded={isForceExpanded}
                  routeTree={rt}
                  breadcrumbs={breadcrumbs}
                  level={level + 1}
                />
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </li>
    )
  } else {
    listItem = (
      <li key={`${title}-${path}-${level}-link`}>
        <SidebarLink
          href={path}
          selected={selected}
          level={level}
          title={title}
          isDraft={routeTree.isDraft}
          isNew={routeTree.isNew}
          isPrivate={routeTree.isPrivate}
          showDot={true}
        />
      </li>
    )
  }

  if (routeTree.hasSectionHeader) {
    const sectionHeader = routeTree.sectionHeader
    return (
      <Fragment key={`${sectionHeader}-${level}-separator`}>
        <h3
          className={cx(
            'mb-1 text-sm font-bold ml-5 text-tertiary dark:text-tertiary-dark',
            'mt-2'
          )}
        >
          {sectionHeader}
        </h3>
      </Fragment>
    )
  } else {
    return listItem
  }
}
