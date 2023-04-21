import { notifications } from '@mantine/notifications'
import { ActionFunctionArgs, redirect } from 'react-router-dom'
import { updatePage } from '../api'
import { PostStatusEnum } from '../__generated__/graphql'

export async function action({ params }: ActionFunctionArgs) {
  const result = await updatePage({
    id: params.pageId ?? '',
    status: PostStatusEnum.Trash,
  })
  notifications.show({
    title: 'Page deleted',
    message: `Page ${result?.title} moved to trash`,
    color: 'blue',
  })
  return redirect('/')
}
