import { DialogProvider } from "@/common/components/Dialog";
import "./styles.sass";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import { IdentityContext } from "@/common/contexts/IdentityContext.jsx";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import {
    mdiAccountCircleOutline,
    mdiFileUploadOutline,
    mdiLockOutline,
    mdiFlash,
    mdiKeyOutline,
    mdiShieldKeyOutline,
    mdiKeyPlus,
    mdiCheckCircleOutline,
} from "@mdi/js";
import Input from "@/common/components/IconInput";
import SelectBox from "@/common/components/SelectBox";
import { getFieldConfig } from "@/pages/Servers/components/ServerDialog/utils/fieldConfig.js";

export const DirectConnectDialog = ({ open, onClose, onConnect, server }) => {
    const { t } = useTranslation();
    const { sendToast } = useToast();
    const { identities } = useContext(IdentityContext);

    const protocol = server?.protocol ?? server?.config?.protocol ?? "ssh";
    const fieldConfig = useMemo(() => getFieldConfig("server", protocol), [protocol]);
    const allowedAuthTypes = fieldConfig.allowedAuthTypes || ["password", "ssh", "both"];
    const defaultAuthType = allowedAuthTypes[0] || "password";

    const hasSavedIdentities = identities && identities.length > 0;
    const [useSaved, setUseSaved] = useState(hasSavedIdentities);
    const [selectedSavedId, setSelectedSavedId] = useState(identities?.[0]?.id || null);

    const [username, setUsername] = useState("");
    const [authType, setAuthType] = useState(defaultAuthType);
    const [password, setPassword] = useState("");
    const [sshKey, setSshKey] = useState(null);
    const [keyFileName, setKeyFileName] = useState("");
    const [passphrase, setPassphrase] = useState("");

    const savedOptions = useMemo(() => {
        if (!identities) return [];
        return identities.map(i => ({
            label: `${i.name} (${i.username || 'root'} · ${i.type.toUpperCase()})`,
            value: i.id,
        }));
    }, [identities]);

    const allAuthOptions = [
        { label: t("servers.dialog.identities.passwordOnly"), value: "password-only" },
        { label: t("servers.dialog.identities.userPassword"), value: "password" },
        { label: t("servers.dialog.identities.sshKey"), value: "ssh" },
        { label: t("servers.dialog.identities.both"), value: "both" },
    ];
    
    const authOptions = useMemo(() => 
        allAuthOptions.filter(opt => allowedAuthTypes.includes(opt.value)),
        [allowedAuthTypes, t]
    );

    const readFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setKeyFileName(file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setSshKey(e.target.result);
        };
        reader.readAsText(file);
    };

    const validateFields = () => {
        if (authType !== "password-only" && !username) {
            sendToast("Error", t("servers.messages.usernameRequired") || "Username is required");
            return false;
        }

        if ((authType === "password" || authType === "password-only" || authType === "both") && !password) {
            sendToast("Error", t("servers.messages.passwordRequired") || "Password is required");
            return false;
        }

        if ((authType === "ssh" || authType === "both") && !sshKey) {
            sendToast("Error", t("servers.messages.sshKeyRequired") || "SSH key is required");
            return false;
        }

        return true;
    };

    const handleConnect = useCallback(() => {
        if (useSaved && selectedSavedId) {
            onConnect({ savedIdentityId: selectedSavedId });
            return;
        }

        if (!validateFields()) return;

        const directIdentity = {
            username: authType === "password-only" ? undefined : username,
            type: authType,
            ...(authType === "password" || authType === "password-only"
                ? { password }
                : authType === "both"
                ? { password, sshKey, passphrase: passphrase || undefined }
                : { sshKey, passphrase: passphrase || undefined }
            ),
        };

        onConnect(directIdentity);
    }, [useSaved, selectedSavedId, username, authType, password, sshKey, passphrase, onConnect]);

    useEffect(() => {
        if (!open) return;

        setUseSaved(hasSavedIdentities);
        setSelectedSavedId(identities?.[0]?.id || null);
        setUsername("");
        setAuthType(defaultAuthType);
        setPassword("");
        setSshKey(null);
        setKeyFileName("");
        setPassphrase("");
    }, [open, hasSavedIdentities, identities, defaultAuthType]);

    useEffect(() => {
        if (!open) return;

        const submitOnEnter = (event) => {
            if (event.key === "Enter") {
                handleConnect();
            }
        };

        document.addEventListener("keydown", submitOnEnter);
        return () => {
            document.removeEventListener("keydown", submitOnEnter);
        };
    }, [open, handleConnect]);

    const showUsername = authType !== "password-only";
    const serverHost = server?.ip || server?.config?.ip || server?.host;
    const serverPort = server?.port || server?.config?.port || 22;

    return (
        <DialogProvider open={open} onClose={onClose}>
            <div className="direct-connect-dialog">
                <div className="direct-connect-header">
                    <div className="header-badge">
                        <Icon path={mdiFlash} size={0.8} />
                    </div>
                    <div className="header-titles">
                        <h2>{t("servers.contextMenu.quickConnect")}</h2>
                        <div className="header-meta">
                            <span className="server-name">{server?.name || "Remote Node"}</span>
                            {serverHost && (
                                <span className="server-endpoint">({serverHost}:{serverPort})</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="direct-connect-content">
                    {hasSavedIdentities && (
                        <div className="identity-source-tabs">
                            <button
                                type="button"
                                className={useSaved ? "active" : ""}
                                onClick={() => setUseSaved(true)}
                            >
                                <Icon path={mdiShieldKeyOutline} size={0.65} />
                                <span>Saved Key</span>
                            </button>
                            <button
                                type="button"
                                className={!useSaved ? "active" : ""}
                                onClick={() => setUseSaved(false)}
                            >
                                <Icon path={mdiKeyPlus} size={0.65} />
                                <span>Custom Credentials</span>
                            </button>
                        </div>
                    )}

                    {useSaved && hasSavedIdentities ? (
                        <div className="identity-section">
                            <div className="form-group">
                                <label>Stored Identity</label>
                                <SelectBox
                                    options={savedOptions}
                                    selected={selectedSavedId}
                                    setSelected={setSelectedSavedId}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="identity-section">
                            <div className={`name-row ${!showUsername ? 'single-column' : ''}`}>
                                {showUsername && (
                                    <div className="form-group">
                                        <label htmlFor="username">{t("servers.dialog.fields.username")}</label>
                                        <Input
                                            icon={mdiAccountCircleOutline}
                                            type="text"
                                            placeholder={t("servers.dialog.placeholders.username")}
                                            autoComplete="off"
                                            value={username}
                                            setValue={setUsername}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>{t("servers.dialog.identities.authentication")}</label>
                                    <SelectBox
                                        options={authOptions}
                                        selected={authType}
                                        setSelected={setAuthType}
                                    />
                                </div>
                            </div>

                            {(authType === "password" || authType === "password-only" || authType === "both") && (
                                <div className="form-group">
                                    <label htmlFor="password">{t("servers.dialog.fields.password")}</label>
                                    <Input
                                        icon={mdiLockOutline}
                                        type="password"
                                        placeholder={t("servers.dialog.placeholders.password")}
                                        autoComplete="off"
                                        value={password}
                                        setValue={setPassword}
                                    />
                                </div>
                            )}

                            {(authType === "ssh" || authType === "both") && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="keyfile">{t("servers.dialog.identities.sshPrivateKey")}</label>
                                        <Input
                                            icon={mdiFileUploadOutline}
                                            type="file"
                                            autoComplete="off"
                                            onChange={readFile}
                                        />
                                        {keyFileName && (
                                            <div className="key-loaded-status">
                                                <Icon path={mdiCheckCircleOutline} size={0.65} />
                                                <span>Loaded: {keyFileName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="passphrase">{t("servers.dialog.identities.passphrase")}</label>
                                        <Input
                                            icon={mdiKeyOutline}
                                            type="password"
                                            placeholder={t("servers.dialog.identities.passphrase")}
                                            autoComplete="off"
                                            value={passphrase}
                                            setValue={setPassphrase}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="direct-connect-submit-btn"
                    onClick={handleConnect}
                >
                    <Icon path={mdiFlash} size={0.8} />
                    <span>{t("servers.contextMenu.connect")}</span>
                </button>
            </div>
        </DialogProvider>
    );
};
