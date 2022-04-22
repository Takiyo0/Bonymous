import "../CSS/Create.css";
import loadingSVG from "../Assets/Loading.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import CropperJs from 'cropperjs';
import "cropperjs/dist/cropper.css";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faImage, faExclamationTriangle } from "@fortawesome/fontawesome-free-solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { User } from "../Constants";

const imageIcon: IconProp = faImage as IconProp;
const warningIcon: IconProp = faExclamationTriangle as IconProp;

export default function Create({ user }: { user: User | null }) {
    const navigate = useNavigate();

    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [header, setHeader] = useState<string>("");
    const [visibility, setVisibility] = useState<string>("unlisted");
    const [shortDescription, setShortDescription] = useState<string>("");
    const [loading, setLoading] = useState<Boolean>(false);
    const [disappear, setDisappear] = useState<Boolean>(false);

    // cropper thingy
    const [useThisImage, setUseThisImage] = useState<Boolean>(false);
    const [tempImageBase, setTempImageBase] = useState<string>("");
    const [cropper, setCropper] = useState<CropperJs>();

    useEffect(() => {
        if (!useThisImage) return setTempImageBase("");
        if (!cropper) return;
        cropper.getCroppedCanvas().toBlob(blob => sendBlobImage(blob));
    }, [useThisImage]);

    function _setLoading(value: Boolean) {
        setDisappear(!value);
        setTimeout(() => {
            setLoading(value);
        }, 500);
    }

    function sendBlobImage(blob: Blob | null) {
        if (!blob) return;
        const formData = new FormData();
        formData.append("image", blob);
        _setLoading(true);
        toast.info("Uploading image...");
        fetch("/api/file/upload", {
            method: "POST",
            body: formData,
        }).then(response => response.json())
            .then(json => {
                if (json.error) return;
                setHeader(json.url);
                setUseThisImage(true);
                _setLoading(false);
                toast.success("Image uploaded!");
            }).catch(err => {
                _setLoading(false);
                toast.error("Error uploading image!");
            });
    }

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!title || !content || !header || !header.startsWith("/api/file") || !shortDescription) return toast.error("Invalid fields!");
        _setLoading(true);

        toast.info("Creating thread...");
        fetch("/api/thread", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content,
                header,
                shortDescription,
                visibility,
            }),
        }).then(response => response.json())
            .then(json => {
                if (json.error) return toast.error(`Error creating thread: ${json.message}`);
                setTitle("");
                setContent("");
                setHeader("");
                setShortDescription("");
                setVisibility("unlisted");
                setUseThisImage(false);
                setTempImageBase("");
                _setLoading(false);
                toast.success("Thread created!");
                navigate("/");
            }).catch(err => {
                _setLoading(false);
                toast.error("Error creating thread!");
            });
    }


    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => setTempImageBase(reader.result as string);
        reader.readAsDataURL(file);
    }

    return (<div className="create-parent">
        {loading && <div className={disappear ? "loading loading-disappear" : "loading"}>
            <img src={loadingSVG} alt="loading" />
        </div>}
        {user ? <div className="create-child">
            <div className="create-child-header">
                <h1>Create a new board</h1>
            </div>
            <div className="create-child-body">
                <form onSubmit={onSubmit}>
                    <div className="create-child-body-title">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
                    </div>
                    <div className="create-child-body-short-description">
                        <label htmlFor="short-description">Short description</label>
                        <input id="short-description" value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} required />
                    </div>
                    <div className="create-child-body-content">
                        <label htmlFor="content">Content</label>
                        <textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} required />
                    </div>
                    <div className="create-child-body-visibility">
                        <label htmlFor="visibility">Visibility</label>
                        <select id="visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                            <option value="unlisted">Unlisted</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div className="create-child-body-header">
                        <label htmlFor="header">Header</label>
                        <input type="file" accept="image/*" onChange={onFileChange} disabled={!!useThisImage} required />
                        <div className="create-child-body-headers">
                            {!useThisImage ? <div className="edit-body-list-item-preview">
                                {tempImageBase && <Cropper
                                    dragMode="move"
                                    style={{ height: 400, width: "100%" }}
                                    zoomTo={0.5}
                                    initialAspectRatio={2.5 / 1}
                                    aspectRatio={2.5 / 1}
                                    preview=".img-preview"
                                    src={tempImageBase}
                                    viewMode={1}
                                    minCropBoxHeight={10}
                                    minCropBoxWidth={10}
                                    background={false}
                                    responsive={true}
                                    autoCropArea={1}
                                    checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                                    onInitialized={(instance) => {
                                        setCropper(instance);
                                    }}
                                    guides={true}
                                />}
                                {!tempImageBase && <div className="edit-body-list-item-preview-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <FontAwesomeIcon icon={imageIcon} size={"3x"} />
                                    <p style={{ textAlign: "center" }}>Select image to see the preview</p>
                                </div>}
                            </div> : <div className="edit-body-list-item-preview-image">
                                <img style={{ width: "100%", aspectRatio: "2.5/1" }} src={header} />
                            </div>}
                            <div className="create-child-body-headers-button-confirm">
                                <button onClick={() => setUseThisImage(!useThisImage)} style={tempImageBase ? {} : { pointerEvents: "none", filter: "opacity(.7)" }}>{useThisImage ? "Use another image" : "Use this image"}</button>
                            </div>
                        </div>
                    </div>
                    <div className="create-child-body-submit">
                        <input type="submit" value="Create" />
                    </div>
                </form>

            </div>
        </div> : <div className="thread-error">
            <div className="thread-error-header">
                <FontAwesomeIcon className="fontawesome-thread-error" icon={warningIcon} />
                <p>You must be logged in to create a board</p>
            </div>
        </div>}
    </div>);
}
