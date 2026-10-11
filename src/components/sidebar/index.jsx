import { useEffect } from "react";
import {
    FiCalendar,
    FiClock,
    FiFolder,
    FiGrid,
    FiUsers,
} from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const navigation = [
    { label: "Today", to: "/", icon: <FiGrid aria-hidden="true" />, end: true },
    { label: "Matter files", to: "/matters", icon: <FiFolder aria-hidden="true" /> },
    { label: "Court calendar", to: "/calendar", icon: <FiCalendar aria-hidden="true" /> },
    { label: "Time & billing", to: "/billing", icon: <FiClock aria-hidden="true" /> },
    { label: "Clients", to: "/clients", icon: <FiUsers aria-hidden="true" /> },
];

const Sidebar = ({ isOpen, onClose, matterCount = 0, nextEvent }) => {
    const location = useLocation();

    useEffect(() => {
        if (!isOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [isOpen, onClose]);

    return (
        <>
            <button
                aria-label="Close navigation menu"
                className={`${styles.scrim} ${isOpen ? styles.scrimVisible : ""}`}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                type="button"
            />
            <aside aria-label="Practice workspace" className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`} id="practice-sidebar">
                <NavLink aria-label="Matterline home" className={styles.brand} onClick={onClose} to="/" end>
                    <span aria-hidden="true" className={styles.brandMark}><FiFolder /></span>
                    <span>Matterline<span className={styles.brandDot}>.</span></span>
                </NavLink>

                <div className={styles.firmPicker}>
                    <span className={styles.firmIcon}>L&amp;L</span>
                    <span className={styles.firmCopy}>
                        <strong>Lark &amp; Lowe</strong>
                        <span>Practice workspace</span>
                    </span>
                </div>

                <nav aria-label="Primary navigation" className={styles.navigation}>
                    <p className={styles.sectionLabel}>Your desk</p>
                    {navigation.map((item) => {
                        const isCurrent = item.to === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.to);

                        return (
                            <NavLink
                                aria-current={isCurrent ? "page" : undefined}
                                className={isCurrent ? styles.activeLink : styles.link}
                                end={item.end}
                                key={item.to}
                                onClick={onClose}
                                to={item.to}
                            >
                                <span className={styles.linkIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.to === "/matters" && <span className={styles.count}>{matterCount}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className={styles.sidebarBottom}>
                    <div className={styles.weeklyCard}>
                        <span className={styles.weeklyIcon}><FiCalendar aria-hidden="true" /></span>
                        <span>
                            <strong>{nextEvent?.title ?? "No upcoming date"}</strong>
                            <small>{nextEvent ? `${formatDate(nextEvent.date, { weekday: "short", month: "short", day: "numeric" })} · ${nextEvent.time}` : "Schedule a hearing or meeting"}</small>
                        </span>
                    </div>
                    <div className={styles.userProfile}>
                        <span className={styles.avatar}>ER</span>
                        <span className={styles.userCopy}>
                            <strong>Elena Ruiz</strong>
                            <small>Managing attorney</small>
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
