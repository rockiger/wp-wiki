import {
  ActionIcon,
  AppShell,
  Autocomplete,
  Box,
  Burger,
  Collapse,
  createStyles,
  Group,
  Header,
  Image,
  LoadingOverlay,
  MantineProvider,
  MediaQuery,
  Navbar,
  rem,
  ScrollArea,
  Text,
  useMantineTheme,
} from '@mantine/core'

import { Notifications } from '@mantine/notifications'
import { useRef, useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from 'react-router-dom'
import {
  fetchPages,
  fetchSpaces,
  Page,
  postPage,
  Space,
  useFetchPages,
  useFetchSpaces,
} from '../api'

export function loader() {
  fetchPages()
  fetchSpaces()
  return {}
}

type Pages = Page[]
type Spaces = Space[]

const useStyles = createStyles((theme) => ({
  active: {
    color: theme.colors.blue,
  },
  chevron: {
    transition: 'transform 200ms ease',
  },
  control: {
    borderRadius: theme.radius.md,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    display: 'block',
    margin: 2,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    textDecoration: 'none',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[2],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },
  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },

  inner: {
    height: rem(56),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  link: {
    display: 'block',
    borderRadius: theme.radius.sm,
    lineHeight: 1,
    marginRight: 2,
    padding: `${rem(8)} ${rem(12)}`,
    textDecoration: 'none',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  links: {
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  navlink: {
    borderRadius: theme.radius.md,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    display: 'block',
    marginLeft: rem(16),
    marginRight: 1,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    textDecoration: 'none',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },

  search: {},
}))

export default function Root() {
  const theme = useMantineTheme()
  const [opened, setOpened] = useState(false)
  const [autoCompleteValue, setAutoCompleteValue] = useState('')
  const autoCompleteRef = useRef<HTMLInputElement>(null)
  const { data: pages, refetch: pagesRefetch } = useFetchPages()
  const { data: spaces, refetch: spacesRefetch } = useFetchSpaces()
  const { pageId } = useParams()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { classes } = useStyles()

  const onClickNewButton = async (ev: React.MouseEvent) => {
    ev.preventDefault()

    const title = window.prompt('New Pagename')
    if (title) {
      try {
        const page = await postPage({
          title: title,
          parentId: pageId ?? spaces[0]['overviewPage'] ?? '',
          spaceId: spaces[0]['id'],
        })
        pagesRefetch()
        spacesRefetch()
        navigate(`/page/${page.id}?edit`)
      } catch (err) {
        console.error(err)
      }
    }
  }
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Oxygen, Cantarell, Ubuntu, "Fira Sans", "Droid Sans", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        fontSizes: {
          sm: '1rem',
          md: '1.125rem',
        },
        headings: {
          fontWeight: 400,
          sizes: {
            h1: {
              fontWeight: 400,
            },
            h2: {
              fontWeight: 400,
            },
            h3: {
              fontWeight: 400,
            },
          },
        },
      }}
    >
      <Notifications />
      <AppShell
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="md"
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 200, lg: 300 }}
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            })}
          >
            <Navbar.Section grow component={ScrollArea}>
              {pages
                .filter((page) => page.isOverview)
                .map((page) => (
                  <LinksGroup
                    key={page.id}
                    initiallyOpened
                    //@ts-ignore
                    pages={pages}
                    //@ts-ignore
                    rootPage={page}
                  />
                ))}
            </Navbar.Section>
            <Navbar.Section>Bottom</Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={56} className={classes.header} mb={120}>
            <div className={classes.inner}>
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Group align="start" spacing="xs">
                  <Burger
                    onClick={() => setOpened((o) => !o)}
                    opened={opened}
                    size="sm"
                    color={theme.colors.gray[6]}
                  />
                  <Link to="/">
                    <Image
                      src="/fulcrum.svg"
                      alt="Fulcrum Logo"
                      height="sm"
                      width="sm"
                    />
                  </Link>
                </Group>
              </MediaQuery>
              <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                <Group spacing="xs">
                  <Link to="/">
                    <Image
                      src="/fulcrum_name.svg"
                      alt="Fulcrum Logo"
                      height="2.125rem"
                    />
                  </Link>
                </Group>
              </MediaQuery>

              <Group>
                <Group ml={50} spacing={5} className={classes.links}>
                  {/* Put links or menus in here */}
                </Group>

                <ActionIcon
                  color="blue"
                  onClick={onClickNewButton}
                  variant="filled"
                  h="2.125rem"
                  w="2.125rem"
                >
                  <IconPlus size="1.5rem" />
                </ActionIcon>
                <Form
                  method="get"
                  action="search"
                  onSubmit={() => autoCompleteRef.current?.blur()}
                >
                  <Autocomplete
                    aria-label="search pages"
                    className={classes.search}
                    data={pages.map((page) => ({
                      id: page.id,
                      value: page.title ?? '',
                    }))}
                    icon={<IconSearch size="1rem" stroke={1.5} />}
                    name="q"
                    onChange={setAutoCompleteValue}
                    onItemSubmit={(item) => {
                      setAutoCompleteValue('')
                      autoCompleteRef.current?.blur()
                      navigate(`/page/${item.id}`)
                    }}
                    placeholder="Search"
                    ref={autoCompleteRef}
                    value={autoCompleteValue}
                  />
                </Form>
              </Group>
            </div>
          </Header>
        }
        sx={(theme) => {
          console.log(theme)
          return {
            main: {
              paddingBottom: 'var(--mantine-footer-height)',
              paddingLeft: 'var(--mantine-navbar-width)',
              paddingRight: 'var(--mantine-aside-width)',
              paddingTop: 'var(--mantine-header-height)',
            },
          }
        }}
      >
        {navigation.state === 'loading' ? (
          <Box h={'60vh'} pos={'relative'}>
            <LoadingOverlay overlayOpacity={0} visible />
          </Box>
        ) : (
          <Outlet />
        )}
      </AppShell>
    </MantineProvider>
  )
}

