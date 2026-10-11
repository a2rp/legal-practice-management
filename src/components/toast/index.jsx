import { useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const icons = {
    success: <FiCheckCircle aria-hidden="true" />,
    error: <FiAlertCircle aria-hidden="true" />,
    info: <FiInfo aria-hidden="true" />,
};

const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(onDismiss, 5000);
        return () => window.clearTimeout(timer);
    }, [toast, onDismiss]);

    if (!toast) return null;

    return (
        <div
            aria-live={toast.type === "error" ? "assertive" : "polite"}
            className={`${styles.toast} ${styles[toast.type] || styles.info}`}
            role={toast.type === "error" ? "alert" : "status"}
        >
            <span className={styles.icon}>{icons[toast.type] || icons.info}</span>
            <p>{toast.message}</p>
            <button aria-label="Dismiss notification" className={styles.dismiss} onClick={onDismiss} type="button">
                <FiX aria-hidden="true" />
            </button>
        </div>
    );
};

export default Toast;
