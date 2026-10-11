import { useMemo, useState } from "react";
import { FiArrowRight, FiBookOpen, FiCalendar, FiCheck, FiClock, FiPlay, FiStopCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate, formatToday } from "../../utils/formatters";
import styles from "./styles.module.css";

const todayKey = () => new Date().toISOString().slice(0, 10);
const timeValue = (value = "") => {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + Number(match[2]);
};

const formatElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${remainder}`;
};

const TodayPage = ({
    matters,
    events,
    timeEntries,
    invoices,
    timer,
    elapsedSeconds,
    onToggleEvent,
    onToggleTask,
    onTimerStart,
    onTimerStop,
}) => {
    const [selectedMatterId, setSelectedMatterId] = useState(matters[0]?.id ?? "");
    const today = todayKey();
    const todayEvents = useMemo(
        () => events.filter((event) => event.date === today).sort((a, b) => timeValue(a.time) - timeValue(b.time)),
        [events, today],
    );
    const openMatters = matters.filter((matter) => matter.status !== "Closed").length;
    const todayHours = timeEntries
        .filter((entry) => entry.date === today)
        .reduce((sum, entry) => sum + Number(entry.hours), 0) + elapsedSeconds / 3600;
    const unpaidAmount = invoices.filter((invoice) => invoice.status !== "Paid")
        .reduce((sum, invoice) => sum + invoice.amount, 0);
    const dueTasks = matters.flatMap((matter) => matter.tasks
        .filter((task) => !task.done && task.due <= today)
        .map((task) => ({ ...task, matter })));
    const activeTimerMatter = matters.find((matter) => matter.id === timer?.matterId);

    const startTimer = () => {
        if (!selectedMatterId) return;
        onTimerStart(selectedMatterId);
    };

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <p className={styles.date}>{formatToday()}</p>
                    <h1>Your day in practice</h1>
                    <p className={styles.intro}>Court dates, client work, and time in one clear view.</p>
                    <div className={styles.metrics}>
                        <div><strong>{openMatters}</strong><span>Open matters</span></div>
                        <div><strong>{todayHours.toFixed(1)}h</strong><span>Recorded today</span></div>
                        <div><strong>{formatCurrency(unpaidAmount)}</strong><span>Unpaid invoices</span></div>
                    </div>
                </div>
                <div className={styles.heroImage}>
                    <img alt="Law books arranged on a reference library shelf" src={`${import.meta.env.BASE_URL}assets/law-reference.jpg`} />
                    <div className={styles.imageCaption}>
                        <FiBookOpen aria-hidden="true" />
                        <span>Keep every next step close to its matter file.</span>
                    </div>
                </div>
            </section>

            <div className={styles.workGrid}>
                <section className={styles.docketCard}>
                    <header className={styles.sectionHeader}>
                        <div>
                            <h2>Today's docket</h2>
                            <p>{todayEvents.length} scheduled items · {formatDate(today, { month: "long", day: "numeric" })}</p>
                        </div>
                        <Link className={styles.textLink} to="/calendar">Open calendar <FiArrowRight aria-hidden="true" /></Link>
                    </header>
                    {todayEvents.length ? (
                        <div className={styles.docketList}>
                            {todayEvents.map((event) => {
                                const matter = matters.find((item) => item.id === event.matterId);
                                return (
                                    <article className={event.done ? styles.eventDone : styles.eventRow} key={event.id}>
                                        <time>{event.time}</time>
                                        <span className={styles.eventStem} aria-hidden="true" />
                                        <div className={styles.eventDetails}>
                                            <strong>{event.title}</strong>
                                            <span>{matter?.title ?? "Practice calendar"}</span>
                                            <small>{event.location}</small>
                                        </div>
                                        <button
                                            aria-label={event.done ? `Mark ${event.title} as upcoming` : `Mark ${event.title} complete`}
                                            className={styles.eventToggle}
                                            onClick={() => onToggleEvent(event.id)}
                                            type="button"
                                        >
                                            <FiCheck aria-hidden="true" />
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyDocket}>
                            <FiCalendar aria-hidden="true" />
                            <p>Your calendar is clear for today.</p>
                            <Link className={styles.textLink} to="/calendar">Review upcoming dates <FiArrowRight aria-hidden="true" /></Link>
                        </div>
                    )}
                </section>

                <section className={styles.timerCard}>
                    <div className={styles.timerHeading}>
                        <span className={styles.timerIcon}><FiClock aria-hidden="true" /></span>
                        <div>
                            <h2>Focus timer</h2>
                            <p>Record billable work to a matter.</p>
                        </div>
                    </div>
                    <label className={styles.selectLabel} htmlFor="timer-matter">Matter</label>
                    <select
                        disabled={Boolean(timer)}
                        id="timer-matter"
                        onChange={(event) => setSelectedMatterId(event.target.value)}
                        value={timer?.matterId ?? selectedMatterId}
                    >
                        {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}
                    </select>
                    <p aria-live="polite" className={styles.clock}>{formatElapsed(elapsedSeconds)}</p>
                    {timer && <p className={styles.runningMatter}>Running on {activeTimerMatter?.title}</p>}
                    {timer ? (
                        <button className={styles.stopButton} onClick={onTimerStop} type="button"><FiStopCircle aria-hidden="true" /> Stop &amp; save time</button>
                    ) : (
                        <button className={styles.startButton} disabled={!matters.length} onClick={startTimer} type="button"><FiPlay aria-hidden="true" /> Start timer</button>
                    )}
                    <Link className={styles.timerLink} to="/billing">Review time &amp; billing <FiArrowRight aria-hidden="true" /></Link>
                </section>
            </div>

            <div className={styles.bottomGrid}>
                <section className={styles.tasksCard}>
                    <header className={styles.sectionHeader}>
                        <div>
                            <h2>Needs attention</h2>
                            <p>{dueTasks.length} task{dueTasks.length === 1 ? "" : "s"} due today or earlier</p>
                        </div>
                        <Link className={styles.textLink} to="/matters">All matters <FiArrowRight aria-hidden="true" /></Link>
                    </header>
                    {dueTasks.length ? dueTasks.slice(0, 5).map((task) => (
                        <div className={styles.taskRow} key={task.id}>
                            <button
                                aria-label={`Mark ${task.title} complete`}
                                className={styles.taskCheck}
                                onClick={() => onToggleTask(task.matter.id, task.id)}
                                type="button"
                            ><FiCheck aria-hidden="true" /></button>
                            <div className={styles.taskText}>
                                <strong>{task.title}</strong>
                                <Link to={`/matters/${task.matter.id}`}>{task.matter.title}</Link>
                            </div>
                            <span className={styles.dueToday}>{task.due === today ? "Today" : "Overdue"}</span>
                        </div>
                    )) : (
                        <div className={styles.emptyTasks}>Nothing is overdue. You are caught up.</div>
                    )}
                </section>

                <section className={styles.stagesCard}>
                    <header className={styles.sectionHeader}>
                        <div>
                            <h2>Files in motion</h2>
                            <p>Active work by current stage</p>
                        </div>
                        <Link className={styles.textLink} to="/matters">Matter files <FiArrowRight aria-hidden="true" /></Link>
                    </header>
                    {[
                        { name: "Discovery", color: "plum" },
                        { name: "Drafting", color: "copper" },
                        { name: "Negotiation", color: "blue" },
                        { name: "Client review", color: "sage" },
                        { name: "Advice", color: "gold" },
                    ].map((stage) => {
                        const count = matters.filter((matter) => matter.stage === stage.name && matter.status !== "Closed").length;
                        return (
                            <Link className={styles.stageRow} key={stage.name} to={`/matters?stage=${encodeURIComponent(stage.name)}`}>
                                <span className={`${styles.stageDot} ${styles[stage.color]}`} />
                                <span>{stage.name}</span>
                                <span className={styles.stageBar}><i style={{ width: `${Math.max(count / Math.max(openMatters, 1) * 100, count ? 12 : 0)}%` }} /></span>
                                <strong>{count}</strong>
                            </Link>
                        );
                    })}
                    <div className={styles.updatedNote}>Matter totals update as files move forward.</div>
                </section>
            </div>
        </div>
    );
};

export default TodayPage;
