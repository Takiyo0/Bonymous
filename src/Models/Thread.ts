import mongoose from "mongoose";
import { Thread } from "../Modules/Constants";

const Schema = mongoose.Schema;

const ThreadSchema = new Schema<Thread>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    comments: {
        type: [Object],
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    lastActivity: {
        type: Date,
        default: new Date()
    },
    moderators: {
        type: [Object],
        required: true
    },
    members: {
        type: [Object],
        required: true
    },
    visibility: {
        type: String,
        required: true
    },
    inviteLink: {
        type: String,
        required: true
    },
    author: {
        type: Object,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true
    },
    data: {
        type: Object,
        required: false,
        default: {}
    }
});

export default mongoose.model('Thread', ThreadSchema);