/**
 * Small inline SVG icons. They inherit color via currentColor and size via the size prop.
 */

export const HeartIcon = ({ filled = false, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
)

export const PlusIcon = ({ size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M12 5v14M5 12h14" />
    </svg>
)

const navProps = (size) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
})

export const HomeIcon = ({ size = 22 }) => (
    <svg {...navProps(size)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
)

export const SearchIcon = ({ size = 22 }) => (
    <svg {...navProps(size)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
)

export const LibraryIcon = ({ size = 22 }) => (
    <svg {...navProps(size)}><path d="M4 4v16M9 4v16" /><path d="M14.5 5.5l5 14" /></svg>
)
