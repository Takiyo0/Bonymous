import mongoose from 'mongoose';
import user from "../Models/User";
import thread from "../Models/Thread";
import Logger from '../Modules/Logger';
import { User, Thread, Comment, ThreadMini } from "../Modules/Constants";
import { MONGODB_URI } from "../../config";

export default class DatabaseManager {
    ready: boolean;

    constructor() {
        this.ready = false;
    }

    connect() {
        mongoose.connect(MONGODB_URI);

        mongoose.connection.on('connected', () => {
            Logger.log('Connected to database', 'info');
            this.ready = true;
        });

        mongoose.connection.on('error', (err) => {
            Logger.error(`Database connection error: ${err}`);
            this.ready = false;
        });

        mongoose.connection.on('disconnected', () => {
            Logger.log('Disconnected from database', 'info');
            this.ready = false;
        });
    }

    public async addGoogleUser({ id, firstName, lastName, username, profilePhoto }: { id: string, firstName: string, username: string, lastName: string, profilePhoto?: string }): Promise<User> {
        const _user = new user({
            id,
            firstName,
            lastName,
            profilePhoto,
            username,
            source: "google",
            isAdmin: false
        });

        return await _user.save();
    }

    public async getUsers(): Promise<User[]> {
        return await user.find({});
    }

    public async getUserById(id: string): Promise<User | null> {
        return await user.findOne({ id });
    }

    public async getThreads(): Promise<Thread[]> {
        return await thread.find({});
    }

    public async getThreadById(id: string): Promise<Thread | null> {
        return await thread.findOne({ id });
    }

    public async getThreadThatUserOwns(user: User): Promise<Thread[]> {
        return await thread.find({ author: user });
    }

    public async getThreadsThatUserIsMemberOf(user: User): Promise<Thread[]> {
        return await thread.find({ members: { $elemMatch: { id: user.id } } });
    }

    public async getThreadThatUserCommentedOn(user: User): Promise<Thread[]> {
        return await thread.find({ comments: { $elemMatch: { "author.id": user.id } } });
    }

    public async getThreadsThatUserIsModeratorOf(user: User): Promise<Thread[]> {
        return await thread.find({ moderators: { $elemMatch: { id: user.id } } });
    }

    public async getFilteredThreads(user: User | undefined): Promise<Thread[]> {
        if (!user) return await thread.find({ visibility: "public" });
        const result = await thread.find({
            $or: [
                { visibility: "public" },
                { $and: [{ visibility: "unlisted" }, { $or: [{ author: { id: user.id } }, { moderators: { $elemMatch: { id: user.id } } }, { members: { $elemMatch: { id: user.id } } }] }] },
                { $and: [{ visibility: "private" }, { author: { id: user.id } }] },
                { members: { $elemMatch: { id: user.id } } },
                { author: { id: user.id } },
                { moderators: { $elemMatch: { id: user.id } } }
            ]
        });

        return result;
    }

    public async addLikeByThreadId(id: string): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $inc: { likes: 1 } }, { new: true });

        return updatedThread;
    }

    public async getFilteredThreadsWithQuery(user: User | undefined, query: string): Promise<Thread[]> {
        if (!user) return await thread.find({
            $and: [
                { visibility: "public" },
                { $or: [{ title: { $regex: query, $options: "i" } }, { shortDescription: { $regex: query, $options: "i" } }] }
            ]
        });

        const result = await thread.find({
            $and: [
                {
                    $or: [
                        { visibility: "public" },
                        { $and: [{ visibility: "unlisted" }, { $or: [{ author: { id: user.id } }, { moderators: { $elemMatch: { id: user.id } } }, { members: { $elemMatch: { id: user.id } } }] }] },
                        { $and: [{ visibility: "private" }, { author: { id: user.id } }] },
                        { members: { $elemMatch: { id: user.id } } },
                        { author: { id: user.id } },
                        { moderators: { $elemMatch: { id: user.id } } }
                    ]
                }, {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { shortDescription: { $regex: query, $options: "i" } }
                    ]
                }
            ]
        })

        return result;
    }

    public async addModeratorToThreadById(id: string, user: User): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const newThread = await thread.findOneAndUpdate({ id }, { $push: { moderators: user } }, { new: true });

        return newThread;
    }

    public async removeModeratorFromThreadById(id: string, user: User): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $pull: { moderators: user } }, { new: true });

        return updatedThread;
    }

    public async getThreadByInviteCode(inviteLink: string): Promise<Thread | null> {
        return await thread.findOne({ inviteLink });
    }

    public async deleteThreadById(id: string): Promise<Thread | null> {
        return await thread.findOneAndDelete({ id });
    }

    public async updateThreadById(id: string, threadData: ThreadMini): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        let options = {
            title: _thread.title,
            header: _thread.header,
            content: _thread.content,
            shortDescription: _thread.shortDescription,
            visibility: _thread.visibility
        };

        if (threadData.title) options.title = threadData.title;
        if (threadData.header) options.header = threadData.header;
        if (threadData.content) options.content = threadData.content;
        if (threadData.shortDescription) options.shortDescription = threadData.shortDescription;
        if (threadData.visibility) options.visibility = threadData.visibility;

        const newThread = await thread.findOneAndUpdate({ id }, { $set: options }, { new: true });

        return newThread;
    }

    public async joinThreadById(id: string, user: User): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $push: { members: user } }, { new: true });

        return updatedThread;
    }

    public async leaveThreadById(id: string, user: User): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $pull: { members: user } }, { new: true });

        return updatedThread;
    }

    public async kickUserFromThreadById(id: string, user: User): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $pull: { members: user } }, { new: true });

        return updatedThread;
    }

    public async postCommentByThreadId(id: string, commentData: Comment): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $push: { comments: commentData } }, { new: true });

        return updatedThread;
    }

    public async deleteCommentByThreadId(id: string, commentId: string): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id }, { $pull: { comments: { id: commentId } } }, { new: true });

        return updatedThread;
    }

    public async updateCommentContentByThreadId(id: string, commentId: string, content: string): Promise<Thread | null> {
        const _thread = await thread.findOne({ id });
        if (!_thread) return null;

        const updatedThread = await thread.findOneAndUpdate({ id, "comments.id": commentId }, { $set: { "comments.$.content": content, "comments.$.updatedAt": new Date() } }, { new: true });

        return updatedThread;
    }

    public async createThread(threadData: Thread): Promise<Thread> {
        const _thread = new thread(threadData);
        return await _thread.save();
    }
}