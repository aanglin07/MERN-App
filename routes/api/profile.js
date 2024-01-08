import express from 'express';
import jwtVerify from '../../middleware/auth.js';
import Profile from '../../model/Profile.js';
import { check, validationResult } from 'express-validator';
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

//@route    POST api/profile/
//@desc     Create or update profile
//access    Private

router.post('/', [
    jwtVerify,
    [
        check('status', 'Status is required').not().isEmpty(),
        check ('skills', 'Skills is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try
    {
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile)
        {
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //Create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

            
//@route    GET api/profile/
//@desc     Get all profile
//access    Public

router.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['firstname', 'lastname', 'avatar']);
        res.json(profiles);        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

//@route    GET api/profile/user/:user_id
//@desc     Get all profile
//access    Public

router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['firstname', 'lastname', 'avatar']);
        
        if(!profile) 
        {
            return res.status(400).json({msg: 'Profile not found'});
        }
        
        return res.json(profile);
    } catch (error) {
        console.error(error.message);

        if (error.kind == 'ObjectId')
        {
            return res.status(400).json({msg: 'Profile not found'});
        }         
        res.status(500).send('Server Error');
    }
})

//@route    Delete api/profile/
//@desc     Delete user and profile
//access    Private

router.delete('/', jwtVerify, async(req, res) => {
    try {
        //@todo - remove users posts
        //@todo - remove profile
        await Profile.findOneAndDelete({user: req.user.id});
        //@todo - remove users comments        
        await User.findOneAndDelete({_id: req.user.id})        
        res.json({msg: 'User deleted'})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
        }
    })

//@route    PUT api/profile/experience
//@desc     Add profile experience
//access    Private

router.put('/experience', [jwtVerify, [ 
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async(req, res) =>
{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})

        profile.experience.unshift(newExp); //unshift is the same as push but it pushes to the beginning instead of end

        await profile.save();

        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    })

    //@route    DELETE api/profile/experience
    //@desc     Delete profile experience
    //access    Private

    router.delete('/experience/:exp_id', [jwtVerify], async(req, res) =>
    {
        try {
            const profile = await Profile.findOne({user: req.user.id}) //gets profile by user id

            //Get remove index(The experience we need to remove)
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

            profile.experience.splice(removeIndex, 1);

            await profile.save();

            res.json(profile)
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    })

//@route    PUT api/profile/education
//@desc     Add profile education
//access    Private

router.put('/education', [jwtVerify, [ 
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async(req, res) =>
{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})

        profile.education.unshift(newEdu); //unshift is the same as push but it pushes to the beginning instead of end

        await profile.save();

        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    })

    //@route    DELETE api/profile/education
    //@desc     Delete profile education
    //access    Private

    router.delete('/education/:edu_id', [jwtVerify], async(req, res) =>
    {
        try {
            const profile = await Profile.findOne({user: req.user.id}) //gets profile by user id

            //Get remove index(The education we need to remove)
            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

            profile.education.splice(removeIndex, 1);

            await profile.save();

            res.json(profile)
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    })


export default router;