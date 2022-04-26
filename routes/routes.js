const express = require('express');

const bookmarkRoutes = require('./bookmark');
const categoryRoutes = require('./category');
const tabRoutes = require('./tab');
const authRoutes = require('./auth');

const router = express.Router();

router.use('/bookmark', bookmarkRoutes)
router.use('/category', categoryRoutes)
router.use('/tab', tabRoutes)
router.use('/auth', authRoutes)


module.exports = router;