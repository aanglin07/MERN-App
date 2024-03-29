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

//@route    PUT api/posts/like/:id
//@desc     Like a post
//access    Private

router.put('/like/:id',[jwtVerify], async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        //Check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked' });
        }
        post.likes.unshift({ user: req.user.id })
        await post.save();

        res.json(post.likes);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route    PUT api/posts/unlike/:id
//@desc     Unlike a post
//access    Private

router.put('/unlike/:id',[jwtVerify], async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        //Check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }
        //Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();

        res.json(post.likes);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route    POST api/post/comment/:id
//@desc     Make a comment on a post
//access    Private

router.post('/comment/:id',[jwtVerify, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            firstname: user.firstname,
            lastname: user.lastname,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route    DELETE api/post/comment/:id
//@desc     Delete a comment on a post
//access    Private

router.delete('/comment/:id/:comment_id', [jwtVerify], async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        //Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' }
            );
            }
        //Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' }
            );
            }
        //Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
        }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route    PATCH api/posts/comment/:id/:comment_id
//@desc     Update a comment on a post
//access    Private

router.patch('/comment/:id/:comment_id', [jwtVerify], async(req, res) =>
    {
        try {
            const post = await Post.findById(req.params.id);
            //Pull out comment
            const comment = post.comments.find(comment => comment.id === req.params.comment_id);
            //Make sure comment exists
            if (!comment) {
                return res.status(404).json({ msg: 'Comment does not exist' }
                );
            }
            //Check user
            if (comment.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized' }
                );
                }
            //Update the comment
            const newComment = { text: req.body.text };
            post.comments.splice(comment, 1, newComment);
            await post.save();
            res.json(post.comments);
            }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })



export default router;