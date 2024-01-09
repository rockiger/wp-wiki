import { Menu, Transition } from '@headlessui/react'
import * as Select from '@radix-ui/react-select'
//@ts-ignore
import type { Level } from '@tiptap/core'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import SubScript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

import cx from 'classix'
import { Form, LoaderFunctionArgs, useParams } from 'react-router-dom'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import ArrowSplitVerticalIcon from 'mdi-react/ArrowSplitVerticalIcon'
import ChevronDownIcon from 'mdi-react/ChevronDownIcon'
import ChevronUpIcon from 'mdi-react/ChevronUpIcon'
import CodeJsonIcon from 'mdi-react/CodeJsonIcon'
import CodeTagsIcon from 'mdi-react/CodeTagsIcon'
import DeleteOutlineIcon from 'mdi-react/DeleteOutlineIcon'
import DotsHorizontalIcon from 'mdi-react/DotsHorizontalIcon'
import FormatBoldIcon from 'mdi-react/FormatBoldIcon'
import FormatItalicIcon from 'mdi-react/FormatItalicIcon'
import FormatListBulletedIcon from 'mdi-react/FormatListBulletedIcon'
import FormatListNumberedIcon from 'mdi-react/FormatListNumberedIcon'
import FormatPageBreakIcon from 'mdi-react/FormatPageBreakIcon'
import FormatQuoteOpenOutlineIcon from 'mdi-react/FormatQuoteOpenOutlineIcon'
import FormatStrikethroughIcon from 'mdi-react/FormatStrikethroughIcon'
import MinusIcon from 'mdi-react/MinusIcon'
import PencilOutlineIcon from 'mdi-react/PencilOutlineIcon'
import PencilOffOutlineIcon from 'mdi-react/PencilOffOutlineIcon'
import ContentSaveOutlineIcon from 'mdi-react/ContentSaveOutlineIcon'
import RedoIcon from 'mdi-react/RedoIcon'
import TableColumnPlusAfterIcon from 'mdi-react/TableColumnPlusAfterIcon'
import TableColumnRemoveIcon from 'mdi-react/TableColumnRemoveIcon'
import TablePlusIcon from 'mdi-react/TablePlusIcon'
import TableRowRemoveIcon from 'mdi-react/TableRowRemoveIcon'
import TableRowAddAfterIcon from 'mdi-react/TableRowAddAfterIcon'
import UndoIcon from 'mdi-react/UndoIcon'

import {
  fetchPage,
  useFetchPage,
  useFetchPages,
  useUpdatePage,
  useUpdatePageMeta,
  useFetchApi,
} from '../api'
import Breadcrumbs from '../components/Breadcrumbs'
import IconButton from '../components/IconButton'

import './page.css'
import type { RouteItem } from './root'

