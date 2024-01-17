import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'
import Root, { loader as rootLoader } from './routes/root'
import ErrorPage from './error-page'
import Page, { loader as pageLoader } from './routes/page'
import Search, { loader as searchLoader } from './routes/search'
import { action as trashAction } from './routes/trash'
import Index from './routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Index /> },
          {
            path: 'page/:pageId',
            element: <Page />,
            loader: pageLoader,
          },
          {
            path: 'page/:pageId/trash',
            action: trashAction,
          },
          { path: 'search', element: <Search />, loader: searchLoader },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toast.Provider swipeDirection="right">
        <RouterProvider router={router} />
      </Toast.Provider>
    </QueryClientProvider>
  </React.StrictMode>
)
