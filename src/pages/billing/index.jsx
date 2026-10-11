import { useMemo, useState } from "react";
import { FiClock, FiDownload, FiEdit2, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import Dialog from "../../components/dialog";
import { createId, downloadCsv, formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const todayKey = () => new Date().toISOString().slice(0, 10);
const formatElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${remainder}`;
};

const TimeEntryForm = ({ entry, matters, formId = "time-entry-form", onSave }) => {
    const [form, setForm] = useState(entry ? { ...entry } : {
        matterId: matters[0]?.id ?? "",
        date: todayKey(),
        description: "",
        hours: "1.0",
    });
    const [errors, setErrors] = useState({});

    const change = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
        setErrors((current) => ({ ...current, [event.target.name]: "" }));
    };

    const submit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!form.matterId) nextErrors.matterId = "Choose a matter for this time entry.";
        if (!form.date) nextErrors.date = "Choose the date worked.";
        if (!form.description.trim()) nextErrors.description = "Describe the work completed.";
        if (!Number(form.hours) || Number(form.hours) < 0.1 || Number(form.hours) > 24) nextErrors.hours = "Enter time from 0.1 to 24 hours.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        const matter = matters.find((item) => item.id === form.matterId);
        onSave({
            ...form,
            id: entry?.id ?? createId("TE"),
            hours: Number(form.hours),
            rate: matter?.hourlyRate ?? 0,
            description: form.description.trim(),
            billed: entry?.billed ?? false,
            invoiceId: entry?.invoiceId ?? null,
        }, Boolean(entry));
    };

    return (
        <form className={styles.entryForm} id={formId} noValidate onSubmit={submit}>
            <label className={styles.fullField}>
                Matter
                <select name="matterId" onChange={change} value={form.matterId}>
                    <option value="">Choose a matter</option>
                    {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                </select>
                {errors.matterId && <span className={styles.fieldError}>{errors.matterId}</span>}
            </label>
            <label>
                Date worked
                <input name="date" onChange={change} type="date" value={form.date} />
                {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
            </label>
            <label>
                Hours
                <input inputMode="decimal" name="hours" onChange={change} value={form.hours} />
                {errors.hours && <span className={styles.fieldError}>{errors.hours}</span>}
            </label>
            <label className={styles.fullField}>
                Work description
                <textarea name="description" onChange={change} placeholder="Describe the client work completed" rows="3" value={form.description} />
                {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
            </label>
        </form>
    );
};

const BillingPage = ({
    matters,
    clients,
    timeEntries,
    invoices,
    timer,
    elapsedSeconds,
    onTimerStop,
    onSaveTimeEntry,
    onDeleteTimeEntry,
    onCreateInvoice,
    onUpdateInvoice,
    onDeleteInvoice,
    onToast,
}) => {
    const [activeTab, setActiveTab] = useState("time");
    const [matterFilter, setMatterFilter] = useState("all");
    const [entryStatus, setEntryStatus] = useState("Unbilled");
    const [invoiceStatus, setInvoiceStatus] = useState("All invoices");
    const [createEntry, setCreateEntry] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [deletingEntry, setDeletingEntry] = useState(null);
    const [invoiceAction, setInvoiceAction] = useState(null);
    const [deletingInvoice, setDeletingInvoice] = useState(null);

    const matterById = useMemo(() => new Map(matters.map((matter) => [matter.id, matter])), [matters]);
    const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients]);
    const visibleEntries = timeEntries
        .filter((entry) => matterFilter === "all" || entry.matterId === matterFilter)
        .filter((entry) => entryStatus === "All time" || (entryStatus === "Unbilled" && !entry.billed) || (entryStatus === "Invoiced" && entry.billed))
        .sort((a, b) => b.date.localeCompare(a.date));
    const unbilledEntries = timeEntries.filter((entry) => !entry.billed && (matterFilter === "all" || entry.matterId === matterFilter));
    const unbilledHours = unbilledEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const unbilledValue = unbilledEntries.reduce((sum, entry) => sum + entry.hours * entry.rate, 0);
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");
    const paidTotal = invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
    const invoiceList = invoices
        .filter((invoice) => invoiceStatus === "All invoices" || invoice.status === invoiceStatus)
        .filter((invoice) => matterFilter === "all" || invoice.matterId === matterFilter)
        .sort((a, b) => b.due.localeCompare(a.due));
    const runningMatter = matters.find((matter) => matter.id === timer?.matterId);

    const saveEntry = (entry, isEdit) => {
        onSaveTimeEntry(entry, isEdit);
        onToast(isEdit ? "Time entry updated." : "Time entry added to the ledger.", "success");
        if (isEdit) setEditingEntry(null);
        else setCreateEntry(false);
    };

    const confirmDeleteEntry = () => {
        onDeleteTimeEntry(deletingEntry.id);
        onToast("Time entry removed from the ledger.", "success");
        setDeletingEntry(null);
    };

    const buildInvoice = () => {
        if (matterFilter === "all") {
            onToast("Choose a matter before building an invoice.", "info");
            return;
        }
        if (!unbilledEntries.length) {
            onToast("There is no unbilled time for this matter.", "info");
            return;
        }
        const invoice = onCreateInvoice(matterFilter, unbilledEntries.map((entry) => entry.id));
        if (invoice) onToast(`${invoice.id} created from ${unbilledEntries.length} time entr${unbilledEntries.length === 1 ? "y" : "ies"}.`, "success");
    };

    const confirmInvoiceAction = () => {
        if (invoiceAction.action === "send") {
            onUpdateInvoice(invoiceAction.invoice.id, { status: "Sent", issued: todayKey() });
            onToast(`${invoiceAction.invoice.id} marked as sent in this demo. No email was sent.`, "success");
        } else {
            onUpdateInvoice(invoiceAction.invoice.id, { status: "Paid" });
            onToast(`${invoiceAction.invoice.id} marked as paid in the demo ledger.`, "success");
        }
        setInvoiceAction(null);
    };

    const confirmDeleteInvoice = () => {
        onDeleteInvoice(deletingInvoice.id);
        onToast(`${deletingInvoice.id} removed from the demo ledger.`, "success");
        setDeletingInvoice(null);
    };

    const exportEntries = () => {
        const rows = [
            ["Date", "Matter", "Description", "Hours", "Rate", "Amount", "Status"],
            ...visibleEntries.map((entry) => [entry.date, matterById.get(entry.matterId)?.title ?? "Matter unavailable", entry.description, entry.hours, entry.rate, entry.hours * entry.rate, entry.billed ? "Invoiced" : "Unbilled"]),
        ];
        if (downloadCsv("time-ledger.csv", rows)) onToast(`${visibleEntries.length} time entries exported.`, "success");
        else onToast("There are no time entries to export.", "info");
    };

    const exportInvoices = () => {
        const rows = [
            ["Invoice", "Matter", "Amount", "Status", "Issued", "Due"],
            ...invoiceList.map((invoice) => [invoice.id, matterById.get(invoice.matterId)?.title ?? "Matter unavailable", invoice.amount, invoice.status, invoice.issued ?? "", invoice.due]),
        ];
        if (downloadCsv("invoice-ledger.csv", rows)) onToast(`${invoiceList.length} invoices exported.`, "success");
        else onToast("There are no invoices to export.", "info");
    };

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div><h1>Time &amp; billing</h1><p>Keep work entries, client balances, and invoice follow-through connected.</p></div>
                <button className={styles.addEntryButton} onClick={() => setCreateEntry(true)} type="button"><FiPlus aria-hidden="true" /> Add time entry</button>
            </header>

            <section className={styles.metricGrid}>
                <article><span>Unbilled time</span><strong>{unbilledHours.toFixed(1)} hours</strong><small>{formatCurrency(unbilledValue)} ready to invoice</small></article>
                <article><span>Overdue invoices</span><strong>{overdueInvoices.length}</strong><small>{formatCurrency(overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0))} outstanding</small></article>
                <article><span>Recorded as paid</span><strong>{formatCurrency(paidTotal)}</strong><small>Updated in this demo session</small></article>
            </section>

            {timer && (
                <section className={styles.timerBanner}>
                    <span className={styles.timerIcon}><FiClock aria-hidden="true" /></span>
                    <div><strong>Timer running</strong><span>{runningMatter?.title ?? "Matter unavailable"}</span></div>
                    <time>{formatElapsed(elapsedSeconds)}</time>
                    <button onClick={onTimerStop} type="button">Stop &amp; save</button>
                </section>
            )}

            <div className={styles.billingTabs} role="tablist" aria-label="Billing ledger">
                <button aria-selected={activeTab === "time"} className={activeTab === "time" ? styles.activeTab : ""} onClick={() => setActiveTab("time")} role="tab" type="button"><FiClock aria-hidden="true" /> Time entries <span>{timeEntries.length}</span></button>
                <button aria-selected={activeTab === "invoices"} className={activeTab === "invoices" ? styles.activeTab : ""} onClick={() => setActiveTab("invoices")} role="tab" type="button"><FiFileText aria-hidden="true" /> Invoices <span>{invoices.length}</span></button>
            </div>

            {activeTab === "time" ? (
                <section className={styles.ledgerCard}>
                    <header className={styles.ledgerHeader}>
                        <div><h2>Time ledger</h2><p>Review, correct, and prepare recorded work for billing.</p></div>
                        <div className={styles.ledgerActions}>
                            <button className={styles.secondaryButton} onClick={exportEntries} type="button"><FiDownload aria-hidden="true" /> Export</button>
                            <button className={styles.primaryButton} disabled={matterFilter === "all" || !unbilledEntries.length} onClick={buildInvoice} type="button"><FiFileText aria-hidden="true" /> Build invoice</button>
                        </div>
                    </header>
                    <div className={styles.filters}>
                        <label>
                            <span>Matter</span>
                            <select aria-label="Filter time and invoices by matter" onChange={(event) => setMatterFilter(event.target.value)} value={matterFilter}>
                                <option value="all">All matters</option>
                                {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                            </select>
                        </label>
                        <label><span>Entries</span>
                            <select aria-label="Filter time entries by invoice status" onChange={(event) => setEntryStatus(event.target.value)} value={entryStatus}>
                                {["Unbilled", "All time", "Invoiced"].map((status) => <option key={status}>{status}</option>)}
                            </select>
                        </label>
                        <span>{visibleEntries.length} entries</span>
                    </div>
                    {visibleEntries.length ? (
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Date</th><th>Matter &amp; work</th><th>Hours</th><th>Rate</th><th>Amount</th><th>Status</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead>
                                <tbody>
                                    {visibleEntries.map((entry) => {
                                        const matter = matterById.get(entry.matterId);
                                        return (
                                            <tr key={entry.id}>
                                                <td>{formatDate(entry.date, { month: "short", day: "numeric" })}</td>
                                                <td><div className={styles.entryWork}><strong>{matter?.title ?? "Matter unavailable"}</strong><span>{entry.description}</span></div></td>
                                                <td>{Number(entry.hours).toFixed(1)}</td>
                                                <td>{formatCurrency(entry.rate)}</td>
                                                <td className={styles.amount}>{formatCurrency(entry.hours * entry.rate)}</td>
                                                <td><span className={entry.billed ? styles.invoicedStatus : styles.unbilledStatus}>{entry.billed ? "Invoiced" : "Unbilled"}</span></td>
                                                <td><div className={styles.rowActions}>
                                                    <button aria-label={`Edit ${entry.description}`} disabled={entry.billed} onClick={() => setEditingEntry(entry)} type="button"><FiEdit2 aria-hidden="true" /></button>
                                                    <button aria-label={`Remove ${entry.description}`} disabled={entry.billed} onClick={() => setDeletingEntry(entry)} type="button"><FiTrash2 aria-hidden="true" /></button>
                                                </div></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className={styles.emptyLedger}><FiClock aria-hidden="true" /><p>No time entries match these filters.</p><button onClick={() => setCreateEntry(true)} type="button">Add time entry</button></div>}
                </section>
            ) : (
                <section className={styles.ledgerCard}>
                    <header className={styles.ledgerHeader}>
                        <div><h2>Invoice ledger</h2><p>Manage demo invoice statuses and client balances.</p></div>
                        <button className={styles.secondaryButton} onClick={exportInvoices} type="button"><FiDownload aria-hidden="true" /> Export invoices</button>
                    </header>
                    <div className={styles.filters}>
                        <label><span>Matter</span>
                            <select aria-label="Filter invoices by matter" onChange={(event) => setMatterFilter(event.target.value)} value={matterFilter}>
                                <option value="all">All matters</option>
                                {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                            </select>
                        </label>
                        <label><span>Status</span>
                            <select aria-label="Filter invoices by status" onChange={(event) => setInvoiceStatus(event.target.value)} value={invoiceStatus}>
                                {["All invoices", "Draft", "Sent", "Overdue", "Paid"].map((status) => <option key={status}>{status}</option>)}
                            </select>
                        </label>
                        <span>{invoiceList.length} invoices</span>
                    </div>
                    {invoiceList.length ? (
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Invoice</th><th>Matter &amp; client</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead>
                                <tbody>
                                    {invoiceList.map((invoice) => {
                                        const matter = matterById.get(invoice.matterId);
                                        return (
                                            <tr key={invoice.id}>
                                                <td className={styles.invoiceId}>{invoice.id}</td>
                                                <td><div className={styles.entryWork}><strong>{matter?.title ?? "Matter unavailable"}</strong><span>{matter?.clientId ? clientById.get(matter.clientId) ?? "Client unavailable" : "Matter file unavailable"}</span></div></td>
                                                <td>{invoice.issued ? formatDate(invoice.issued, { month: "short", day: "numeric" }) : "Not sent"}</td>
                                                <td>{formatDate(invoice.due, { month: "short", day: "numeric" })}</td>
                                                <td className={styles.amount}>{formatCurrency(invoice.amount)}</td>
                                                <td><span className={`${styles.invoiceStatus} ${styles[invoice.status.toLowerCase()]}`}>{invoice.status}</span></td>
                                                <td>
                                                    <div className={styles.rowActions}>
                                                        {invoice.status === "Draft" && <button aria-label={`Send ${invoice.id}`} onClick={() => setInvoiceAction({ invoice, action: "send" })} type="button">Send</button>}
                                                        {(invoice.status === "Sent" || invoice.status === "Overdue") && <button aria-label={`Mark ${invoice.id} paid`} onClick={() => setInvoiceAction({ invoice, action: "paid" })} type="button">Mark paid</button>}
                                                        {invoice.status === "Draft" && <button aria-label={`Remove ${invoice.id}`} onClick={() => setDeletingInvoice(invoice)} type="button"><FiTrash2 aria-hidden="true" /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className={styles.emptyLedger}><FiFileText aria-hidden="true" /><p>No invoices match these filters.</p><button onClick={() => setActiveTab("time")} type="button">Review unbilled time</button></div>}
                </section>
            )}

            {createEntry && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save time entry" description="Add work to the client ledger. Time entries stay in this browser session." formId="time-entry-form" onClose={() => setCreateEntry(false)} title="Add time entry">
                    <TimeEntryForm matters={matters} onSave={saveEntry} />
                </Dialog>
            )}
            {editingEntry && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save changes" description={`Update the work entry for ${editingEntry.description}.`} formId="time-entry-form" onClose={() => setEditingEntry(null)} title="Edit time entry">
                    <TimeEntryForm entry={editingEntry} formId="time-entry-form" matters={matters} onSave={saveEntry} />
                </Dialog>
            )}
            {deletingEntry && (
                <Dialog cancelLabel="Keep entry" confirmLabel="Remove entry" danger description={`Remove ${deletingEntry.description} from the time ledger? This will not affect other matter files.`} onClose={() => setDeletingEntry(null)} onConfirm={confirmDeleteEntry} title="Remove time entry" />
            )}
            {invoiceAction && (
                <Dialog
                    cancelLabel="Cancel"
                    confirmLabel={invoiceAction.action === "send" ? "Record as sent" : "Record as paid"}
                    description={invoiceAction.action === "send"
                        ? `Mark ${invoiceAction.invoice.id} as sent in the demo ledger. This does not send an email or share client data.`
                        : `Mark ${invoiceAction.invoice.id} as paid in this demo ledger? No payment will be processed.`}
                    onClose={() => setInvoiceAction(null)}
                    onConfirm={confirmInvoiceAction}
                    title={invoiceAction.action === "send" ? "Record invoice as sent" : "Record payment status"}
                />
            )}
            {deletingInvoice && (
                <Dialog cancelLabel="Keep invoice" confirmLabel="Remove draft" danger description={`Remove draft invoice ${deletingInvoice.id}? Its time entries will return to the unbilled ledger.`} onClose={() => setDeletingInvoice(null)} onConfirm={confirmDeleteInvoice} title="Remove draft invoice" />
            )}
        </div>
    );
};

export default BillingPage;
