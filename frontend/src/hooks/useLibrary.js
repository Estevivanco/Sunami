/**
 * useLibrary Hook
 * Custom hook for accessing library context
 */

import { useContext } from 'react'
import { useLibrary as useLibraryContext } from '../context/LibraryContext'

export const useLibrary = () => {
    return useLibraryContext()
}
