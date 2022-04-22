import "../CSS/Home.css";
import loadingSVG from "../Assets/Loading.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faThumbsUp, faCommentDots, faUserCircle, faGlobe, faLink, faLock, faExclamationTriangle } from "@fortawesome/fontawesome-free-solid";
import { Thread } from "../Constants";

const faThumbsUpIcon: IconProp = faThumbsUp as IconProp;
const faCommentIcon: IconProp = faCommentDots as IconProp;
const faUserIcon: IconProp = faUserCircle as IconProp;
const warningIcon: IconProp = faExclamationTriangle as IconProp;
const globeIcon: IconProp = faGlobe as IconProp;
const linkIcon: IconProp = faLink as IconProp;
const lockIcon: IconProp = faLock as IconProp;


export default function Home({ changeBackground }: { changeBackground: (url?: string) => Promise<void> }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Thread[] | []>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [disappear, setDisappear] = useState<Boolean>(false);

    useEffect(() => {
        const abortController = new AbortController();

        fetch("/api/user/threads", { signal: abortController.signal })
            .then(response => response.json())
            .then(json => {
                setPosts(json.threads);
                _setLoading(false);
            });

        return () => abortController.abort();
    }, []);

    function _setLoading(value: Boolean) {
        setDisappear(!value);
        setTimeout(() => {
            setLoading(value);
        }, 500);
    }

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

    return (<div className="home-parent">
        {loading ? <div className={disappear ? "loading loading-disappear" : "loading"}>
            <img src={loadingSVG} alt="loading" />
        </div> : <div className="home-child">
            <div className="home-child-header">
                <h1>Welcome to the Anonymous Board!</h1>
            </div>
            <div className="home-child-body">
                <p className="home-child-body-text">Boards</p>
                <div className="home-child-body-posts">
                    {posts.map((post, index: number) => {
                        return (<div key={index} className="home-child-body-posts-post" style={{ backgroundImage: `url('${post.header}')` }} onClick={() => { changeBackground(); navigate(`/board/${post.id}`) }}
                            onMouseEnter={() => changeBackground(`${post.header}`)}
                            onMouseLeave={() => changeBackground()}
                        >
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
                    })}
                </div>
            </div>
        </div>}
    </div>);
}