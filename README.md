# Module: MMM-JiraFeed

Basic feed listing out Jira tickets based on the provided criteria. Uses the Atlassian Jira Rest API to pull up to 100 results.

## Sample Configuration

{
    module: 'MMM-JiraFeed',
    position: 'top_center',
    config: {
        header: "Jira Tickets",
        updateInterval: 180000,
        jiraInstance: "https://your-instance.atlassian.net",
        username: "your-email@address.com,
        apiKey: "SUPER SECRET!",
        jiraFilter: "project = MYPROJECT AND status != Closed ORDER BY created DESC",
        maxResults: 5
    }
},

## Sample Custom CSS to add colors for status.
### Uses the status name as the class.

.MMM-JiraFeed .open,
.MMM-JiraFeed .in-progress,
.MMM-JiraFeed .reopened {
    background: #13E06B;
}

.MMM-JiraFeed .waiting-on-customer,
.MMM-JiraFeed .on-hold,
.MMM-JiraFeed .blocked {
    background: #fa2e3e;
}