import "../../CSS/Thread.css";
import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-cropper";
import CropperJs from 'cropperjs';
import "cropperjs/dist/cropper.css";
import { Thread, User } from "../../Constants";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { confirmAlert } from 'react-confirm-alert';
import { faImage, faTruckLoading } from "@fortawesome/fontawesome-free-solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import getCroppedImg from "../../Utils/GetCroppedImage";

const imageIcon: IconProp = faImage as IconProp;
const truckIcon: IconProp = faTruckLoading as IconProp;

export default function Edit({ post, user, sendAdvancedRequest, setLoading }: { post: Thread | string, user: User | null, sendAdvancedRequest: (url: string, options?: Object, type?: string) => void, setLoading: React.Dispatch<React.SetStateAction<Boolean>> }) {
    const [title, setTitle] = useState(typeof post !== "string" ? post.title : "");
    const [content, setContent] = useState(typeof post !== "string" ? post.content : "");
    const [header, setHeader] = useState(typeof post !== "string" ? post.header : "");
    const [shortDescription, setShortDescription] = useState(typeof post !== "string" ? post.shortDescription : "");
    const [visibility, setVisibility] = useState(typeof post !== "string" ? post.visibility : "public");
    const [disablePost, setDisablePost] = useState<Boolean>(true);

    const [useThisImage, setUseThisImage] = useState<Boolean>(true);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [tempImageBase, setTempImageBase] = useState<string>("");
    const [cropper, setCropper] = useState<CropperJs>();

    const [localLoading, setLocalLoading] = useState<Boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<any>(null);
    const firstInit = useRef<Boolean>(true);

    useEffect(() => {
        if (typeof post === "string") return;
        if (!title && !content && !header && !shortDescription && !visibility) setDisablePost(true);
        else if (title === post.title && content && post.content && content === post.content && header && post.header && header === post.header && shortDescription && post.shortDescription && shortDescription === post.shortDescription && visibility && post.visibility && visibility === post.visibility) setDisablePost(true);
        else setDisablePost(false);
    }, [title, content, header, shortDescription, visibility]);

    useEffect(() => {
        if (firstInit.current) {
            firstInit.current = false;
            return;
        }
        if (typeof post === "string") return;
        if (!useThisImage) return;
        if (!cropper) return;

        getCropData();
    }, [useThisImage]);

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => setTempImageBase(reader.result as string);
        reader.readAsDataURL(file);
    }

    function getCropData() {
        if (typeof cropper !== "undefined") {
            setLocalLoading(true);
            cropper.getCroppedCanvas().toBlob((blob) => {
                if (!blob) return;
                const formData = new FormData();
                formData.append("image", blob, "image.png");
                fetch("/api/file/upload", {
                    method: "POST",
                    body: formData,
                }).then(res => res.json()).then(res => {
                    if (res.error) return;
                    setHeader(res.url);
                    setUseThisImage(true);
                    setLocalLoading(false);
                }).catch(err => {
                    setLocalLoading(false);
                });
            });
        }
    }

    // async function uploadImage(blobUrl: string) {
    //     const responseImage = await fetch(blobUrl);
    //     const blob = await responseImage.blob();
    //     const formData = new FormData();
    //     formData.append("image", blob);
    //     console.log(blob, formData)
    //     const response = await fetch("/api/file/upload", {
    //         method: "POST",
    //         body: formData
    //     });
    //     const data = await response.json();
    //     console.log(data);
    // }



    function startEdit() {
        if (!title && !content && !header && !shortDescription && !visibility) return setDisablePost(true);
        if (typeof post === "string") return;
        if (disablePost) return;

        let data: { title?: string, content?: string, header?: string, shortDescription?: string, visibility?: string } = {};
        if (title) data["title"] = title;
        if (content) data["content"] = content;
        if (header) data["header"] = header;
        if (shortDescription) data["shortDescription"] = shortDescription;
        if (visibility) data["visibility"] = visibility;

        sendAdvancedRequest(`/api/thread/${post.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }, "edit");
    }

    return (<div className={localLoading ? "edit edit-loading" : "edit"}>
        {localLoading && <div className="edit-loading-overlay">
            <FontAwesomeIcon icon={truckIcon} className="edit-loading-icon" fontSize={"70px"} color="white" />
        </div>}
        <div className="edit-header">
            <div className="edit-header-title">Edit</div>
        </div>
        {typeof post !== "string" && <div className="edit-body">
            <div className="edit-body-list">
                <div className="edit-body-list-item">
                    <div className="edit-body-list-item-title">Title</div>
                    <div className="edit-body-list-item-content">
                        <input type="text" value={title} onChange={e => setTitle(e.currentTarget.value)} />
                    </div>
                </div>
                <div className="edit-body-list-item">
                    <div className="edit-body-list-item-title">Short Description</div>
                    <div className="edit-body-list-item-content">
                        <input type="text" value={shortDescription} onChange={e => setShortDescription(e.currentTarget.value)} />
                    </div>
                </div>
                <div className="edit-body-list-item">
                    <div className="edit-body-list-item-title">Content</div>
                    <div className="edit-body-list-item-content">
                        <textarea value={content} onChange={e => setContent(e.currentTarget.value)} />

                    </div>
                </div>
                <div className="edit-body-list-item">
                    <div className="edit-body-list-item-title">Header</div>
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
                        <img src={header} />
                    </div>}
                    <div className="edit-body-list-item-previews">
                        {!useThisImage && <div className="edit-body-list-item-previews-child">
                            <h1>Preview</h1>
                            <div className="img-preview" />
                        </div>}
                        {/* <div className="edit-body-list-item-previews-child">
                            <h1>Result</h1>
                            <img style={{ width: "100%" }} src={cropData} alt="cropped" />
                        </div> */}
                    </div>

                    <div className="edit-body-list-item-content">
                        {useThisImage ? <div className="edit-body-list-item-content-upload-progress">
                            <div className="edit-body-list-item-content-upload-progress-bar">
                                <div className="edit-body-list-item-content-upload-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div> : <input type="file" accept="image/*" onChange={onFileChange} />}
                    </div>
                    <div className="edit-body-list-item-confirm">
                        <button onClick={() => setUseThisImage(!useThisImage)}>{useThisImage ? "Use another image" : "Use this image"}</button>
                    </div>
                </div>
                <div className="edit-body-list-item">
                    <div className="edit-body-list-item-title">Visibility</div>
                    <div className="edit-body-list-item-content">
                        <select value={visibility} onChange={e => setVisibility(e.currentTarget.value)}>
                            <option value="public">Public</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className={`edit-body-send ${disablePost ? "edit-body-send-disabled" : ""}`}>
                <button onClick={() => startEdit()}>Post edit</button>
            </div>
        </div>}
    </div>
    );
}