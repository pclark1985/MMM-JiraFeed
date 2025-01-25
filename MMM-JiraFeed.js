/* MagicMirror²
 * Module: MMM-JiraFeed
 *
 * By Peter Clark
 */
Module.register("MMM-JiraFeed", {
	defaults: {
		header: "Jira Tickets",
		updateInterval: 300000, // 5 minutes
		jiraInstance: "https://webcontent.atlassian.net", // Update this with your Jira instance URL
		corsProxy: "https://cors-anywhere.herokuapp.com/",
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
		// Use CORS Anywhere proxy to bypass CORS restrictions
		//const corsProxy = "http://192.168.1.131/cors-proxy.php?url=" //"https://cors-anywhere.herokuapp.com/";
		const url =  this.config.corsProxy + encodeURIComponent(`${this.config.jiraInstance}/rest/api/latest/search?jql=${encodeURIComponent(
			this.config.jiraFilter
		)}%20ORDER%20BY%20created%20DESC&maxResults=${this.config.maxResults}`);

		const options = {
			method: "GET",
			headers: {
				"Authorization": "Basic " + btoa(
					this.config.username + ":" + this.config.apiKey
				),
				"Content-Type": "application/json"
			},
		};

		console.log(`[MMM-JiraFeed] Fetching Jira data from URL: ${url}`);
		console.log("[MMM-JiraFeed] Request options:", options);

		fetch(url, options)
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`[MMM-JiraFeed] HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`
					);
				}
				return response.json();
			})
			.then((data) => {
				console.log("[MMM-JiraFeed] Jira API raw response:", data);

				// Process issues
				if (data.issues && data.issues.length > 0) {
					this.tickets = data.issues.map((issue) => ({
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
			})
			.catch((error) => {
				console.error("[MMM-JiraFeed] Error fetching Jira data:", error);
			});
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
            //const statusClassName = ticket.status.toLowerCase().replace(/\s+/g, "-");  // Generate class name for status
            //const statusSpan = document.createElement("span");

            // Add 'jiraFeed' class first, followed by the dynamically generated class
            //statusSpan.classList.add("MMM-JiraFeed", statusClassName, "small");
            //statusSpan.innerText = ticket.status;

            summary.innerText = `${ticket.summary}`;// \u2013 `;
			summary.classList.add("small");  // Adding 'small' class to the summary text
            //summary.appendChild(statusSpan);  // Append the status span
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