import { Link, useRouteError } from 'react-router-dom'
import image from './assets/404.svg'

export default function ErrorPage() {
  const error = useRouteError() as { message?: string; statusText?: string }
  console.warn(error)
  return (
    <div className="py-[80rem]">
      <div className="grid grid-cols-1 gap-10 mb-16 md:grid-cols-3 md:gap-20">
        <img src={image} className="md:hidden" />
        <div>
          <h1 className="font-black text-[32rem] md:text-[34rem]">
            Something is not right...
          </h1>
          <p className="text-3xl text-slate-400">
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </p>
          <Link to="/">Get back to home page</Link>
        </div>
        <img src={image} className="hidden md:block" />
      </div>
    </div>
  )
}
