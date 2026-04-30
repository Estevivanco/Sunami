import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false

    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    // Library collections
    likedSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    savedAlbums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
    followedArtists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    followedPlaylists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist'
}]

}, {timestamps:true}
)

// Hooks och metoder FÖRE skapande av modellen
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

        const saltRounds = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, saltRounds)

        next()
})

userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User