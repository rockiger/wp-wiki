// password: 'orJp IOvd nQKq PYck q2YO qJky'

import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import reactPress from './reactPress'

import apiFetch from '@wordpress/api-fetch'
import { WikipageResponse, WikispaceResponse } from './api-types'
import { addQueryArgs } from '@wordpress/url'
import { UseMutationOptions, useMutation } from '@tanstack/react-query'

apiFetch.use((options, next) => {
  const { headers = {} } = options
  console.log('headers', import.meta.env.Prod)
  return next({
    ...options,
    headers: {
      ...headers,
      ...(import.meta.env.Prod
        ? { 'X-WP-Nonce': reactPress.api.nonce }
        : { Authorization: `Basic ${btoa('admin:pass')}` }),
    },
  })
})

apiFetch.use(
  apiFetch.createRootURLMiddleware(
    import.meta.env.PROD
      ? `${reactPress?.api.graphql_url}` //! needs to be wp-json url
      : 'http://fulcrum.test/wp-json/'
  )
)

/**
 * Consumes the properties of the new page and creates the
 * new page in WordPress. One of title or content is required.
 * @returns
 */
export async function postPage({
  spaceId = 0,
  title = '',
  content = '',
  parentId = 0,
}) {
  const response = await apiFetch({
    path: '/wp/v2/wikipages',
    method: 'POST',
    data: {
      title,
      content,
      wikispaces: spaceId,
      parent: parentId,
    },
  })

  console.log(
    'created wikipage',
    normalizeWikipageResponse(response as WikipageResponse)
  )
  return normalizeWikipageResponse(response as WikipageResponse)
}

function normalizeWikispaceResponseArray(nodes: WikispaceResponse[]) {
  return nodes?.map((node) => {
    const { count, description, id, name, slug } = node
    return {
      count,
      description,
      id,
      name,
      slug,
    }
  })
}
export type Wikispace = ReturnType<typeof normalizeWikispaceResponseArray>
export async function fetchSpaces() {
  const response = await apiFetch({
    path: '/wp/v2/wikispaces',
  })

  if (!response) return []
  console.log('wikispaces', response)
  return normalizeWikispaceResponseArray(response as WikispaceResponse[])
}

export const useFetchSpaces = () => {
  const [data, setData] = useState<Space[]>([])

  useEffect(() => {
    const afn = async () => {
      const pages = await fetchSpaces()
      if (pages) {
        setData(pages)
      }
    }
    afn()
  }, [])
  return { data }
}
export type Space = ReturnType<typeof normalizeWikispaceResponseArray>[0]

export const normalizeWikipageResponse = (data: WikipageResponse) => {
  const {
    author,
    content,
    date,
    excerpt,
    id,
    isOverview,
    modified,
    parent,
    status,
    title,
    wikispace,
    width,
  } = data

  return {
    author,
    body: content.rendered,
    created: date,
    excerpt: excerpt.rendered,
    id,
    isOverview,
    modified: modified,
    parentId: parent,
    status,
    title: title.rendered,
    wikispace,
    width,
  }
}
export type Page = ReturnType<typeof normalizeWikipageResponse>

export async function fetchPage(id: string) {
  const queryParams = {
    _fields:
      'author,content,date,excerpt,id,isOverview,modified,parent,status,title, wikispaces, wikispace, wikispaceId',
  }
  const response = await apiFetch({
    path: addQueryArgs(`/wp/v2/wikipages/${id}`, queryParams),
  })

  if (!response) return undefined
  console.log(
    'wikipage',
    id,
    normalizeWikipageResponse(response as WikipageResponse)
  )
  return normalizeWikipageResponse(response as WikipageResponse)
}

export const useFetchPage = (id: string) => {
  const [data, setData] = useState<Page | undefined>(undefined)

  useEffect(() => {
    const afn = async () => {
      const page = await fetchPage(id)
      if (page) {
        setData(page)
      }
    }
    afn()
  }, [id])
  return { data }
}

function normalizeWikipageResponseArray(nodes: WikipageResponse[]): Page[] {
  return nodes.map((node) => normalizeWikipageResponse(node))
}

export async function fetchPages(search = '') {
  const queryParams = {
    status: 'draft,publish,private,pending',
    _fields:
      'author,content,date,excerpt,id,isOverview,modified,parent,status,title, wikispaces, wikispace, wikispaceId',
    search,
  }
  const response = await apiFetch({
    path: addQueryArgs('/wp/v2/wikipages', queryParams),
  })

  if (!response) return []
  console.log(
    'wikipages',
    normalizeWikipageResponseArray(response as WikipageResponse[])
  )
  return normalizeWikipageResponseArray(response as WikipageResponse[])
}

export const useFetchPages = (search = '') => {
  const [data, setData] = useState<Page[]>([])

  useEffect(() => {
    const afn = async () => {
      const pages = await fetchPages(search)
      if (pages) {
        setData(pages)
      }
    }
    afn()
  }, [])
  return { data }
}

/**
 * Consumes the varibles object of the new properties of the
 * new page and update the
 * page in WordPress.
 * @returns
 */
export async function updatePage({
  body,
  id,
  parentId,
  spaceId,
  title,
}: {
  body?: string
  id: number
  title?: string
  spaceId?: number
  parentId?: number
}) {
  const response = await apiFetch({
    path: `/wp/v2/wikipages/${id}`,
    method: 'POST',
    data: {
      title,
      content: body,
      wikispaces: spaceId,
      parent: parentId,
    },
  })

  console.log(
    'created wikipage',
    normalizeWikipageResponse(response as WikipageResponse)
  )
  return normalizeWikipageResponse(response as WikipageResponse)
}

export const useUpdatePage = (
  options: Omit<UseMutationOptions, 'mutationFn'> = {}
) => {
  //@ts-ignore
  const { mutate, ...rest } = useMutation({
    ...options,
    mutationFn: updatePage,
  })

  return { updatePage: mutate, ...rest }
}

/**
 * Consumes the varibles object of the new meta properties
 * and updates the page meta in WordPress.
 */
export async function updatePageMeta({
  id,
  isOverview,
  width,
}: {
  id: number
  isOverview?: boolean
  width?: string
}) {
  const response = await apiFetch({
    path: `/wp/v2/wikipages/${id}`,
    method: 'POST',
    data: {
      meta: {
        isOverview,
        width,
      },
    },
  })

  console.log(
    'created wikipage',
    normalizeWikipageResponse(response as WikipageResponse)
  )
  return normalizeWikipageResponse(response as WikipageResponse)
}

export const useUpdatePageMeta = (
  options: Omit<UseMutationOptions, 'mutationFn'> = {}
) => {
  //@ts-ignore
  const { mutate, ...rest } = useMutation({
    ...options,
    mutationFn: updatePageMeta,
  })

  return { updatePageMeta: mutate, ...rest }
}
