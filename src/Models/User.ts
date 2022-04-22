import mongoose from "mongoose";
import { User } from "../Modules/Constants";

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        required: false,
        default: ""
    },
    source: {
        type: String,
        required: true
    },
    lastVisited: {
        type: Date,
        default: new Date()
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

export default mongoose.model('User', UserSchema);