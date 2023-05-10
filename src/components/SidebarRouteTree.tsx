/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import { useRef, useLayoutEffect, Fragment } from 'react'

import SidebarLink from './SidebarLink'

import { cx } from 'classix'
import type { RouteItem } from '../routes/root'
import { useLocation } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'

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
  // const slug = useRouter().asPath.split(/[\?\#]/)[0];
  const { pathname: slug } = useLocation()
  const path = routeTree?.path ?? ''
  const routes = routeTree.routes as RouteItem[]
  const title = routeTree.title
  const selected = slug === path

  let listItem = null
  if (routes) {
    const isBreadcrumb =
      breadcrumbs.length > 1 &&
      breadcrumbs[breadcrumbs.length - 1].path === path
    // const isExpanded = isForceExpanded || isBreadcrumb || selected

    //! use HeadlessUI disclosure instead
    listItem = (
      <li key={`${title}-${path}-${level}-heading`}>
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <SidebarLink
                key={`${title}-${path}-${level}-link`}
                DisclosureButton={Disclosure.Button}
                href={path}
                isPending={
                  false /* //! pendingRoute === path maybe in router */
                }
                selected={selected}
                level={level}
                title={title}
                isDraft={routeTree.isDraft}
                isExpanded={open}
                hideArrow={!routes.length}
              />
              <Disclosure.Panel>
                <ul>
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
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </li>
    )
  } else {
    listItem = (
      <li key={`${title}-${path}-${level}-link`}>
        <SidebarLink
          isPending={false /* //! pendingRoute === path maybe in router */}
          href={path}
          selected={selected}
          level={level}
          title={title}
          isDraft={routeTree.isDraft}
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
