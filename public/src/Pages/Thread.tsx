import "../CSS/Thread.css";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import loadingSVG from "../Assets/Loading.svg";
import { Thread as ThreadType } from "../Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle, faUser, faUserShield, faThumbsUp, faClock, faUserClock, faPencilAlt, faArrowAltCircleRight, faArrowAltCircleLeft, faTrash, faGlobe, faLink, faLock, faEye, faExternalLinkAlt, faCommentDots, faCrown } from "@fortawesome/fontawesome-free-solid";
import { User } from "../Constants";
import { useEffect, useState } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { toast } from "react-toastify";

import Comments from "./Thread/Comments";
import Members from "./Thread/Members";
import Moderators from "./Thread/Moderators";
import Edit from "./Thread/Edit";

const warningIcon: IconProp = faExclamationTriangle as IconProp;
const userIcon: IconProp = faUser as IconProp;
const userShieldIcon: IconProp = faUserShield as IconProp;
const thumbsUpIcon: IconProp = faThumbsUp as IconProp;
const clockIcon: IconProp = faClock as IconProp;
const userClockIcon: IconProp = faUserClock as IconProp;
const pencilIcon: IconProp = faPencilAlt as IconProp;
const arrowRightIcon: IconProp = faArrowAltCircleRight as IconProp;
const arrowLeftIcon: IconProp = faArrowAltCircleLeft as IconProp;
const trashIcon: IconProp = faTrash as IconProp;
const globeIcon: IconProp = faGlobe as IconProp;
const linkIcon: IconProp = faLink as IconProp;
const lockIcon: IconProp = faLock as IconProp;
const commentIcon: IconProp = faCommentDots as IconProp;
const crownIcon: IconProp = faCrown as IconProp;

