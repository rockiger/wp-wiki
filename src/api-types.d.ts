export interface WikipageResponse {
  _links: Links
  author: number
  comment_status: string
  content: Content
  date_gmt: string
  date: string
  excerpt: Excerpt
  featured_media: number
  format: string
  guid: Guid
  id: number
  isOverview: boolean
  link: string
  menu_order: number
  meta: any[]
  modified_gmt: string
  modified: string
  parent: number
  ping_status: string
  slug: string
  status: string
  template: string
  title: Title
  type: string
  width: 'standard' | 'wide'
  wikispaces: number[]
  wikispace: { id: number; name: string }
}

export interface Guid {
  rendered: string
}

export interface Title {
  rendered: string
}

export interface Content {
  rendered: string
  protected: boolean
}

export interface Excerpt {
  rendered: string
  protected: boolean
}

export interface Links {
  self: Self[]
  collection: Collection[]
  about: About[]
  author: Author[]
  replies: Reply[]
  'version-history': VersionHistory[]
  'predecessor-version': PredecessorVersion[]
  'wp:attachment': WpAttachment[]
  'wp:term': WpTerm[]
  curies: Cury[]
}

export interface Self {
  href: string
}

export interface Collection {
  href: string
}

export interface About {
  href: string
}

export interface Author {
  embeddable: boolean
  href: string
}

export interface Reply {
  embeddable: boolean
  href: string
}

export interface VersionHistory {
  count: number
  href: string
}

export interface PredecessorVersion {
  id: number
  href: string
}

export interface WpAttachment {
  href: string
}

export interface WpTerm {
  taxonomy: string
  embeddable: boolean
  href: string
}

export interface Cury {
  name: string
  href: string
  templated: boolean
}

export interface WikispaceResponse {
  count: number
  description: string
  id: number
  link: string
  meta: any[]
  name: string
  slug: string
  taxonomy: string
}
