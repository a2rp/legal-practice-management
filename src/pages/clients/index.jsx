import { useMemo, useState } from "react";
import { FiBriefcase, FiEdit2, FiMail, FiPhone, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import Dialog from "../../components/dialog";
import { createId, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const emptyClient = { name: "", contact: "", type: "Business", email: "", phone: "" };

const ClientForm = ({ client, formId = "client-form", onSave }) => {
    const [form, setForm] = useState(client ? { ...client } : { ...emptyClient });
    const [errors, setErrors] = useState({});

    const change = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
        setErrors((current) => ({ ...current, [event.target.name]: "" }));
    };

    const submit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = "Enter a client or organization name.";
        if (!form.contact.trim()) nextErrors.contact = "Add the primary client contact.";
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
        if (form.phone.replaceAll(/\D/g, "").length < 7) nextErrors.phone = "Enter a phone number with at least seven digits.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        onSave({
            ...form,
            id: client?.id ?? createId("CL"),
            name: form.name.trim(),
            contact: form.contact.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
        }, Boolean(client));
    };

    return (
        <form className={styles.clientForm} id={formId} noValidate onSubmit={submit}>
            <label className={styles.fullField}>
                Client or organization
                <input autoComplete="off" name="name" onChange={change} placeholder="e.g. Harbor House Studio" value={form.name} />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </label>
            <label>
                Primary contact
                <input name="contact" onChange={change} placeholder="Full name" value={form.contact} />
                {errors.contact && <span className={styles.fieldError}>{errors.contact}</span>}
            </label>
            <label>
                Client type
                <select name="type" onChange={change} value={form.type}>
                    <option>Business</option>
                    <option>Individual</option>
                </select>
            </label>
            <label>
                Email
                <input autoComplete="email" name="email" onChange={change} placeholder="name@example.com" type="email" value={form.email} />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </label>
            <label>
                Phone
                <input autoComplete="tel" name="phone" onChange={change} placeholder="(206) 555-0123" type="tel" value={form.phone} />
                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </label>
        </form>
    );
};

