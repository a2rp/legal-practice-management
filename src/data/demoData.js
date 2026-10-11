const dateAtOffset = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
};

export const createDemoData = () => {
    const clients = [
        { id: "CL-101", name: "Lumen Labs", contact: "Nora Patel", type: "Business", email: "nora@lumenlabs.example", phone: "(206) 555-0142", openMatters: 2, since: dateAtOffset(-200) },
        { id: "CL-102", name: "Arbor & Field", contact: "Marcus Bell", type: "Business", email: "marcus@arborfield.example", phone: "(503) 555-0118", openMatters: 1, since: dateAtOffset(-134) },
        { id: "CL-103", name: "Maya Chen", contact: "Maya Chen", type: "Individual", email: "maya.chen@example.com", phone: "(425) 555-0173", openMatters: 1, since: dateAtOffset(-98) },
        { id: "CL-104", name: "Cedar House Co.", contact: "Jules Martin", type: "Business", email: "jules@cedarhouse.example", phone: "(360) 555-0124", openMatters: 2, since: dateAtOffset(-61) },
        { id: "CL-105", name: "Owen Brooks", contact: "Owen Brooks", type: "Individual", email: "owen.brooks@example.com", phone: "(206) 555-0197", openMatters: 1, since: dateAtOffset(-26) },
        { id: "CL-106", name: "Juniper Health", contact: "Priya Desai", type: "Business", email: "priya@juniperhealth.example", phone: "(425) 555-0185", openMatters: 1, since: dateAtOffset(-17) },
    ];

    const matters = [
        {
            id: "MT-2041", title: "Lumen Labs v. Radian Systems", clientId: "CL-101", area: "Commercial litigation", status: "Open", stage: "Discovery", priority: "High", opened: dateAtOffset(-42), nextDate: dateAtOffset(0), nextEvent: "Motion hearing", nextTime: "10:30 AM", attorney: "Elena Ruiz", matterNumber: "2026-CV-1842", hourlyRate: 375, budget: 24000, invoiced: 8200, description: "Representation in a software delivery and services dispute. The team is preparing for a motion hearing and finalizing the supporting record.", tasks: [
                { id: "T-11", title: "Finalize hearing binder", due: dateAtOffset(0), done: false },
                { id: "T-12", title: "Review Radian's supplemental brief", due: dateAtOffset(0), done: true },
                { id: "T-13", title: "Send client hearing outline", due: dateAtOffset(1), done: false },
            ], activity: ["Reply brief filed", "Hearing preparation started", "Matter opened"],
        },
        {
            id: "MT-2038", title: "Arbor & Field founder agreement", clientId: "CL-102", area: "Corporate", status: "Open", stage: "Drafting", priority: "Normal", opened: dateAtOffset(-19), nextDate: dateAtOffset(2), nextEvent: "Founder review", nextTime: "2:00 PM", attorney: "Sam Rivera", matterNumber: "2026-CO-391", hourlyRate: 325, budget: 12000, invoiced: 3900, description: "Governance and equity documentation for the company's new co-founder arrangement.", tasks: [
                { id: "T-21", title: "Circulate revised ownership schedule", due: dateAtOffset(1), done: false },
                { id: "T-22", title: "Confirm vesting terms", due: dateAtOffset(2), done: false },
            ], activity: ["First draft prepared", "Client terms confirmed", "Matter opened"],
        },
        {
            id: "MT-2034", title: "Chen family trust update", clientId: "CL-103", area: "Estate planning", status: "Waiting on client", stage: "Client review", priority: "Normal", opened: dateAtOffset(-14), nextDate: dateAtOffset(5), nextEvent: "Client signing", nextTime: "11:00 AM", attorney: "Elena Ruiz", matterNumber: "2026-EP-086", hourlyRate: 300, budget: 6500, invoiced: 2250, description: "Update of the family trust and related health-care directives after a change in the client's circumstances.", tasks: [
                { id: "T-31", title: "Receive updated beneficiary details", due: dateAtOffset(2), done: false },
                { id: "T-32", title: "Prepare signing set", due: dateAtOffset(4), done: false },
            ], activity: ["Draft documents shared", "Planning call completed", "Matter opened"],
        },
        {
            id: "MT-2029", title: "Cedar House lease negotiation", clientId: "CL-104", area: "Real estate", status: "Open", stage: "Negotiation", priority: "High", opened: dateAtOffset(-31), nextDate: dateAtOffset(1), nextEvent: "Landlord conference", nextTime: "9:00 AM", attorney: "Daniel Kim", matterNumber: "2026-RE-774", hourlyRate: 350, budget: 14000, invoiced: 5900, description: "Commercial lease negotiation for a new neighborhood retail location, including tenant improvement and renewal terms.", tasks: [
                { id: "T-41", title: "Review landlord's redline", due: dateAtOffset(1), done: false },
                { id: "T-42", title: "Confirm opening condition schedule", due: dateAtOffset(3), done: false },
            ], activity: ["Second draft received", "Business terms confirmed", "Matter opened"],
        },
        {
            id: "MT-2022", title: "Brooks employment separation", clientId: "CL-105", area: "Employment", status: "Open", stage: "Advice", priority: "Normal", opened: dateAtOffset(-8), nextDate: dateAtOffset(3), nextEvent: "Advice call", nextTime: "1:30 PM", attorney: "Sam Rivera", matterNumber: "2026-EM-448", hourlyRate: 300, budget: 8000, invoiced: 1450, description: "Counsel on separation terms, release language, and the client's transition plan.", tasks: [
                { id: "T-51", title: "Review proposed separation terms", due: dateAtOffset(1), done: true },
                { id: "T-52", title: "Prepare call agenda", due: dateAtOffset(2), done: false },
            ], activity: ["Initial advice provided", "Conflict check cleared", "Matter opened"],
        },
        {
            id: "MT-2019", title: "Juniper Health vendor terms", clientId: "CL-106", area: "Commercial contracts", status: "Open", stage: "Review", priority: "Low", opened: dateAtOffset(-11), nextDate: dateAtOffset(6), nextEvent: "Review deadline", nextTime: "4:00 PM", attorney: "Elena Ruiz", matterNumber: "2026-CC-637", hourlyRate: 325, budget: 9200, invoiced: 2600, description: "Review of a vendor services agreement and associated data handling schedule.", tasks: [
                { id: "T-61", title: "Complete privacy schedule review", due: dateAtOffset(4), done: false },
                { id: "T-62", title: "Summarize open negotiation points", due: dateAtOffset(5), done: false },
            ], activity: ["Vendor draft received", "Kickoff completed", "Matter opened"],
        },
    ];

    const events = [
        { id: "EV-401", title: "Motion hearing", matterId: "MT-2041", date: dateAtOffset(0), time: "10:30 AM", kind: "Court", location: "King County Superior Court, Room 5B", done: false },
        { id: "EV-402", title: "Lumen Labs client check-in", matterId: "MT-2041", date: dateAtOffset(0), time: "1:15 PM", kind: "Client call", location: "Video conference", done: false },
        { id: "EV-403", title: "Arbor & Field founder review", matterId: "MT-2038", date: dateAtOffset(2), time: "2:00 PM", kind: "Client meeting", location: "Lark & Lowe, Room 2", done: false },
        { id: "EV-404", title: "Cedar House landlord conference", matterId: "MT-2029", date: dateAtOffset(1), time: "9:00 AM", kind: "Negotiation", location: "Video conference", done: false },
        { id: "EV-405", title: "Chen family signing", matterId: "MT-2034", date: dateAtOffset(5), time: "11:00 AM", kind: "Client meeting", location: "Lark & Lowe, Room 1", done: false },
        { id: "EV-406", title: "Brooks advice call", matterId: "MT-2022", date: dateAtOffset(3), time: "1:30 PM", kind: "Client call", location: "Phone", done: false },
        { id: "EV-407", title: "Juniper Health review due", matterId: "MT-2019", date: dateAtOffset(6), time: "4:00 PM", kind: "Filing deadline", location: "Internal deadline", done: false },
        { id: "EV-408", title: "Lumen Labs evidence exchange", matterId: "MT-2041", date: dateAtOffset(9), time: "9:00 AM", kind: "Filing deadline", location: "Electronic filing", done: false },
    ];

    const timeEntries = [
        { id: "TE-301", matterId: "MT-2041", date: dateAtOffset(0), description: "Prepare hearing outline and exhibit list", hours: 1.6, rate: 375, billed: false },
        { id: "TE-302", matterId: "MT-2029", date: dateAtOffset(0), description: "Review revised lease provisions", hours: 1.1, rate: 350, billed: true },
        { id: "TE-303", matterId: "MT-2038", date: dateAtOffset(-1), description: "Draft founder vesting schedule", hours: 2.2, rate: 325, billed: false },
        { id: "TE-304", matterId: "MT-2034", date: dateAtOffset(-1), description: "Revise trust distribution language", hours: 1.4, rate: 300, billed: true },
    ];

    const invoices = [
        { id: "INV-511", matterId: "MT-2041", amount: 3825, status: "Draft", issued: null, due: dateAtOffset(8) },
        { id: "INV-507", matterId: "MT-2038", amount: 1950, status: "Sent", issued: dateAtOffset(-4), due: dateAtOffset(18) },
        { id: "INV-503", matterId: "MT-2029", amount: 2475, status: "Overdue", issued: dateAtOffset(-34), due: dateAtOffset(-4) },
        { id: "INV-499", matterId: "MT-2034", amount: 1350, status: "Paid", issued: dateAtOffset(-21), due: dateAtOffset(-2) },
    ];

    return { clients, matters, events, timeEntries, invoices };
};

export const getDateOffset = dateAtOffset;
