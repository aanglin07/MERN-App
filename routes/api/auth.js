import express from 'express';
import jwtVerify from '../../middleware/auth.js';
import Users from '../../model/Users.js';

const router = express.Router();
//@route    GET api/auth
//@desc     Test route
//access    Public
router.get('/', jwtVerify, async (req, res) => {

    try {
        const user = await Users.findById(req.user.id).select('-password'); //leaves off password in data
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

export default router;