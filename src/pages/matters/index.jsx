import { useMemo, useState } from "react";
import { FiDownload, FiEdit2, FiFolder, FiPlus, FiSearch } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Dialog from "../../components/dialog";
import MatterForm from "../../components/matterForm";
import { downloadCsv, formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const stageOptions = ["Intake", "Advice", "Discovery", "Drafting", "Negotiation", "Client review", "Filing", "Resolution"];
const statusOptions = ["Open", "Waiting on client", "Closed"];

const MattersPage = ({ matters, clients, onSaveMatter, onUpdateMatter, onToast }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [sortBy, setSortBy] = useState("nextDate");
    const stageFilter = searchParams.get("stage") ?? "All stages";
    const search = searchParams.get("search") ?? "";
    const createRequested = searchParams.get("create") === "1";
    const showCreate = createOpen || createRequested;

    const closeCreate = () => {
        setCreateOpen(false);
        if (createRequested) {
            const next = new URLSearchParams(searchParams);
            next.delete("create");
            setSearchParams(next, { replace: true });
        }
    };

    const visibleMatters = useMemo(() => matters
        .filter((matter) => {
            const client = clients.find((item) => item.id === matter.clientId);
            const haystack = `${matter.title} ${matter.id} ${matter.area} ${client?.name ?? ""}`.toLowerCase();
            return (!search || haystack.includes(search.toLowerCase()))
                && (statusFilter === "All statuses" || matter.status === statusFilter)
                && (stageFilter === "All stages" || matter.stage === stageFilter);
        })
        .sort((a, b) => sortBy === "title" ? a.title.localeCompare(b.title) : a.nextDate.localeCompare(b.nextDate)),
    [matters, clients, search, statusFilter, stageFilter, sortBy]);

    const changeStage = (matter, stage) => {
        onUpdateMatter(matter.id, { stage, activity: [`Moved to ${stage}`, ...matter.activity] });
        onToast(`${matter.title} moved to ${stage}.`, "success");
    };

    const exportMatters = () => {
        const clientById = new Map(clients.map((client) => [client.id, client.name]));
        const rows = [
            ["File", "Matter", "Client", "Practice area", "Status", "Stage", "Priority", "Next date", "Attorney", "Budget"],
            ...visibleMatters.map((matter) => [matter.id, matter.title, clientById.get(matter.clientId), matter.area, matter.status, matter.stage, matter.priority, matter.nextDate, matter.attorney, matter.budget]),
        ];
        if (!downloadCsv("matter-files.csv", rows)) {
            onToast("There are no matter files to export.", "info");
            return;
        }
        onToast(`${visibleMatters.length} matter files exported.`, "success");
    };

    const saveMatter = (matter, isEdit) => {
        onSaveMatter(matter, isEdit);
        onToast(isEdit ? "Matter file updated." : "New matter file opened.", "success");
        if (isEdit) setEditing(null);
        else {
            setCreateOpen(false);
            navigate(`/matters/${matter.id}`);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Matter files</h1>
                    <p>{matters.length} files in the practice register. Search, update stages, and open the full case record.</p>
                </div>
                <button className={styles.newButton} onClick={() => setCreateOpen(true)} type="button"><FiPlus aria-hidden="true" /> New matter</button>
            </header>

            <section className={styles.register}>
                <div className={styles.toolbar}>
                    <label className={styles.search}>
                        <FiSearch aria-hidden="true" />
                        <input aria-label="Search matter files" onChange={(event) => {
                            const next = new URLSearchParams(searchParams);
                            if (event.target.value) next.set("search", event.target.value);
                            else next.delete("search");
                            setSearchParams(next, { replace: true });
                        }} placeholder="Search names, clients, or file number" value={search} />
                    </label>
                    <label className={styles.filter}>
                        <span>Status</span>
                        <select aria-label="Filter by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                            {["All statuses", ...statusOptions].map((status) => <option key={status}>{status}</option>)}
                        </select>
                    </label>
                    <label className={styles.filter}>
                        <span>Stage</span>
                        <select aria-label="Filter by stage" onChange={(event) => {
                            const next = new URLSearchParams(searchParams);
                            if (event.target.value === "All stages") next.delete("stage");
                            else next.set("stage", event.target.value);
                            setSearchParams(next, { replace: true });
                        }} value={stageFilter}>
                            {["All stages", ...stageOptions].map((stage) => <option key={stage}>{stage}</option>)}
                        </select>
                    </label>
                    <label className={styles.sort}>
                        <span>Sort</span>
                        <select aria-label="Sort matter files" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                            <option value="nextDate">Next date</option>
                            <option value="title">Matter name</option>
                        </select>
                    </label>
                    <button aria-label="Export visible matter files as CSV" className={styles.exportButton} onClick={exportMatters} type="button"><FiDownload aria-hidden="true" /><span>Export</span></button>
                </div>

                <div className={styles.registerMeta}>
                    <span>{visibleMatters.length} file{visibleMatters.length === 1 ? "" : "s"} shown</span>
                    {stageFilter !== "All stages" && <button className={styles.clearFilter} onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete("stage");
                        setSearchParams(next, { replace: true });
                    }} type="button">Clear stage filter</button>}
                </div>

                {visibleMatters.length ? (
                    <div className={styles.tableWrap}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Matter</th>
                                    <th>Status</th>
                                    <th>Stage</th>
                                    <th>Priority</th>
                                    <th>Next date</th>
                                    <th>Budget</th>
                                    <th><span className={styles.srOnly}>Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleMatters.map((matter) => {
                                    const client = clients.find((item) => item.id === matter.clientId);
                                    return (
                                        <tr key={matter.id}>
                                            <td>
                                                <div className={styles.matterCell}>
                                                    <span className={styles.fileMark}><FiFolder aria-hidden="true" /></span>
                                                    <span className={styles.matterCopy}>
                                                        <Link to={`/matters/${matter.id}`}>{matter.title}</Link>
                                                        <span>{matter.id} · {client?.name ?? "Client unavailable"}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.status} ${styles[matter.status === "Open" ? "open" : matter.status === "Closed" ? "closed" : "waiting"]}`}>{matter.status}</span></td>
                                            <td>
                                                <label className={styles.stageSelect}>
                                                    <span className={styles.srOnly}>Change stage for {matter.title}</span>
                                                    <select aria-label={`Change stage for ${matter.title}`} onChange={(event) => changeStage(matter, event.target.value)} value={matter.stage}>
                                                        {stageOptions.map((stage) => <option key={stage}>{stage}</option>)}
                                                    </select>
                                                </label>
                                            </td>
                                            <td><span className={`${styles.priority} ${styles[matter.priority.toLowerCase()]}`}>{matter.priority}</span></td>
                                            <td><span className={styles.nextDate}>{matter.nextEvent}<small>{formatDate(matter.nextDate, { month: "short", day: "numeric" })}</small></span></td>
                                            <td className={styles.budget}>{formatCurrency(matter.budget)}</td>
                                            <td>
                                                <button aria-label={`Edit ${matter.title}`} className={styles.editButton} onClick={() => setEditing(matter)} type="button"><FiEdit2 aria-hidden="true" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FiFolder aria-hidden="true" />
                        <h2>No files match those filters</h2>
                        <p>Try another search or clear the selected stage and status.</p>
                        <button className={styles.resetButton} onClick={() => {
                            setStatusFilter("All statuses");
                            setSearchParams({}, { replace: true });
                        }} type="button">Clear filters</button>
                    </div>
                )}
            </section>

            {showCreate && (
                <Dialog cancelLabel="Cancel" confirmLabel="Open matter" description="Create a matter file and add it to the practice register." formId="matter-form" onClose={closeCreate} title="Open a new matter">
                    <MatterForm clients={clients} onSave={saveMatter} />
                </Dialog>
            )}
            {editing && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save changes" description={`Update the practice details for ${editing.title}.`} formId="matter-form" onClose={() => setEditing(null)} title="Edit matter file">
                    <MatterForm clients={clients} matter={editing} onSave={saveMatter} />
                </Dialog>
            )}
        </div>
    );
};

export default MattersPage;
