import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
           
        }
    ],
    comments: [
        {
            user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            },
            text:{
                type: String,
                required: true
            },
            firstname: {
                type: String
            },
            lastname: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }

],
    date: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("Post", postSchema);