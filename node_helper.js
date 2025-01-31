/*
 * node_helper.js
 *
 * MagicMirror²
 * Module: MMM-JiraFeed
 *
 * By Peter Clark
 * MIT Licensed.
 */

// call in the required classes
const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

// the main module helper create
module.exports = NodeHelper.create({
    socketNotificationReceived: function(notification, payload) {
        if (notification === "JIRA_CALL") {
            console.log("[MMM-JiraFeed] Received request from module:", payload);

            const url = payload.jiraInstance + "/rest/api/latest/search?jql=" + encodeURIComponent(payload.jiraFilter) + "&maxResults=" + payload.maxResults;

            const options = {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + Buffer.from(
                        payload.username + ":" + payload.apiKey
                    ).toString("base64"), // Proper encoding for authentication
                    "Content-Type": "application/json"
                },
            };

            // Fetch data from Jira API
            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`[MMM-JiraFeed] HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("[MMM-JiraFeed] Jira API raw response:", data);
                    this.sendSocketNotification("JIRA_CALL_DATA", data); // Send data back
                })
                .catch(error => {
                    console.error("[MMM-JiraFeed] Error fetching Jira data:", error);
                    this.sendSocketNotification("JIRA_CALL_ERROR", { error: error.message });
                });
        }
    }
});
