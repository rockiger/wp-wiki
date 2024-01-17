import { ActionFunctionArgs, redirect } from 'react-router-dom'
import { updatePage } from '../api'

export async function action({ params }: ActionFunctionArgs) {
  const result = await updatePage({
    id: parseInt(params.pageId ?? '0'),
    //! status: 'trash',
  })
  alert(`Page ${result?.title} moved to trash`)
  return redirect('/')
}