export async function loader({ params }: LoaderFunctionArgs) {
  // await fetchPage(params?.pageId ?? '')
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

  useFetchApi()
  /* GraphQL operations */
  const [updatePage] = useUpdatePage({
    onCompleted: (data) => refetch(),
    onError: (error) => alert(`Error while saving: ${error.message}`),
  })
  const [updatePageMeta] = useUpdatePageMeta({
    onError: (error) => alert(`Error while saving page meta ${error.message}`),
  })

  const [width, _setWidth] = useState(page?.width ?? 'standard')
  const setWidth = (width: string) => {
    _setWidth(width)
    updatePageMeta({ variables: { id: page?.id ?? '', width: width } })
  }

  /**
   * Compute breadcrumbs
   */
  const { data: pages } = useFetchPages()
  const breadcrumbs: RouteItem[] = useMemo(() => {
    function createBreadcrumbs(pageId: string): RouteItem[] {
      const page = pages.find((p) => p?.id === pageId)
      if (page?.isOverview) {
        return [
          {
            path: `/page/${page?.id}`,
            title: page.fulcrumSpace?.name ?? page?.title ?? '',
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
      editor.commands.setContent(page?.body)
    }
  }, [])

  return (
    <div className="pl-0">
      <div className={cx('flex border-b h-14 pl-5')}>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        {/* // Editor Toolbar */}
        <div className="EditorToolbar flex flex-wrap grow items-center justify-end min-w-fit pr-2 lg:pr-6 xl:mr-0">
          {editor?.isEditable ? (
            <>
              <ButtonGroup>
                <IconButton
                  size="md"
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
                  <TablePlusIcon />
                </IconButton>
                <IconButton
                  size="md"
                  aria-label="Insert table row"
                  disabled={!editor.can().addRowAfter()}
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                  title="Insert table row"
                >
                  <TableRowAddAfterIcon />
                </IconButton>
                <IconButton
                  size="md"
                  aria-label="Insert table column"
                  disabled={!editor.can().addColumnAfter()}
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  title="Insert table column"
                >
                  <TableColumnPlusAfterIcon />
                </IconButton>
                <IconButton
                  size="md"
                  aria-label="Delete table row"
                  disabled={!editor.can().deleteRow()}
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  title="Delete table row"
                >
                  <TableRowRemoveIcon />
                </IconButton>
                <IconButton
                  size="md"
                  aria-label="Delete table column"
                  disabled={!editor.can().deleteColumn()}
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  title="Delete table column"
                >
                  <TableColumnRemoveIcon />
                </IconButton>
              </ButtonGroup>
              <ButtonGroup>
                <ParagraphSelect editor={editor} size="md" />
              </ButtonGroup>
              <ButtonGroup>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                >
                  <FormatBoldIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                >
                  <FormatItalicIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  isActive={editor.isActive('strike')}
                >
                  <FormatStrikethroughIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  disabled={!editor.can().chain().focus().toggleCode().run()}
                  isActive={editor.isActive('code')}
                >
                  <CodeTagsIcon />
                </IconButton>
              </ButtonGroup>
              {/*   <button
                  onClick={() => editor.chain().focus().unsetAllMarks().run()}
                >
                  clear marks
                </button>
                <button
                  onClick={() => editor.chain().focus().clearNodes().run()}
                >
                  clear nodes
                </button> */}
              <Menu as="div" className="relative">
                <Menu.Button as="span">
                  {({ open }) => (
                    <IconButton size="md" isActive={open}>
                      <DotsHorizontalIcon />
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
                          <button
                            onClick={() =>
                              editor.chain().focus().setParagraph().run()
                            }
                            className={
                              editor.isActive('paragraph') ? 'is-active' : ''
                            }
                          >
                            paragraph
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 1 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h1
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 2 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h2
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 3 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h3
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 4 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 4 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h4
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 5 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 5 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h5
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 6 })
                                .run()
                            }
                            className={
                              editor.isActive('heading', { level: 6 })
                                ? 'is-active'
                                : ''
                            }
                          >
                            h6
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <ButtonGroup>
                <IconButton
                  size="md"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editor.isActive('bulletList')}
                >
                  <FormatListBulletedIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editor.isActive('orderedList')}
                >
                  <FormatListNumberedIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  isActive={editor.isActive('codeBlock')}
                >
                  <CodeJsonIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  isActive={editor.isActive('blockquote')}
                >
                  <FormatQuoteOpenOutlineIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  <MinusIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().setHardBreak().run()}
                >
                  <FormatPageBreakIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() =>
                    width === 'standard'
                      ? setWidth('wide')
                      : setWidth('standard')
                  }
                  isActive={width === 'wide'}
                >
                  <ArrowSplitVerticalIcon />
                </IconButton>
              </ButtonGroup>
              <ButtonGroup>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                >
                  <UndoIcon />
                </IconButton>
                <IconButton
                  size="md"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                >
                  <RedoIcon />
                </IconButton>
                {/* <button
                  onClick={() =>
                    editor.chain().focus().setColor('#958DF1').run()
                  }
                  className={
                    editor.isActive('textStyle', { color: '#958DF1' })
                      ? 'is-active'
                      : ''
                  }
                >
                  purple
                </button> */}
              </ButtonGroup>

              <ButtonGroup>
                <IconButton
                  size="md"
                  onClick={() => {
                    editor.setEditable(false)
                    editor?.commands.blur()
                  }}
                >
                  <PencilOffOutlineIcon />
                </IconButton>
                <IconButton
                  size="md"
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
                      updatePage({
                        variables: {
                          id: pageId!,
                          body: editor.getHTML(),
                        },
                      })
                    }
                  }}
                >
                  <ContentSaveOutlineIcon color="blue" />
                </IconButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <IconButton
                size="md"
                onClick={() => {
                  editor?.setEditable(true)
                  editor?.commands.focus()
                }}
              >
                <PencilOutlineIcon />
              </IconButton>
              <Menu as="div" className="relative">
                <Menu.Button as="span">
                  {({ open }) => (
                    <IconButton size="md" isActive={open}>
                      <DotsHorizontalIcon />
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
                              <DeleteOutlineIcon className="h-5 mr-2 w-5" />
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
      <div
        className="no-bg-scrollbar"
        id="scrollwrapper"
        style={{ height: 'calc(100vh - 4rem - 3.5rem)', overflowY: 'auto' }}
      >
        <div className="pt-12 px-5">
          <div
            className={cx(
              'ml-0 2xl:mx-auto',
              width === 'standard' && 'max-w-4xl'
            )}
          >
            <h1 className="mt-0 text-primary dark:text-primary-dark -mx-.5 break-words text-5xl font-display font-bold leading-tight">
              {page?.title}
            </h1>
            <EditorContent
              className="EditorContent p-0 prose prose-a:text-link"
              editor={editor}
            />
            {/* //? Tags */}
          </div>
        </div>
      </div>
    </div>
  )
}

