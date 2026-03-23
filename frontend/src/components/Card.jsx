/**
 * Card Component
 * Reusable card for displaying albums, playlists, artists
 * 
 * Props:
 * - image: Album/artist/playlist cover image
 * - title: Main title
 * - subtitle: Secondary text (artist name, song count, etc.)
 * - onClick: Handler when card is clicked
 * - type: 'album' | 'artist' | 'playlist' (for styling)
 * 
 * Features:
 * - Hover effects
 * - Play button on hover
 * - Rounded corners for artist cards
 * - Responsive sizing
 * 
 * Example usage:
 * <Card 
 *   image="album-cover.jpg"
 *   title="Album Name"
 *   subtitle="Artist Name"
 *   onClick={() => navigate(`/album/${id}`)}
 *   type="album"
 * />
 * 
 * Example structure:
 * <div className="card" onClick={onClick}>
 *   <div className="card-image">
 *     <img src={image} alt={title} />
 *     <button className="play-btn">▶</button>
 *   </div>
 *   <h3>{title}</h3>
 *   <p>{subtitle}</p>
 * </div>
 */

// TODO: Implement Card component
