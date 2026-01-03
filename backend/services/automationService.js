const EventEmitter = require('events');
const automationBus = new EventEmitter();

// Mock Services
const EmailService = {
    send: (to, subject, body) => console.log(`[Email Mock] To: ${to}, Subject: ${subject}`)
};

const SlackService = {
    send: (channel, message) => console.log(`[Slack Mock] Channel: ${channel}, Msg: ${message}`)
};

// Automation Rules
automationBus.on('issue:created', (issue) => {
    console.log(`[Automation] New issue created: ${issue.key}`);

    // Rule: Critical Priority -> Notify Admin
    if (issue.priority === 'highest' || issue.priority === 'critical') {
        EmailService.send('admin@digitaldockers.com', `Critical Issue Created: ${issue.key}`, `Please review ${issue.title}`);
        SlackService.send('#general', `Critical issue ${issue.key} needs attention!`);
    }
});

automationBus.on('issue:updated', (issue, changes) => {
    // Rule: Status Done -> Notify Reporter
    if (changes.status && issue.status === 'done') {
        // In real app, look up reporter email
        EmailService.send('reporter@example.com', `Issue Done: ${issue.key}`, `${issue.title} is now complete.`);
    }
});

exports.emit = (event, ...args) => {
    automationBus.emit(event, ...args);
};
