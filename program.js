'use strict;'

const sa = require('superagent');
const mail = require("nodemailer");
const config = require('./configuration.json');

const repoURI = process.env.REPO_URI || 'https://api.github.com/repos/microsoft/vscode/pulls'; 
const fromAddress = process.env.FROM_ADDRESS || 'jason.a.phillips@gmail.com';
const gmailUser = process.env.GMAIL_USER || 'jason.a.phillips@gmail.com';
const gmailPass = process.env.GMAIL_PASS || 'password123'; 
const githubUser = process.env.GITHUB_USER || 'jason-a-phillips';
const githubPass = process.env.GITHUB_PASS || 'password123'; 

async function main() {

    try {

        let weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0,0,0,0);

        let pulls = [];

        await getPulls();

        async function getPulls() {
            const res = await sa.get(repoURI)
                .set('User-Agent', 'request')
                .auth(githubUser, githubPass);

            for (let x = 0; x < res.body.length; x++) {
                let dtCreatedAt = new Date(res.body[x].created_at);
                if (dtCreatedAt < weekAgo) return;
                
                pulls.push(res.body[x]);
            }

            await getPulls();
        }

        let body = "<h2>Weekly Pull Request Report</h2>";
        body += "<h3>Please contact jason.a.phillips@gmail.com with questions.</h3>";

        if (pulls.length) {
            body += "<strong>Number of PRs last week:</strong> " + pulls.length + "<br><br>";

            pulls.forEach(p => {
                let assignees = p.assignees.map(a => a.login).join();
                assignees = assignees ? assignees : "None";
                let requestedReviewers = p.requested_reviewers.map(r => r.login).join();
                requestedReviewers = requestedReviewers ? requestedReviewers : "None";
                let labels = p.labels.map(a => a.name).join();
                labels = labels ? labels : "None";
    
                body += "<strong>Title: " + p.title + "</strong><br>";
                body += "<strong>Labels:</strong> " + labels + "<br>";
                body += "<strong>Milestone:</strong> " + (p.milestone ? p.milestone : "None") + "<br>";
                body += "<strong>Created on:</strong> " + p.created_at + "<br>";
                body += "<strong>Status:</strong> " + p.state + "<br>";
                body += "<strong>Created by:</strong> " + p.user.login + "<br>";
                body += "<strong>Requested reviewers:</strong> " + requestedReviewers + "<br>";
                body += "<strong>Assignees:</strong> " + assignees + "<br>";
                body += "<strong>URL:</strong> " + p.html_url + "<br>";
                body += "<strong>Body:</strong> " + p.body + "<br><br>";
            });    
        } else {
            body += "<strong>No pull requests found last week.</strong><br><br>";        
        }

        let transport = mail.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: gmailUser,
              pass: gmailPass,
            },
          });

        config.recipients.forEach(r => {
            return new Promise(async (resolve, reject) => {
                try {
                    let results = await transport.sendMail({
                            from: fromAddress,
                            to: r, 
                            subject: "Github Pull Request Report", 
                            html: body, 
                        });
                    console.log("smtp result:", results);
                    resolve(results);
                } catch (e) {
                    reject(e);
                }
            });
        })
    } catch (err) {
        console.error(err);
    }
}

main();







