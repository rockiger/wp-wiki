import { BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView, useBlockNote } from '@blocknote/react'
import '@blocknote/react/style.css'
import './page.css'

import cx from 'classix'
import { LoaderFunctionArgs, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  TbEdit as EditIcon,
  TbEditOff as EditOffIcon,
  TbDeviceFloppy as SaveIcon,
  TbViewportNarrow as ViewportNarrowIcon,
  TbViewportWide as ViewportWideIcon,
} from 'react-icons/tb'

import {
  Page as PageType,
  pageQuery,
  //! uploadFile,
  useFetchPage,
  useFetchPages,
  useUpdatePage,
  useUpdatePageMeta,
} from '../api'
import Breadcrumbs from '../components/Breadcrumbs'

// import './page.css'
import type { RouteItem } from '../components/Sidebar'
import { QueryClient } from '@tanstack/react-query'
import { Button, Chip } from '@nextui-org/react'

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const query = pageQuery(params?.pageId ?? '')

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    )
  }

export default function Page() {
  const { pageId } = useParams()
  const { data } = useFetchPage(pageId ?? '')
  const page = data as PageType

  const [isEditable, setIsEditable] = useState(false)

  const editor: BlockNoteEditor = useBlockNote({
    editable: false,
    //! uploadFile: uploadFile,
  })
  const { updatePage } = useUpdatePage({
    //! update pages after saving
    onError: (error) => alert(`Error while saving: ${error.message}`),
  })
  const { updatePageMeta } = useUpdatePageMeta({
    onError: (error) => alert(`Error while saving page meta ${error.message}`),
  })

  const [width, _setWidth] = useState(page?.width ?? 'standard')
  const setWidth = (width: 'wide' | 'standard') => {
    _setWidth(width)
    //@ts-ignore
    updatePageMeta({ id: page?.id ?? 0, width: width })
  }

  /**
   * Compute breadcrumbs
   */
  const { data: pages } = useFetchPages()
  const breadcrumbs: RouteItem[] = useMemo(() => {
    function createBreadcrumbs(pageId: number): RouteItem[] {
      const page = pages?.find((p) => p?.id === pageId)
      if (page?.isOverview) {
        return [
          {
            id: page.id.toString(),
            path: `/page/${page.id}`,
            title: page.wikispace?.name ?? page?.title ?? '',
          },
        ]
      }
      if (!page?.parentId) {
        return [
          {
            id: page?.id.toString() ?? '',
            path: `/page/${page?.id}`,
            title: page?.title ?? '',
          },
        ]
      }
      if (page?.parentId) {
        return [
          ...createBreadcrumbs(page?.parentId),
          {
            id: page?.id.toString(),
            path: `/page/${page?.id}`,
            title: page?.title ?? '',
          },
        ]
      }
      return []
    }

    // Show the space name
    if (page?.isOverview && pages) {
      return createBreadcrumbs(page?.id)
    }
    // Show the title
    if (page?.parentId && pages) {
      return createBreadcrumbs(page.parentId)
    }
    return []
  }, [page, pages])

  /**
   * Set the contentent of the editor
   */
  useEffect(() => {
    if (page && editor) {
      const fn = async () => {
        const contentBlocks = await editor.tryParseHTMLToBlocks(page.body)
        editor.replaceBlocks(editor.topLevelBlocks, contentBlocks)
      }
      setTimeout(fn, 0)
      _setWidth(page.width)
    }
  }, [page, editor])

  return (
    <article
      className="no-bg-scrollbar pb-4"
      id="scrollwrapper"
      key={pageId}
      style={{ height: 'calc(100vh - 4rem - 2rem)', overflowY: 'auto' }}
    >
      <div
        className={cx(
          'ml-0 2xl:mx-auto',
          width === 'wide' ? 'max-w-full' : 'max-w-4xl'
        )}
      >
        <div className="flex h-8 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Breadcrumbs
              breadcrumbs={[
                ...breadcrumbs,
                {
                  title: page.title,
                  id: page.id.toString(),
                  path: `/page/${page.id}`,
                },
              ]}
              className="pl-6"
            />
            {isEditable && (
              <Chip color="success" variant="flat">
                Edit Mode
              </Chip>
            )}
          </div>
          {isEditable ? (
            <div className="flex gap-1">
              <Button
                aria-label="Revert page without saving"
                isIconOnly
                onPress={() => {
                  width === 'standard' ? setWidth('wide') : setWidth('standard')
                }}
                size="sm"
                variant="light"
              >
                {width === 'wide' ? (
                  <ViewportNarrowIcon size={22} strokeWidth={1} />
                ) : (
                  <ViewportWideIcon size={22} strokeWidth={1} />
                )}
              </Button>
              <Button
                aria-label="Revert page without saving"
                isIconOnly
                onPress={() => {
                  setIsEditable(false)
                  editor.isEditable = false
                }}
                size="sm"
                variant="light"
              >
                <EditOffIcon size={22} strokeWidth={1} />
              </Button>
              <Button
                aria-label="Save page"
                isIconOnly
                onPress={async () => {
                  setIsEditable(false)
                  editor.isEditable = false
                  const body = await editor.blocksToHTMLLossy()
                  updatePage({
                    id: parseInt(pageId!),
                    body,
                  })
                }}
                size="sm"
                variant="light"
              >
                <SaveIcon size={22} strokeWidth={1} />
              </Button>
            </div>
          ) : (
            <div>
              <Button
                aria-label="Edit page"
                isIconOnly
                onPress={() => {
                  setIsEditable(true)
                  editor.isEditable = true
                  editor.focus()
                }}
                size="sm"
                variant="light"
              >
                <EditIcon size={22} strokeWidth={1} />
              </Button>
            </div>
          )}
        </div>
        <h1 className="mt-0 break-words text-5xl leading-tight pl-6">
          {page?.title}
        </h1>
        <BlockNoteView editor={editor} className="pl-6" />
        <div className="pl-6" id="page-footer">
          <div className="text-default-500 text-sm">
            Last updated on{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
              new Date(page.modified)
            )}
          </div>
        </div>
        {/* //? Tags */}
      </div>
    </article>
  )
}
