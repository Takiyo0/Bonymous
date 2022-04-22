import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Thread, User } from "../../Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBoxOpen, faThumbsUp, faCommentDots, faUserCircle, faExclamationTriangle, faGlobe, faLink, faLock } from "@fortawesome/fontawesome-free-solid";
import "../../CSS/Profile.css";
import { useNavigate } from "react-router-dom";

const boxIcon: IconProp = faBoxOpen as IconProp;
const faThumbsUpIcon: IconProp = faThumbsUp as IconProp;
const faCommentIcon: IconProp = faCommentDots as IconProp;
const faUserIcon: IconProp = faUserCircle as IconProp;
const warningIcon: IconProp = faExclamationTriangle as IconProp;
const globeIcon: IconProp = faGlobe as IconProp;
const linkIcon: IconProp = faLink as IconProp;
const lockIcon: IconProp = faLock as IconProp;

export default function Moderator({ user }: { user: User | null }) {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Thread[] | []>([]);

    function getVisibilityIcon(visiblity: string) {
        switch (visiblity) {
            case "public":
                return <FontAwesomeIcon icon={globeIcon} />;
            case "unlisted":
                return <FontAwesomeIcon icon={linkIcon} />;
            case "private":
                return <FontAwesomeIcon icon={lockIcon} />;
            default:
                return <FontAwesomeIcon icon={warningIcon} />;
        }
    }

    useEffect(() => {
        const abortController = new AbortController();

        fetch("/api/user/moderating", { signal: abortController.signal })
            .then(response => response.json())
            .then(data => {
                if (data.error) toast.error(`There was an error: ${data.error}`);
                else setPosts(data.threads);
            }).catch(error => {
                if (error.name === "AbortError") return;
                toast.error(`There was an error: ${error.message}`);
            });

        return () => abortController.abort();
    }, []);
    return (<div className="posts-parent">
        {!posts.length && <div className="no-posts">
            <FontAwesomeIcon icon={boxIcon} />
            <p>No posts yet.</p>
        </div>}
        {posts.length > 0 && posts.map((post, index) => (<div key={index} className="home-child-body-posts-post" style={{ backgroundImage: `url('${post.header}')` }} onClick={() => navigate(`/board/${post.id}`)}>
            <div className="home-child-body-posts-post-body">
                <div className="home-child-body-posts-post-title">
                    <h2>{post.title}</h2>
                </div>
                <div className="home-child-body-posts-post-stats">
                    <div className="home-child-body-posts-post-stats-child">
                        <img src={post.author.profilePhoto} alt="profile" onError={e => {
                            (e.target as HTMLTextAreaElement).onerror = null;
                            (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                        }} />
                        <p>Created by: {post.author.firstName}</p>
                    </div>
                    <div className="home-child-body-posts-post-stats-child">
                        <FontAwesomeIcon icon={faThumbsUpIcon} />
                        <p>{post.likes} like{post.likes > 1 ? "s" : ""}</p>
                    </div>
                    <div className="home-child-body-posts-post-stats-child">
                        <FontAwesomeIcon icon={faCommentIcon} />
                        <p>{post.comments.length} response{post.comments.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="home-child-body-posts-post-stats-child">
                        <FontAwesomeIcon icon={faUserIcon} />
                        <p>{post.members.length} member{post.members.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="home-child-body-posts-post-stats-child">
                        {getVisibilityIcon(post.visibility)}
                        <p>{post.visibility}</p>
                    </div>
                </div>
            </div>
        </div>)
        )}

    </div>);
}