---
title: CookieArena CTF
published: 2024-11-28
category: Writeups
tags: [web, cookiearena, ctf, misc, tutorial]
image: "./image/titles/logo-cookiehanhoan.png"
description: Some cool and fun web, misc, tutorial challenges from cookie arena.
draft: false
---

# Tutorial

## The Flag Format

`Flag: CHH{thiS_IS_@_54mP1E_FlaG}`

## Downloadable

`flag` into `flag.php` file after downloading the challenge.

`CHH{Th15_Is_A_d0WnLoAd_ChA1lENGe}`

## HTTP Response Content Type

The challenge is that we need to request a `content-type` header that matches the data format to view the content.

![image](./image/cookiearenactf/1.png)

here we see that the returned data is `html` so we need requests : `text/html`

![image](./image/cookiearenactf/2.png)

`Flag1: CTF{text/html}`

![image](./image/cookiearenactf/3.png)

This time the returned data is an `image` that appears to be a `jpg` so I tried: `image/jpeg`

![image](./image/cookiearenactf/4.png)

`Flag2: CHH{YouCanSee_image/jpg}`

![image](./image/cookiearenactf/5.png)

this last time the format is `pdf` so i used `application/pdf`

![image](./image/cookiearenactf/6.png)

`Flag3: CHH{yeah_application/pdf}`

![image](./image/cookiearenactf/7.png)

![image](./image/cookiearenactf/8.png)

final flag is `CHH{a809e289961ce88adedba653b77d58ba}`

## HTTP Request Transfer Encoding

Flag: `CHH{HTTPTransferEncoding_e64835f651b1673bd1f2b0613298a8b0}`

## HTTP Request Content-Length

Flag: `CHH{HTTPContentLength_bbf82fb9633a072300cba58250c60c8c}`

## PHP Executor Playground

One of the most popular and practical execution functions is `shell_exec`

![image](./image/cookiearenactf/9.png)

![image](./image/cookiearenactf/10.png)

Flag: `CHH{PHPFunct1Ons_893f5732a97f2a7e29115e42627a298d}`

## Client-side Rendering (CSR) aka SPA

This challenge is mostly on the `client`, I tried requesting all `4` pages and got the `flag` on the last page

![image](./image/cookiearenactf/11.png)

Flag: `CHH{REqu3stCre4t3dByJS_a647bda426bed7c2e10494a59e07d8ea}`

## Server-side Rendering (SSR)

This challenge is similar to `Client-side Rendering (CSR)` aka `SPA` challenge, look at the response on the last page which will give us the `flag`

![image](./image/cookiearenactf/12.png)

Flag: `CHH{YOuv3Kn0wnHTML_b5088dc237fea7906b19779f5ee205a0}`

## Simple HTTP Proxy

`run.py`

```python
#!/usr/bin/python3
from flask import Flask, request, render_template, make_response, redirect, url_for
import socket

app = Flask(__name__)

try:
    FLAG = open('/flag.txt', 'r').read()
except:
    FLAG = '[**FLAG**]'


@app.route('/')
def index():
    return render_template('index.jinja2')


@app.route('/socket', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('socket.jinja2')
    elif request.method == 'POST':
        host = request.form.get('host')
        port = request.form.get('port', type=int)
        data = request.form.get('data')

        retData = ""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(3)
                s.connect((host, port))
                s.sendall(data.encode())
                while True:
                    tmpData = s.recv(1024)
                    retData += tmpData.decode()
                    if not tmpData: break

        except Exception as e:
            return render_template('socket-result.jinja2', data=e)

        return render_template('socket-result.jinja2', data=retData)


@app.route('/admin', methods=['POST'])
def admin():
    if request.remote_addr != '127.0.0.1':
        return 'Only localhost'

    if request.headers.get('User-Agent') != 'Admin Browser':
        return 'Only Admin Browser'

    if request.headers.get('Cookier') != 'admin':
        return 'Only Admin'

    if request.cookies.get('admin') != 'true':
        return 'Admin Cookie'

    if request.form.get('userid') != 'admin':
        return 'Admin id'

    return FLAG


@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.jinja2'), 404


app.run(host='0.0.0.0', port=1337)
```

we see that the `condition` to have that `flag` is to `POST` to `/admin` and meet the requests conditions:
- must be `internal ip` (`localhost` or `127.0.0.1`) => `Host: 127.0.0.1`
- `User-Agent` header must have value `Admin Browser` => `User-Agent: Admin Browser`
- there is 1 `Cookier` header with value `admin` => `Cookier: admin`
- cookie with key admin value is true => `Cookie: admin=true`
- and finally the userid variable has value equal to admin => `userid: admin`

accordingly we are also given a `socket`, perhaps this is where we can go internally because it is the same program, based on that what we need to do is create a request data and send it to the `socket` according to the request to receive the return. Note that when requesting header we need to provide additional body length and data type

```shell
POST /admin HTTP/1.1
Host: 127.0.0.1
User-Agent: Admin Browser
Cookier: admin
Cookie: admin=true
Content-Length: 12
Content-Type: application/x-www-form-urlencoded

userid=admin
```

![image](./image/cookiearenactf/13.png)

Flag: `CHH{HTTP_via_RaW_Sock3T_f71bcb2e295f2c205cbfa411bd2137cf}`

