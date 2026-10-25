import "./styles.sass";
import { useState, useCallback } from "react";
import Icon from "@mdi/react";
import {
    mdiKeyboard,
    mdiArrowUp,
    mdiArrowDown,
    mdiArrowLeft,
    mdiArrowRight,
    mdiContentPaste,
    mdiChevronDown,
    mdiChevronUp,
} from "@mdi/js";

export const MobileTerminalToolbar = ({
    onSendKey,
    onPaste,
    onToggleKeyboard,
    stickyCtrl,
    setStickyCtrl,
    stickyAlt,
    setStickyAlt,
    bottomOffset = 0,
}) => {
    const [collapsed, setCollapsed] = useState(false);

    const preventBlur = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleKeyClick = useCallback((e, keyStr) => {
        preventBlur(e);
        onSendKey(keyStr);
    }, [onSendKey, preventBlur]);

    const handleCtrlToggle = useCallback((e) => {
        preventBlur(e);
        setStickyCtrl(prev => !prev);
    }, [setStickyCtrl, preventBlur]);

    const handleAltToggle = useCallback((e) => {
        preventBlur(e);
        setStickyAlt(prev => !prev);
    }, [setStickyAlt, preventBlur]);

    const handlePasteClick = useCallback((e) => {
        preventBlur(e);
        onPaste();
    }, [onPaste, preventBlur]);

    const handleToggleKeyboardClick = useCallback((e) => {
        preventBlur(e);
        onToggleKeyboard();
    }, [onToggleKeyboard, preventBlur]);

    return (
        <div 
            className={`mobile-terminal-toolbar ${collapsed ? "collapsed" : ""}`}
            style={bottomOffset > 0 ? { transform: `translateY(-${bottomOffset}px)` } : undefined}
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
        >
            <button
                type="button"
                className="toolbar-toggle-btn"
                onClick={() => setCollapsed(prev => !prev)}
                onPointerDown={preventBlur}
                onMouseDown={preventBlur}
                title={collapsed ? "Show Mobile Keys" : "Hide Mobile Keys"}
            >
                <Icon path={collapsed ? mdiChevronUp : mdiChevronDown} size={0.6} />
            </button>

            {!collapsed && (
                <div 
                    className="toolbar-keys-scroll"
                    onPointerDown={preventBlur}
                    onMouseDown={preventBlur}
                >
                    {/* Escape & Tab */}
                    <button
                        type="button"
                        className="toolbar-key"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x1b")}
                    >
                        ESC
                    </button>
                    <button
                        type="button"
                        className="toolbar-key"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\t")}
                    >
                        TAB
                    </button>

                    {/* Modifiers */}
                    <button
                        type="button"
                        className={`toolbar-key modifier ${stickyCtrl ? "active" : ""}`}
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={handleCtrlToggle}
                    >
                        CTRL
                    </button>
                    <button
                        type="button"
                        className={`toolbar-key modifier ${stickyAlt ? "active" : ""}`}
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={handleAltToggle}
                    >
                        ALT
                    </button>

                    {/* Quick Interrupts */}
                    <button
                        type="button"
                        className="toolbar-key danger"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x03")}
                        title="Cancel (Ctrl+C)"
                    >
                        ^C
                    </button>
                    <button
                        type="button"
                        className="toolbar-key"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x04")}
                        title="EOF (Ctrl+D)"
                    >
                        ^D
                    </button>

                    {/* Arrow Navigation */}
                    <button
                        type="button"
                        className="toolbar-key arrow"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x1b[A")}
                        title="Up"
                    >
                        <Icon path={mdiArrowUp} size={0.65} />
                    </button>
                    <button
                        type="button"
                        className="toolbar-key arrow"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x1b[B")}
                        title="Down"
                    >
                        <Icon path={mdiArrowDown} size={0.65} />
                    </button>
                    <button
                        type="button"
                        className="toolbar-key arrow"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x1b[D")}
                        title="Left"
                    >
                        <Icon path={mdiArrowLeft} size={0.65} />
                    </button>
                    <button
                        type="button"
                        className="toolbar-key arrow"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "\x1b[C")}
                        title="Right"
                    >
                        <Icon path={mdiArrowRight} size={0.65} />
                    </button>

                    {/* Quick Symbols */}
                    <button
                        type="button"
                        className="toolbar-key symbol"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "|")}
                    >
                        |
                    </button>
                    <button
                        type="button"
                        className="toolbar-key symbol"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "/")}
                    >
                        /
                    </button>
                    <button
                        type="button"
                        className="toolbar-key symbol"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "-")}
                    >
                        -
                    </button>
                    <button
                        type="button"
                        className="toolbar-key symbol"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={(e) => handleKeyClick(e, "~")}
                    >
                        ~
                    </button>

                    {/* Actions */}
                    <button
                        type="button"
                        className="toolbar-key action"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={handlePasteClick}
                        title="Paste Clipboard"
                    >
                        <Icon path={mdiContentPaste} size={0.65} />
                    </button>
                    <button
                        type="button"
                        className="toolbar-key action"
                        onPointerDown={preventBlur}
                        onMouseDown={preventBlur}
                        onClick={handleToggleKeyboardClick}
                        title="Toggle Keyboard"
                    >
                        <Icon path={mdiKeyboard} size={0.65} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MobileTerminalToolbar;
