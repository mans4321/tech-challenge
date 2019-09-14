const express = require('express')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const Album = require('../models/album')
const Photo = require('../models/photo')
const router = new express.Router()


// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/albums', auth , async (req, res) => {
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'albums',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.albums)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/albums', auth , async (req, res) => {
    const album = new Album({
        ...req.body,
        owner: req.user._id
    })

    try {
        await album.save()
        res.status(201).send(album)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/albums/:id', auth , async (req, res) => {
    const _id = req.params.id

    try {
        const album = await Album.findOne({ _id, owner: req.user._id })

        if (!album) {
            return res.status(404).send()
        }

        res.send(album)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/albums/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const album = await Album.findOne({ _id: req.params.id, owner: req.user._id})

        if (!album) {
            return res.status(404).send()
        }

        updates.forEach((update) => album[update] = req.body[update])
        await album.save()
        res.send(album)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/albums/:id', auth, async (req, res) => {
    try {
        const album = await Album.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!album) {
            res.status(404).send()
        }

        res.send(album)
    } catch (e) {
        res.status(500).send()
    }

})

// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/albums/:id/photos', auth , async (req, res) => {
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    const _id = req.params.id

    try {
        const album = await Album.findOne({ _id, owner: req.user._id })
        if (!album) {
            return res.status(404).send()
        }
        await album.populate({
            path: 'photos',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(album.photos)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/albums/:id/photos', auth , upload.single('photo'), async (req, res) => {
    const _id = req.params.id

    try {
        const album = await Album.findOne({ _id, owner: req.user._id })

        if (!album) {
            return res.status(404).send()
        }

        const buffer = await sharp(req.file.buffer).png().toBuffer()

        const photo = new Photo({
        ...req.body,
        image: buffer,
        albumId: req.params.id,
        title: req.query.title ? req.query.title : '',
        description: req.query.description ? req.query.description : '',
        owner: req.user._id
    })

        await photo.save()
        res.status(201).send(photo)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router