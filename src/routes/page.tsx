import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Title,
  TypographyStylesProvider,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
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
import { fetchPage, useFetchPage, useUpdatePage } from '../api'
import {
  Form,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
} from 'react-router-dom'
import { useEffect } from 'react'
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
import { IconSquareRoundedMinus } from '@tabler/icons-react'

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
   * Set the contentent of the editor
   */
  useEffect(() => {
    if (page && editor) {
      editor.commands.setContent(page?.body)
      console.log('useEffect')
    }
  }, [])

  return (
    <RichTextEditor editor={editor} sx={{ border: 'none' }}>
      {editor?.isEditable ? (
        <RichTextEditor.Toolbar
          sticky
          stickyOffset={56}
          sx={{ gap: '0.5rem', height: '3rem', justifyContent: 'flex-end' }}
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
                  page?.body.replaceAll('>\n', '>').replaceAll('<br />', '<br>')
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
        <RichTextEditor.Toolbar
          sx={{
            borderBottomColor: 'white',
            height: '3rem',
            justifyContent: 'flex-end',
          }}
        >
          <Group spacing="0">
            <ActionIcon
              onClick={() => {
                editor?.setEditable(true)
                editor?.commands.focus()
              }}
              size="lg"
            >
              <IconPencil />
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  size="lg"
                  sx={(theme) => ({
                    '&[data-expanded]': {
                      backgroundColor:
                        theme.colors[theme.primaryColor][
                          theme.fn.primaryShade()
                        ],
                      color: theme.white,
                    },
                  })}
                >
                  <IconDots />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Form method="post" action="trash">
                  <Menu.Item
                    color="red"
                    icon={<IconTrash size={14} />}
                    type="submit"
                  >
                    Delete
                  </Menu.Item>
                </Form>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </RichTextEditor.Toolbar>
      )}
      <Container size={'sm'} py="sm">
        <Title mb="lg">{page?.title}</Title>
        <TypographyStylesProvider>
          <RichTextEditor.Content />
        </TypographyStylesProvider>
      </Container>
    </RichTextEditor>
  )
}
