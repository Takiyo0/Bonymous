import "./CSS/App.css";
import { useEffect, useRef, useState } from "react";
import { Link, Routes, useLocation, Route } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faHome, faInfoCircle, faSearch, faPlus, faAngleLeft, faLink, faUser } from "@fortawesome/fontawesome-free-solid";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './Pages/Home';
import About from "./Pages/About";
import Thread from "./Pages/Thread";
import Search from "./Pages/Search";
import Code from "./Pages/Code";
import Create from "./Pages/Create";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import { User } from "./Constants";

const homeIcon: IconProp = faHome as IconProp;
const aboutIcon: IconProp = faInfoCircle as IconProp;
const searchIcon: IconProp = faSearch as IconProp;
const plusIcon: IconProp = faPlus as IconProp;
const angleLeftIcon: IconProp = faAngleLeft as IconProp;
const linkIcon: IconProp = faLink as IconProp;
const userIcon: IconProp = faUser as IconProp;


export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState<Boolean>(window.innerWidth > 768);
    const [imageLazyChunk, setImageLazyChunk] = useState<{ [key: string]: boolean; }[]>([
        { "sidebar-user-image": true },
    ]);
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransistionStage] = useState("fadeIn");

    const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

    const timeout1 = useRef<NodeJS.Timeout | null>(null);
    const timeout2 = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchUser();
        setInterval(fetchUser, 120 * 1000); // fetch user every 2 minutes in case they got logged out automatically

        window.onresize = () => {
            resizeTimeout.current && clearTimeout(resizeTimeout.current);
            resizeTimeout.current = setTimeout(resizeHandler, 200);
        }
    }, []);

    useEffect(() => {
        if (location !== displayLocation) setTransistionStage("fadeOut");
    }, [location, displayLocation]);

    function resizeHandler() {
        setIsOpen(window.innerWidth > 768);
    }

    function fetchUser() {
        const abortController = new AbortController();

        fetch("/api/user", { signal: abortController.signal })

            .then(response => response.json())
            .then(json => {
                if (!json.loggedIn) setUser(buildAnonymousUser());
                setUser(json.user);
            });

        return () => abortController.abort();
    }

    function addImageLazyChunk(image: any) {
        setImageLazyChunk(imageLazyChunk => [...imageLazyChunk, image]);
    }

    function removeImageLazyChunk(image: any) {
        setImageLazyChunk(imageLazyChunk => imageLazyChunk.filter(i => i !== image));
    }

    async function changeBackground(url?: string) {
        return;
        // const bgImageElement = document.getElementById("bg-image");
        // const contentElement = document.getElementById("content");
        // if (!bgImageElement || !contentElement) return;

        // if (timeout1.current) clearTimeout(timeout1.current);
        // if (timeout2.current) clearTimeout(timeout2.current);

        // bgImageElement.classList.remove("bg-image-active");
        // contentElement.style.backgroundColor = "#f4f4f4";
        // contentElement.style.opacity = "1";
        // if (!url) return;
        // timeout1.current = setTimeout(() => {
        //     bgImageElement.style.backgroundImage = `url(${url})`;
        //     timeout2.current = setTimeout(() => {
        //         bgImageElement.classList.add("bg-image-active");
        //         contentElement.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        //         contentElement.style.opacity = "0";
        //     }, 50);
        // }, 100);
    }

    function wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    function buildAnonymousUser() {
        return {
            id: "0",
            firstName: "",
            lastName: "",
            username: "Anonymous",
            profilePhoto: "",
            source: "anonymous",
            lastVisited: new Date(),
            isAdmin: false,
            data: {}
        }
    }

    return (
        <div className="App">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="bg-image" id="bg-image" />
            <section className={isOpen ? "sidebar" : "sidebar sidebar-container-closed"}>
                <div className={isOpen ? "sidebar-header" : "sidebar-header sidebar-closed"}>
                    <h1>Anonymous Board</h1>
                    <p className="sidebar-header-version">Pre-release 1.0.0</p>
                </div>
                <div className={isOpen ? "sidebar-body" : "sidebar-body sidebar-closed"}>
                    <Link className={location.pathname === "/" ? "sidebar-button sidebar-button-active" : "sidebar-button"} to="/">
                        <FontAwesomeIcon icon={homeIcon} />
                        <p>Home</p>
                    </Link>
                    <Link className={location.pathname === "/search" ? "sidebar-button sidebar-button-active" : "sidebar-button"} to="/search">
                        <FontAwesomeIcon icon={searchIcon} />
                        <p>Search</p>
                    </Link>
                    <Link className={location.pathname === "/code" ? "sidebar-button sidebar-button-active" : "sidebar-button"} to="/code">
                        <FontAwesomeIcon icon={linkIcon} />
                        <p>Code</p>
                    </Link>
                    {user && <Link className={location.pathname === "/new" ? "sidebar-button sidebar-button-active" : "sidebar-button"} to="/new">
                        <FontAwesomeIcon icon={plusIcon} />
                        <p>Create Board</p>
                    </Link>}
                    <Link className={location.pathname === "/about" ? "sidebar-button sidebar-button-active" : "sidebar-button"} to="/about">
                        <FontAwesomeIcon icon={aboutIcon} />
                        <p>About</p>
                    </Link>

                    <Link className={location.pathname === "/profile" ? "sidebar-user sidebar-user-active" : "sidebar-user"} to={user ? "/profile" : "/login"}>
                        {user && user.profilePhoto ? <img src={user ? user.profilePhoto : ""} alt="profile" /> : <FontAwesomeIcon fontSize={"50px"} icon={userIcon} />}
                        <p>{user ? user.username : "Anonymous"}</p>
                    </Link>
                </div>
            </section>
            <div className={isOpen ? "sidebar-close-button" : "sidebar-close-button sidebar-close-closed"} onClick={() => {
                setIsOpen(!isOpen);
            }}>
                <FontAwesomeIcon style={{ marginRight: "5px" }} icon={angleLeftIcon} />
            </div>
            <section className={isOpen ? `content ${transitionStage}` : `content content-closed ${transitionStage}`} id="content"
                onAnimationEnd={() => {
                    if (transitionStage === "fadeOut") {
                        setTransistionStage("fadeIn");
                        setDisplayLocation(location);
                    }
                }}>
                {/* {useRoutes([
                    { path: '/', element: <Home /> },
                    { path: '/about', element: <About /> },
                    { path: '/board/:id', element: <Thread user={user} /> },
                    { path: '/search', element: <Search user={user} /> }
                ])} */}
                <Routes location={displayLocation}>
                    <Route path="/" element={<Home changeBackground={changeBackground} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/board/:id" element={<Thread user={user} />} />
                    <Route path="/search" element={<Search user={user} />} />
                    <Route path="/code" element={<Code />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/new" element={<Create user={user} />} />
                    <Route path="/profile" element={<Profile user={user} />} />
                </Routes>
            </section>
        </div>
    );
}