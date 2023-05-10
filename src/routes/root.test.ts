//@ts-nocheck
import { describe, it, expect } from 'vitest'

import { createRouteTrees } from './root'

describe('createRouteTrees', () => {
  it('should create an empty array if there are no pages', () => {
    expect(createRouteTrees([], [])).toEqual([])
    expect(
      createRouteTrees(
        [],
        [
          {
            overviewPage: 'cG9zdDoxNjg0',
            count: 1,
            description: null,
            id: 'dGVybToxMjI=',
            name: 'Space 1',
          },
        ]
      )
    ).toEqual([])
  })

  it('should create an array with one route item', () => {
    const pages = [
      {
        id: 'cG9zdDoxOTAw',
        isOverview: false,
        isStarred: false,
        parentId: 'cG9zdDoxNjg0',
        status: 'draft',
        title: 'Entrepreneurship',
      },
      {
        id: 'cG9zdDoxOTAw',
        isOverview: false,
        isStarred: false,
        parentId: 'cG9zdDoxNjg0',
        status: 'draft',
        title: 'Page 1',
      },
      {
        id: 'cG9zdDoxOTAw',
        isOverview: false,
        isStarred: false,
        parentId: 'cG9zdDoxNjg0',
        status: 'published',
        title: 'Page 2',
      },
      {
        id: 'cG9zdDoxNjg0',
        isOverview: true,
        isStarred: false,
        parentId: null,
        status: 'publish',
        title: 'Overview',
      },
    ]

    const spaces = [
      {
        overviewPage: 'cG9zdDoxNjg0',
        count: 1,
        description: null,
        id: 'dGVybToxMjI=',
        name: 'Space 1',
      },
    ]

    const tree = [
      {
        path: '/page/cG9zdDoxNjg0',
        title: 'Space 1',
        isDraft: false,
        routes: [
          {
            path: '/page/cG9zdDoxOTAw',
            isDraft: true,
            title: 'Entrepreneurship',
            routes: [],
          },
          {
            path: '/page/cG9zdDoxOTAw',
            isDraft: true,
            title: 'Page 1',
            routes: [],
          },
          {
            path: '/page/cG9zdDoxOTAw',
            isDraft: false,
            title: 'Page 2',
            routes: [],
          },
        ],
      },
    ]
    expect(createRouteTrees(pages, spaces)).toEqual(tree)
  })

  it('should create an array with two route items', () => {
    const pages = [
      {
        id: 'cG9zdDoxOTAw',
        isOverview: false,
        isStarred: false,
        parentId: 'cG9zdDoxNjg0',
        status: 'draft',
        title: 'Page 1',
      },
      {
        id: 'cG9zdDoxOTAw',
        isOverview: false,
        isStarred: false,
        parentId: 'cG9zdDoxNjg0',
        status: 'published',
        title: 'Page 2',
      },
      {
        id: 'cG9zdDoxneosnw',
        isOverview: false,
        isStarred: false,
        parentId: '123456',
        status: 'draft',
        title: 'Page 3',
      },
      {
        id: 'cG9zdDeuaeuTAw',
        isOverview: false,
        isStarred: false,
        parentId: '123456',
        status: 'published',
        title: 'Page 4',
      },
      {
        id: 'cG9zdDoxNjg0',
        isOverview: true,
        isStarred: false,
        parentId: null,
        status: 'publish',
        title: 'Overview',
      },
      {
        id: '123456',
        isOverview: true,
        isStarred: false,
        parentId: null,
        status: 'publish',
        title: 'Overview',
      },
    ]

    const spaces = [
      {
        overviewPage: 'cG9zdDoxNjg0',
        count: 1,
        description: null,
        id: 'dGVybToxMjI=',
        name: 'Space 1',
      },
      {
        overviewPage: '123456',
        count: 1,
        description: null,
        id: 'deVybToxMjI=',
        name: 'Space 2',
      },
    ]

    const tree = [
      {
        path: '/page/cG9zdDoxNjg0',
        title: 'Space 1',
        isDraft: false,
        routes: [
          {
            path: '/page/cG9zdDoxOTAw',
            isDraft: true,
            title: 'Page 1',
            routes: [],
          },
          {
            path: '/page/cG9zdDoxOTAw',
            isDraft: false,
            title: 'Page 2',
            routes: [],
          },
        ],
      },
      {
        path: '/page/123456',
        title: 'Space 2',
        isDraft: false,
        routes: [
          {
            path: '/page/cG9zdDoxneosnw',
            isDraft: true,
            title: 'Page 3',
            routes: [],
          },
          {
            path: '/page/cG9zdDeuaeuTAw',
            isDraft: false,
            title: 'Page 4',
            routes: [],
          },
        ],
      },
    ]
    expect(createRouteTrees(pages, spaces)).toEqual(tree)
  })
})
