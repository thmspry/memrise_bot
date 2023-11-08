
![Logo](https://i.imgur.com/vMieEK8.png)


# Memrise bot

🤖 Memrise bot  to be the top of the list.
Thanks to puppeteer, this bot will launch a chromium page, connect you to your Memrise account, then perform a test of a course in a loop.


## Author

- Thomas Peray ([@thmspry](https://github.com/thmspry))


## Requirement

You will need the runtime [Node](https://nodejs.org/en/download/) and its package manager npm

The course on which the bot will run must have at least one level (only the first level will be considered). Some words of the level should already be learned before launching the bot, since it will only perform review tests.
## Installation

Run `npm install` in a terminal to download all depedencies.


## Deployment
Create a file named `.env` in the project root with these fields.
```env
USER_NAME=your_email_address
USER_PASSWORD=your_password
COURSE_URL=course_url
```
Replace `your_email_address` and `your_password` with the email address and password used for your Memrise account.
Replace `course_url` with the Memrise course URL that you want to run in loop.

You can now launch the project with `npm start`.

❗Do not resize the window during the execution, else it will cause errors.


## Adaptability

Depending on your Internet connection, some actions and page loading may be too slow for the bot. To solve this problem, you will have to modify the delay values in `delay` function call the main file `index.js`. They are scattered all along the file, it's up to you.


## Tech Stack

**Web scrapping:** Puppeteer

**Manipulating sensitive data:** dotenv

