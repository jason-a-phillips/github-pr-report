# github-pr-report
Creates and emails a report of GitHub pull requests within the last week.

### Short description
This short JavaScript program executes HTTP GET requests against the GitHub API, querying pull requests created in the last week within Microsoft's Visual Studio Code repository. The results are collated in a simple report and emailed to a configurable list of recipients.

### Short technical description
The program is written in JavaScript and uses Nodejs. Two NPM packages are used: superagent (for making http requests) and nodemailer (for sending mail). The program recursively calls the GitHub API until PRs older than one week are found, and then stops. All blocking code is handled with async/await or promises.

### Requirements
In this example I use my own GitHub account and personal access token to query the GitHub repo. This allows for more permissive rate-limiting, rather than querying without authentication. Create your own GitHub account and token, then use the GITHUB_USER and GITHUB_PASS environment variables. 

I use Gmail's SMTP servers. Again, I use my own Gmail account and personal access token, which you must create and configure yourself so that you may send email. Then set the GMAIL_USER and GMAIL_PASS environment variables.

### Screenshot of email containing the report
![screenshot](/assets/screenshot.png?raw=true)


