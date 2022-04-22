import "../../CSS/Thread.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTrash, faEdit } from "@fortawesome/fontawesome-free-solid";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { Thread, User } from "../../Constants";
import { timeDifference } from "../../Utils";

const trashIcon: IconProp = faTrash as IconProp;
const editIcon: IconProp = faEdit as IconProp;

export default function Comments({ post, user, sendRequest, sendAdvancedRequest }: { post: Thread | string, user: User | null, sendRequest: (type: "join" | "leave" | "like" | "comment", data?: Object) => void, sendAdvancedRequest: (url: string, options?: Object) => void }) {
    const [comment, setComment] = useState<string>("");
    const [editCommentId, setEditCommentId] = useState<string>("");
    const [commentVisibility, setCommentVisibility] = useState<"public" | "anonymous">("public");
    const [editedComments, setEditedComments] = useState<{ [key: string]: string }>({});

    function editCommentOnChange(id: string, event: React.ChangeEvent<HTMLTextAreaElement>) {
        setEditedComments({ ...editedComments, [id]: event.target.value.trim() });
    }

    useEffect(() => {
        if (!editCommentId) setEditedComments({});
    }, [editCommentId]);

    function onEditSubmit(id: string) {
        const content = editedComments[id];
        if (!content) return;

        sendAdvancedRequest(`/api/thread/{id}/comment/${id}`, {
            method: "PUT",
            body: JSON.stringify({ content }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        setEditCommentId("");
        setEditedComments({});
    }

    function onPost() {
        if (!comment.trim().length) return;
        sendRequest("comment", { content: comment, anonymous: commentVisibility === "anonymous" });
        setComment("");
    }

    function onDelete(id: string) {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Are you sure you want to delete this comment?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => sendAdvancedRequest(`/api/thread/{id}/comment/${id}{code}`, { method: "DELETE", header: { "Content-Type": "application/json" } }),
                },
                {
                    label: 'No',
                    onClick: () => void 0
                }
            ],
            overlayClassName: 'overlay-confirmation'
        })
    }

    return (<div className="comments-main">
        <div className="comments-body">
            <div className="comments-post">
                <div className="comments-input">
                    <textarea className="comments-input-textarea" placeholder="Write a response..." value={comment} onChange={e => setComment(e.currentTarget.value)}></textarea>
                </div>
                <div className="comment-select-anonimity">
                    <div className="comment-select-anonimity-option">
                        <input type="radio" name="anonimity" id="anonimity-public" defaultChecked onClick={() => setCommentVisibility("public")} />
                        <label htmlFor="anonimity-public">Public</label>
                    </div>
                    <div className="comment-select-anonimity-option">
                        <input type="radio" name="anonimity" id="anonimity-anonymous" onClick={() => setCommentVisibility("anonymous")} />
                        <label htmlFor="anonimity-anonymous">Anonymous</label>
                    </div>
                </div>
                <div className={`comments-button ${comment.trim().length === 0 ? "comments-button-disabled" : ""}`}>
                    <button onClick={() => onPost()}>Post</button>
                </div>
            </div>
            <div className="comments-list">
                {typeof post !== "string" && post.comments.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()).map((comment, index) => (
                    <div className="comments-item" key={index}>
                        <div className="comments-item-header">
                            <div className="comments-item-header-top">
                                <div className="comments-item-header-top-user">
                                    <div className="comments-item-header-top-user-image">
                                        <img src={comment.author?.profilePhoto ? comment.author.profilePhoto : "https://i.imgur.com/JGk69Vz.png"} alt="user" onError={e => {
                                            (e.target as HTMLTextAreaElement).onerror = null;
                                            (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                        }} />
                                    </div>
                                    <div className="comments-item-header-top-user-name">
                                        <p>{comment.author?.username ? comment.author.username : "Anonymous"}</p>
                                    </div>
                                </div>
                                <div className="comments-item-header-top-date">
                                    <p>{timeDifference(new Date().getTime(), new Date(comment.createdAt).getTime())}</p>
                                </div>
                                <div className="comments-item-header-top-date">
                                    <p>Last updated {timeDifference(new Date().getTime(), new Date(comment.updatedAt).getTime())}</p>
                                </div>
                            </div>
                            {user && (comment.author?.id === user.id || post.moderators.find(u => u.id === user.id)) && <div className="comments-item-header-bottom">
                                <div className={`comments-item-header-bottom-button ${post.moderators.find(u => u.id === user.id) || comment.author?.id === user.id ? "comments-item-header-bottom-button-red" : "comments-item-header-bottom-button-disabled"}`}>
                                    <button onClick={() => onDelete(comment.id)}>
                                        <FontAwesomeIcon icon={trashIcon} />
                                        <p>Delete</p>
                                    </button>
                                </div>
                                <div className={`comments-item-header-bottom-button ${comment.author?.id === user.id ? "comments-item-header-bottom-button-blue" : "comments-item-header-bottom-button-disabled"}`}>
                                    <button onClick={() => setEditCommentId(c => c === comment.id ? "" : comment.id)}>
                                        <FontAwesomeIcon icon={editIcon} />
                                        <p>Edit</p>
                                    </button>
                                </div>
                            </div>}
                        </div>

                        <div className="comments-item-body">
                            {editCommentId === comment.id ? <div className="comments-item-body-edit">
                                <textarea onChange={e => editCommentOnChange(comment.id, e)} className="comments-item-body-edit-textarea" placeholder="Edit this comment..." defaultValue={comment.content}></textarea>
                                <div className={`comments-item-body-edit-button ${!editedComments[comment.id] ? "comments-item-body-edit-button-disabled" : editedComments[comment.id] === comment.content ? "comments-item-body-edit-button-disabled" : ""}`}>
                                    <button onClick={() => onEditSubmit(comment.id)}>Save</button>
                                </div>
                            </div> : <p>{comment.content}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    )
}