const getInitials = (value) => value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const ClientsPage = ({ clients, matters, onSaveClient, onDeleteClient, onToast }) => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All clients");
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [blockedDelete, setBlockedDelete] = useState(null);

    const visibleClients = useMemo(() => clients
        .filter((client) => {
            const haystack = `${client.name} ${client.contact} ${client.email} ${client.phone}`.toLowerCase();
            return (!search || haystack.includes(search.toLowerCase())) && (typeFilter === "All clients" || client.type === typeFilter);
        })
        .sort((a, b) => a.name.localeCompare(b.name)), [clients, search, typeFilter]);

    const saveClient = (client, isEdit) => {
        onSaveClient(client, isEdit);
        onToast(isEdit ? `${client.name} client details updated.` : `${client.name} added to the client directory.`, "success");
        if (isEdit) setEditing(null);
        else setCreateOpen(false);
    };

    const requestDelete = (client) => {
        const linkedMatters = matters.filter((matter) => matter.clientId === client.id);
        if (linkedMatters.length) {
            setBlockedDelete({ client, count: linkedMatters.length });
            return;
        }
        setDeleting(client);
    };

    const confirmDelete = () => {
        onDeleteClient(deleting.id);
        onToast(`${deleting.name} was removed from the client directory.`, "success");
        setDeleting(null);
    };

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div><h1>Client directory</h1><p>Keep client contacts connected to the work your team is managing.</p></div>
                <button className={styles.newClient} onClick={() => setCreateOpen(true)} type="button"><FiPlus aria-hidden="true" /> Add client</button>
            </header>

            <section className={styles.directoryStats}>
                <article><span className={styles.statIcon}><FiUsers aria-hidden="true" /></span><span><strong>{clients.length}</strong><small>Client records</small></span></article>
                <article><span className={styles.statIcon}><FiBriefcase aria-hidden="true" /></span><span><strong>{clients.filter((client) => client.type === "Business").length}</strong><small>Business clients</small></span></article>
                <article><span className={styles.statIcon}><FiMail aria-hidden="true" /></span><span><strong>{matters.filter((matter) => matter.status !== "Closed").length}</strong><small>Open matter links</small></span></article>
            </section>

            <div className={styles.directoryToolbar}>
                <label className={styles.search}>
                    <FiSearch aria-hidden="true" />
                    <input aria-label="Search clients" onChange={(event) => setSearch(event.target.value)} placeholder="Search names, contacts, or email" value={search} />
                </label>
                <label className={styles.typeSelect}>
                    <span>Type</span>
                    <select aria-label="Filter clients by type" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
                        <option>All clients</option>
                        <option>Business</option>
                        <option>Individual</option>
                    </select>
                </label>
                <span className={styles.resultCount}>{visibleClients.length} shown</span>
            </div>

            {visibleClients.length ? (
                <div className={styles.clientGrid}>
                    {visibleClients.map((client, index) => {
                        const clientMatters = matters.filter((matter) => matter.clientId === client.id);
                        const activeMatters = clientMatters.filter((matter) => matter.status !== "Closed").length;
                        return (
                            <article className={`${styles.clientCard} ${styles[`tone${index % 4}`]}`} key={client.id}>
                                <div className={styles.cardTop}>
                                    <span className={styles.avatar}>{getInitials(client.name)}</span>
                                    <span className={styles.clientType}>{client.type}</span>
                                    <div className={styles.cardActions}>
                                        <button aria-label={`Edit ${client.name}`} onClick={() => setEditing(client)} type="button"><FiEdit2 aria-hidden="true" /></button>
                                        <button aria-label={`Remove ${client.name}`} onClick={() => requestDelete(client)} type="button"><FiTrash2 aria-hidden="true" /></button>
                                    </div>
                                </div>
                                <h2>{client.name}</h2>
                                <p className={styles.contactName}>{client.contact}</p>
                                <div className={styles.contactLines}>
                                    <a href={`mailto:${client.email}`}><FiMail aria-hidden="true" /><span>{client.email}</span></a>
                                    <a href={`tel:${client.phone.replaceAll(/[^\d+]/g, "")}`}><FiPhone aria-hidden="true" /><span>{client.phone}</span></a>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{activeMatters} active matter{activeMatters === 1 ? "" : "s"}</span>
                                    <Link to={`/matters?search=${encodeURIComponent(client.name)}`}>View files</Link>
                                </div>
                                <p className={styles.clientSince}>Client since {formatDate(client.since, { month: "short", year: "numeric" })}</p>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <section className={styles.emptyState}>
                    <FiUsers aria-hidden="true" />
                    <h2>No client records found</h2>
                    <p>Change the search or filter, or add a new client contact.</p>
                    <button className={styles.newClient} onClick={() => setCreateOpen(true)} type="button"><FiPlus aria-hidden="true" /> Add client</button>
                </section>
            )}

            {createOpen && (
                <Dialog cancelLabel="Cancel" confirmLabel="Add client" description="Add a client contact to the practice directory." formId="client-form" onClose={() => setCreateOpen(false)} title="Add a client">
                    <ClientForm onSave={saveClient} />
                </Dialog>
            )}
            {editing && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save changes" description={`Update the client details for ${editing.name}.`} formId="client-form" onClose={() => setEditing(null)} title="Edit client">
                    <ClientForm client={editing} onSave={saveClient} />
                </Dialog>
            )}
            {deleting && (
                <Dialog cancelLabel="Keep client" confirmLabel="Remove client" danger description={`Remove ${deleting.name} from the client directory? This action cannot be undone.`} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title="Remove client" />
            )}
            {blockedDelete && (
                <Dialog cancelLabel="Understood" description={`${blockedDelete.client.name} is linked to ${blockedDelete.count} matter file${blockedDelete.count === 1 ? "" : "s"}. Reassign or close those files before removing this client.`} onClose={() => setBlockedDelete(null)} title="Client still has matter files" />
            )}
        </div>
    );
};

export default ClientsPage;
