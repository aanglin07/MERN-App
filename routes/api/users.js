import express from 'express';
import { check, validationResult } from 'express-validator';
import Users from '../../model/Users.js';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import config from 'config';

const router = express.Router();
//@route    POST api/users
//@desc     Register user
//access    Public
router.post('/', [
    check('firstname', 'First Name is required').not().isEmpty(),
    check('lastname', 'Last Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        //400 for bad request
    }
    const {firstname, lastname, email, password} = req.body;
try {
    //See if User exists
        let user = await Users.findOne({ email }
        );
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }       
    
    //Get users gravatar
    const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' })

    user = new Users({ firstname, lastname, email, avatar, password}
        );

    //Encrypt password
    const salt = await bcrypt.genSalt(10)

    user.password = await bcrypt.hash(password, salt)
    await user.save();   
    
    
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
}
catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
}
})

export default router;