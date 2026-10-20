import styles from './Toast.module.css'

function Toast({ toast, onDismiss }) {
    if (!toast) return null
    return (
        <div
            className={`${styles.toast} ${styles[toast.type]}`}
            onClick={onDismiss}
            role="alert"
        >
            {toast.message}
        </div>
    )
}

export default Toast