## Virtual Host Fuzzing

In this challenge we need to understand about `feedback` and `subdomains`, as the challenge description also said.

![image](./image/cookiearenactf/14.png)

here we see that there are 2 response headers `flag` and `Server-Name`, we can see the server name used is `.hacker-dailycookie.cloud`, i spent a lot of time `bruteforce` with `ffuf` but the result is `200` anyway, so it might be like the value of the current `flag` tag is `guess`, in the description it mentions us `admin` and `beta`, the result can see that beta is active.

![image](./image/cookiearenactf/15.png)

![image](./image/cookiearenactf/16.png)

we can see the `flag` tag suggests developer so just use `dev.`

![image](./image/cookiearenactf/17.png)

Flag: `CHH{vir7U@L_h05t_BRUt3_FORCInG_94ad58c6f74aa098ab94a5c48d88242f}`

## Git it right

For this challenge, I first used `dirsearch` to check and find the `.git` public folder, then I used `git-dumper` to get the source.

![image](./image/cookiearenactf/18.png)

![image](./image/cookiearenactf/19.png)

![image](./image/cookiearenactf/20.png)

We see that there is a `super_secure_read_flag.php` file that is used to read `flag.txt`, and `index.html` is where the website is running, the `super_secure_read_flag.php` file is at the same level so we call it to return the `flag`.

![image](./image/cookiearenactf/21.png)

Flag: `CHH{3XpLoIT_.Git_m1scoNF1g_b72745a87ef6932057e0b11762f2f0d1}`

## Break The Editor Jail

When opening it, we see that it is the `vim` online program, hmmmm after a while of `searching` we can see that `vim` can `execute shell` by adding `:!` before command

```vim
:!ls 
```

![image](./image/cookiearenactf/22.png)

```vim
:!cat flag.txt
```

![image](./image/cookiearenactf/23.png)

Flag: `CHH{v1M_c@n_3X3cuT3_th3_cOmManD5_c9ec4a6b9ced1159c60830dc33131615}`

## Easy Git

with this challenge we can see there is a file saying `flag` is removed and we need to see commit history, this is quite common

use `git log`

![image](./image/cookiearenactf/24.png)

we can see there is a commit with an additional `flag`, we need to restore it

use `git checkout` to restore the file

![image](./image/cookiearenactf/25.png)

Flag: `CHH{G1t_c0mm4nD_f0r_7hE_W1n}`

## HTTP Authentication

we get 1 file and i think it is hex, when decode it will see a tag: 
```Authorization: Basic RUhDe2ZyQG00XyMjIUBhfQ==``` and `base64` decoding is ok `flag`

Flag: `EHC{fr@m4_##!@a}`

## Cracking

This is a challenge about using common `passwords` to `bruteforce` office files.

my shell

```shell
└─$ office2john Cracking.docx > office.hash
                                                                                                                                                                        
┌──(kali㉿kali)-[~/Desktop]
└─$ cat office.hash 
Cracking.docx:$office$*2013*100000*256*16*d0b0ff733972e40e90b35340b2685759*9f37067379e97d6c694f6f78c33710f6*f1a9fdd16ba7eeacf5f86d84d0d3276e1714118fa5a8afef6e155b9ee0e5cee5
                                                                                                                                                                        
┌──(kali㉿kali)-[~/Desktop]
└─$ john office.hash --wordlist=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (Office, 2007/2010/2013 [SHA1 128/128 AVX 4x / SHA512 128/128 AVX 2x AES])
Cost 1 (MS Office version) is 2013 for all loaded hashes
Cost 2 (iteration count) is 100000 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
princess         (Cracking.docx)     
1g 0:00:00:00 DONE (2025-07-10 11:40) 11.11g/s 177.7p/s 177.7c/s 177.7C/s 123456..jessica
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

password : `princess`

![image](./image/cookiearenactf/26.png)

Flag: `CHH{m0i_thu_d3u_nen_dc_b4o_m4t}`

## Interceptor

in this challenge i used `https://ezgif.com` to split the `gif` into `images`, and still nothing, it seems the `flag` is still `hidden`, look closely you will see the components of the qr code are cut out and scattered some images, accordingly i extracted them in the correct order from left to right and from top to bottom and combined them into a complete qr and we will get the `flag`

![image](./image/cookiearenactf/27.png)

![image](./image/cookiearenactf/28.png)

![image](./image/cookiearenactf/29.png)

Flag: `Flag{1s_th1s_m1sc3llan30us?}` => `CHH{1s_th1s_m1sc3llan30us?}`

## Audit Web Logs

this is a very good challenge and what we need to do is `analyze` the `log` to see what the `hacker` has `exploited`, maybe there will be a `flag` for us

I see quite a few requests being sent, most notably queries using `sql injection` exploits

![image](./image/cookiearenactf/30.png)

let's start with
```if(ord(substr(database(),%201,1))=32,%20(select%201%20union%20select%202),%200)```

when decoding the urlencode we get:
```sql
if(ord(substr(database(), 1,1))=32, (select 1 union select 2), 0)
```

The meaning of the `query` is to find out if the `first` character value of the database is `32` or not, if so, it will `execute` the command: `(select 1 union select 2)`, which means returning 2 rows corresponding to its number, otherwise returning `0`


