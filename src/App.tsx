import React from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'
import Root, { loader as rootLoader } from './routes/root'
import ErrorPage from './error-page'
import Page, { loader as pageLoader } from './routes/page'
import Search, { loader as searchLoader } from './routes/search'
import { action as trashAction } from './routes/trash'
import Index from './routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NextUIProvider } from '@nextui-org/react'
import './index.css'
import Login from './routes/login'
import NoRights from './routes/no-rights'

const queryClient = new QueryClient()

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader(queryClient),
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Index /> },
          {
            path: 'page/:pageId',
            element: <Page />,
            loader: pageLoader(queryClient),
          },
          {
            path: 'page/:pageId/trash',
            action: trashAction(queryClient),
          },
          { path: 'search', element: <Search />, loader: searchLoader },
        ],
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/rights', element: <NoRights /> },
])

export default function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider navigate={router.navigate}>
          <Toast.Provider swipeDirection="right">
            <RouterProvider router={router} />
          </Toast.Provider>
        </NextUIProvider>
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </React.StrictMode>
  )
}
