import { useState, useCallback, useRef } from 'react'

export const useToast = () => {
    const [toast, setToast] = useState(null)
    const timerRef = useRef(null)

    const showToast = useCallback((message, type = 'error') => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setToast({ message, type })
        timerRef.current = setTimeout(() => setToast(null), 3000)
    }, [])

    const clearToast = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setToast(null)
    }, [])

    return { toast, showToast, clearToast }
}
