import { Menu, Transition } from '@headlessui/react'
import { notifications } from '@mantine/notifications'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { EditorContent, useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Superscript from '@tiptap/extension-superscript'
import SubScript from '@tiptap/extension-subscript'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import {
  Page as PageType,
  Spaces,
  fetchPage,
  useFetchPage,
  useFetchPages,
  useFetchSpaces,
  useUpdatePage,
} from '../api'
import {
  Form,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
} from 'react-router-dom'
import { Fragment, useEffect, useMemo } from 'react'
import {
  IconColumnInsertRight,
  IconDeviceFloppy,
  IconDots,
  IconPencil,
  IconRowInsertBottom,
  IconSquareMinus,
  IconSquareRounded,
  IconTable,
  IconTrash,
} from '@tabler/icons-react'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

import './page.css'
import Breadcrumbs from '../components/Breadcrumbs'
import IconButton from '../components/IconButton'
import { IconPencilOff } from '@tabler/icons-react'

import type { RouteItem } from './root'

export async function loader({ params }: LoaderFunctionArgs) {
  await fetchPage(params?.pageId ?? '')
  return {}
}

export default function Page() {
  const { pageId } = useParams()
  const { data: page, refetch } = useFetchPage(pageId ?? '')
  const content = page?.body ?? ''
  const editor = useEditor({
    content,
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({
        resizable: true,
      }),
      TableCell,
      TableRow,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
  })

  /* GraphQL operations */
  const [updatePage] = useUpdatePage({
    onCompleted: (data) => refetch(),
    onError: (error) =>
      notifications.show({
        title: 'Error while saving',
        message: error.message,
        color: 'red',
      }),
  })

  /**
   * Compute breadcrumbs
   */
  const { data: spaces } = useFetchSpaces()
  const { data: pages } = useFetchPages()
  const breadcrumbs: RouteItem[] = useMemo(() => {
    function createBreadcrumbs(pageId: string): RouteItem[] {
      const page = pages.find((p) => p?.id === pageId)
      if (page?.isOverview) {
        const space = spaces.find((s) => s.overviewPage === page?.id)
        return [
          {
            path: `/page/${page?.id}`,
            title: space?.name ?? '',
          },
        ]
      }
      if (!page?.parentId) {
        return [{ path: `/page/${page?.id}`, title: page?.title ?? '' }]
      }
      if (page?.parentId) {
        return [
          ...createBreadcrumbs(page?.parentId),
          { path: `/page/${page?.id}`, title: page?.title ?? '' },
        ]
      }
      return []
    }

    // Show the space name
    if (page?.isOverview && pages && spaces) {
      return createBreadcrumbs(page?.id)
    }
    // Show the title
    if (page?.parentId && pages && spaces) {
      return createBreadcrumbs(page.parentId)
    }
    return []
  }, [page, pages, spaces])

  /**
   * Set the contentent of the editor
   */
  useEffect(() => {
    if (page && editor) {
      editor.commands.setContent(page?.body)
      console.log('useEffect')
    }
  }, [])

  return (
    <div className="pl-0">
      <div className="px-5 sm:px-12">
        <div className="max-w-7xl mx-auto">
          {/* {editor?.isEditable ? (
            <RichTextEditor.Toolbar
              sticky
              stickyOffset={56}
              sx={{
                gap: '0.5rem',
                height: '3rem',
                justifyContent: 'flex-end',
              }}
            >
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Control
                  aria-label="Insert table"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                  title="Insert table"
                >
                  <IconTable size="1rem" />
                </RichTextEditor.Control>
                <RichTextEditor.Control
                  aria-label="Insert table row"
                  disabled={!editor.can().addRowAfter()}
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                  title="Insert table row"
                >
                  <IconRowInsertBottom size="1rem" />
                </RichTextEditor.Control>
                <RichTextEditor.Control
                  aria-label="Insert table column"
                  disabled={!editor.can().addColumnAfter()}
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  title="Insert table column"
                >
                  <IconColumnInsertRight size="1rem" />
                </RichTextEditor.Control>
                <RichTextEditor.Control
                  aria-aria-label="Delete table row"
                  disabled={!editor.can().deleteRow()}
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  title="Delete table row"
                >
                  <IconSquareMinus size="1rem" />
                </RichTextEditor.Control>
                <RichTextEditor.Control
                  aria-aria-label="Delete table column"
                  disabled={!editor.can().deleteColumn()}
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  title="Delete table column"
                >
                  <IconSquareRoundedMinus size="1rem" />
                </RichTextEditor.Control>
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Control
                  onClick={() => {
                    editor.setEditable(false)
                    editor?.commands.blur()

                    if (
                      editor.getHTML() !==
                      // WordPress transform the HTML content,
                      // so we have to undo that.
                      page?.body
                        .replaceAll('>\n', '>')
                        .replaceAll('<br />', '<br>')
                    ) {
                      console.log('update body')
                      updatePage({
                        variables: { id: pageId!, body: editor.getHTML() },
                      })
                    }
                  }}
                >
                  <IconDeviceFloppy color="blue" stroke={1.5} size="1rem" />
                </RichTextEditor.Control>
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
          ) : (
          )} */}
          {/* <Container size={'sm'} py="sm">
              <Title mb="lg">{page?.title}</Title>
              <TypographyStylesProvider>
                <RichTextEditor.Content />
              </TypographyStylesProvider>
                      </Container> */}
          <div className="px-5 sm:px-12 pt-3.5">
            <div className="max-w-4xl ml-0 2xl:mx-auto">
              <div className="flex">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <div className="flex-1"></div>
                {/* // Editor Toolbar */}
                <div className="flex -mr-8 xl:mr-0">
                  {editor?.isEditable ? (
                    <>
                      <IconButton
                        onClick={() => {
                          editor.setEditable(false)
                          editor?.commands.blur()
                        }}
                      >
                        <IconPencilOff />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          editor.setEditable(false)
                          editor?.commands.blur()

                          if (
                            editor.getHTML() !==
                            // WordPress transform the HTML content,
                            // so we have to undo that.
                            page?.body
                              .replaceAll('>\n', '>')
                              .replaceAll('<br />', '<br>')
                          ) {
                            console.log('update body')
                            updatePage({
                              variables: {
                                id: pageId!,
                                body: editor.getHTML(),
                              },
                            })
                          }
                        }}
                      >
                        <IconDeviceFloppy color="blue" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => {
                          editor?.setEditable(true)
                          editor?.commands.focus()
                        }}
                      >
                        <IconPencil />
                      </IconButton>
                      <Menu as="div" className="relative">
                        <Menu.Button as="span">
                          {({ open }) => (
                            <IconButton isActive={open}>
                              <IconDots />
                            </IconButton>
                          )}
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1 ">
                              <Menu.Item>
                                {({ active }) => (
                                  <Form method="post" action="trash">
                                    <button
                                      className={`${
                                        active
                                          ? 'bg-gray-5 dark:bg-gray-80'
                                          : 'text-gray-900'
                                      } group flex w-full items-center rounded-md px-2 py-2`}
                                    >
                                      <IconTrash className="h-5 mr-2 w-5" />
                                      Delete
                                    </button>
                                  </Form>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  )}
                </div>
              </div>
              <h1 className="mt-0 text-primary dark:text-primary-dark -mx-.5 break-words text-5xl font-display font-bold leading-tight">
                {page?.title}
              </h1>
              <EditorContent className="p-0" editor={editor} />
              {/* //! Tags */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
