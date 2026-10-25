import ServerList from "@/pages/Servers/components/ServerList";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const SideNavRail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setMobileOpen(prev => !prev);
        window.addEventListener("toggleServerList", handleToggle);
        return () => window.removeEventListener("toggleServerList", handleToggle);
    }, []);

    const handleConnectToServer = (serverId, identity) => {
        if (location.pathname.startsWith("/monitoring")) {
            navigate(`/monitoring/${serverId}/overview`);
            setMobileOpen(false);
        } else {
            navigate("/servers");
            setMobileOpen(false);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("connectToServer", { detail: { serverId, identity } }));
            }, 100);
        }
    };

    const handleServerDialogOpen = (protocol = null) => {
        navigate("/servers");
        setMobileOpen(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("openServerDialog", { detail: { protocol } }));
        }, 100);
    };

    const handleEditServerId = (id) => {
        navigate("/servers");
        setMobileOpen(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("openEditServer", { detail: { id } }));
        }, 100);
    };

    const handleOpenSFTP = (serverId, identity) => {
        navigate("/servers");
        setMobileOpen(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("openSFTP", { detail: { serverId, identity } }));
        }, 100);
    };

    const handleOpenDirectConnect = (server) => {
        navigate("/servers");
        setMobileOpen(false);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("openDirectConnect", { detail: { server } }));
        }, 100);
    };

    return (
        <ServerList
            connectToServer={handleConnectToServer}
            setServerDialogOpen={handleServerDialogOpen}
            setEditServerId={handleEditServerId}
            openDirectConnect={handleOpenDirectConnect}
            openSFTP={handleOpenSFTP}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
        />
    );
};

export default SideNavRail;
