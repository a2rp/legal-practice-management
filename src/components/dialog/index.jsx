import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const Dialog = ({
    title,
    description,
    onClose,
    children,
    confirmLabel,
    cancelLabel = "Cancel",
    onConfirm,
    formId,
    danger = false,
}) => {
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        const previousFocus = document.activeElement;
        cancelRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key === "Tab") {
                const focusable = dialogRef.current?.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
                );
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [onClose]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) onClose();
    };

    return createPortal(
        <div className={styles.overlay} onMouseDown={handleBackdropClick}>
            <section
                aria-describedby={description ? "matterline-dialog-description" : undefined}
                aria-labelledby="matterline-dialog-title"
                aria-modal="true"
                className={styles.dialog}
                ref={dialogRef}
                role="dialog"
                tabIndex={-1}
            >
                <header className={styles.header}>
                    <div>
                        <h2 id="matterline-dialog-title">{title}</h2>
                        {description && <p id="matterline-dialog-description">{description}</p>}
                    </div>
                    <button aria-label="Close dialog" className={styles.closeButton} onClick={onClose} type="button">
                        <FiX aria-hidden="true" />
                    </button>
                </header>
                <div className={styles.content}>{children}</div>
                <footer className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose} ref={cancelRef} type="button">
                        {cancelLabel}
                    </button>
                    {confirmLabel && (
                        <button
                            className={danger ? styles.dangerButton : styles.confirmButton}
                            form={formId}
                            onClick={formId ? undefined : onConfirm}
                            type={formId ? "submit" : "button"}
                        >
                            {confirmLabel}
                        </button>
                    )}
                </footer>
            </section>
        </div>,
        document.body,
    );
};

export default Dialog;
