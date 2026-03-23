// import { useState, useEffect } from 'react'

/**
 * useFetch Hook
 * Generic hook for fetching data from API
 */
// export const useFetch = (url, options = {}) => {
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const fetchData = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const response = await fetch(url, options)
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const result = await response.json()
//       setData(result)
//     } catch (err) {
//       setError(err.message)
//       console.error('Fetch error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (url) {
//       fetchData()
//     }
//   }, [url])

//   // Refetch function to manually trigger a new fetch
//   const refetch = () => {
//     if (url) {
//       fetchData()
//     }
//   }

//   return { data, loading, error, refetch }
// }

// * Ett annat alternativ för services där man använder endpoints för att hämta data.
// * Data hämtas och namnges const {data: artists eller data: songs}
// * Ska ej använda denna på detta projekt
