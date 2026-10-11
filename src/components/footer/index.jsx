import { FaCoffee, FaCodepen, FaFacebookF, FaGithub, FaLinkedinIn, FaPatreon, FaYoutube } from "react-icons/fa";
import { FiGlobe, FiLifeBuoy, FiMail } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const links = [
    { label: "Portfolio", detail: "ashishranjan.net", icon: <FiGlobe aria-hidden="true" />, href: "https://www.ashishranjan.net" },
    { label: "GitHub", detail: "github.com/a2rp", icon: <FaGithub aria-hidden="true" />, href: "https://github.com/a2rp" },
    { label: "CodePen", detail: "codepen.io/ash1198", icon: <FaCodepen aria-hidden="true" />, href: "https://codepen.io/ash1198" },
    { label: "LinkedIn", detail: "linkedin.com/in/aashishranjan", icon: <FaLinkedinIn aria-hidden="true" />, href: "https://www.linkedin.com/in/aashishranjan" },
    { label: "Facebook", detail: "facebook.com/theash.ashish", icon: <FaFacebookF aria-hidden="true" />, href: "https://www.facebook.com/theash.ashish/" },
    { label: "YouTube", detail: "youtube.com/@ashishranjan-ashz", icon: <FaYoutube aria-hidden="true" />, href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1" },
    { label: "Email", detail: "ash.ranjan09@gmail.com", icon: <FiMail aria-hidden="true" />, href: "mailto:ash.ranjan09@gmail.com" },
    { label: "Support", detail: "a2rp-donation-page.netlify.app", icon: <FiLifeBuoy aria-hidden="true" />, href: "https://a2rp-donation-page.netlify.app/" },
    { label: "Buy Me a Coffee", detail: "buymeacoffee.com/ashishranjan", icon: <FaCoffee aria-hidden="true" />, href: "https://buymeacoffee.com/ashishranjan" },
    { label: "Patreon", detail: "patreon.com/ashishranjan", icon: <FaPatreon aria-hidden="true" />, href: "https://www.patreon.com/ashishranjan" },
    { label: "Source code", detail: "github.com/a2rp/legal-practice-management", icon: <FaGithub aria-hidden="true" />, href: "https://github.com/a2rp/legal-practice-management" },
];

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.inner}>
            <div className={styles.identity}>
                <Link aria-label="Matterline home" className={styles.brand} to="/">
                    <img alt="" src={`${import.meta.env.BASE_URL}logo.png`} />
                    <span>Matterline<span className={styles.brandDot}>.</span></span>
                </Link>
                <p>© {new Date().getFullYear()} <a href="https://www.ashishranjan.net">Ashish Ranjan</a>. All rights reserved.</p>
            </div>
            <nav aria-label="Footer links" className={styles.links}>
                {links.map((item) => (
                    <a
                        aria-label={item.label}
                        data-tooltip-detail={item.detail}
                        data-tooltip-id="matterline-footer-tooltip"
                        data-tooltip-label={item.label}
                        href={item.href}
                        key={item.label}
                        rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                    >
                        {item.icon}
                    </a>
                ))}
                <Tooltip
                    arrowSize={7}
                    border="1px solid rgb(255 255 255 / 16%)"
                    className={styles.tooltip}
                    classNameArrow={styles.tooltipArrow}
                    id="matterline-footer-tooltip"
                    offset={8}
                    opacity={1}
                    place="top"
                    render={({ activeAnchor }) => (
                        <div className={styles.tooltipContent}>
                            <strong>{activeAnchor?.getAttribute("data-tooltip-label")}</strong>
                            <span>{activeAnchor?.getAttribute("data-tooltip-detail")}</span>
                        </div>
                    )}
                />
            </nav>
        </div>
    </footer>
);

export default Footer;
