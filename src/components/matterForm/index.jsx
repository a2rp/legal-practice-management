import { useState } from "react";
import { createId } from "../../utils/formatters";
import styles from "./styles.module.css";

const stageOptions = ["Intake", "Advice", "Discovery", "Drafting", "Negotiation", "Client review", "Filing", "Resolution"];
const statusOptions = ["Open", "Waiting on client", "Closed"];
const emptyMatter = {
    title: "",
    clientId: "",
    area: "Commercial litigation",
    status: "Open",
    stage: "Intake",
    priority: "Normal",
    attorney: "Elena Ruiz",
    hourlyRate: "325",
    budget: "10000",
    description: "",
};

const MatterForm = ({ matter, clients, formId = "matter-form", onSave }) => {
    const [form, setForm] = useState(() => matter
        ? { ...matter }
        : { ...emptyMatter, clientId: clients[0]?.id ?? "" });
    const [errors, setErrors] = useState({});

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
        setErrors((current) => ({ ...current, [event.target.name]: "" }));
    };

    const submit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = "Enter a matter name.";
        if (!form.clientId) nextErrors.clientId = "Choose a client for this file.";
        if (!form.area.trim()) nextErrors.area = "Enter a practice area.";
        if (!Number(form.hourlyRate) || Number(form.hourlyRate) < 1) nextErrors.hourlyRate = "Enter an hourly rate greater than zero.";
        if (!Number(form.budget) || Number(form.budget) < 1) nextErrors.budget = "Enter a budget greater than zero.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        onSave({
            ...form,
            id: matter?.id ?? createId("MT"),
            title: form.title.trim(),
            area: form.area.trim(),
            hourlyRate: Number(form.hourlyRate),
            budget: Number(form.budget),
            tasks: matter?.tasks ?? [],
            activity: matter?.activity ?? ["Matter opened"],
        }, Boolean(matter));
    };

    return (
        <form className={styles.form} id={formId} noValidate onSubmit={submit}>
            <label className={styles.fullField}>
                Matter name
                <input autoComplete="off" name="title" onChange={updateField} placeholder="e.g. Gray v. Northline" value={form.title} />
                {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
            </label>
            <label>
                Client
                <select name="clientId" onChange={updateField} value={form.clientId}>
                    <option value="">Choose a client</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
                {errors.clientId && <span className={styles.fieldError}>{errors.clientId}</span>}
            </label>
            <label>
                Practice area
                <input name="area" onChange={updateField} placeholder="e.g. Employment" value={form.area} />
                {errors.area && <span className={styles.fieldError}>{errors.area}</span>}
            </label>
            <label>
                File status
                <select name="status" onChange={updateField} value={form.status}>
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
            </label>
            <label>
                Current stage
                <select name="stage" onChange={updateField} value={form.stage}>
                    {stageOptions.map((stage) => <option key={stage}>{stage}</option>)}
                </select>
            </label>
            <label>
                Priority
                <select name="priority" onChange={updateField} value={form.priority}>
                    {["High", "Normal", "Low"].map((priority) => <option key={priority}>{priority}</option>)}
                </select>
            </label>
            <label>
                Responsible attorney
                <select name="attorney" onChange={updateField} value={form.attorney}>
                    {["Elena Ruiz", "Sam Rivera", "Daniel Kim"].map((name) => <option key={name}>{name}</option>)}
                </select>
            </label>
            <label>
                Hourly rate ($)
                <input inputMode="decimal" name="hourlyRate" onChange={updateField} value={form.hourlyRate} />
                {errors.hourlyRate && <span className={styles.fieldError}>{errors.hourlyRate}</span>}
            </label>
            <label>
                Matter budget ($)
                <input inputMode="decimal" name="budget" onChange={updateField} value={form.budget} />
                {errors.budget && <span className={styles.fieldError}>{errors.budget}</span>}
            </label>
            <label className={styles.fullField}>
                Matter summary
                <textarea name="description" onChange={updateField} placeholder="Add a short note about the work and next objective." rows="3" value={form.description} />
            </label>
        </form>
    );
};

export default MatterForm;
