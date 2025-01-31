/* MagicMirror²
 * Module: MMM-JiraFeed
 *
 * By Peter Clark
 * MIT Licensed
 */
Module.register("MMM-JiraFeed", {
	defaults: {
		header: "Jira Tickets",
		updateInterval: 300000, // 5 minutes
		jiraInstance: "", // Update this with your Jira instance URL
		username: "", // Add your Jira username
		apiKey: "", // Add your Jira API key
		jiraFilter: "", // Example: "project = MYPROJECT AND status != Done"
		maxResults: 10,
	},

	start: function () {
		console.log("[MMM-JiraFeed] Module started");
		Log.info("Starting module: " + this.name);
		this.tickets = [];
		this.getData();
		this.scheduleUpdate();
	},

	getData: function () {
		this.sendSocketNotification("JIRA_CALL", {
            jiraInstance: this.config.jiraInstance,
            username: this.config.username,
            apiKey: this.config.apiKey,
            jiraFilter: this.config.jiraFilter,
            maxResults: this.config.maxResults
        });
	},

	socketNotificationReceived: function(notification, payload) {
		console.log("[MMM-JiraFeed] Received notification:", notification, payload);
		if (notification === "JIRA_CALL_DATA") {
			console.log("[MMM-JiraFeed] Received data from node_helper:", payload);
	
			// Process issues
			if (payload.issues && payload.issues.length > 0) {
				this.tickets = payload.issues.map(issue => ({
					priorityIcon: issue.fields.priority?.iconUrl || "",
					summary: issue.fields.summary,
					status: issue.fields.status.name || "Unknown", // Add the status
				}));
				console.log("[MMM-JiraFeed] Processed tickets:", this.tickets);
			} else {
				console.warn("[MMM-JiraFeed] No tickets available in the response.");
				this.tickets = [];
			}
	
			this.updateDom();
		} else if (notification === "JIRA_CALL_ERROR") {
			console.error("[MMM-JiraFeed] Error received from node_helper:", payload.error);
		}
	},

	scheduleUpdate: function () {
		const self = this;
		setInterval(() => {
			console.log("[MMM-JiraFeed] Updating data...");
			self.getData();
		}, this.config.updateInterval);
	},

	// Add header
	getHeader: function() {
		return this.config.header;
	},

	getDom: function () {
    const wrapper = document.createElement("div");

    // Add tickets or a message
    if (this.tickets.length > 0) {
        const list = document.createElement("ul");
        this.tickets.forEach((ticket) => {
            const listItem = document.createElement("li");
            listItem.style.display = "flex";
            listItem.style.alignItems = "center";

            // Priority Icon
            if (ticket.priorityIcon) {
                const icon = document.createElement("img");
				icon.classList.add("priority-icon");
                icon.src = ticket.priorityIcon;
                icon.style.width = "16px";
                icon.style.height = "16px";
                icon.style.marginRight = "8px";
                listItem.appendChild(icon);
            }

			// Status Icon
            if (ticket.status) {
                const statusIcon = document.createElement("div");
				const statusClassName = ticket.status.toLowerCase().replace(/\s+/g, "-");  // Generate class name for status
				statusIcon.classList.add("status-icon", statusClassName);
                statusIcon.style.width = "16px";
                statusIcon.style.height = "16px";
                statusIcon.style.marginRight = "8px";
                listItem.appendChild(statusIcon);
            }
            // Ticket Summary and Status
            const summary = document.createElement("span");

            summary.innerText = `${ticket.summary}`;// \u2013 `;
			summary.classList.add("small");  // Adding 'small' class to the summary text
            listItem.appendChild(summary);

            list.appendChild(listItem);
        });
        wrapper.appendChild(list);
    } else {
        const message = document.createElement("div");
        message.innerText = "No tickets available.";
        message.style.fontStyle = "italic";
		message.classList.add("small");
        wrapper.appendChild(message);
    }

    return wrapper;
},
});  