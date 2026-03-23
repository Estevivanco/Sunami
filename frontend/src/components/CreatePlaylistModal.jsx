/**
 * CreatePlaylistModal
 * Modal dialog for creating a new playlist
 */

import { useState } from 'react'
import styles from './CreatePlaylistModal.module.css'

function CreatePlaylistModal({ isOpen, onClose, onCreatePlaylist }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!name.trim()) {
            setError('Playlist name is required')
            return
        }

        try {
            setIsCreating(true)
            setError(null)
            
            await onCreatePlaylist({
                name: name.trim(),
                description: description.trim(),
                isPublic
            })
            
            // Reset form
            setName('')
            setDescription('')
            setIsPublic(true)
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to create playlist')
        } finally {
            setIsCreating(false)
        }
    }

    const handleClose = () => {
        if (!isCreating) {
            setName('')
            setDescription('')
            setError(null)
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Skapa ny spellista</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isCreating}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="playlistName" className={styles.label}>
                            Namn
                        </label>
                        <input
                            id="playlistName"
                            type="text"
                            className={styles.input}
                            placeholder="Min spellista"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isCreating}
                            autoFocus
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="playlistDescription" className={styles.label}>
                            Beskrivning (valfritt)
                        </label>
                        <textarea
                            id="playlistDescription"
                            className={styles.textarea}
                            placeholder="Lägg till en valfri beskrivning"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isCreating}
                            rows={3}
                            maxLength={300}
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            id="isPublic"
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            disabled={isCreating}
                        />
                        <label htmlFor="isPublic" className={styles.checkboxLabel}>
                            Gör spellistan publik
                        </label>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleClose}
                            disabled={isCreating}
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            className={styles.createButton}
                            disabled={isCreating || !name.trim()}
                        >
                            {isCreating ? 'Skapar...' : 'Skapa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePlaylistModal
