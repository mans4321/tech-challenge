const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const Photo = require('../models/photo')
const router = new express.Router()


// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/photos', auth , async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'photos',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.photos)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/photos/:id', auth , async (req, res) => {
    const _id = req.params.id

    try {
        const photo = await Photo.findOne({ _id, owner: req.user._id })

        if (!photo) {
            return res.status(404).send()
        }

        res.send(photo)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/photos/:id', auth , async (req, res) => {
    try {
        const photo = await Photo.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!photo) {
            res.status(404).send()
        }

        res.send(photo)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/photos/:id/image', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const photo = await Photo.findOne({ _id, owner: req.user._id })

        if (!photo) {
            return res.status(404).send()
        }

        res.set('Content-Type', 'image/png')
        res.send(photo.image)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router