import "../CSS/Search.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Thread, User } from "../Constants";
import loadingSVG from "../Assets/Loading.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBoxOpen, faThumbsUp, faUser, faComment, faHandPointer } from "@fortawesome/fontawesome-free-solid";

const batteryIcon: IconProp = faBoxOpen as IconProp;
const thumbsUpIcon: IconProp = faThumbsUp as IconProp;
const userIcon: IconProp = faUser as IconProp;
const commentIcon: IconProp = faComment as IconProp;
const handPointerIcon: IconProp = faHandPointer as IconProp;

export default function Search({ user }: { user: User | null }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [disappear, setDisappear] = useState<Boolean>(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (query.length < 3) return setResults([]);

        searchTimeout.current && clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(searchHandler, 500);
    }, [query]);

    function searchHandler() {
        _setLoading(true);
        fetch(`/api/thread/search?q=${query}`)
            .then(response => response.json())
            .then(json => {
                setResults(json.thread);
                _setLoading(false);
            });
    }

    function _setLoading(value: Boolean) {
        setDisappear(!value);
        setTimeout(() => {
            setIsLoading(value);
        }, 500);
    }

    return (<div className="search-main">
        <div className="search-main-content">
            <div className="search-main-content-header">
                <div className="search-main-content-header-title">
                    <h1>Search</h1>
                </div>
                <div className="search-main-content-header-search">
                    <input readOnly={Boolean(isLoading)} type="text" placeholder="Search" onChange={e => setQuery(e.currentTarget.value)} />
                </div>
            </div>
            <div className={`search-main-content-results ${results.length ? "search-main-content-results-disable-justify" : ""}`}>
                {isLoading && <div className={disappear ? "loading loading-disappear" : "loading"}>
                    <img src={loadingSVG} alt="loading" />
                </div>}
                {(!query || query.length < 3) && <div className="search-main-content-results-empty">
                    <FontAwesomeIcon icon={handPointerIcon} />
                    <p>Enter a search query</p>
                </div>}
                {!isLoading && query.length >= 3 && results.length === 0 && <div className="search-main-content-results-no-results">
                    <FontAwesomeIcon icon={batteryIcon} />
                    <p>No results found</p>
                </div>}
                {!isLoading && results.length > 0 && <div className="search-main-content-results-results">
                    {results.map((post, index: number) => <div key={index} className="home-child-body-posts-post home-child-body-posts-post-search" onClick={() => navigate(`/board/${post.id}`)}>
                        <div className="home-child-body-posts-post-body">
                            <div className="home-child-body-posts-post-title">
                                <h2>{post.title}</h2>
                            </div>
                            <div className="home-child-body-posts-post-stats">
                                <div className="home-child-body-posts-post-stats-child">
                                    <img src={post.author.profilePhoto} alt="profile" onError={e => {
                                            (e.target as HTMLTextAreaElement).onerror = null;
                                            (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                        }}/>
                                    <p>Created by: {post.author.firstName}</p>
                                </div>
                                <div className="home-child-body-posts-post-stats-child">
                                    <FontAwesomeIcon icon={thumbsUpIcon} />
                                    <p>{post.likes} like{post.likes > 1 ? "s" : ""}</p>
                                </div>
                                <div className="home-child-body-posts-post-stats-child">
                                    <FontAwesomeIcon icon={commentIcon} />
                                    <p>{post.comments.length} response{post.comments.length > 1 ? "s" : ""}</p>
                                </div>
                                <div className="home-child-body-posts-post-stats-child">
                                    <FontAwesomeIcon icon={userIcon} />
                                    <p>{post.members.length} member{post.members.length > 1 ? "s" : ""}</p>
                                </div>
                            </div>
                        </div>
                    </div>)}
                </div>}

            </div>
        </div>
    </div>)
}