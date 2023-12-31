import express from 'express';
import jwtVerify from '../../middleware/auth.js';
import Profile from '../../model/Profile.js';
import User from '../../model/Users.js';

const router = express.Router();
//@route    GET api/profile/me
//@desc     Get current user's profile
//access    Private
router.get('/me', jwtVerify, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['firstname', 'lastname', 'avatar']);
        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' });
        } 
        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

export default router;