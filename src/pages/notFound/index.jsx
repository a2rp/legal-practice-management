import { FiArrowLeft, FiFolder } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const NotFoundPage = () => (
    <section className={styles.page}>
        <span className={styles.icon}><FiFolder aria-hidden="true" /></span>
        <h1>This page is outside the file room</h1>
        <p>The address may have changed. Your matter and client records are still available from the practice desk.</p>
        <div className={styles.actions}>
            <Link className={styles.primaryLink} to="/"><FiArrowLeft aria-hidden="true" /> Return to today</Link>
            <Link className={styles.secondaryLink} to="/matters">Browse matter files</Link>
        </div>
    </section>
);

export default NotFoundPage;
