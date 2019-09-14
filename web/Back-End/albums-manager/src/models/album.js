const mongoose = require('mongoose')
const Photo = require('./photo')

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

albumSchema.virtual('photos', {
    ref: 'Photo',
    localField: '_id',
    foreignField: 'albumId'
})

albumSchema.pre('remove', async function (next) {
    const album = this
    await Photo.deleteMany({ albumId: album._id })
    next()
})

const Album = mongoose.model('Album', albumSchema)

module.exports = Album