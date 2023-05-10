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
import { useCallback } from 'react'
import reactPress from './reactPress'
import {
  FulcrumPage,
  FulcrumSpace,
  UpdateFulcrumPageInput,
} from './__generated__/graphql'

const httpLink = createHttpLink({
  uri: import.meta.env.PROD
    ? `${reactPress?.user?.data?.user_url}/graphql`
    : 'http://rockiger.local/graphql', // live site needs rockiger.com
})

const authLink = setContext((_, { headers }) => {
  const credentials = btoa('admin:pass')

  // return the headers to the context so httpLink can read them

  return {
    headers: {
      ...headers,

      Authorization: `Basic ${credentials}`, // Use for tests
      // 'X-WP-Nonce': reactPress.api.nonce, // Use for staging/live site
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
      }
    ) {
      clientMutationId
      fulcrumPage {
        acfFulcrumPage {
          isoverview
          isstarred
        }
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
      nodes {
        acfFulcrumSpace {
          overviewPage
        }
        count
        description
        id
        name
      }
    }
  }
`

function rewriteNodesFetchSpaces(nodes: FulcrumSpace[]) {
  return nodes.map((node) => {
    const { count, description, id, name } = node
    return {
      overviewPage: node.acfFulcrumSpace?.overviewPage,
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
  return rewriteNodesFetchSpaces(response.data.fulcrumSpaces.nodes)
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
      acfFulcrumPage {
        isoverview
        isstarred
      }
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
      isStarred: boolean
      modified: string
      parentId: string
      status: string
      title: string
    }
  | undefined => {
  if (!data?.fulcrumPage) return undefined
  const {
    acfFulcrumPage,
    author,
    content,
    date,
    id,
    modified,
    parentId,
    status,
    title,
  } = data?.fulcrumPage
  const isOverview = !!acfFulcrumPage?.isoverview
  const isStarred = !!acfFulcrumPage?.isstarred

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
    isStarred: isStarred ?? false,
    modified: modified ?? '',
    parentId: parentId ?? '',
    status: status ?? '',
    title: title ?? '',
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
        acfFulcrumPage {
          isoverview
          isstarred
        }
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
        modified
        parentId
        status
        title
      }
    }
    pendings: fulcrumPages(where: { status: PENDING, search: $search }) {
      nodes {
        acfFulcrumPage {
          isoverview
          isstarred
        }
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
        modified
        parentId
        status
        title
      }
    }
    privates: fulcrumPages(where: { status: PRIVATE, search: $search }) {
      nodes {
        acfFulcrumPage {
          isoverview
          isstarred
        }
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
        modified
        parentId
        status
        title
      }
    }
    publishes: fulcrumPages(where: { status: PUBLISH, search: $search }) {
      nodes {
        acfFulcrumPage {
          isoverview
          isstarred
        }
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
        modified
        parentId
        status
        title
      }
    }
  }
`
function rewriteNodesFetchPages(nodes: FulcrumPage[]) {
  return nodes.map((node) => {
    const {
      acfFulcrumPage = {},
      author,
      date,
      id,
      modified,
      parentId,
      status,
      title,
    } = node
    const isOverview = !!acfFulcrumPage?.isoverview
    const isStarred = !!acfFulcrumPage?.isstarred

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
      isStarred,
      modified: modified,
      parentId,
      status,
      title,
    }
  })
}

export type Page = ReturnType<typeof normalizeFetchPageData>

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
