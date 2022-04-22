import { useEffect, useState } from "react";
import { User } from "../Constants";
import "../CSS/Profile.css";

import { timeDifference } from "../Utils";

import Comments from "./Profile/Comments";
import Member from "./Profile/Member";
import Moderator from "./Profile/Moderator";
import Posts from "./Profile/Posts";
import Settings from "./Profile/Settings";

export default function Profile({ user }: { user: User | null }) {
    const [pageName, setPageName] = useState<"posts" | "member" | "comments" | "moderating" | "settings">("posts");

    const [page, setPage] = useState<JSX.Element | null>(<Posts user={user} />);
    const [displayLocation, setDisplayLocation] = useState(page);
    const [transitionStage, setTransistionStage] = useState("fadeIn");

    useEffect(() => {
        setPageTo(pageName);
    }, [pageName]);

    useEffect(() => {
        if (page !== displayLocation) setTransistionStage("fadeOut");
    }, [page, displayLocation]);

    function setPageTo(pageName: "posts" | "member" | "comments" | "moderating" | "settings") {
        switch (pageName) {
            case "posts":
                setPage(<Posts user={user} />);
                break;
            case "member":
                setPage(<Member user={user} />);
                break;
            case "comments":
                setPage(<Comments user={user} />);
                break;
            case "moderating":
                setPage(<Moderator user={user} />);
                break;
            case "settings":
                setPage(<Settings user={user} />);
                break;
        }
    }

    return (<div className="profile-parent">
        {/* make a profile page for the user including avatar */}
        {user ? (<div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <img src={user?.profilePhoto} alt="avatar" />
                </div>
                <div className="profile-info">
                    <div className="profile-info-username">
                        @{user?.username}
                    </div>
                    <div className="profile-name">
                        <p>First name: {user?.firstName}</p>
                        &#8195;
                        <p>Last name: {user?.lastName}</p>
                    </div>
                    <div className="profile-info-bottom">
                        <div className="profile-info-last-visited">
                            <p>Last visited: {timeDifference(new Date().getTime(), new Date(user.lastVisited).getTime())}</p>
                        </div>
                        <div className="profile-info-admin">
                            <p>Admin: {user?.isAdmin ? "Yes" : "No"}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-body">
                <div className="profile-body-pages">
                    <div className={pageName === "posts" ? "profile-body-page profile-body-page-active" : "profile-body-page"} onClick={() => setPageName("posts")}>
                        <p>Posts</p>
                    </div>
                    <div className={pageName === "member" ? "profile-body-page profile-body-page-active" : "profile-body-page"} onClick={() => setPageName("member")}>
                        <p>Member</p>
                    </div>
                    <div className={pageName === "comments" ? "profile-body-page profile-body-page-active" : "profile-body-page"} onClick={() => setPageName("comments")}>
                        <p>Comments</p>
                    </div>
                    <div className={pageName === "moderating" ? "profile-body-page profile-body-page-active" : "profile-body-page"} onClick={() => setPageName("moderating")}>
                        <p>Moderator</p>
                    </div>
                    <div className={pageName === "settings" ? "profile-body-page profile-body-page-active" : "profile-body-page"} onClick={() => setPageName("settings")}>
                        <p>Settings</p>
                    </div>
                </div>
                <section className={`profile-body-section-content ${transitionStage}`}
                    onAnimationEnd={() => {
                        if (transitionStage === "fadeOut") {
                            setTransistionStage("fadeIn");
                            setDisplayLocation(page);
                        }
                    }}>
                    {displayLocation}
                </section>
            </div>
        </div>) : ""}
    </div>);
}