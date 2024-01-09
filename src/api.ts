// password: 'orJp IOvd nQKq PYck q2YO qJky'
import {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
  MutationHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import _ from 'lodash'
import { useCallback, useEffect } from 'react'
import reactPress from './reactPress'
import type {
  FulcrumPage,
  FulcrumSpace,
  TermNode,
  UpdateFulcrumPageInput,
} from './__generated__/graphql'

import apiFetch from '@wordpress/api-fetch'

apiFetch.use((options, next) => {
  const { headers = {} } = options

  // If an 'X-WP-Nonce' header (or any case-insensitive variation
  // thereof) was specified, no need to add a nonce header.
  for (const headerName in headers) {
    if (headerName.toLowerCase() === 'Authorization') {
      return next(options)
    }
  }
  const credentials = btoa('admin:pass')
  const auth = { Authorization: `Basic ${credentials}` }
  return next({
    ...options,
    headers: {
      ...headers,
      ...auth,
    },
  })
})

apiFetch.use(
  apiFetch.createRootURLMiddleware('http://carolinlaspe.test/wp-json/')
)

export const useFetchApi = () => {
  useEffect(() => {
    const fetchPages = async () => {
      const posts = await apiFetch({
        path: '/wp/v2/pages',
        referrerPolicy: 'unsafe-url',
      })
      console.log('posts', posts)
    }
    fetchPages()
  }, [])
}

const httpLink = createHttpLink({
  uri: import.meta.env.PROD
    ? `${reactPress?.api.graphql_url}`
    : 'http://wordlassian.local/graphql',
})

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      ...(import.meta.env.Prod
        ? { 'X-WP-Nonce': reactPress.api.nonce }
        : { Authorization: `Basic ${btoa('admin:pass')}` }),
    },
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export async function fetcher(slug: 'string', options = {}) {
  const url = `${reactPress.api.rest_url}wp/v2${slug}`
  if (import.meta.env.DEV) {
    const credentials = btoa('admin:pass')
    const auth = { Authorization: `Basic ${credentials}` }
    const response = await fetch(url, { ...options, headers: auth })
    const data = await response.json()
    return data
  }
  //! https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
  //! https://developer.wordpress.org/rest-api/using-the-rest-api/client-libraries/
}

//! Make it possible to make drafts and then turn them into published
export const CREATE_FULCRUM_PAGE = gql`
  mutation createFulcrumPage(
    $spaceId: ID!
    $title: String
    $body: String
    $parentId: ID
  ) {
    createFulcrumPage(
      input: {
        fulcrumSpaces: { nodes: { id: $spaceId } }
        title: $title
        content: $body
        parentId: $parentId
        status: PUBLISH
      }
    ) {
      clientMutationId
      fulcrumPage {
        author {
          node {
            avatar {
              url
            }
            firstName
            name
            nicename
            nickname
          }
        }
        content
        date
        id
        modified
        parentId
        status
        title
      }
    }
  }
`

/**
 * Consumes the properties of the new page and creates the
 * new page in WordPress. One of title or content is required.
 * @returns
 */
export async function postPage({
  spaceId = '',
  title = '',
  content = '',
  parentId = '',
}) {
  const response = await client.mutate({
    mutation: CREATE_FULCRUM_PAGE,
    variables: { spaceId, title, content, parentId },
  })

  return response.data.createFulcrumPage.fulcrumPage
}

export const GET_FULCRUM_SPACES = gql`
  query getFulcrumSpaces {
    fulcrumSpaces {
      edges {
        node {
          count
          description
          id
          name
          contentNodes {
            nodes {
              ... on FulcrumPage {
                id
                isOverview
                title
              }
            }
          }
        }
      }
    }
  }
`

function rewriteNodesFetchSpaces(edges: FulcrumSpace[]) {
  return edges?.map((edge) => {
    const { count, description, id, name } = edge
    return {
      //@ts-ignore
      overviewPage: edge.contentNodes?.nodes.find((n) => n?.isOverview) ?? '',
      count,
      description,
      id,
      name,
    }
  })
}

export type Spaces = ReturnType<typeof rewriteNodesFetchSpaces>
export async function fetchSpaces() {
  const response = await client.query({
    query: GET_FULCRUM_SPACES,
  })

  return rewriteNodesFetchSpaces(response.data.fulcrumSpaces.edges)
}
export const useFetchSpaces = () => {
  const { data, ...rest } = useQuery(GET_FULCRUM_SPACES, {})
  return {
    ...rest,
    data: data ? rewriteNodesFetchSpaces(data.fulcrumSpaces.nodes) : [],
  }
}

