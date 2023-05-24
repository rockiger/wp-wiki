import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form, Link, useNavigate, useSubmit } from 'react-router-dom'

import { cx } from 'classix'

import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import FileDocumentIcon from 'mdi-react/FileDocumentIcon'
import SearchIcon from 'mdi-react/SearchIcon'
import CloseIcon from 'mdi-react/CloseIcon'

import { Page } from '../../api'
import IconButton from '../IconButton'
import './gmail.css'

interface SearchProps {
  pages: Page[]
}
export default function Search({ pages }: SearchProps) {
  const [isActive, setIsActive] = useState(true)
  // const isActive = true
  const [filteredPages, setFilteredPages] = useState(pages)
  const [selectedRow, setSelectedRow] = useState<null | number>(null)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()
  const submit = useSubmit()

  /**
   * Filter pages based on search value for instant search
   */
  useEffect(() => {
    setFilteredPages(
      pages
        .filter((page: Page) =>
          page.title.toLowerCase().includes(value.toLowerCase())
        )
        .sort((file1, file2) => {
          if (file1.modified < file2.modified) return -1
          if (file2.modified < file1.modified) return 1
          return 0
        })
    )
  }, [pages, value, setFilteredPages])

  /**
   * Always clear selection if value changes.
   */
  useEffect(() => {
    setSelectedRow(null)
  }, [value])

  const handleKeys = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const border = Math.min(6, filteredPages.length - 1)
    if (ev.key === 'Enter') {
      ev.preventDefault()
      setIsActive(false)
      setSelectedRow(null)
      inputRef.current?.blur()
      if (selectedRow === null) {
        submit(ev.currentTarget.form)
      } else {
        navigate(`/page/${filteredPages[selectedRow].id}`)
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault()
      setIsActive(false)
      inputRef.current?.blur()
    } else if (ev.key === 'ArrowDown') {
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
      if (isActive) ev.stopPropagation()
    }
  }

  return (
    <div
      className={cx(
        'rw-search-wrapper',
        isActive && 'rw-search-wrapper--active'
      )}
    >
      <Form
        className={cx('rw-search', isActive && 'rw-search--active')}
        onFocus={() => {
          setIsActive(true)
        }}
        onBlur={() => setIsActive(false)}
        onSubmit={(ev) => submit(ev.currentTarget.form)}
        role="search"
      >
        <h2 className="rw-search-heading">Search</h2>
        <IconButton aria-label="Search" className="rw-search-start">
          <SearchIcon />
        </IconButton>
        <IconButton aria-label="Close Search" className="rw-search-close">
          <ArrowLeftIcon />
        </IconButton>
        <input
          ref={inputRef}
          className="rw-search-input"
          aria-label="Search"
          autoComplete="off"
          placeholder="Search"
          name="q"
          type="text"
          dir="ltr"
          spellCheck="false"
          aria-haspopup="true"
          aria-live="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeys}
        />
        <IconButton
          aria-label="Delete Search"
          className="rw-search-delete"
          style={{ display: value ? 'flex' : 'none' }}
          onClick={(e) => {
            setValue('')
            inputRef.current?.focus()
          }}
        >
          <CloseIcon />
        </IconButton>
      </Form>
      <div
        className={cx('rw-autocomplete', isActive && 'rw-autocomplete--active')}
      >
        <div className="rw-autocomplete-list">
          {filteredPages?.slice(0, 7).map((page, index) => {
            const filename = page.title
            const author = page.author.name
            const date = new Date(page.modified)
            return (
              <Link
                className={cx(
                  'rw-autocomplete-list-item',
                  'rw-autocomplete-list-item-link',
                  index === selectedRow && 'rw-autocomplete-list-item--selected'
                )}
                key={page.id}
                to={`/page/${page.id}`}
              >
                <div className={cx('rw-autocomplete-list-item-icon')}>
                  <FileDocumentIcon />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div className="rw-autocomplete-list-item-title">
                    {filename}
                  </div>
                  <small className="rw-autocomplete-list-item-subtitle">
                    {author}
                  </small>
                </div>
                <div>
                  <small>{date.toLocaleDateString()}</small>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
