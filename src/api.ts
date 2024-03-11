import reactPress from './reactPress'

import apiFetch from '@wordpress/api-fetch'
import { addQueryArgs } from '@wordpress/url'
import { WikipageResponse, WikispaceResponse } from './api-types'
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
apiFetch.use((options, next) => {
  const { headers = {} } = options
  return next({
    ...options,
    headers: {
      ...headers,
      ...(import.meta.env.PROD
        ? { 'X-WP-Nonce': reactPress.api.nonce }
        : { Authorization: `Basic ${btoa('admin:pass')}` }),
    },
  })
})

apiFetch.use(
  apiFetch.createRootURLMiddleware(
    import.meta.env.PROD
      ? `${reactPress?.api.rest_url}`
      : 'http://fulcrum.local/wp-json/'
  )
)

// apiFetch.use(apiFetch.mediaUploadMiddleware)

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
  return normalizeWikispaceResponseArray(response as WikispaceResponse[])
}

export const spacesQuery = () => ({
  queryKey: ['spaces'],
  queryFn: async () => fetchSpaces(),
})
export const useFetchSpaces = () => {
  return useQuery({ ...spacesQuery(), initialData: [] })
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
    title: status === 'private' ? title.rendered.slice(9) : title.rendered,
    wikispace,
    width,
  }
}
export type Page = ReturnType<typeof normalizeWikipageResponse>

export async function fetchPage(id: string) {
  const queryParams = {
    _fields:
      'author,content,date,excerpt,id,isOverview,modified,parent,status,title, wikispaces, wikispace, wikispaceId, width',
  }
  const response = await apiFetch({
    path: addQueryArgs(`/wp/v2/wikipages/${id}`, queryParams),
  })

  if (!response) return undefined

  return normalizeWikipageResponse(response as WikipageResponse)
}

export const pageQuery = (id: string) => ({
  queryKey: ['page', id],
  queryFn: async () => fetchPage(id),
})

export function useFetchPage(id: string) {
  return useQuery({ ...pageQuery(id) })
}

function normalizeWikipageResponseArray(nodes: WikipageResponse[]): Page[] {
  return nodes.map((node) => normalizeWikipageResponse(node))
}

export async function fetchPages(search = '') {
  const queryParams = {
    status: 'draft,publish,private,pending',
    per_page: '100',
    _fields:
      'author,content,date,excerpt,id,isOverview,modified,parent,status,title, wikispaces, wikispace, wikispaceId, raw_title',
    search,
  }
  const response = await apiFetch({
    path: addQueryArgs('/wp/v2/wikipages', queryParams),
  })

  if (!response) return []
  return normalizeWikipageResponseArray(response as WikipageResponse[])
}

export const pagesQuery = () => ({
  queryKey: ['pages'],
  queryFn: async () => fetchPages(),
})

export const useFetchPages = () => {
  return useQuery({ ...pagesQuery(), initialData: [] })
}

interface UpdatePageArgs {
  body?: string
  id: number
  title?: string
  spaceId?: number
  parentId?: number
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
}: UpdatePageArgs) {
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

  return normalizeWikipageResponse(response as WikipageResponse)
}

export const useUpdatePage = (
  options: Omit<UseMutationOptions, 'mutationFn'> = {}
) => {
  //@ts-ignore
  const { mutate, ...rest } = useMutation({
    ...options,
    mutationKey: ['updatePage'],
    //@ts-ignore
    mutationFn: (args: UpdatePageArgs) => updatePage(args),
  })

  return { updatePage: mutate, ...rest }
}

interface UpdatePageMetaArgs {
  id: number
  isOverview?: boolean
  width?: string
}

/**
 * Consumes the varibles object of the new meta properties
 * and updates the page meta in WordPress.
 */
export async function updatePageMeta({
  id,
  isOverview,
  width,
}: UpdatePageMetaArgs) {
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

  return normalizeWikipageResponse(response as WikipageResponse)
}

export const useUpdatePageMeta = (
  options: Omit<UseMutationOptions, 'mutationFn'> = {}
) => {
  //@ts-ignore
  const { mutate, ...rest } = useMutation({
    ...options,
    mutationKey: ['updatePageMeta'],
    //@ts-ignore
    mutationFn: (args: UpdatePageMetaArgs) => updatePageMeta(args),
  })

  return { updatePageMeta: mutate, ...rest }
}

export const uploadFile = async (file: File) => {
  console.log('uploadFile', file)
  const formData = new FormData()
  formData.append('file', file, file.name || file.type.replace('/', '.'))
  console.log(
    'formData',
    Array.from(formData.values()).map((value) => value)
  )

  const response = await apiFetch({
    path: '/wp/v2/media',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': 'attachment; filename="' + file.name + '"',
    },
  })
  //@ts-expect-error
  return response?.media_details?.sizes?.large?.source_url as string
}