function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="ButtonGroup border-r-2 flex px-2 first:pl-0 last:pr-0 last:border-r-0">
      {children}
    </div>
  )
}

const paragraphs = {
  p: 'Paragraph',
  1: 'Heading 1',
  2: 'Heading 2',
  3: 'Heading 3',
  4: 'Heading 4',
  5: 'Heading 5',
  6: 'Heading 6',
}
const ParagraphSelect = ({
  editor,
  size = 'lg',
  className = '',
}: {
  editor: Editor
  size: string
  className?: string
}) => {
  const getValue = useCallback(() => {
    if (editor.isActive('paragraph')) return 'p'
    else if (editor.isActive('heading', { level: 1 })) return '1'
    else if (editor.isActive('heading', { level: 2 })) return '2'
    else if (editor.isActive('heading', { level: 3 })) return '3'
    else if (editor.isActive('heading', { level: 4 })) return '4'
    else if (editor.isActive('heading', { level: 5 })) return '5'
    else if (editor.isActive('heading', { level: 6 })) return '6'
    return 'p'
  }, [editor])

  const onValueChange = useCallback(
    (value = '') => {
      if (value === 'p') {
        editor.chain().focus().setParagraph().run()
      } else {
        editor
          .chain()
          .focus()
          .setHeading({ level: parseInt(value) as Level })
          .run()
      }
    },
    [editor]
  )

  const value = getValue()
  return (
    <Select.Root onValueChange={onValueChange} value={value}>
      <Select.Trigger
        className={cx(
          'active:scale-95 transition-transform flex rounded-full items-center justify-center hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link pl-4 pr-3',
          'focus:bg-highlight focus:dark:bg-highlight-dark focus:text-link focus:dark:text-link-dark',
          'data-[state=open]:bg-highlight data-[state=open]:dark:bg-highlight-dark data-[state=open]:text-link data-[state=open]:dark:text-link-dark',
          size === 'lg' && 'h-12',
          size === 'md' && 'h-12 lg:h-10',
          size === 'sm' && 'h-12 lg:h-8',
          className
        )}
        aria-label="Food"
      >
        <Select.Value aria-label={value}>{paragraphs[value]}</Select.Value>
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="ParagraphMenu olg:-m-5 h-full shadow-nav dark:shadow-nav-dark lg:rounded-2xl bg-wash dark:bg-gray-95 w-full flex grow flex-col mt-2 w-fit"
          onCloseAutoFocus={(ev) => {
            ev.preventDefault()
            editor?.commands.focus()
          }}
          position="popper"
          style={{
            maxHeight: 'var(--radix-select-content-available-height)',
            minWidth: 'var(--radix-select-trigger-width)',
          }}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-[5px]">
            <Select.Group>
              <SelectItem currentValue={value} value="p">
                <p>Paragraph</p>
              </SelectItem>
              <SelectItem currentValue={value} value="1">
                <h1 className="font-bold text-5xl leading-none">Heading 1</h1>
              </SelectItem>
              <SelectItem currentValue={value} value="2">
                <h2 className="font-bold text-3xl">Heading 2</h2>
              </SelectItem>
              <SelectItem currentValue={value} value="3">
                <h3 className="font-bold text-2xl">Heading 3</h3>
              </SelectItem>
              <SelectItem currentValue={value} value="4">
                <h4 className="font-bold text-xl">Heading 4</h4>
              </SelectItem>
              <SelectItem currentValue={value} value="5">
                <h5 className="font-bold text-lg">Heading 5</h5>
              </SelectItem>
              <SelectItem currentValue={value} value="6">
                <h6 className="font-bold text-base">Heading 6</h6>
              </SelectItem>
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

const SelectItem = React.forwardRef(
  (
    {
      children,
      className,
      currentValue,
      value,
      ...props
    }: {
      children: React.ReactNode
      className?: string
      currentValue?: string
      value: string
      disabled?: boolean
    },
    forwardedRef: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <Select.Item
        className={cx(
          'leading-none text-violet11 rounded-[3px] flex items-center min-h-[60px] px-4 relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-primary/5 data-[highlighted]:dark:bg-primary-dark/5 ',
          currentValue === value &&
            'bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark',
          className
        )}
        {...props}
        ref={forwardedRef}
        value={value}
      >
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    )
  }
)
