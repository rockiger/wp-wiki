import {
  ActionIcon,
  Box,
  Container,
  createStyles,
  Flex,
  Group,
  Input,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconCircleX,
  IconSearch,
  IconSearchOff,
  IconWorldSearch,
  IconZoomExclamation,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'
import {
  Form,
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from 'react-router-dom'
import { fetchPages, useFetchPages } from '../api'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchTerm = url.searchParams.get('q')
  const pages = await fetchPages(searchTerm ?? '')
  // pages is still neeed, to use the loading state in the component
  return { searchTerm, pages }
}

export default function Search() {
  const { searchTerm } = useLoaderData() as Awaited<ReturnType<typeof loader>>
  const { data: pages, loading } = useFetchPages(searchTerm ?? '')
  const navigation = useNavigation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isTouched, setIsTouched] = useState(!!searchTerm)
  const submit = useSubmit()

  return (
    <Container py="xs">
      <Title>Search</Title>
      <Form
        action=""
        method="get"
        onSubmit={(ev) => submit(ev.currentTarget.form)}
        role="search"
      >
        <TextInput
          aria-label="search wiki"
          defaultValue={searchTerm ?? ''}
          icon={<IconSearch size="1rem" stroke={1.5} />}
          name="q"
          onChange={(ev) => {
            if (ev.target.value && !isTouched) setIsTouched(true)
          }}
          placeholder="Add keywords to search for pages"
          ref={inputRef}
          rightSection={
            isTouched ? (
              <ActionIcon
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = ''
                    submit(new FormData())
                    setIsTouched(false)
                  }
                }}
                variant="subtle"
              >
                <IconCircleX />
              </ActionIcon>
            ) : null
          }
          type="search"
        />
      </Form>

      {navigation.state === 'loading' || loading ? (
        <Box mt="xl">
          <Skeleton height={50} circle mb="xl" />
          <Skeleton height={8} radius="xl" />
          <Skeleton height={8} mt={6} radius="xl" />
          <Skeleton height={8} mt={6} width="70%" radius="xl" />
        </Box>
      ) : (
        (() => {
          if (!searchTerm) {
            return (
              <Flex align="center" direction="column" mt="6rem" mx="0">
                <IconWorldSearch color="gray" size={80} stroke={1} />
                <Text ta="center" fw={700} fz="lg" mt="xl">
                  Find what you need
                </Text>
                <Text ta="center" fz="sm" mt="xs" c="dimmed">
                  Search for keywords in the title, the content or the tags of
                  any page.
                </Text>
              </Flex>
            )
          }
          if (pages.length === 0) {
            return (
              <Flex align="center" direction="column" mt="6rem" mx="0">
                <IconZoomExclamation color="gray" size={80} stroke={1} />
                <Text ta="center" fw={700} fz="lg" mt="xl">
                  We couldn't find any results for your search.
                </Text>
                <Text ta="center" fz="sm" mt="xs" c="dimmed">
                  Try to search for different or less keywords or try to use
                  more common terms.
                </Text>
              </Flex>
            )
          }
          return (
            <Flex align="center" direction="column" mt="xl" mx="0">
              {pages.map((p) => (
                <Container
                  key={p.id}
                  px={0}
                  sx={{ display: 'block', marginBottom: '1rem', width: '100%' }}
                >
                  <Link to={`/page/${p.id}`}>
                    <Title order={3} size="h6">
                      {p.title}
                    </Title>
                  </Link>
                  <Text color="dimmed" size="sm">
                    {p.modified
                      ? Intl.DateTimeFormat().format(new Date(p.modified))
                      : ''}
                  </Text>
                  <Text
                    dangerouslySetInnerHTML={{ __html: p.excerpt ?? '' }}
                    my="0"
                    size="sm"
                    sx={{
                      '& > *:first-of-type': { marginTop: 0 },
                      '& > *:last-of-type': { marginBottom: 0 },
                    }}
                  />
                </Container>
              ))}
            </Flex>
          )
        })()
      )}
    </Container>
  )
}