export const GET_FULCRUM_PAGE = gql`
  query FetchPage($id: ID!) {
    fulcrumPage(id: $id) {
      author {
        node {
          avatar {
            url
          }
          firstName
          name
          nicename
          nickname
        }
      }
      content
      date
      id
      isOverview
      modified
      parentId
      status
      title
      width
    }
  }
`

export const normalizeFetchPageData = (data: {
  fulcrumPage: FulcrumPage
}):
  | {
      author: {
        avatar: string
        name: string
      }
      body: string
      created: string
      id: string
      isOverview: boolean
      modified: string
      parentId: string
      status: string
      title: string
      width: string
    }
  | undefined => {
  if (!data?.fulcrumPage) return undefined
  const {
    author,
    content,
    date,
    id,
    isOverview,
    modified,
    parentId,
    status,
    title,
    width,
  } = data?.fulcrumPage

  const normalizedData = {
    author: {
      avatar: data.fulcrumPage.author?.node?.avatar?.url ?? '',
      name:
        _.get(author?.node, 'firstName') ??
        _.get(author?.node, 'nickname') ??
        _.get(author?.node, 'nicename') ??
        _.get(author?.node, 'name') ??
        '',
    },
    body: content ?? '',
    created: date ?? '',
    id: id ?? '',
    isOverview: isOverview ?? false,
    modified: modified ?? '',
    parentId: parentId ?? '',
    status: status ?? '',
    title: title ?? '',
    width: width ?? '',
  }
  return normalizedData
}
export async function fetchPage(id: string) {
  const response = await client.query({
    query: GET_FULCRUM_PAGE,
    variables: { id },
  })
  return normalizeFetchPageData(response.data)
}
export const useFetchPage = (id: string) => {
  const { data, ...rest } = useQuery(GET_FULCRUM_PAGE, {
    variables: { id },
  })
  return {
    ...rest,
    data: data ? normalizeFetchPageData(data) : undefined,
  }
}

export const GET_FULCRUM_PAGES = gql`
  query getFulcrumPages($search: String) {
    drafts: fulcrumPages(where: { status: DRAFT, search: $search }) {
      nodes {
        author {
          node {
            avatar {
              url
            }
            firstName
            name
            nicename
            nickname
          }
        }
        date
        id
        isOverview
        modified
        parentId
        status
        title
        terms(where: { taxonomies: FULCRUMSPACE }) {
          nodes {
            name
            id
            taxonomyName
          }
        }
      }
    }
    pendings: fulcrumPages(where: { status: PENDING, search: $search }) {
      nodes {
        author {
          node {
            avatar {
              url
            }
            firstName
            name
            nicename
            nickname
          }
        }
        date
        id
        isOverview
        modified
        parentId
        status
        title
        terms(where: { taxonomies: FULCRUMSPACE }) {
          nodes {
            name
            id
            taxonomyName
          }
        }
      }
    }
    privates: fulcrumPages(where: { status: PRIVATE, search: $search }) {
      nodes {
        author {
          node {
            avatar {
              url
            }
            firstName
            name
            nicename
            nickname
          }
        }
        date
        id
        isOverview
        modified
        parentId
        status
        title
        terms(where: { taxonomies: FULCRUMSPACE }) {
          nodes {
            name
            id
            taxonomyName
          }
        }
      }
    }
    publishes: fulcrumPages(where: { status: PUBLISH, search: $search }) {
      nodes {
        author {
          node {
            avatar {
              url
            }
            firstName
            name
            nicename
            nickname
          }
        }
        date
        id
        isOverview
        modified
        parentId
        status
        title
        terms(where: { taxonomies: FULCRUMSPACE }) {
          nodes {
            name
            id
            taxonomyName
          }
        }
      }
    }
  }
`
function rewriteNodesFetchPages(nodes: FulcrumPage[]) {
  return nodes.map((node) => {
    const {
      author,
      date,
      id,
      isOverview,
      modified,
      parentId,
      status,
      title,
      terms,
    } = node

    return {
      author: {
        avatar: node.author?.node?.avatar?.url,
        name:
          _.get(author?.node, 'firstName') ??
          _.get(author?.node, 'nickname') ??
          _.get(author?.node, 'nicename') ??
          _.get(author?.node, 'name') ??
          '',
      },
      created: date,
      id,
      isOverview,
      modified: modified,
      parentId,
      status,
      title,
      fulcrumSpace: terms?.nodes?.find(
        (n: TermNode) => n.taxonomyName === 'fulcrum_space'
      ),
    }
  })
}