export default function Thread({ user }: { user: User | null }) {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<Boolean>(true);
    const [removePageContentWhenLoading, setRemovePageContentWhenLoading] = useState<Boolean>(true);
    const [post, setPost] = useState<ThreadType | string>("Loading...");
    const [disableLike, setDisableLike] = useState<Boolean>(false);
    const [disappear, setDisappear] = useState<Boolean>(false);

    const [page, setPage] = useState(<Comments post={post} user={user} sendRequest={sendRequest} sendAdvancedRequest={sendAdvancedRequest} />);
    const [displayLocation, setDisplayLocation] = useState(page);
    const [transitionStage, setTransistionStage] = useState("fadeIn");

    useEffect(() => {
        const abortController = new AbortController();

        fetch(`/api/thread/${params.id}${searchParams.get("code") ? `?code=${searchParams.get("code")}` : ""}`, { signal: abortController.signal })
            .then(response => response.json())
            .then(json => {
                if (json.error) {
                    setPost(json.message ? json.message : "Oops! Something went wrong.");
                    return _setLoading(false);
                };
                setPost(json.thread);
                setHeaderImage(json.thread.header);
                _setLoading(false);
            });

        return () => {
            abortController.abort();
        }
    }, []);

    useEffect(() => {
        if (loading) window.scrollTo(0, 0);
    }, [loading]);

    async function setHeaderImage(url: string | null) {
        // make sure post.header image is online
        if (!url) return setImageHeader();

        fetch(url).then(response => {
            if (!response.ok) return setImageHeader();
            if (!response.headers.get("content-type")) return setImageHeader();
            if (!response.headers.get("content-type")!.match(/^image\//)) return setImageHeader();
            if (response.headers.get("content-type")!.match(/^image\/gif$/)) return setImageHeader();
            setImageHeader(url);
        }).catch((e) => setImageHeader());


    }

    function setImageHeader(url: string = "https://i.imgur.com/KTk64Nb.jpg") {
        document.documentElement.style.setProperty('--thread-header-background', `url('${url}')`);
    }

    useEffect(() => {
        switch (page.type.name) {
            case "Comments":
                setPage(<Comments post={post} user={user} sendRequest={sendRequest} sendAdvancedRequest={sendAdvancedRequest} />);
                break;

            case "Members":
                setPage(<Members post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} />);
                break;

            case "Moderators":
                setPage(<Moderators post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} />);
                break;

            case "Edit":
                setPage(<Edit post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} setLoading={setLoading} />);
                break;

            default:
                setPage(<Comments post={post} user={user} sendRequest={sendRequest} sendAdvancedRequest={sendAdvancedRequest} />);
        }
    }, [post]);

    function changePage(page: "comments" | "members" | "moderators" | "edit") {
        switch (page) {
            case "comments":
                setPage(<Comments post={post} user={user} sendRequest={sendRequest} sendAdvancedRequest={sendAdvancedRequest} />);
                break;
            case "members":
                setPage(<Members post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} />);
                break;
            case "moderators":
                setPage(<Moderators post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} />);
                break;
            case "edit":
                setPage(<Edit post={post} user={user} sendAdvancedRequest={sendAdvancedRequest} setLoading={setLoading} />);
        }
    }

    useEffect(() => {
        if (page !== displayLocation) setTransistionStage("fadeOut");
    }, [page, displayLocation]);

    function _setLoading(value: Boolean) {
        setDisappear(!value);
        setTimeout(() => {
            setLoading(value);
        }, 500);
    }

    function deletePost() {
        if (!user) return;
        if (typeof post === "string") return;
        if (user.id !== post.author.id) return;

        fetch(`/api/thread/${post.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json()).then(json => {
            if (json.error) return toast.error(`Oops! ${json.message}`);
            toast.success("Post deleted!");
            setPost("Deleted");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        });
    }

    function sendRequest(type: "join" | "leave" | "like" | "comment", data: Object = {}) {
        const abortController = new AbortController();

        setRemovePageContentWhenLoading(false);
        _setLoading(true);

        fetch(`/api/thread/${params.id}/${type}${searchParams.get("code") ? `?code=${searchParams.get("code")}` : ""}`, { signal: abortController.signal, method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } })
            .then(response => response.json())
            .then(json => {
                if (json.error) {
                    setPost(json.message ? json.message : "Oops! Something went wrong.");
                    return _setLoading(false);
                };
                setPost(json.thread);
                setHeaderImage(json.thread.header);
                if (type === "like") setDisableLike(true);
                _setLoading(false);
            });

        return () => abortController.abort();
    }

    function sendAdvancedRequest(url: string, options: Object = {}, type?: string) {
        const abortController = new AbortController();

        setRemovePageContentWhenLoading(false);
        _setLoading(true);

        url = url.replace("{id}", `${params.id}`).replace("{code}", searchParams.get("code") ? `?code=${searchParams.get("code")}` : "");
        fetch(url, { signal: abortController.signal, ...options })
            .then(response => response.json())
            .then(json => {
                if (json.error) {
                    setPost(json.message ? json.message : "Oops! Something went wrong.");
                    return _setLoading(false);
                };
                setPost(json.thread);
                setHeaderImage(json.thread.header);
                _setLoading(false);
                if (type === "edit") changePage("comments");
            });

        return () => abortController.abort();
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

    function deletePostFirst() {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Are you sure you want to delete this board? This action cannot be undone! fr...',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => deletePost(),
                },
                {
                    label: 'No',
                    onClick: () => toast.success("Post not deleted!")
                }
            ],
            overlayClassName: 'overlay-confirmation'
        })
    }

    return (
        <div className={typeof post === "string" ? "thread-main thread-main-not-found" : "thread-main"}>
            {loading && removePageContentWhenLoading ? <div className={disappear ? "loading loading-disappear" : "loading"}>
                <img src={loadingSVG} alt="loading" />
            </div> :
                typeof post === "string" ? <div className="thread-error">
                    <div className="thread-error-header">
                        <FontAwesomeIcon className="fontawesome-thread-error" icon={warningIcon} />
                        <p>{post}</p>
                    </div>
                    {!user && <div className="thread-error-body">
                        <p>You sure this board exist? Try logging in first</p>
                        <Link className="thread-error-login-button" to="/login">Login</Link>
                    </div>}
                </div> :
                    <div style={{ height: "100%" }} className={loading ? "disable-scroll" : ""}>
                        {loading && !removePageContentWhenLoading && <div className="loading">
                            <img src={loadingSVG} alt="loading" />
                        </div>}
                        <div className="thread-header">
                            <div className="thread-header-top">
                                <div className="thread-header-left">
                                    <div className="thread-header-left-title">
                                        <h1>{post.title}</h1>
                                        {post.shortDescription && <p>{post.shortDescription}</p>}
                                    </div>
                                    <div className="thread-header-left-info">
                                        <p>{post.content}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="thread-header-bottom">
                                <div className="thread-header-bottom-stats">
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <img src={post.author.profilePhoto} alt="avatar" onError={e => {
                                                (e.target as HTMLTextAreaElement).onerror = null;
                                                (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                            }} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>{post.author.username}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <FontAwesomeIcon icon={userIcon} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>{post.members.length} member{post.members.length > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <FontAwesomeIcon icon={userShieldIcon} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>{post.moderators.length} moderator{post.moderators.length > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            {getVisibilityIcon(post.visibility)}
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>{post.visibility}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <FontAwesomeIcon icon={thumbsUpIcon} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>{post.likes} like{post.likes > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <FontAwesomeIcon icon={clockIcon} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="thread-header-bottom-stats-child">
                                        <div className="thread-header-bottom-stats-child-icon">
                                            <FontAwesomeIcon icon={userClockIcon} />
                                        </div>
                                        <div className="thread-header-bottom-stats-child-text">
                                            <p>Last updated at: {new Date(post.lastActivity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="thread-header-bottom-buttons">
                                    {/* {user && post.moderators.find(u => u.id === user.id) && <div className="thread-header-bottom-buttons-button thread-header-bottom-buttons-button-edit">
                                        <FontAwesomeIcon icon={pencilIcon} />
                                        <p>Edit</p>
                                    </div>} */}
                                    {user && <div onClick={() => sendRequest("like")} className={`thread-header-bottom-buttons-button thread-header-bottom-buttons-button-like ${disableLike ? "thread-button-disabled" : ""}`}>
                                        <FontAwesomeIcon icon={thumbsUpIcon} />
                                        <p>Like</p>
                                    </div>}
                                    {user && !post.members.find(u => u.id === user.id) && <div onClick={() => sendRequest("join")} className={`thread-header-bottom-buttons-button thread-header-bottom-buttons-button-join ${post.author.id === user.id ? "thread-button-disabled" : ""}`}>
                                        <FontAwesomeIcon icon={arrowRightIcon} />
                                        <p>Join</p>
                                    </div>}
                                    {user && post.moderators.find(u => u.id === user.id) && <div onClick={() => navigator.clipboard.writeText(post.inviteLink)} className="thread-header-bottom-buttons-button thread-header-bottom-buttons-button-edit">
                                        <FontAwesomeIcon icon={linkIcon} />
                                        <p>Get Code</p>
                                    </div>}
                                    {user && post.members.find(u => u.id === user.id) && <div onClick={() => sendRequest("leave")} className={`thread-header-bottom-buttons-button thread-header-bottom-buttons-button-leave ${post.author.id === user.id ? "thread-button-disabled" : ""}`}>
                                        <FontAwesomeIcon icon={arrowLeftIcon} />
                                        <p>Leave</p>
                                    </div>}
                                    {user && post.author.id === user.id && <div onClick={() => deletePostFirst()} className="thread-header-bottom-buttons-button thread-header-bottom-buttons-button-delete">
                                        <FontAwesomeIcon icon={trashIcon} />
                                        <p>Delete</p>
                                    </div>}
                                </div>
                            </div>
                        </div>

                        <div className="thread-body">
                            <section className="thread-body-section">
                                <div className="thread-body-section-navigation">
                                    <div onClick={() => changePage("comments")} className={`thread-body-section-navigation-item ${displayLocation.type.name === "Comments" ? "thread-body-section-navigation-item-active" : ""}`}>
                                        <FontAwesomeIcon icon={commentIcon} />
                                        <p>Responses ({post.comments.length})</p>
                                    </div>
                                    <div onClick={() => changePage("members")} className={`thread-body-section-navigation-item ${displayLocation.type.name === "Members" ? "thread-body-section-navigation-item-active" : ""}`}>
                                        <FontAwesomeIcon icon={userIcon} />
                                        <p>Members ({post.members.length})</p>
                                    </div>
                                    <div onClick={() => changePage("moderators")} className={`thread-body-section-navigation-item ${displayLocation.type.name === "Moderators" ? "thread-body-section-navigation-item-active" : ""}`}>
                                        <FontAwesomeIcon icon={userShieldIcon} />
                                        <p>Moderators ({post.moderators.length})</p>
                                    </div>
                                    {user && post.moderators.find(u => u.id === user.id) && <div onClick={() => changePage("edit")} className={`thread-body-section-navigation-item ${displayLocation.type.name === "Edit" ? "thread-body-section-navigation-item-active" : ""}`}>
                                        <FontAwesomeIcon icon={pencilIcon} />
                                        <p>Edit</p>
                                    </div>}
                                </div>
                                <section className={`thread-body-section-content ${transitionStage}`}
                                    onAnimationEnd={() => {
                                        if (transitionStage === "fadeOut") {
                                            setTransistionStage("fadeIn");
                                            setDisplayLocation(page);
                                        }
                                    }}>
                                    {displayLocation}
                                </section>
                            </section>
                            <section className="thread-body-informations">
                                <div className="thread-body-informations-child">
                                    <div className="thread-body-informations-child-header">
                                        <FontAwesomeIcon icon={userShieldIcon} />
                                        <p>Moderators</p>
                                        <div className="thread-body-informations-child-header-circle">
                                            <p>{post.moderators.length}</p>
                                        </div>
                                    </div>
                                    <div className="thread-body-informations-child-content">
                                        {post.moderators.map(u => <div className="thread-body-informations-child-content-user" key={u.id}>
                                            <div className="thread-body-informations-child-content-user-avatar">
                                                <img src={u.profilePhoto} alt={u.username} onError={e => {
                                                    (e.target as HTMLTextAreaElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                                }} />
                                            </div>
                                            <p>{u.username}</p>
                                            {u.id === post.author.id && <FontAwesomeIcon color="#f4c430" style={{ marginLeft: "5px" }} icon={crownIcon} />}
                                            {post.moderators.find(us => us.id === u.id) && <FontAwesomeIcon color="#2554C7" style={{ marginLeft: "5px" }} icon={userShieldIcon} />}
                                        </div>)}
                                    </div>
                                </div>
                                <div className="thread-body-informations-child">
                                    <div className="thread-body-informations-child-header">
                                        <FontAwesomeIcon icon={userIcon} />
                                        <p>Members</p>
                                        <div className="thread-body-informations-child-header-circle">
                                            <p>{post.members.length}</p>
                                        </div>
                                    </div>
                                    <div className="thread-body-informations-child-content">
                                        {post.members.map(u => <div className="thread-body-informations-child-content-user" key={u.id}>
                                            <div className="thread-body-informations-child-content-user-avatar">
                                                <img src={u.profilePhoto} alt={u.username} onError={e => {
                                                    (e.target as HTMLTextAreaElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                                }} />
                                            </div>
                                            <p>{u.username}</p>
                                            {u.id === post.author.id && <FontAwesomeIcon color="#f4c430" style={{ marginLeft: "5px" }} icon={crownIcon} />}
                                            {post.moderators.find(us => us.id === u.id) && <FontAwesomeIcon color="#2554C7" style={{ marginLeft: "5px" }} icon={userShieldIcon} />}
                                        </div>)}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
            }
        </div>);
}