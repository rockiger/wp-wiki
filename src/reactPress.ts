interface ReactPress {
  api: {
    nonce: string
    rest_url: string
    graphql_url: string
  }
  user: any
  usermeta: any
}
const reactPress: ReactPress = (window as any)?.reactPress || {
  api: { nonce: 'aeb0b52e44', rest_url: 'https://rockiger.com/wp-json/' },
}
// uncomment next line if you want the user to have admin rights
// reactPress.user.roles.push('administrator')
export default reactPress
export { reactPress }
