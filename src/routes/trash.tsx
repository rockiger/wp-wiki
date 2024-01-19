import { ActionFunctionArgs, redirect } from 'react-router-dom'
import { updatePage } from '../api'
import { QueryClient } from '@tanstack/react-query'

export const action =
  (queryClient: QueryClient) =>
  async ({ params }: ActionFunctionArgs) => {
    const result = await updatePage({
      id: parseInt(params.pageId ?? '0'),
      //! status: 'trash',
    })
    queryClient.invalidateQueries({ queryKey: ['pages'] })
    alert(`Page ${result?.title} moved to trash`)
    return redirect('/')
  }
