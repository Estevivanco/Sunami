/**
 * useLibrary Hook
 * Custom hook for accessing library context
 */

import { useLibrary as useLibraryContext } from '../context/LibraryContext'

export const useLibrary = () => {
    return useLibraryContext()
}
