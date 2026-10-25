import { Outlet } from "react-router-dom";
import { UserProvider } from "@/common/contexts/UserContext.jsx";
import { StateStreamProvider } from "@/common/contexts/StateStreamContext.jsx";
import { LiveSessionProvider } from "@/common/contexts/LiveSessionContext.jsx";
import { ServerProvider } from "@/common/contexts/ServerContext.jsx";
import { IdentityProvider } from "@/common/contexts/IdentityContext.jsx";
import { ToastProvider } from "@/common/contexts/ToastContext.jsx";
import { PreferencesProvider } from "@/common/contexts/PreferencesContext.jsx";
import { AIProvider } from "@/common/contexts/AIContext.jsx";
import { KeymapProvider } from "@/common/contexts/KeymapContext.jsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SessionProvider } from "@/common/contexts/SessionContext.jsx";
import { SnippetProvider } from "@/common/contexts/SnippetContext.jsx";
import { ScriptProvider } from "@/common/contexts/ScriptContext.jsx";
import { TagProvider } from "@/common/contexts/TagContext.jsx";
import { QuickActionProvider } from "@/common/contexts/QuickActionContext.jsx";
import { Suspense, lazy, useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import Loading from "@/common/components/Loading";
import { ErrorBoundary } from "@/common/components/ErrorBoundary";
import TitleBar from "@/common/components/TitleBar";
import TopNavBar from "@/common/components/TopNavBar";
import SideNavRail from "@/common/components/SideNavRail";
import SettingsDialog from "@/common/components/SettingsDialog";
import SupportDialog from "@/common/components/SupportDialog";
import ActionConfirmDialog from "@/common/components/ActionConfirmDialog";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConnectionErrorBanner from "@/common/components/ConnectionErrorBanner";
import { waitForTauri } from "@/common/utils/TauriUtil.js";
import MobileNav from "@/common/components/MobileNav";
import ThemeLoader from "@/common/components/ThemeLoader";
import { patchRequest } from "@/common/utils/RequestUtil.js";

const Sidebar = lazy(() => import("@/common/components/Sidebar"));

const PreferencesWrapper = ({ children }) => {
    const { user, login } = useContext(UserContext);
    return (
        <PreferencesProvider user={user} refreshUser={login}>
            {children}
        </PreferencesProvider>
    );
};

const AppContent = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user, logout } = useContext(UserContext);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState("account");
    const [supportDialogOpen, setSupportDialogOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const handleOpenSettings = (e) => {
            setSettingsTab(e.detail?.tab || "account");
            setSettingsDialogOpen(true);
        };
        const handleOpenSupport = () => setSupportDialogOpen(true);
        const handleRequestLogout = () => setLogoutDialogOpen(true);

        window.addEventListener("openSettings", handleOpenSettings);
        window.addEventListener("openSupport", handleOpenSupport);
        window.addEventListener("requestLogout", handleRequestLogout);

        return () => {
            window.removeEventListener("openSettings", handleOpenSettings);
            window.removeEventListener("openSupport", handleOpenSupport);
            window.removeEventListener("requestLogout", handleRequestLogout);
        };
    }, []);
    const [tauriReady, setTauriReady] = useState(false);
    const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false);
    const [isLeftPaneHovering, setIsLeftPaneHovering] = useState(false);
    const leftPaneRef = useRef(null);

    const toggleLeftPane = () => {
        const nextCollapsed = !isLeftPaneCollapsed;
        setIsLeftPaneHovering(false);
        setIsLeftPaneCollapsed(nextCollapsed);
        patchRequest("accounts/me/preferences", { general: { sidebarCollapsed: nextCollapsed } })
            .catch(error => console.error("Failed to save sidebar preference:", error));
    };

    useEffect(() => {
        waitForTauri().then(() => {
            setTauriReady(true);
        });
    }, []);
    useEffect(() => {
        setIsLeftPaneCollapsed(user?.preferences?.general?.sidebarCollapsed === true);
    }, [user?.id]);
    useEffect(() => {
        if (!isLeftPaneCollapsed) return;

        const containsPoint = (rect, x, y) => rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        const handleMouseMove = (event) => {
            const leftPaneRect = leftPaneRef.current?.getBoundingClientRect();
            const serverListRect = isLeftPaneHovering ? document.querySelector(".server-list")?.getBoundingClientRect() : null;
            const hovering = containsPoint(leftPaneRect, event.clientX, event.clientY)
                || containsPoint(serverListRect, event.clientX, event.clientY);
            setIsLeftPaneHovering(current => current === hovering ? current : hovering);
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [isLeftPaneCollapsed, isLeftPaneHovering]);
    if (!tauriReady) {
        return (
            <div className="app-wrapper">
                <TitleBar />
                <Loading />
            </div>
        );
    }

    const isLeftPaneVisible = !isLeftPaneCollapsed || isLeftPaneHovering;

    return (
        <PreferencesWrapper>
                <ThemeLoader />
                <StateStreamProvider>
                    <LiveSessionProvider>
                    <KeymapProvider>
                        <AIProvider>
                            <ServerProvider>
                                <IdentityProvider>
                                    <SnippetProvider>
                                        <ScriptProvider>
                                            <TagProvider>
                                            <SessionProvider>
                                                <QuickActionProvider>
                                                    <div className="app-wrapper" onMouseLeave={() => setIsLeftPaneHovering(false)}>
                                                        <TitleBar showTabs />
                                                        <TopNavBar />
                                                        <ConnectionErrorBanner />
                                                        <div className="content-wrapper">
                                                            <div
                                                                className={`left-pane${isLeftPaneCollapsed ? " collapsed" : ""}${isLeftPaneVisible ? " open" : ""}`}
                                                                ref={leftPaneRef}
                                                            >
                                                                <div
                                                                    className="left-pane-slot"
                                                                    id="left-pane-slot"
                                                                >
                                                                    {location.pathname !== '/servers' && <SideNavRail />}
                                                                </div>
                                                            </div>
                                                            <div className="main-content">
                                                                <Suspense fallback={<Loading />}>
                                                                    <Outlet />
                                                                </Suspense>
                                                            </div>
                                                        </div>
                                                        
                                                        <SettingsDialog
                                                            open={settingsDialogOpen}
                                                            onClose={() => setSettingsDialogOpen(false)}
                                                            initialTab={settingsTab}
                                                        />
                                                        <SupportDialog
                                                            open={supportDialogOpen}
                                                            onClose={() => setSupportDialogOpen(false)}
                                                        />
                                                        <ActionConfirmDialog
                                                            open={logoutDialogOpen}
                                                            setOpen={setLogoutDialogOpen}
                                                            text={t('common.sidebar.logoutConfirmText', { username: user?.username })}
                                                            onConfirm={logout}
                                                        />
                                                        <MobileNav />
                                                    </div>
                                                </QuickActionProvider>
                                            </SessionProvider>
                                            </TagProvider>
                                        </ScriptProvider>
                                    </SnippetProvider>
                                </IdentityProvider>
                            </ServerProvider>
                        </AIProvider>
                    </KeymapProvider>
                    </LiveSessionProvider>
                </StateStreamProvider>
        </PreferencesWrapper>
    );
};

export default () => {
    return (
        <ErrorBoundary>
            <DndProvider backend={HTML5Backend}>
                <ToastProvider>
                    <UserProvider>
                        <AppContent />
                    </UserProvider>
                </ToastProvider>
            </DndProvider>
        </ErrorBoundary>
    );
}
