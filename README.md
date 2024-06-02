
<div style="width: 100%; display: flex; justify-content: center; margin-top: 20px">
    <img alt="bot-logo" src="https://i.imgur.com/vMieEK8.png" style="width: 100px" />
</div>

# Memrise bot
🤖 Memrise bot  to be the top of the list.
Thanks to puppeteer, this bot will launch a chromium page, connect you to your Memrise account, then perform a test of a course in a loop.


## Author
- Thomas Peray ([@thmspry](https://github.com/thmspry))


## Requirement
You will need the runtime [Node](https://nodejs.org/en/download/) and its package manager npm.
The course on which the bot will run must have at least one level (only the first level will be considered). Some words of the level should already be learned before launching the bot, since it will only perform review tests.

## Installation
Run `npm install` in a terminal to download all dependencies.


## Deployment
Create a file named `.env` in the `📁 src/config` folder these fields.
```env
USER_NAME=your_email_address
USER_PASSWORD=your_password
COURSE_URL=course_url
HEADLESS=false
```
Replace `your_email_address` and `your_password` with the email address and password used for your Memrise account.
Replace `course_url` with the Memrise course URL that you want to run in loop.
If you want to see the bot in action, set `HEADLESS` to `false`, else set it to `true`.

## Run
You can now launch the project with `npm start`.

❗Do not resize the window during the execution, else it will cause errors.


## Adaptability
Depending on your Internet connection, some actions and page loading may be too slow for the bot.
To solve this problem, you will have to modify the delay values in the `bot.wait` instruction in `main.ts`. 
They are scattered all along the file, it's up to you.


## Tech Stack
**Web scrapping:** Puppeteer for TypeScript

**Manipulating sensitive data:** dotenv

**Unit test:** Jest

**CI/CD Pipeline:** GitHub Actions

