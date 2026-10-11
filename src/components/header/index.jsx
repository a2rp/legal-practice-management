import { useState } from "react";
import { FiArrowUpRight, FiFolder, FiMenu, FiPlus, FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const getPageLabel = (pathname) => {
    if (pathname === "/") return "Today";
    if (pathname.startsWith("/matters/")) return "Matter file";
    if (pathname.startsWith("/matters")) return "Matter files";
    if (pathname.startsWith("/calendar")) return "Court calendar";
    if (pathname.startsWith("/billing")) return "Time & billing";
    if (pathname.startsWith("/clients")) return "Clients";
    return "Practice workspace";
};

const Header = ({ onMenuToggle, isMenuOpen, onNewMatter }) => {
    const [search, setSearch] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const pageLabel = getPageLabel(location.pathname);

    const submitSearch = (event) => {
        event.preventDefault();
        const query = search.trim();
        navigate(query ? `/matters?search=${encodeURIComponent(query)}` : "/matters");
        setSearch(query);
    };

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <button
                    aria-controls="practice-sidebar"
                    aria-expanded={isMenuOpen}
                    aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
                    className={styles.menuButton}
                    onClick={onMenuToggle}
                    type="button"
                >
                    <FiMenu aria-hidden="true" />
                </button>
                <span aria-hidden="true" className={styles.compactBrand}>
                    <FiFolder /> Matterline<span>.</span>
                </span>
                <div aria-label="Current page" className={styles.pageInfo}>
                    <span>Practice</span>
                    <FiArrowUpRight aria-hidden="true" />
                    <strong>{pageLabel}</strong>
                </div>

                <div className={styles.actions}>
                    <form className={styles.search} onSubmit={submitSearch} role="search">
                        <FiSearch aria-hidden="true" />
                        <input
                            aria-label="Search matter files"
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search matter files"
                            value={search}
                        />
                        <kbd>⌘ K</kbd>
                    </form>
                    <a
                        className={styles.repository}
                        href="https://github.com/a2rp/legal-practice-management"
                        rel="noreferrer"
                        target="_blank"
                    >
                        <span>Repository</span>
                        <FiArrowUpRight aria-hidden="true" />
                    </a>
                    <button className={styles.newMatter} onClick={onNewMatter} type="button">
                        <FiPlus aria-hidden="true" />
                        <span>New matter</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
