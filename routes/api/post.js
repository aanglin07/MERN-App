import express from 'express';

const router = express.Router();
//@route    GET api/post
//@desc     Test route
//access    Public
router.get('/', (req, res) => {

    res.send('Post route');

})

export default router;