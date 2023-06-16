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
import { ApolloProvider } from '@apollo/client'
import { client } from './api'
import Index from './routes'

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
    <ApolloProvider client={client}>
      <Toast.Provider swipeDirection="right">
        <RouterProvider router={router} />
      </Toast.Provider>
    </ApolloProvider>
  </React.StrictMode>
)
