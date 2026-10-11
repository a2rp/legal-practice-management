import { useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCalendar, FiCheck, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import Dialog from "../../components/dialog";
import { createId, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const eventKinds = ["Court", "Client call", "Client meeting", "Filing deadline", "Negotiation", "Internal"];
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = () => dateKey(new Date());
const timeValue = (value = "") => {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + Number(match[2]);
};

const EventForm = ({ event, matters, initialDate, initialMatterId, onSave }) => {
    const [form, setForm] = useState(() => event ? { ...event } : {
        title: "",
        matterId: initialMatterId || matters[0]?.id || "",
        date: initialDate || today(),
        time: "10:00 AM",
        kind: "Court",
        location: "",
        done: false,
    });
    const [errors, setErrors] = useState({});

    const change = (field) => (eventChange) => {
        setForm((current) => ({ ...current, [field]: eventChange.target.value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const submit = (eventSubmit) => {
        eventSubmit.preventDefault();
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = "Enter a clear calendar title.";
        if (!form.matterId) nextErrors.matterId = "Choose a matter for this date.";
        if (!form.date) nextErrors.date = "Choose a date.";
        if (!form.location.trim()) nextErrors.location = "Add a location or meeting method.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        onSave({ ...form, id: event?.id ?? createId("EV"), title: form.title.trim(), location: form.location.trim() }, Boolean(event));
    };

    return (
        <form className={styles.eventForm} id="event-form" noValidate onSubmit={submit}>
            <label className={styles.fullField}>
                Calendar title
                <input autoComplete="off" onChange={change("title")} placeholder="e.g. Final hearing" value={form.title} />
                {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
            </label>
            <label>
                Matter file
                <select onChange={change("matterId")} value={form.matterId}>
                    <option value="">Choose a matter</option>
                    {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                </select>
                {errors.matterId && <span className={styles.fieldError}>{errors.matterId}</span>}
            </label>
            <label>
                Type
                <select onChange={change("kind")} value={form.kind}>
                    {eventKinds.map((kind) => <option key={kind}>{kind}</option>)}
                </select>
            </label>
            <label>
                Date
                <input onChange={change("date")} type="date" value={form.date} />
                {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
            </label>
            <label>
                Time
                <input onChange={change("time")} placeholder="10:00 AM" value={form.time} />
            </label>
            <label className={styles.fullField}>
                Location or meeting method
                <input onChange={change("location")} placeholder="e.g. King County Superior Court, Room 5B" value={form.location} />
                {errors.location && <span className={styles.fieldError}>{errors.location}</span>}
            </label>
        </form>
    );
};

const CalendarPage = ({ matters, events, onSaveEvent, onUpdateEvent, onDeleteEvent, onToast }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || today());
    const [matterFilter, setMatterFilter] = useState(searchParams.get("matter") || "all");
    const [kindFilter, setKindFilter] = useState("All types");
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const createRequested = searchParams.get("create") === "1";
    const showCreate = createOpen || createRequested;

    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const firstDayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - firstDayOffset);
    const days = Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
    const selectedMatter = matters.find((matter) => matter.id === matterFilter);

    const filteredEvents = useMemo(() => events.filter((event) =>
        (matterFilter === "all" || event.matterId === matterFilter)
        && (kindFilter === "All types" || event.kind === kindFilter)), [events, matterFilter, kindFilter]);
    const selectedEvents = filteredEvents.filter((event) => event.date === selectedDate).sort((a, b) => timeValue(a.time) - timeValue(b.time));
    const monthEvents = filteredEvents.filter((event) => event.date.startsWith(`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`));
    const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthDate);

    const selectMatter = (value) => {
        setMatterFilter(value);
        const next = new URLSearchParams(searchParams);
        if (value === "all") next.delete("matter");
        else next.set("matter", value);
        setSearchParams(next, { replace: true });
    };

    const closeCreate = () => {
        setCreateOpen(false);
        if (createRequested) {
            const next = new URLSearchParams(searchParams);
            next.delete("create");
            setSearchParams(next, { replace: true });
        }
    };

    const saveEvent = (event, isEdit) => {
        onSaveEvent(event, isEdit);
        onToast(isEdit ? "Calendar date updated." : "Date added to the court calendar.", "success");
        if (isEdit) setEditing(null);
        else {
            setCreateOpen(false);
            setSelectedDate(event.date);
            if (createRequested) {
                const next = new URLSearchParams(searchParams);
                next.delete("create");
                setSearchParams(next, { replace: true });
            }
        }
    };

    const deleteEvent = () => {
        onDeleteEvent(deleting.id);
        onToast(`${deleting.title} was removed from the calendar.`, "success");
        setDeleting(null);
    };

    const changeMonth = (offset) => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div><h1>Court calendar</h1><p>Keep hearings, filings, and client commitments on one shared calendar.</p></div>
                <button className={styles.newEventButton} onClick={() => setCreateOpen(true)} type="button"><FiPlus aria-hidden="true" /> Add calendar date</button>
            </header>

            <div className={styles.calendarToolbar}>
                <div className={styles.monthControls}>
                    <button aria-label="Previous month" onClick={() => changeMonth(-1)} type="button"><FiArrowLeft aria-hidden="true" /></button>
                    <h2>{monthLabel}</h2>
                    <button aria-label="Next month" onClick={() => changeMonth(1)} type="button"><FiArrowRight aria-hidden="true" /></button>
                    <button className={styles.todayButton} onClick={() => {
                        const now = new Date();
                        setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
                        setSelectedDate(today());
                    }} type="button">Today</button>
                </div>
                <div className={styles.filters}>
                    <label>
                        Matter
                        <select aria-label="Filter calendar by matter" onChange={(event) => selectMatter(event.target.value)} value={matterFilter}>
                            <option value="all">All matters</option>
                            {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                        </select>
                    </label>
                    <label>
                        Type
                        <select aria-label="Filter calendar by date type" onChange={(event) => setKindFilter(event.target.value)} value={kindFilter}>
                            {["All types", ...eventKinds].map((kind) => <option key={kind}>{kind}</option>)}
                        </select>
                    </label>
                </div>
            </div>

            <div className={styles.calendarGrid}>
                <section aria-label={`${monthLabel} calendar`} className={styles.monthCard}>
                    <div className={styles.weekdays}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
                    <div className={styles.daysGrid}>
                        {days.map((date) => {
                            const key = dateKey(date);
                            const dayEvents = filteredEvents.filter((event) => event.date === key);
                            const isCurrentMonth = date.getMonth() === monthDate.getMonth();
                            const isSelected = key === selectedDate;
                            return (
                                <button
                                    aria-label={`${formatDate(key, { weekday: "long", month: "long", day: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} scheduled items` : ""}`}
                                    aria-pressed={isSelected}
                                    className={`${styles.dayCell} ${isCurrentMonth ? "" : styles.outsideMonth} ${isSelected ? styles.selectedDay : ""} ${key === today() ? styles.todayCell : ""}`}
                                    key={key}
                                    onClick={() => setSelectedDate(key)}
                                    type="button"
                                >
                                    <span className={styles.dayNumber}>{date.getDate()}</span>
                                    {dayEvents.slice(0, 2).map((event) => <span className={`${styles.eventMarker} ${styles[`kind${event.kind.replaceAll(/\s+/g, "")}`] || ""}`} key={event.id}>{event.title}</span>)}
                                    {dayEvents.length > 2 && <span className={styles.moreEvents}>+{dayEvents.length - 2} more</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.legend}>
                        <span><i className={styles.courtDot} /> Court</span>
                        <span><i className={styles.clientDot} /> Client</span>
                        <span><i className={styles.filingDot} /> Filing</span>
                    </div>
                </section>

                <aside className={styles.agendaCard}>
                    <div className={styles.agendaHeader}>
                        <div>
                            <p>{formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</p>
                            <h2>{selectedEvents.length ? "Scheduled work" : "No dates on this day"}</h2>
                        </div>
                        <span className={styles.agendaCount}>{selectedEvents.length}</span>
                    </div>
                    {selectedMatter && <p className={styles.filterNote}>Showing {selectedMatter.title}</p>}
                    {selectedEvents.length ? (
                        <div className={styles.eventList}>
                            {selectedEvents.map((event) => {
                                const matter = matters.find((item) => item.id === event.matterId);
                                return (
                                    <article className={event.done ? styles.eventDone : styles.eventItem} key={event.id}>
                                        <time>{event.time}</time>
                                        <div className={styles.eventContent}>
                                            <strong>{event.title}</strong>
                                            <Link to={`/matters/${event.matterId}`}>{matter?.title ?? "Matter file unavailable"}</Link>
                                            <small>{event.kind} · {event.location}</small>
                                        </div>
                                        <div className={styles.eventActions}>
                                            <button aria-label={event.done ? `Reopen ${event.title}` : `Mark ${event.title} complete`} onClick={() => onUpdateEvent(event.id, { done: !event.done })} type="button"><FiCheck aria-hidden="true" /></button>
                                            <button aria-label={`Edit ${event.title}`} onClick={() => setEditing(event)} type="button"><FiEdit2 aria-hidden="true" /></button>
                                            <button aria-label={`Remove ${event.title}`} onClick={() => setDeleting(event)} type="button"><FiTrash2 aria-hidden="true" /></button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyAgenda}>
                            <FiCalendar aria-hidden="true" />
                            <p>Use this space to schedule a hearing, filing, or client commitment.</p>
                        </div>
                    )}
                    <button className={styles.agendaAdd} onClick={() => setCreateOpen(true)} type="button"><FiPlus aria-hidden="true" /> Add a date here</button>
                    <div className={styles.monthSummary}>{monthEvents.length} item{monthEvents.length === 1 ? "" : "s"} this month</div>
                </aside>
            </div>

            {showCreate && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save calendar date" description="Add a deadline or commitment to the practice calendar." formId="event-form" onClose={closeCreate} title="Add a calendar date">
                    <EventForm initialDate={selectedDate} initialMatterId={matterFilter === "all" ? "" : matterFilter} matters={matters} onSave={saveEvent} />
                </Dialog>
            )}
            {editing && (
                <Dialog cancelLabel="Cancel" confirmLabel="Save changes" description={`Update ${editing.title} on the practice calendar.`} formId="event-form" onClose={() => setEditing(null)} title="Edit calendar date">
                    <EventForm event={editing} matters={matters} onSave={saveEvent} />
                </Dialog>
            )}
            {deleting && (
                <Dialog cancelLabel="Keep date" confirmLabel="Remove date" danger description={`Remove ${deleting.title} from the court calendar? The matter file will stay unchanged.`} onClose={() => setDeleting(null)} onConfirm={deleteEvent} title="Remove calendar date" />
            )}
        </div>
    );
};

export default CalendarPage;
