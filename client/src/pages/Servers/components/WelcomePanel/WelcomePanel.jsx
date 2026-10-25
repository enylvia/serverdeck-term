import "./styles.sass";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import { ServerContext } from "@/common/contexts/ServerContext.jsx";
import { IdentityContext } from "@/common/contexts/IdentityContext.jsx";
import { useActiveSessions } from "@/common/contexts/SessionContext.jsx";
import Icon from "@mdi/react";
import {
    mdiHistory,
    mdiPower,
    mdiPlay,
    mdiFlash,
    mdiServerNetwork,
    mdiConnection,
    mdiFolderOpen,
    mdiCursorDefaultClick,
    mdiDownload,
    mdiLinkVariant,
    mdiWeb,
    mdiContentCopy,
    mdiCheck,
    mdiDevices,
    mdiShieldCheck,
    mdiKey,
    mdiLock,
    mdiMicrosoftWindows,
    mdiApple,
    mdiLinux,
    mdiCellphone,
    mdiPlus
} from "@mdi/js";
import { getRequest } from "@/common/utils/RequestUtil";
import { useTranslation } from "react-i18next";
import { ContextMenu, ContextMenuItem, useContextMenu } from "@/common/components/ContextMenu";
import { getIconPath } from "@/common/utils/iconUtils.js";
import DownloadAppsDialog from "@/common/components/DownloadAppsDialog";
import { DeviceLinkDialog } from "@/common/components/DeviceLinkDialog/DeviceLinkDialog.jsx";
import { getAvatarLabel } from "@/common/utils/avatar.js";
import { useDrop } from "react-dnd";

const formatTimeAgo = (timestamp) => {
    const diffMins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
};

const PROTOCOL_LABELS = {
    "entry.ssh_connect": "SSH",
    "entry.sftp_connect": "SFTP",
    "entry.rdp_connect": "RDP",
    "entry.vnc_connect": "VNC",
    "entry.demo_connect": "Demo",
    "entry.pve_connect": "PVE",
    "entry.web_connect": "Web",
};

