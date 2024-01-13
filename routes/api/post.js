import express from 'express';
import jwtVerify from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import Post from '../../model/Posts.js';
import Profile from '../../model/Profile.js';
import User from '../../model/Users.js';

const router = express.Router();
//@route    GET api/post
//@desc     Get all posts
//access    Private
router.get('/', jwtVerify, async (req, res) =>
{
    try {
        const posts = await Post.find().sort({ date: -1 }); //(date: -1) Gets the most recent post
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    GET api/post
//@desc     Get post by ID
//access    Private
router.get('/:id', jwtVerify, async (req, res) =>
{
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
            }
            res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
})


//@route    POST api/post/:id
//@desc     Create a post
//access    Private


router.post('/', [
    check('text', 'Text is required').not().isEmpty(),[jwtVerify]
    
], async (req, res) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    
    try {
        const  user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            firstname: user.firstname,
            lastname: user.lastname,
            avatar: user.avatar,
            user:req.user.id
        })

        const post = await newPost.save();

        res.json(post);
    } catch (err) 
    {  
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})  

//@route    DELETE api/post/:id
//@desc     DELETE a post
//access    Private

router.delete('/:id',[jwtVerify], async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' }
            );
            }
            //Check user
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized' });
                }

            await Post.findOneAndDelete({_id: req.params.id});
            res.json({ msg: 'Post removed' });
            }
            catch (err) {
                if (err.kind === 'ObjectId') {
                    return res.status(404).json({ msg: 'Post not found' }
                    );
            }
            console.error(err.message);
            res.status(500).send('Server Error');
        }
})

export default router;