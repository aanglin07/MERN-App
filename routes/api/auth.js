import express from 'express';
import jwtVerify from '../../middleware/auth.js';
import Users from '../../model/Users.js';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import config from 'config';
import bcrypt from 'bcryptjs';

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

//@route    POST api/auth
//@desc     Authenticate user and get token
//access    Public

router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        //400 for bad request
    }
    const {email, password} = req.body;
try {
    //See if User exists
        let user = await Users.findOne({ email }
        );
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }  
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] }
            );
        }
    
    //Return JWT

    const payload = {
        user: {
        id: user.id
        }
    };

    jwt.sign(
        payload, 
        config.get('jwtSecret'), 
        { expiresIn: 360000 }
        , (err, token) => {
            if(err) throw err;
            res.json({token})
        }
        )
} catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
}
})

export default router;