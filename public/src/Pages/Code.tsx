import "../CSS/Code.css";
import { useState } from "react";
import loadingSVG from "../Assets/Loading.svg";
import { useNavigate } from "react-router-dom";

export default function Code() {
    const [code, setCode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [disappear, setDisappear] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const navigate = useNavigate();


    function _setLoading(value: boolean) {
        setDisappear(!value);
        setTimeout(() => {
            setLoading(value);
        }, 500);
    }

    function onSubmit() {
        if (!code) return setError("Code cannot be empty!");
        _setLoading(true);
        fetch(`/api/thread/code/${code}`)
            .then(response => response.json())
            .then(json => {
                if (json.error || !json.thread) {
                    setError(json.message);
                    _setLoading(false);
                } else {
                    navigate({
                        pathname: `/board/${json.thread.id}`,
                        search: `?code=${code}`
                    });
                    _setLoading(false);
                }
            });

    }

    return (<div className="code-main">
        {loading && <div className={disappear ? "loading loading-disappear" : "loading"}>
            <img src={loadingSVG} alt="loading" />
        </div>}
        <div className="code-body">
            <div className="code-header">
                <h1>Enter board Invite Code</h1>
            </div>
            <div className="code-input">
                <input type="text" onChange={e => setCode(e.currentTarget.value)} placeholder="Enter Invite Code" />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="code-button">
                <button onClick={onSubmit}>Join</button>
            </div>
        </div>
    </div>)
}