const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    image: {
        type: Buffer
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Album'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

photoSchema.methods.toJSON = function () {
    const photo = this
    const photoObject = photo.toObject()

    delete photoObject.image

    return photoObject
}

const Photo = mongoose.model('Photo', photoSchema)

module.exports = Photo