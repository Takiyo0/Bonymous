import "../../CSS/Thread.css";
import { Thread, User } from "../../Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { confirmAlert } from 'react-confirm-alert';
import { faCrown, faUserShield, faUser } from "@fortawesome/fontawesome-free-solid";

const crownIcon: IconProp = faCrown as IconProp;
const shieldIcon: IconProp = faUserShield as IconProp;
const userIcon: IconProp = faUser as IconProp;

export default function Moderators({ post, user, sendAdvancedRequest }: { post: Thread | string, user: User | null, sendAdvancedRequest: (url: string, options?: Object) => void }) {

    function onClickButton(type: "makeModerator" | "removeModerator", user: User) {
        switch (type) {
            case "makeModerator":
                alert("Assign a moderator", `Are you sure you want to make ${user.username} a moderator?`, () => sendAdvancedRequest(`/api/thread/{id}/moderator`, { method: "POST", body: JSON.stringify({ userId: user.id }), headers: { "Content-Type": "application/json" } }));
                break;
            case "removeModerator":
                alert("Un-assign a moderator", `Are you sure you want to remove ${user.username} as a moderator?`, () => sendAdvancedRequest(`/api/thread/{id}/moderator`, { method: "DELETE", body: JSON.stringify({ userId: user.id }), headers: { "Content-Type": "application/json" } }));
                break;
        }
    }

    function alert(title: string, text: string, callback: () => void) {
        confirmAlert({
            title: title,
            message: text,
            buttons: [
                {
                    label: 'Yes',
                    onClick: callback,
                },
                {
                    label: 'No',
                    onClick: () => void 0
                }
            ],
            overlayClassName: 'overlay-confirmation'
        });
    }

    return (<div className="members">
        <div className="members-header">
            <div className="members-header-title">Moderators</div>
        </div>
        <div className="members-body">
            <div className="members-body-list">
                {typeof post !== "string" && post.moderators.map((member) => {
                    return (<div className="members-body-list-item">
                        <div className="members-body-list-item-avatar">
                            <img src={member.profilePhoto} alt={member.username} onError={e => {
                                            (e.target as HTMLTextAreaElement).onerror = null;
                                            (e.target as HTMLImageElement).src = "https://i.imgur.com/JGk69Vz.png";
                                        }} />
                        </div>
                        <div className="members-body-list-item-name">
                            <p>{member.username}</p>
                        </div>
                        <div className="members-body-list-item-badges">
                            {member.id === post.author.id && <FontAwesomeIcon color="#f4c430" icon={crownIcon} />}
                            {post.moderators.find(u => u.id === member.id) && <FontAwesomeIcon color="#2554C7" style={{ marginLeft: "5px" }} icon={shieldIcon} />}
                            {post.members.find(u => u.id === member.id) && <FontAwesomeIcon color="#8B008B" style={{ marginLeft: "5px" }} icon={userIcon} />}
                        </div>

                        <div className="members-body-list-item-buttons">
                            {user && post.author.id === user.id && !post.moderators.find(u => u.id === member.id) && <button className={`members-body-list-item-buttons-blue ${post.author.id === member.id ? "members-body-list-item-buttons-disabled" : ""}`} onClick={() => onClickButton("makeModerator", member)}>Make Moderator</button>}
                            {user && post.author.id === user.id && post.moderators.find(u => u.id === member.id) && <button className={`members-body-list-item-buttons-red ${post.author.id === member.id ? "members-body-list-item-buttons-disabled" : ""}`} onClick={() => onClickButton("removeModerator", member)}>Remove Moderator</button>}
                        </div>
                    </div>)
                })}
            </div>
        </div>
    </div>)
}