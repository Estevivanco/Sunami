import styles from './Skeleton.module.css'

function Skeleton({ width, height, borderRadius = '4px', className = '', style = {} }) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height, borderRadius, ...style }}
        />
    )
}

export default Skeleton
