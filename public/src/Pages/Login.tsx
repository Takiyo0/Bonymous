import "../CSS/Login.css";
import { User } from "../Constants";
import { useEffect, useState } from "react";

export default function Login() {
    const [disabled, setDisabled] = useState<boolean>(true);

    useEffect(() => {
        const abortController = new AbortController();

        fetch("/api/user", { signal: abortController.signal })
            .then(response => response.json())
            .then(json => setDisabled(!!json.user));

        return () => abortController.abort();
    }, []);



    function handleLogin() {
        window.location.href = "/api/auth/google";
    }
    return (<div className="login-main">
        <div className="login-body">
            <div className="login-header">
                <h1>Login</h1>
            </div>
            <div className="login-method">
                <div className={disabled ? "login-method-child login-method-child-disabled" : "login-method-child"} onClick={() => handleLogin()}>
                    <GoogleIcon />
                    <p>Login with Google</p>
                </div>
            </div>
        </div>
    </div>
    )
}

const GoogleIcon = (props: any) => (
    <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fill="#4285F4"
            d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
        />
        <path
            fill="#34A853"
            d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"
        />
        <path
            fill="#FBBC05"
            d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"
        />
        <path
            fill="#EA4335"
            d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
        />
    </svg>
)