export interface Page {
  author: {
    avatar: string
    name: string
  }
  body: string
  created: string
  excerpt: string
  id: string
  isOverview: boolean
  modified: string
  parentId: string
  status: string
  title: string
  fulcrumSpace:
    | { id: string; name: string; taxonomyName: 'fulcrum_space' }
    | undefined
}

export async function fetchPages(search = '') {
  const response = await client.query({
    query: GET_FULCRUM_PAGES,
    variables: { search },
  })
  const { drafts, pendings, privates, publishes } = response.data
  return _.concat(
    rewriteNodesFetchPages(drafts.nodes),
    rewriteNodesFetchPages(pendings.nodes),
    rewriteNodesFetchPages(privates.nodes),
    rewriteNodesFetchPages(publishes.nodes)
  )
}

export const useFetchPages = (search = '') => {
  const { data, ...rest } = useQuery(GET_FULCRUM_PAGES, {
    variables: { search },
  })
  return {
    ...rest,
    data: (data
      ? _.concat(
          rewriteNodesFetchPages(data.drafts.nodes),
          rewriteNodesFetchPages(data.pendings.nodes),
          rewriteNodesFetchPages(data.privates.nodes),
          rewriteNodesFetchPages(data.publishes.nodes)
        )
      : []) as Page[],
  }
}

export const UPDATE_FULCRUM_PAGE = gql`
  mutation UpdateFulcrumPage(
    $body: String
    $id: ID!
    $parentId: ID
    $spaceId: ID
    $status: PostStatusEnum = PRIVATE
    $title: String
  ) {
    updateFulcrumPage(
      input: {
        content: $body
        fulcrumSpaces: { nodes: { id: $spaceId } }
        id: $id
        parentId: $parentId
        status: $status
        title: $title
      }
    ) {
      fulcrumPage {
        modified
      }
    }
  }
`
/**
 * Consumes the varibles object of the new properties of the
 * new page and update the
 * page in WordPress.
 * @returns
 */
export async function updatePage(
  variables: UpdateFulcrumPageInput & { body?: string }
) {
  const response = await client.mutate({
    mutation: UPDATE_FULCRUM_PAGE,
    variables,
  })

  return response.data.updateFulcrumPage.fulcrumPage
}

export const useUpdatePage = (options: MutationHookOptions = {}) => {
  const [mutate, ...rest] = useMutation(UPDATE_FULCRUM_PAGE, options)

  const updateFile = useCallback(
    (options: MutationHookOptions) => {
      return mutate(options)
    },
    [mutate]
  )
  return [updateFile, ...rest] as const
}

export const DELETE_FULCRUM_PAGE = gql`
  mutation DeleteFulcrumPage($id: ID!) {
    deleteFulcrumPage(input: { id: $id }) {
      fulcrumPage {
        id
        title(format: RAW)
      }
    }
  }
`

export const UPDATE_FULCRUM_PAGE_META = gql`
  mutation UpdateFulcrumPageMeta(
    $id: ID!
    $isOverview: Boolean
    $width: String
  ) {
    updateFulcrumPageMeta(
      input: { id: $id, isOverview: $isOverview, width: $width }
    ) {
      isOverview
      width
    }
  }
`

/**
 * Consumes the varibles object of the new meta properties
 * and updates the page meta in WordPress.
 */
export async function updatePageMeta(variables: {
  id: string
  isOverview?: boolean
  width?: string
}) {
  const response = await client.mutate({
    mutation: UPDATE_FULCRUM_PAGE_META,
    variables,
  })

  return response.data.updateFulcrumPage.fulcrumPage
}

export const useUpdatePageMeta = (options: MutationHookOptions = {}) => {
  const [mutate, ...rest] = useMutation(UPDATE_FULCRUM_PAGE_META, options)

  const updatePageMeta = useCallback(
    (options: MutationHookOptions) => {
      return mutate(options)
    },
    [mutate]
  )
  return [updatePageMeta, ...rest] as const
}