export const WelcomePanel = ({
    connectToServer,
    hibernatedSessions = [],
    resumeSession,
    openSFTP,
    openBrowser,
    openDirectConnect,
    setServerDialogOpen,
}) => {
    const { user } = useContext(UserContext);
    const { getServerById } = useContext(ServerContext);
    const { identities } = useContext(IdentityContext);
    const { activeSessions, setActiveSessionId } = useActiveSessions();
    const { t } = useTranslation();
    const [recentConnections, setRecentConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextItem, setContextItem] = useState(null);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [deviceLinkDialogOpen, setDeviceLinkDialogOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const contextMenu = useContextMenu();

    const [{ isServerOver }, dropRef] = useDrop({
        accept: "server",
        drop: (item) => {
            const droppedServer = getServerById(item.id);
            if (droppedServer) connectToServer(droppedServer.id, droppedServer.identities?.[0]);
            return { handled: true };
        },
        collect: (monitor) => ({ isServerOver: monitor.isOver() }),
    });

    useEffect(() => {
        getRequest("/entries/recent?limit=8")
            .then((data) => setRecentConnections(data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const server = contextItem ? getServerById(contextItem.entryId) : null;
    const getHibernated = (entryId) => hibernatedSessions.find((s) => s.server?.id === parseInt(entryId));

    const handleClick = (item) => {
        const entryId = parseInt(item.entryId);

        // 1. If session is already open/active, switch straight to it!
        const existingSession = activeSessions?.find((s) => s.server?.id === entryId);
        if (existingSession) {
            setActiveSessionId(existingSession.id);
            return;
        }

        // 2. If hibernated, resume
        const hibernated = getHibernated(entryId);
        if (hibernated) {
            resumeSession(hibernated.id);
            return;
        }

        // 3. Otherwise connect
        const targetServer = getServerById(entryId);
        if (targetServer) {
            connectToServer(targetServer.id, targetServer.identities?.[0]);
        } else {
            connectToServer(entryId, item.identities?.[0] ? { id: item.identities[0] } : null);
        }
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextItem(item);
        contextMenu.open(e, { x: e.clientX, y: e.clientY });
    };

    const handleCopy = (e, item) => {
        e.stopPropagation();
        const serverObj = getServerById(item.entryId);
        const ip = serverObj?.ip || serverObj?.config?.ip || serverObj?.host;
        const port = serverObj?.port || serverObj?.config?.port || 22;
        const copyText = ip ? `ssh root@${ip} -p ${port}` : item.name;
        navigator.clipboard.writeText(copyText).then(() => {
            setCopiedId(item.entryId);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const connect = () => {
        if (server) {
            connectToServer(server.id, server.identities?.[0] ? { id: server.identities[0] } : null);
            contextMenu.close();
        }
    };

    const connectSftp = () => {
        if (server && openSFTP) {
            openSFTP(server.id, server.identities?.[0] ? { id: server.identities[0] } : null);
            contextMenu.close();
        }
    };

    const connectBrowser = () => {
        if (server && openBrowser) {
            openBrowser(server.id, server.identities?.[0] ? { id: server.identities[0] } : null);
            contextMenu.close();
        }
    };

    const quickConnect = () => {
        if (server && openDirectConnect) {
            openDirectConnect(server);
            contextMenu.close();
        }
    };

    return (
        <div className={`welcome-panel${isServerOver ? " drop-target" : ""}`} ref={dropRef}>
            <div className="welcome-container">
                {/* ==================== HERO BANNER ==================== */}
                <div className="hero-banner">
                    <div className="hero-glow-left" />
                    <div className="hero-glow-right" />

                    <div className="hero-content">
                        <div className="hero-badge-row">
                            <span className="hero-badge">
                                <span className="status-pulse-dot" />
                                SESSION READY
                            </span>
                            <span className="hero-meta">
                                Authenticated as {user?.username || "root"}
                            </span>
                        </div>

                        <h1 className="hero-title">
                            Hi, <span className="text-primary">{getAvatarLabel(user, t("welcome.defaultName"))}</span>!
                        </h1>

                        <p className="hero-description">
                            Welcome to <strong>ServerDeck</strong>. The modern self-hosted server manager for high-throughput SSH, VNC, and RDP telemetry.
                        </p>

                        <div className="hero-actions">
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    if (setServerDialogOpen) setServerDialogOpen("ssh");
                                }}
                            >
                                <Icon path={mdiPlus} size={0.8} />
                                <span>Connect Device / New Host</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ==================== BENTO GRID ==================== */}
                <div className="bento-grid">
                    {/* LEFT / MAIN COLUMN: RECENT CONNECTIONS (8 COLS) */}
                    <div className="bento-main">
                        <div className="section-header">
                            <div className="header-left">
                                <Icon path={mdiHistory} size={0.85} className="header-icon" />
                                <h2>Recent Connections</h2>
                                <span className="count-pill">
                                    {recentConnections.length} accessible
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner" />
                            </div>
                        ) : recentConnections.length > 0 ? (
                            <div className="host-card-list">
                                {recentConnections.map((item, i) => {
                                    const entryId = parseInt(item.entryId);
                                    const hibernated = getHibernated(entryId);
                                    const serverObj = getServerById(entryId);
                                    const isCopied = copiedId === item.entryId;
                                    const isSessionActive = activeSessions?.some((s) => s.server?.id === entryId);

                                    const ipAddress = serverObj?.ip || serverObj?.config?.ip || serverObj?.host;
                                    const port = serverObj?.port || serverObj?.config?.port || 22;
                                    const displayHost = ipAddress ? `${ipAddress}:${port}` : "Remote Node";

                                    return (
                                        <div
                                            key={`${item.entryId}-${i}`}
                                            className={`host-card${hibernated ? " hibernated" : ""}${isSessionActive ? " session-active" : ""}`}
                                            onClick={() => handleClick(item)}
                                            onContextMenu={(e) => handleContextMenu(e, item)}
                                        >
                                            <div className="host-left">
                                                <div className="host-icon-wrapper">
                                                    <Icon path={getIconPath(item.icon)} size={0.9} />
                                                </div>

                                                <div className="host-info">
                                                    <div className="host-name-row">
                                                        <span className="status-pulse-dot" />
                                                        <span className="host-name">{item.name}</span>
                                                        <span className="protocol-badge">
                                                            {PROTOCOL_LABELS[item.connectionType] || "SSH"}
                                                        </span>
                                                        <span className={`latency-badge ${isSessionActive ? "badge-connected" : ""}`}>
                                                            {isSessionActive ? "CONNECTED" : hibernated ? "PAUSED" : "ONLINE"}
                                                        </span>
                                                    </div>

                                                    <div className="host-meta-row">
                                                        <span>{displayHost}</span>
                                                        <span>•</span>
                                                        <span>{serverObj?.system || "Linux Fleet"}</span>
                                                        <span>•</span>
                                                        <span className="text-dim">
                                                            {hibernated ? (
                                                                <span className="hibernated-tag">
                                                                    <Icon path={mdiPower} size={0.6} /> Hibernated
                                                                </span>
                                                            ) : isSessionActive ? (
                                                                <span className="active-tag">Active Terminal</span>
                                                            ) : (
                                                                formatTimeAgo(item.timestamp)
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="host-actions">
                                                <button
                                                    className="btn-icon"
                                                    title="Copy SSH connect string"
                                                    onClick={(e) => handleCopy(e, item)}
                                                >
                                                    <Icon path={isCopied ? mdiCheck : mdiContentCopy} size={0.7} />
                                                </button>
                                                <button
                                                    className="btn-connect"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClick(item);
                                                    }}
                                                >
                                                    <Icon path={mdiFlash} size={0.75} />
                                                    <span>{isSessionActive ? "Open Tab" : "Connect"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Icon path={mdiServerNetwork} size={1.8} />
                                <h3>No recent connections</h3>
                                <p>Connect to a server from the left navigation rail or add a new host.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: WIDGETS (4 COLS) */}
                    <div className="bento-side">
                        {/* Security & Auth Widget */}
                        <div className="widget-card">
                            <div className="widget-header">
                                <div className="widget-title">
                                    <Icon path={mdiShieldCheck} size={0.8} className="text-tertiary" />
                                    <h3>Security &amp; Auth</h3>
                                </div>
                                <span className="status-pulse-dot" />
                            </div>
                            <div className="security-items">
                                {identities && identities.length > 0 ? (
                                    identities.slice(0, 3).map((identity) => (
                                        <div
                                            key={identity.id}
                                            className="security-item clickable"
                                            onClick={() => window.dispatchEvent(new CustomEvent("openSettings", { detail: { tab: "identities" } }))}
                                            title="Click to view in Identities Settings"
                                        >
                                            <div className="security-left">
                                                <Icon path={identity.type === "password" ? mdiLock : mdiKey} size={0.7} className="security-icon" />
                                                <div className="security-text">
                                                    <div className="security-name">{identity.name}</div>
                                                    <div className="security-sub">
                                                        {identity.type === "ssh" || identity.type === "ssh_key"
                                                            ? "SSH Key Identity"
                                                            : identity.type === "password"
                                                            ? "Password Identity"
                                                            : "Stored Credential"}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="status-chip chip-tertiary">LOADED</span>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="security-item clickable"
                                        onClick={() => window.dispatchEvent(new CustomEvent("openSettings", { detail: { tab: "identities" } }))}
                                        title="Click to add SSH Key or Password Identity"
                                    >
                                        <div className="security-left">
                                            <Icon path={mdiKey} size={0.7} className="security-icon" />
                                            <div className="security-text">
                                                <div className="security-name">No SSH Keys Loaded</div>
                                                <div className="security-sub">Click to configure identities</div>
                                            </div>
                                        </div>
                                        <span className="status-chip chip-primary">+ Add Key</span>
                                    </div>
                                )}

                                <div
                                    className="security-item clickable"
                                    onClick={() => window.dispatchEvent(new CustomEvent("openSettings", { detail: { tab: "account" } }))}
                                    title="Click to manage MFA / Account Security"
                                >
                                    <div className="security-left">
                                        <Icon path={mdiLock} size={0.7} className="security-icon" />
                                        <div className="security-text">
                                            <div className="security-name">Session Authentication</div>
                                            <div className="security-sub">
                                                {user?.hasMfa ? "MFA Verification (Enforced)" : "Standard Local Token"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`status-chip ${user?.hasMfa ? "chip-primary" : "chip-tertiary"}`}>
                                        {user?.hasMfa ? "ENFORCED" : "ACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Supported Protocols Widget */}
                        <div className="widget-card">
                            <div className="widget-label">SUPPORTED PROTOCOLS</div>
                            <div className="protocol-list">
                                <div className="protocol-row">
                                    <span className="protocol-name">
                                        <span className="dot dot-primary" /> SSH (Secure Shell)
                                    </span>
                                    <span className="protocol-version">OpenSSH 9.6p1</span>
                                </div>
                                <div className="protocol-row">
                                    <span className="protocol-name">
                                        <span className="dot dot-secondary" /> VNC (Remote Framebuffer)
                                    </span>
                                    <span className="protocol-version">TigerVNC 1.13</span>
                                </div>
                                <div className="protocol-row">
                                    <span className="protocol-name">
                                        <span className="dot dot-tertiary" /> RDP (Remote Desktop)
                                    </span>
                                    <span className="protocol-version">FreeRDP 3.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            <ContextMenu
                isOpen={contextMenu.isOpen}
                position={contextMenu.position}
                onClose={contextMenu.close}
                trigger={contextMenu.triggerRef}
            >
                {server && (
                    <>
                        <ContextMenuItem
                            icon={mdiConnection}
                            label={t("servers.contextMenu.connect")}
                            onClick={connect}
                        />
                        {server.protocol === "ssh" && openSFTP && (
                            <ContextMenuItem
                                icon={mdiFolderOpen}
                                label={t("servers.contextMenu.openSFTP")}
                                onClick={connectSftp}
                            />
                        )}
                        {server.protocol === "ssh" && openBrowser && (
                            <ContextMenuItem
                                icon={mdiWeb}
                                label={t("servers.contextMenu.openBrowser")}
                                onClick={connectBrowser}
                            />
                        )}
                        {openDirectConnect && (
                            <ContextMenuItem
                                icon={mdiCursorDefaultClick}
                                label={t("servers.contextMenu.quickConnect")}
                                onClick={quickConnect}
                            />
                        )}
                    </>
                )}
            </ContextMenu>

            <DownloadAppsDialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} />
            <DeviceLinkDialog open={deviceLinkDialogOpen} onClose={() => setDeviceLinkDialogOpen(false)} />
        </div>
    );
};
