import { useState } from "react";
import { FiArrowLeft, FiCalendar, FiCheck, FiClock, FiEdit2, FiFileText, FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import Dialog from "../../components/dialog";
import MatterForm from "../../components/matterForm";
import { createId, formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const MatterFilePage = ({ matters, clients, events, timeEntries, invoices, onUpdateMatter, onDeleteMatter, onToast }) => {
    const { matterId } = useParams();
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [note, setNote] = useState("");
    const matter = matters.find((item) => item.id === matterId);

    if (!matter) {
        return (
            <section className={styles.notFound}>
                <FiFileText aria-hidden="true" />
                <h1>This matter file is unavailable</h1>
                <p>It may have been removed or the file number may be incorrect.</p>
                <Link to="/matters"><FiArrowLeft aria-hidden="true" /> Return to matter files</Link>
            </section>
        );
    }

    const client = clients.find((item) => item.id === matter.clientId);
    const matterEvents = events.filter((event) => event.matterId === matter.id).sort((a, b) => a.date.localeCompare(b.date));
    const matterEntries = timeEntries.filter((entry) => entry.matterId === matter.id).sort((a, b) => b.date.localeCompare(a.date));
    const matterInvoices = invoices.filter((invoice) => invoice.matterId === matter.id);
    const timeValue = matterEntries.reduce((sum, entry) => sum + entry.hours * entry.rate, 0);
    const budgetUse = Math.min(Math.round((timeValue / Math.max(matter.budget, 1)) * 100), 100);

    const changeMatter = (updates, message) => {
        onUpdateMatter(matter.id, updates);
        if (message) onToast(message, "success");
    };

    const toggleTask = (taskId) => {
        const tasks = matter.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
        changeMatter({ tasks });
    };

    const addTask = (event) => {
        event.preventDefault();
        if (!taskTitle.trim()) {
            onToast("Enter a task before adding it to the file.", "error");
            return;
        }
        const task = { id: createId("TSK"), title: taskTitle.trim(), due: taskDate || new Date().toISOString().slice(0, 10), done: false };
        changeMatter({ tasks: [...matter.tasks, task] }, "Task added to the matter file.");
        setTaskTitle("");
        setTaskDate("");
    };

    const addNote = (event) => {
        event.preventDefault();
        if (!note.trim()) {
            onToast("Write a note before adding it to the matter activity.", "error");
            return;
        }
        changeMatter({ activity: [note.trim(), ...matter.activity] }, "Matter note added.");
        setNote("");
    };

    const saveMatter = (updated, isEdit) => {
        changeMatter(updated, "Matter details updated.");
        setEditOpen(false);
        return isEdit;
    };

    const confirmDelete = () => {
        onDeleteMatter(matter.id);
        onToast(`${matter.title} was removed from the practice register.`, "success");
        navigate("/matters");
    };

    return (
        <div className={styles.page}>
            <Link className={styles.backLink} to="/matters"><FiArrowLeft aria-hidden="true" /> Matter files</Link>
            <header className={styles.matterHeader}>
                <div className={styles.titleBlock}>
                    <div className={styles.titleMeta}>
                        <span>{matter.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{matter.area}</span>
                    </div>
                    <h1>{matter.title}</h1>
                    <p>{client?.name ?? "Client unavailable"} · opened {formatDate(matter.opened, { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.editButton} onClick={() => setEditOpen(true)} type="button"><FiEdit2 aria-hidden="true" /> Edit file</button>
                    <button className={styles.deleteButton} onClick={() => setDeleteOpen(true)} type="button"><FiTrash2 aria-hidden="true" /> Remove</button>
                </div>
            </header>

            <div className={styles.stateBar}>
                <label>
                    File status
                    <select aria-label="Change file status" onChange={(event) => changeMatter({ status: event.target.value }, `File status changed to ${event.target.value}.`)} value={matter.status}>
                        {["Open", "Waiting on client", "Closed"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                </label>
                <label>
                    Current stage
                    <select aria-label="Change matter stage" onChange={(event) => changeMatter({ stage: event.target.value }, `Matter moved to ${event.target.value}.`)} value={matter.stage}>
                        {["Intake", "Advice", "Discovery", "Drafting", "Negotiation", "Client review", "Filing", "Resolution"].map((stage) => <option key={stage}>{stage}</option>)}
                    </select>
                </label>
                <span className={`${styles.priority} ${styles[matter.priority.toLowerCase()]}`}>{matter.priority} priority</span>
                <span className={styles.attorney}><FiUser aria-hidden="true" /> {matter.attorney}</span>
            </div>

            <section className={styles.summaryGrid}>
                <article><span>Next date</span><strong>{formatDate(matter.nextDate, { weekday: "short", month: "short", day: "numeric" })}</strong><small>{matter.nextEvent} · {matter.nextTime}</small></article>
                <article><span>Time recorded</span><strong>{matterEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)} hours</strong><small>{formatCurrency(timeValue)} at current rates</small></article>
                <article><span>Budget used</span><strong>{budgetUse}%</strong><small>{formatCurrency(matter.budget - timeValue)} remaining of {formatCurrency(matter.budget)}</small><div className={styles.budgetTrack}><i style={{ width: `${budgetUse}%` }} /></div></article>
                <article><span>Open tasks</span><strong>{matter.tasks.filter((task) => !task.done).length}</strong><small>{matter.tasks.length} tasks in this file</small></article>
            </section>

            <div className={styles.fileGrid}>
                <div className={styles.primaryColumn}>
                    <section className={styles.summaryCard}>
                        <header>
                            <div><h2>Case summary</h2><p>Purpose and current focus</p></div>
                            <span className={styles.caseNumber}>{matter.matterNumber || matter.id}</span>
                        </header>
                        <p className={styles.description}>{matter.description || "No matter summary has been added yet."}</p>
                        <div className={styles.feeInfo}><FiClock aria-hidden="true" /> Hourly engagement <strong>{formatCurrency(matter.hourlyRate)} per hour</strong></div>
                    </section>

                    <section className={styles.tasksCard}>
                        <header className={styles.cardHeader}>
                            <div><h2>Next steps</h2><p>Tasks stay with their matter file.</p></div>
                            <span className={styles.taskCount}>{matter.tasks.filter((task) => !task.done).length} open</span>
                        </header>
                        <div className={styles.taskList}>
                            {matter.tasks.map((task) => (
                                <div className={task.done ? styles.taskDone : styles.taskRow} key={task.id}>
                                    <button aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`} className={styles.taskToggle} onClick={() => toggleTask(task.id)} type="button"><FiCheck aria-hidden="true" /></button>
                                    <span className={styles.taskInfo}><strong>{task.title}</strong><small>Due {formatDate(task.due, { month: "short", day: "numeric" })}</small></span>
                                    <span className={styles.taskState}>{task.done ? "Complete" : "Open"}</span>
                                </div>
                            ))}
                            {!matter.tasks.length && <p className={styles.emptyText}>No tasks yet. Add the next step below.</p>}
                        </div>
                        <form className={styles.addTaskForm} onSubmit={addTask}>
                            <label className={styles.srOnly} htmlFor="new-task">New task</label>
                            <input id="new-task" onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a next step" value={taskTitle} />
                            <label className={styles.srOnly} htmlFor="task-due">Task due date</label>
                            <input id="task-due" onChange={(event) => setTaskDate(event.target.value)} type="date" value={taskDate} />
                            <button aria-label="Add task" type="submit"><FiPlus aria-hidden="true" /> Add</button>
                        </form>
                    </section>

                    <section className={styles.activityCard}>
                        <header className={styles.cardHeader}>
                            <div><h2>File activity</h2><p>Notes and updates from the practice team.</p></div>
                            <FiFileText aria-hidden="true" />
                        </header>
                        <form className={styles.noteForm} onSubmit={addNote}>
                            <label className={styles.srOnly} htmlFor="matter-note">Add a matter note</label>
                            <textarea id="matter-note" onChange={(event) => setNote(event.target.value)} placeholder="Add a clear note for the matter record" rows="2" value={note} />
                            <button type="submit">Add note</button>
                        </form>
                        <div className={styles.activityList}>
                            {matter.activity.map((item, index) => (
                                <div className={styles.activityItem} key={`${item}-${index}`}>
                                    <span className={styles.activityDot} />
                                    <span><strong>{item}</strong><small>{index === 0 ? "Most recent update" : "Matter history"}</small></span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className={styles.secondaryColumn}>
                    <section className={styles.clientCard}>
                        <header><h2>Client contact</h2><FiUser aria-hidden="true" /></header>
                        {client ? (
                            <>
                                <div className={styles.clientIdentity}><span>{client.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.name}</strong><small>{client.contact}</small></div></div>
                                <a href={`mailto:${client.email}`}>{client.email}</a>
                                <a href={`tel:${client.phone.replaceAll(/[^\d+]/g, "")}`}>{client.phone}</a>
                                <Link className={styles.clientLink} to="/clients">Open client directory <FiArrowLeft aria-hidden="true" /></Link>
                            </>
                        ) : <p className={styles.emptyText}>Client details are unavailable.</p>}
                    </section>

                    <section className={styles.datesCard}>
                        <header><h2>Upcoming dates</h2><Link to={`/calendar?matter=${matter.id}`} aria-label="Open calendar for this matter"><FiCalendar aria-hidden="true" /></Link></header>
                        {matterEvents.length ? matterEvents.slice(0, 4).map((item) => (
                            <div className={styles.dateRow} key={item.id}>
                                <span className={styles.dateTile}><strong>{new Date(`${item.date}T12:00:00`).getDate()}</strong><small>{new Date(`${item.date}T12:00:00`).toLocaleString("en-US", { month: "short" })}</small></span>
                                <span><strong>{item.title}</strong><small>{item.time} · {item.kind}</small></span>
                            </div>
                        )) : <p className={styles.emptyText}>No dates are scheduled for this file.</p>}
                        <Link className={styles.addDateLink} to={`/calendar?matter=${matter.id}&create=1`}><FiPlus aria-hidden="true" /> Schedule a date</Link>
                    </section>

                    <section className={styles.financialCard}>
                        <header><h2>Financial record</h2><Link to="/billing" aria-label="Open time and billing"><FiArrowLeft aria-hidden="true" /></Link></header>
                        <div><span>Unbilled time</span><strong>{formatCurrency(matterEntries.filter((entry) => !entry.billed).reduce((sum, entry) => sum + entry.hours * entry.rate, 0))}</strong></div>
                        <div><span>Invoice balance</span><strong>{formatCurrency(matterInvoices.filter((invoice) => invoice.status !== "Paid").reduce((sum, invoice) => sum + invoice.amount, 0))}</strong></div>
                        <div><span>Budget</span><strong>{formatCurrency(matter.budget)}</strong></div>
                    </section>
                </aside>
            </div>

            {editOpen && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save changes" description={`Update the practice details for ${matter.title}.`} formId="edit-matter-form" onClose={() => setEditOpen(false)} title="Edit matter file">
                    <MatterForm clients={clients} formId="edit-matter-form" matter={matter} onSave={saveMatter} />
                </Dialog>
            )}
            {deleteOpen && (
                <Dialog cancelLabel="Keep matter" confirmLabel="Remove matter" danger description={`Remove ${matter.title} and its related tasks, scheduled dates, time entries, and invoices from this demo session? This action cannot be undone.`} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} title="Remove matter file" />
            )}
        </div>
    );
};

export default MatterFilePage;
