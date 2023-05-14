import cx from 'classix'
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useCallback,
  useState,
} from 'react'

import React, { useEffect, useRef } from 'react'
import { isEmpty } from 'lodash'

import SearchAutocomplete from './SearchAutocomplete'
import styles from './search.module.css'
import IconButton from './IconButton'
import { Page } from '../api'

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import SearchIcon from 'mdi-react/SearchIcon'
import CloseIcon from 'mdi-react/CloseIcon'

interface SearchProps {
  clearSearch?: () => void

  submit?: () => void
  isSearchFieldActive: boolean
  pages: Page[]
  searchValue: string
  setSearchValue: (value: string) => void
  toggleSearch: (action?: 'open' | 'close') => void
}
export const Search = React.forwardRef(
  (
    {
      clearSearch = () => {}, //!
      submit = () => {}, //!
      pages,
      isSearchFieldActive,
      searchValue,
      setSearchValue,
      toggleSearch,
    }: SearchProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const [selectedRow, setSelectedRow] = useState<null | number>(null)
    const [submitSelected, setSubmitSelected] = useState(false)
    const [filteredPages, setFilteredPages] = useState(pages)

    // const [searchRef, { height, width }] = useDimensions()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (!isSearchFieldActive) setSelectedRow(null)
    }, [isSearchFieldActive])

    useEffect(() => {
      function onKeyDown(ev: KeyboardEvent) {
        if (ev.key === '/' && !isSearchFieldActive) {
          ev.stopPropagation()
          ev.preventDefault()
          toggleSearch()
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return function cleanup() {
        window.removeEventListener('keydown', onKeyDown)
      }
      // eslint-disable-next-line
    }, [isSearchFieldActive])

    return (
      <div
        className={cx(
          'md:flex flex-1 relative justify-center items-center w-full 3xl:w-auto 3xl:shrink-0 3xl:justify-center',
          isSearchFieldActive ? 'flex' : 'hidden'
        )}
      >
        <div
          className={cx(
            styles.Search,
            isSearchFieldActive && styles.Search__active,
            isSearchFieldActive &&
              isEmpty(filteredPages) &&
              styles.Search__active__empty
          )}
          onClick={() => toggleSearch('open')}
          onFocus={() => toggleSearch('open')}
          onBlur={() => setTimeout(() => toggleSearch(), 100)}
          /*ref={searchRef}*/
        >
          <div className={styles.Search_start}>
            <IconButton
              aria-label="Search"
              className={cx(styles.Search_Icon, 'hidden md:block')}
              onClick={() => submitSearch()}
            >
              <SearchIcon />
            </IconButton>
            {isSearchFieldActive && (
              <IconButton
                aria-label="Clear search"
                className={styles.backIcon}
                onClick={() => toggleSearch('close')}
              >
                <ArrowLeftIcon />
              </IconButton>
            )}
          </div>
          <div className={styles.Search_middle}>
            <input
              arial-label="Search Fulcrum"
              placeholder="Search Fulcrum"
              className={styles.Search_input}
              onChange={(ev) => {
                setSearchValue(ev.target.value)
                setSelectedRow(null)
              }}
              onKeyDown={(ev) => {
                const border = Math.min(6, filteredPages.length - 1)
                if (ev.key === 'Enter') {
                  ev.preventDefault()
                  if (selectedRow === null) {
                    submitSearch()
                  } else {
                    setSubmitSelected(true)
                  }
                } else if (ev.key === 'Escape') {
                  ev.preventDefault()
                  searchValue ? clearSearch() : toggleSearch('close')
                } else if (ev.key === 'ArrowDown') {
                  console.log('ArrowDown')
                  ev.preventDefault()
                  if (filteredPages.length < 1) {
                    setSelectedRow(null)
                  } else if (selectedRow === null) {
                    setSelectedRow(0)
                  } else if (selectedRow === border) {
                    setSelectedRow(null)
                  } else {
                    setSelectedRow(selectedRow + 1)
                  }
                } else if (ev.key === 'ArrowUp') {
                  ev.preventDefault()
                  if (filteredPages.length < 1) {
                    setSelectedRow(null)
                  } else if (selectedRow === null) {
                    setSelectedRow(border)
                  } else if (selectedRow === 0) {
                    setSelectedRow(null)
                  } else {
                    setSelectedRow(selectedRow - 1)
                  }
                } else {
                  if (isSearchFieldActive) ev.stopPropagation()
                }
              }}
              readOnly={!isSearchFieldActive}
              ref={ref}
              value={searchValue}
            />
          </div>
          <div className={styles.Search_end}>
            {searchValue && (
              <IconButton
                aria-label="Clear search"
                className={styles.SearchIcon}
                onClick={() => {
                  setSearchValue('')
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
          {isSearchFieldActive && (
            <div className={styles.Search_mobileSearchCover} />
          )}
          {isSearchFieldActive && (
            <SearchAutocomplete
              clearSearch={clearSearch}
              pages={pages}
              filteredPages={filteredPages}
              searchValue={searchValue}
              selectedRow={selectedRow}
              setFilteredPages={setFilteredPages}
              setSubmitSelected={setSubmitSelected}
              submitSelected={submitSelected}
              submit={submit}
            />
          )}
        </div>
      </div>
    )

    function submitSearch() {
      submit()
    }
  }
)

export default Search

/* export default function Search() {
  const [showSearch, setShowSearch] = useState(false)
  const onOpenSearch = useCallback(() => {
    startTransition(() => {
      setShowSearch(true)
    })
  }, [])
  const onCloseSearch = useCallback(() => {
    setShowSearch(false)
  }, [])
  return (
    <div
      className={cx(
        'flex 3xl:w-[56rem] 3xl:mx-0 relative pl-4 pr-1 py-1 h-10 outline-none focus:outline-link betterhover:hover:bg-opacity-80 pointer items-center text-left w-full text-gray-30 rounded-full align-middle text-base',
        !showSearch && 'bg-gray-30/20 dark:bg-gray-40/20',
        showSearch && 'shadow-md'
      )}
      onClick={onOpenSearch}
    >
      <Icon
        path={mdiMagnify}
        className="mr-3 align-middle text-gray-30 shrink-0 group-betterhover:hover:text-gray-70"
        size={1}
      />
      <input
        className="outline-link grow px-1 bg-transparent"
        placeholder="Search"
        onFocus={() => {
          console.log('true')
          setShowSearch(true)
        }}
        onBlur={() => {
          console.log('false')
          setShowSearch(false)
        }}
      />
      <div className="hidden ml-3 sm:flex item-center mr-1">
        {window.navigator.platform.includes('Mac') ? (
          <Kbd data-platform="mac">⌘</Kbd>
        ) : (
          <Kbd data-platform="win" wide>
            Ctrl
          </Kbd>
        )}
        <Kbd>K</Kbd>
      </div>
    </div>
  )
} */

function Kbd(props: { children?: React.ReactNode; wide?: boolean }) {
  const { wide, ...rest } = props
  const width = wide ? 'w-10' : 'w-5'

  return (
    <kbd
      className={`${width} h-5 border border-transparent mr-1 bg-wash dark:bg-wash-dark text-gray-30 align-middle p-0 inline-flex justify-center items-center text-xs text-center rounded-md`}
      {...rest}
    />
  )
}
