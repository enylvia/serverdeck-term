import "./styles.sass";
import Icon from "@mdi/react";
import { mdiMagnify, mdiDns, mdiMenu } from "@mdi/js";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import { useTranslation } from "react-i18next";
import { getAvatarLabel } from "@/common/utils/avatar.js";
import LetterAvatar from "@/common/components/LetterAvatar";

export const TopNavBar = () => {
    const { user } = useContext(UserContext);
    const { t } = useTranslation();
    const searchInputRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        window.dispatchEvent(new CustomEvent("fleetSearch", { detail: value }));
    };

    const handleUserClick = () => {
        window.dispatchEvent(new CustomEvent("openSettings", { detail: { tab: "account" } }));
    };

    return (
        <header className="top-nav-bar">
            {/* Left: Brand Identity */}
            <div className="nav-brand">
                <button
                    type="button"
                    className="mobile-drawer-toggle"
                    onClick={() => window.dispatchEvent(new CustomEvent("toggleServerList"))}
                    title="Toggle Cluster Fleet"
                >
                    <Icon path={mdiMenu} size={0.8} />
                </button>
                <div className="brand-icon-box">
                    <Icon path={mdiDns} size={0.75} className="brand-icon" />
                </div>
                <div className="brand-text">
                    <span className="brand-title">ServerDeck</span>
                    <span className="brand-subtitle">v2.4.1 Node Cluster</span>
                </div>
                <span className="status-pulse-dot" title="Nodes Synchronized" />
            </div>

            {/* Center: Global Search */}
            <div className="nav-search-container">
                <Icon path={mdiMagnify} size={0.75} className="search-icon" />
                <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search fleet, tags, IP address or hosts..."
                    value={searchValue}
                    onChange={handleSearchChange}
                />
                <div className="search-kbd" onClick={() => searchInputRef.current?.focus()}>
                    <kbd>CTRL</kbd>
                    <span>+</span>
                    <kbd>S</kbd>
                </div>
            </div>

            {/* Right: User Profile Chip */}
            <div className="nav-user-area" onClick={handleUserClick} title="Account Settings">
                <div className="user-avatar-circle">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="user-details">
                    <span className="user-display-name">
                        {getAvatarLabel(user, user?.username || "Admin")}
                    </span>
                    <span className="user-role-badge">
                        {user?.username ? `${user.username}@local` : "root@local"}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default TopNavBar;
