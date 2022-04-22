export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePhoto: string;
    source: string;
    lastVisited: Date;
    isAdmin: boolean;
    data: Object;
}

export interface Comment {
    id: string;
    content: string;
    author: User | null;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

export interface Thread {
    id: string;
    title: string;
    content: string;
    header: string;
    shortDescription: string;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    lastActivity: Date;
    moderators: User[];
    members: User[];
    visibility: string;
    inviteLink: string;
    likes: number;
    author: User;
    isDeleted: boolean;
    data: Object;
}

export interface ThreadMini {
    title: string;
    header: string;
    content: string;
    shortDescription: string;
    visibility: string;
}