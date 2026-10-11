import styles from "./App.module.css";

const App = () => (
    <main className={styles.app}>
        <section className={styles.card}>
            <p className={styles.brand}>Matterline</p>
            <h1>Legal work, in clear view.</h1>
            <p className={styles.description}>A focused workspace for matters, deadlines, clients, and time.</p>
        </section>
    </main>
);

export default App;
