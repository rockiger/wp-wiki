import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cx } from 'classix'

import FileDocumentIcon from 'mdi-react/FileDocumentIcon'

import styles from './search-autocomplete.module.css'
import { Page } from '../api'

interface SearchAutocompleteProps {
  clearSearch: () => void
  submit: () => void
  pages: Page[]
  filteredPages: Page[]
  searchValue: string
  selectedRow: null | number
  setFilteredPages: (files: Page[]) => void
  setSubmitSelected: (value: boolean) => void
  submitSelected: boolean
}

export const SearchAutocomplete = ({
  clearSearch,
  pages,
  filteredPages,
  searchValue,
  selectedRow,
  setFilteredPages: setFilteredFiles,
  setSubmitSelected,
  submitSelected,
}: SearchAutocompleteProps) => {
  useEffect(() => {
    setFilteredFiles(
      pages
        .filter((page: Page) =>
          page.title.toLowerCase().includes(searchValue.toLowerCase())
        )
        .sort((file1, file2) => {
          if (file1.modified < file2.modified) return -1
          if (file2.modified < file1.modified) return 1
          return 0
        })
    )
  }, [pages, searchValue, setFilteredFiles])

  useEffect(() => {
    if (
      submitSelected &&
      selectedRow !== null &&
      filteredPages.length >= selectedRow
    ) {
      //! history.push(`/page/${filteredFiles[selectedRow].id}`)
      clearSearch()
    }
    setSubmitSelected(false)
  }, [
    clearSearch,
    filteredPages,
    history,
    selectedRow,
    setSubmitSelected,
    submitSelected,
  ])

  //@ts-ignore
  window.files = pages
  if (filteredPages?.length < 1) return null
  return (
    <div
      className={styles.SearchAutocomplete}
      style={{
        top: 64,
      }}
    >
      <div
        className={styles.SearchAutocomplete_MenuList}
        id="SearchAutocomplete_MenuList"
      >
        {filteredPages?.slice(0, 7).map((file, index) => {
          const filename = file.title
          return (
            <Link
              className={cx(
                styles.SearchAutocomplete_MenuItem,
                styles.SearcAutocomplete_MenuItem_Link,
                index === selectedRow && 'bg-highlight text-link'
              )}
              key={file.id}
              /* //! selected={index === selectedRow} */
              to={`/page/${file.id}`}
            >
              <div
                className={cx(
                  styles.SearcAutocomplete_MenuItem_icon,
                  'text-link'
                )}
              >
                <FileDocumentIcon />
              </div>
              <div>{filename}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default SearchAutocomplete