interface HeaderSearchProps {
  links: { link: string; label: string }[]
}

interface LinksGroupProps {
  initiallyOpened?: boolean
  pages: Pages
  rootPage: Page
}

export function LinksGroup({
  initiallyOpened,
  pages,
  rootPage,
}: LinksGroupProps) {
  const { classes, theme } = useStyles()
  const [opened, setOpened] = useState(initiallyOpened || false)
  const ChevronIcon = theme.dir === 'ltr' ? IconChevronRight : IconChevronLeft
  const children = pages?.filter((page) => page?.parentId === rootPage?.id)
  const hasChildren = !!children.length

  if (hasChildren) {
    return (
      <>
        <NavLink
          className={({ isActive, isPending }) =>
            `${classes.control} ${isActive ? classes.active : ''}`
          }
          to={`/page/${rootPage?.id}`}
          key={rootPage?.id}
        >
          <Group position="apart" spacing={0}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>{rootPage?.title}</Box>
            </Box>
            {hasChildren && (
              <ActionIcon
                color="dark"
                onClick={(ev) => {
                  setOpened((o) => !o)
                  ev.stopPropagation()
                  ev.preventDefault()
                }}
              >
                <ChevronIcon
                  className={classes.chevron}
                  size="1rem"
                  stroke={1.5}
                  style={{
                    transform: opened
                      ? `rotate(${theme.dir === 'rtl' ? -90 : 90}deg)`
                      : 'none',
                  }}
                />
              </ActionIcon>
            )}
          </Group>
        </NavLink>
        <Collapse in={opened}>
          {children.map((page) => (
            <LinksGroup key={page?.id} pages={pages} rootPage={page} />
          ))}
        </Collapse>
      </>
    )
  }
  return (
    <NavLink
      className={({ isActive, isPending }) =>
        `${classes.navlink} ${isActive ? classes.active : ''}`
      }
      to={`/page/${rootPage?.id}`}
      key={rootPage?.id}
    >
      {rootPage?.title}
    </NavLink>
  )
}
