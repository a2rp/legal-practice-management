![Matterline legal practice dashboard](./screenshot.png)

# Matterline

A focused legal practice workspace for Lark & Lowe. Keep matter files, court dates, client contacts, recorded work, and invoice follow-through together in one clear view.

**Live demo:** [https://a2rp.github.io/legal-practice-management/](https://a2rp.github.io/legal-practice-management/)

## Workflows

- Review today's docket, due tasks, open matters, and invoice totals.
- Start and stop a matter timer; saved time appears in the time ledger.
- Search, filter, sort, export, create, and edit matter files. Update status and practice stage.
- Track a matter's next steps, activity notes, client contact, dates, budget, time, and invoices.
- Manage court dates and client commitments in a monthly calendar. Create, edit, complete, and remove dates.
- Create and update client records. The app prevents removing a client while a matter still references it.
- Add and edit time entries, build draft invoices from unbilled time, export ledgers, and record sent or paid statuses.
- Use clear toast messages and custom confirmation dialogs for consequential actions.

All controls operate on realistic demo records held in React state for the current browser session. Refreshing the page resets the demo data. The app does not use browser storage, connect to a backend, send email, sync a calendar, or process payments.

## Routes

| Page | Route |
| --- | --- |
| Today | `/legal-practice-management/` |
| Matter files | `/legal-practice-management/matters` |
| Matter file | `/legal-practice-management/matters/:matterId` |
| Court calendar | `/legal-practice-management/calendar` |
| Time & billing | `/legal-practice-management/billing` |
| Clients | `/legal-practice-management/clients` |
| Not found | Any unmatched route |

## Page screenshots

### Today

![Today page](./screenshots/pages/today.png)

### Matter files

![Matter files page](./screenshots/pages/matters.png)

### Matter file detail

![Matter file detail page](./screenshots/pages/matter-file.png)

### Court calendar

![Court calendar page](./screenshots/pages/calendar.png)

### Time and billing

![Time and billing page](./screenshots/pages/billing.png)

### Client directory

![Client directory page](./screenshots/pages/clients.png)

### Not found

![Not found page](./screenshots/pages/not-found.png)

### Mobile

![Matterline today page at mobile width](./screenshots/pages/mobile.png)

## Dialog screenshots

<details>
<summary>Matter file dialogs</summary>

![Open a new matter dialog](./screenshots/modals/new-matter.png)

![Edit matter dialog](./screenshots/modals/edit-matter.png)

![Remove matter confirmation](./screenshots/modals/remove-matter.png)

</details>

<details>
<summary>Court calendar dialogs</summary>

![Add calendar date dialog](./screenshots/modals/new-calendar-date.png)

![Edit calendar date dialog](./screenshots/modals/edit-calendar-date.png)

![Remove calendar date confirmation](./screenshots/modals/remove-calendar-date.png)

</details>

<details>
<summary>Client dialogs</summary>

![Add client dialog](./screenshots/modals/add-client.png)

![Edit client dialog](./screenshots/modals/edit-client.png)

![Client removal notice when matters are still linked](./screenshots/modals/blocked-client-remove.png)

![Remove unlinked client confirmation](./screenshots/modals/confirm-client-remove.png)

</details>

<details>
<summary>Time and invoice dialogs</summary>

![Add time entry dialog](./screenshots/modals/add-time-entry.png)

![Edit time entry dialog](./screenshots/modals/edit-time-entry.png)

![Remove time entry confirmation](./screenshots/modals/remove-time-entry.png)

![Record invoice as sent confirmation](./screenshots/modals/send-invoice.png)

![Record invoice as paid confirmation](./screenshots/modals/mark-invoice-paid.png)

![Remove draft invoice confirmation](./screenshots/modals/remove-draft-invoice.png)

</details>

## Image credit

The locally saved law-library photograph is by [Krists Luhaers on Unsplash](https://unsplash.com/photos/law-books-are-lined-up-on-a-shelf-ioRcKUIiIdw). It is used as a relevant workspace image and is included under the Unsplash License.

## Run locally

```bash
npm install
npm run dev
```

## Check and build

```bash
npm run lint
npm run build
npm run preview
```

## Deploy

```bash
npm run deploy
```

The deploy script builds the app, copies the entry page to `404.html` for GitHub Pages route fallback, and publishes the `dist` folder to the `gh-pages` branch.

## Backend integrations

The current interface includes the main day-to-day practice workflows with session-only demo data. A production backend could add firm accounts and permissions, secure document storage, shared records and audit history, calendar and court-data integrations, outgoing email, and payment processing.

## Links & Support

- [Portfolio](https://www.ashishranjan.net) — [GitHub](https://github.com/a2rp/legal-practice-management) — [CodePen](https://codepen.io/ash1198)
- [LinkedIn](https://www.linkedin.com/in/aashishranjan) — [YouTube](https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1)
- [Email](mailto:ash.ranjan09@gmail.com) — [Support](https://a2rp-donation-page.netlify.app/) — [Buy Me a Coffee](https://buymeacoffee.com/ashishranjan) — [Patreon](https://www.patreon.com/ashishranjan)