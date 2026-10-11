import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Footer from "./components/footer";
import ScrollToTop from "./components/scrollToTop";
import Toast from "./components/toast";
import { createDemoData, getDateOffset } from "./data/demoData";
import { createId } from "./utils/formatters";
import styles from "./App.module.css";

const todayKey = () => new Date().toISOString().slice(0, 10);
const timeValue = (value = "") => {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + Number(match[2]);
};

const App = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(createDemoData);
    const [timer, setTimer] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const notify = useCallback((message, type = "success") => {
        setToast({ id: createId("MSG"), message, type });
    }, []);
    const dismissToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        if (!timer) return undefined;
        const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
        return () => window.clearInterval(interval);
    }, [timer]);

    const syncMatterDate = useCallback((items, eventList) => items.map((matter) => {
        const next = eventList
            .filter((event) => event.matterId === matter.id && !event.done && event.date >= todayKey())
            .sort((a, b) => a.date.localeCompare(b.date) || timeValue(a.time) - timeValue(b.time))[0];
        return {
            ...matter,
            nextDate: next?.date ?? getDateOffset(7),
            nextEvent: next?.title ?? "No date scheduled",
            nextTime: next?.time ?? "",
        };
    }), []);

    const onSaveMatter = useCallback((matter, isEdit) => {
        setData((current) => ({
            ...current,
            matters: isEdit
                ? current.matters.map((item) => item.id === matter.id ? { ...item, ...matter } : item)
                : [...current.matters, {
                    ...matter,
                    opened: todayKey(),
                    matterNumber: matter.matterNumber || matter.id,
                    invoiced: 0,
                    nextDate: getDateOffset(7),
                    nextEvent: "No date scheduled",
                    nextTime: "",
                    tasks: matter.tasks ?? [],
                    activity: ["Matter opened"],
                }],
        }));
    }, []);

    const onUpdateMatter = useCallback((id, updates) => setData((current) => ({
        ...current,
        matters: current.matters.map((matter) => matter.id === id ? { ...matter, ...updates } : matter),
    })), []);

    const onDeleteMatter = useCallback((id) => {
        setData((current) => ({
            ...current,
            matters: current.matters.filter((matter) => matter.id !== id),
            events: current.events.filter((event) => event.matterId !== id),
            timeEntries: current.timeEntries.filter((entry) => entry.matterId !== id),
            invoices: current.invoices.filter((invoice) => invoice.matterId !== id),
        }));
        navigate("/matters");
    }, [navigate]);

    const onSaveEvent = useCallback((event, isEdit) => {
        setData((current) => {
            const events = isEdit
                ? current.events.map((item) => item.id === event.id ? { ...item, ...event } : item)
                : [...current.events, { ...event, done: false }];
            return { ...current, events, matters: syncMatterDate(current.matters, events) };
        });
    }, [syncMatterDate]);

    const onUpdateEvent = useCallback((id, updates) => setData((current) => {
        const events = current.events.map((event) => event.id === id ? { ...event, ...updates } : event);
        return { ...current, events, matters: syncMatterDate(current.matters, events) };
    }), [syncMatterDate]);

    const onDeleteEvent = useCallback((id) => setData((current) => {
        const events = current.events.filter((event) => event.id !== id);
        return { ...current, events, matters: syncMatterDate(current.matters, events) };
    }), [syncMatterDate]);

    const onSaveClient = useCallback((client, isEdit) => setData((current) => ({
        ...current,
        clients: isEdit
            ? current.clients.map((item) => item.id === client.id ? { ...item, ...client } : item)
            : [...current.clients, { ...client, since: todayKey() }],
    })), []);

    const onDeleteClient = useCallback((id) => setData((current) => ({
        ...current,
        clients: current.clients.filter((client) => client.id !== id),
    })), []);

    const onSaveTimeEntry = useCallback((entry, isEdit) => setData((current) => ({
        ...current,
        timeEntries: isEdit
            ? current.timeEntries.map((item) => item.id === entry.id ? { ...item, ...entry } : item)
            : [...current.timeEntries, { ...entry, billed: false }],
    })), []);

    const onDeleteTimeEntry = useCallback((id) => setData((current) => ({
        ...current,
        timeEntries: current.timeEntries.filter((entry) => entry.id !== id),
    })), []);

    const onCreateInvoice = useCallback((matterId, entryIds) => {
        const invoice = {
            id: createId("INV"),
            matterId,
            amount: data.timeEntries.filter((entry) => entryIds.includes(entry.id)).reduce((sum, entry) => sum + Number(entry.hours) * Number(entry.rate), 0),
            status: "Draft",
            issued: null,
            due: getDateOffset(30),
        };
        setData((current) => ({
            ...current,
            invoices: [invoice, ...current.invoices],
            timeEntries: current.timeEntries.map((entry) => entryIds.includes(entry.id) ? { ...entry, billed: true, invoiceId: invoice.id } : entry),
        }));
        return invoice;
    }, [data.timeEntries]);

    const onUpdateInvoice = useCallback((id, updates) => setData((current) => ({
        ...current,
        invoices: current.invoices.map((invoice) => invoice.id === id ? { ...invoice, ...updates } : invoice),
    })), []);

    const onDeleteInvoice = useCallback((id) => setData((current) => ({
        ...current,
        invoices: current.invoices.filter((invoice) => invoice.id !== id),
        timeEntries: current.timeEntries.map((entry) => entry.invoiceId === id ? { ...entry, billed: false, invoiceId: undefined } : entry),
    })), []);

    const onToggleEvent = useCallback((id) => onUpdateEvent(id, { done: !data.events.find((event) => event.id === id)?.done }), [data.events, onUpdateEvent]);
    const onToggleTask = useCallback((matterId, taskId) => setData((current) => ({
        ...current,
        matters: current.matters.map((matter) => matter.id === matterId ? {
            ...matter,
            tasks: matter.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task),
        } : matter),
    })), []);

    const onTimerStart = useCallback((matterId) => {
        if (!matterId) return;
        if (timer) {
            notify("Stop the running timer before starting another.", "info");
            return;
        }
        setTimer({ matterId });
        setElapsedSeconds(0);
        notify("Matter timer started.", "success");
    }, [notify, timer]);

    const onTimerStop = useCallback(() => {
        if (!timer) return;
        const matter = data.matters.find((item) => item.id === timer.matterId);
        if (matter) {
            const hours = Math.max(Math.round(elapsedSeconds / 60) / 60, 0.1);
            onSaveTimeEntry({
                id: createId("TE"), matterId: matter.id, date: todayKey(),
                description: "Timed practice work", hours, rate: matter.hourlyRate, billed: false,
            }, false);
            notify(`${hours.toFixed(1)} hour saved to ${matter.title}.`, "success");
        }
        setTimer(null);
        setElapsedSeconds(0);
    }, [data.matters, elapsedSeconds, notify, onSaveTimeEntry, timer]);

    const nextEvent = useMemo(() => data.events
        .filter((event) => !event.done && event.date >= todayKey())
        .sort((a, b) => a.date.localeCompare(b.date) || timeValue(a.time) - timeValue(b.time))[0], [data.events]);

    const pageProps = {
        ...data,
        timer,
        elapsedSeconds,
        onToast: notify,
        onToggleEvent,
        onToggleTask,
        onTimerStart,
        onTimerStop,
        onSaveMatter,
        onUpdateMatter,
        onDeleteMatter,
        onSaveEvent,
        onUpdateEvent,
        onDeleteEvent,
        onSaveClient,
        onDeleteClient,
        onSaveTimeEntry,
        onDeleteTimeEntry,
        onCreateInvoice,
        onUpdateInvoice,
        onDeleteInvoice,
    };

    return (
        <div className={styles.appShell}>
            <a className={styles.skipLink} href="#main-content">Skip to content</a>
            <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} matterCount={data.matters.length} nextEvent={nextEvent} />
            <Header isMenuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onNewMatter={() => navigate("/matters?create=1")} />
            <div className={styles.mainContent} id="main-content">
                <ScrollToTop />
                <AppRoutes {...pageProps} />
                <Footer />
            </div>
            <Toast onDismiss={dismissToast} toast={toast} />
        </div>
    );
};

export default App;
