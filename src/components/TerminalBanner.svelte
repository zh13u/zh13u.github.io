<script>
// Danh sách các bước: mỗi bước là { type: 'cmd' | 'result', text: string }
export let steps = [
	{ type: "cmd", text: "id" },
	{ type: "result", text: "root at here :)" },
	{ type: "cmd", text: "ls" },
	{ type: "result", text: "welcome" },
	{ type: "cmd", text: "./welcome" },
	{
		type: "result",
		text: "Hey there! Welcome to my page \n Where Innovation Meets Excellence \n Let's chill and explore together 😎",
		special: true,
	},
];

let displayedLines = [];
let typing = "";
let showCursor = true;
let currentTime = new Date().toLocaleString();
let isTyping = false;
let stepIndex = 0;

// Biến cho hiệu ứng typing từng dòng
let specialLines = [];
let currentSpecialLine = 0;
let typingSpecialText = "";
let isTypingSpecial = false;

// Thêm biến cho từng ký tự typing
$: typingChars = typing.split("");
$: typingSpecialChars = typingSpecialText.split("");

// Debug log
console.log("TerminalBanner component loaded");

async function typeTerminal() {
	console.log("Starting typeTerminal function");
	// Delay khởi tạo cho smooth hơn
	await new Promise((r) => setTimeout(r, 1500));

	for (let i = 0; i < steps.length; i++) {
		if (steps[i].type === "cmd") {
			typing = "";
			isTyping = true;
			showCursor = true;

			// Delay êm hơn trước khi bắt đầu gõ
			await new Promise((r) => setTimeout(r, 600));

			// Gõ từng ký tự với hiệu ứng từ trái sang phải - mượt hơn
			for (let j = 0; j < steps[i].text.length; j++) {
				typing = steps[i].text.substring(0, j + 1);

				// Tốc độ gõ mượt hơn và tự nhiên hơn (80-200ms)
				let delay = 80 + Math.random() * 120;

				// Thêm hiệu ứng ngừng dài hơn tại space và dấu câu
				if (steps[i].text[j] === " ") {
					delay += 150; // Dừng lâu hơn ở space
					await new Promise((r) => setTimeout(r, delay));
					continue;
				}
				if ([".", "/", "-", "_"].includes(steps[i].text[j])) {
					delay += 100; // Dừng lâu hơn ở dấu câu
					await new Promise((r) => setTimeout(r, delay));
					continue;
				}

				await new Promise((r) => setTimeout(r, delay));
			}

			// Dừng lại lâu hơn sau khi gõ xong để tạo cảm giác tự nhiên
			await new Promise((r) => setTimeout(r, 600));

			// Gõ xong thì tắt cursor và isTyping trước khi push vào displayedLines
			isTyping = false;
			showCursor = false;

			// Push dòng lệnh vào displayedLines
			displayedLines = [...displayedLines, { type: "cmd", text: typing }];
			typing = "";

			// Delay nhẹ nhàng trước khi hiện kết quả
			await new Promise((r) => setTimeout(r, 300));
		} else {
			// Kiểm tra nếu là special result
			if (steps[i].special) {
				await typeSpecialResult(steps[i].text);
			} else {
				// Kết quả thường hiện ra với hiệu ứng slide in mượt mà
				displayedLines = [
					...displayedLines,
					{ type: "result", text: steps[i].text, special: steps[i].special },
				];
			}

			// Delay êm hơn trước lệnh tiếp theo
			await new Promise((r) => setTimeout(r, 1000 + Math.random() * 400));
		}
		stepIndex = i + 1;
	}
}

async function typeSpecialResult(text) {
	// Tách text thành các dòng
	const lines = text.split("\n");
	specialLines = [];
	currentSpecialLine = 0;

	// Thêm container cho special result
	displayedLines = [
		...displayedLines,
		{ type: "result", text: "", special: true, isContainer: true },
	];

	// Typing từng dòng
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		typingSpecialText = "";
		isTypingSpecial = true;
		currentSpecialLine = lineIndex;

		// Delay trước khi bắt đầu dòng mới
		await new Promise((r) => setTimeout(r, 800));

		// Gõ từng ký tự của dòng hiện tại
		for (let charIndex = 0; charIndex < lines[lineIndex].length; charIndex++) {
			typingSpecialText = lines[lineIndex].substring(0, charIndex + 1);

			// Tốc độ typing mượt hơn cho special text
			let delay = 60 + Math.random() * 80;

			// Dừng lâu hơn tại emoji và space
			if (lines[lineIndex][charIndex] === " ") {
				delay += 100;
			}
			if (["🚀", "💫", "⚡"].includes(lines[lineIndex][charIndex])) {
				delay += 200;
			}

			await new Promise((r) => setTimeout(r, delay));
		}

		// Hoàn thành dòng hiện tại
		specialLines = [...specialLines, lines[lineIndex]];
		isTypingSpecial = false;

		// Delay trước dòng tiếp theo
		await new Promise((r) => setTimeout(r, 400));
	}
}

function updateTime() {
	currentTime = new Date().toLocaleString();
}

function getTimeParts() {
	const now = new Date();
	const offset = -now.getTimezoneOffset() / 60;
	const offsetStr =
		offset === 0 ? "UTC" : `UTC${offset > 0 ? "+" : ""}${offset}`;
	const pad = (n) => n.toString().padStart(2, "0");
	const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const hourStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	return { dateStr, hourStr, offsetStr };
}

$: timeParts = getTimeParts();
setInterval(() => {
	timeParts = getTimeParts();
}, 1000);

// Bắt đầu animation
typeTerminal();
setInterval(updateTime, 1000);
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  .terminal-container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    position: relative;
  }

  .terminal-window {
    background: 
      linear-gradient(135deg, rgba(13, 17, 23, 0.85) 0%, rgba(1, 4, 9, 0.9) 100%);
    border: 1px solid rgba(48, 54, 61, 0.8);
    border-radius: 12px;
    box-shadow: 
      0 16px 32px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    overflow: hidden;
    position: relative;
  }

  .glow-effect {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 100, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .terminal-header {
    background: linear-gradient(135deg, #21262d 0%, #161b22 100%);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #30363d;
    position: relative;
  }

  .terminal-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .terminal-dot {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
  }

  .terminal-dot::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .terminal-dot:hover::before {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.5);
  }

  .terminal-dot.red { 
    background: linear-gradient(135deg, #ff5f56 0%, #e0443e 100%);
    box-shadow: 0 2px 4px rgba(255, 95, 86, 0.3);
  }
  .terminal-dot.red::before { background: #ff5f56; }

  .terminal-dot.yellow { 
    background: linear-gradient(135deg, #ffbd2e 0%, #dea123 100%);
    box-shadow: 0 2px 4px rgba(255, 189, 46, 0.3);
  }
  .terminal-dot.yellow::before { background: #ffbd2e; }

  .terminal-dot.green { 
    background: linear-gradient(135deg, #27c93f 0%, #13a10e 100%);
    box-shadow: 0 2px 4px rgba(39, 201, 63, 0.3);
  }
  .terminal-dot.green::before { background: #27c93f; }

  .terminal-title {
    color: #8b949e;
    font-size: 13px;
    font-weight: 500;
    margin-left: 12px;
    opacity: 0.8;
  }

  .terminal-content {
    padding: 24px;
    min-height: 280px;
    background: 
      radial-gradient(circle at 10% 20%, rgba(0, 255, 100, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(0, 255, 100, 0.05) 0%, transparent 50%);
    position: relative;
    overflow: hidden;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  }

  .terminal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 100, 0.02) 2px,
        rgba(0, 255, 100, 0.02) 4px
      );
    pointer-events: none;
    animation: scanlines 0.1s linear infinite;
  }

  @keyframes scanlines {
    0% { transform: translateY(0px); }
    100% { transform: translateY(4px); }
  }

  .terminal-output {
    position: relative;
    z-index: 1;
  }

  .terminal-line {
    color: #f8fafc;
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 4px;
    font-weight: 500;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
    display: flex;
    align-items: baseline;
    min-height: 27px;
  }
  
  .terminal-line.fade-in {
    opacity: 0;
    animation: softAppear 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  @keyframes softAppear {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .terminal-prompt {
    color: #ff6b6b;
    font-weight: 600;
    text-shadow: 0 0 6px rgba(255, 107, 107, 0.4);
    font-family: inherit;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .terminal-cmd {
    color: #ffffff;
    font-weight: 500;
    font-family: inherit;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
    margin-left: 4px;
    display: inline-block;
    min-width: 1px;
    white-space: nowrap;
    overflow: hidden;
  }

  .terminal-cmd.executable {
    color: #00ff64;
    text-shadow: 0 0 4px rgba(0, 255, 100, 0.4);
    font-weight: 500;
  }

  .terminal-result {
    color: #f8fafc;
    font-weight: 400;
    text-shadow: 0 0 2px rgba(0, 255, 100, 0.2);
    font-family: inherit;
    opacity: 0.9;
    flex: 1;
    white-space: pre-line;
  }

  .terminal-result.executable {
    color: #00ff64;
    text-shadow: 0 0 4px rgba(0, 255, 100, 0.4);
    font-weight: 500;
  }

  /* Container cho special result */
  .special-container {
    color: #00ff64;
    background: 
      linear-gradient(135deg, rgba(13, 17, 23, 0.8) 0%, rgba(1, 4, 9, 0.85) 100%);
    font-weight: 600;
    font-size: 16px;
    line-height: 1.8;
    text-align: center;
    display: block;
    margin: 20px 0;
    padding: 25px;
    border: 1px solid rgba(0, 255, 100, 0.4);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    animation: welcomePulse 3s ease-in-out infinite;
    backdrop-filter: blur(20px);
    box-shadow: 
      0 8px 32px rgba(0, 255, 100, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .special-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(0, 255, 100, 0.1) 0%,
      rgba(0, 212, 255, 0.1) 25%,
      rgba(255, 0, 110, 0.1) 50%,
      rgba(131, 56, 236, 0.1) 75%,
      rgba(0, 255, 100, 0.1) 100%
    );
    background-size: 400% 400%;
    animation: gradientWave 4s ease-in-out infinite;
    z-index: -1;
  }

  .special-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: smoothShine 3s ease-in-out infinite;
    z-index: 1;
  }

  .special-line {
    display: block;
    margin: 8px 0;
    text-shadow: 
      0 0 10px rgba(0, 255, 100, 0.8),
      0 0 20px rgba(0, 255, 100, 0.6),
      0 0 30px rgba(0, 255, 100, 0.4);
    opacity: 0;
    transform: translateY(10px);
    animation: lineAppear 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes lineAppear {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .special-typing-line {
    display: block;
    margin: 8px 0;
    text-shadow: 
      0 0 10px rgba(0, 255, 100, 0.8),
      0 0 20px rgba(0, 255, 100, 0.6),
      0 0 30px rgba(0, 255, 100, 0.4);
  }

  @keyframes welcomePulse {
    0%, 100% { 
      transform: scale(1);
      text-shadow: 
        0 0 10px rgba(0, 255, 100, 0.8),
        0 0 20px rgba(0, 255, 100, 0.6),
        0 0 30px rgba(0, 255, 100, 0.4);
      box-shadow: 
        0 8px 32px rgba(0, 255, 100, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    50% { 
      transform: scale(1.02);
      text-shadow: 
        0 0 15px rgba(0, 255, 100, 1),
        0 0 25px rgba(0, 255, 100, 0.8),
        0 0 35px rgba(0, 255, 100, 0.6);
      box-shadow: 
        0 12px 48px rgba(0, 255, 100, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }

  @keyframes gradientWave {
    0%, 100% { 
      background-position: 0% 50%; 
      opacity: 0.3;
    }
    50% { 
      background-position: 100% 50%; 
      opacity: 0.5;
    }
  }

  @keyframes smoothShine {
    0%, 100% { 
      left: -100%; 
      opacity: 0;
    }
    50% { 
      left: 100%; 
      opacity: 1;
    }
  }

  .cursor {
    display: inline-block;
    width: 12px;
    height: 3px;
    background: linear-gradient(90deg, #00ff64 0%, #00cc50 100%);
    animation: horizontalBlink 1.5s ease-in-out infinite;
    box-shadow: 
      0 0 6px rgba(0, 255, 100, 0.6),
      0 0 12px rgba(0, 255, 100, 0.3);
    margin-left: 2px;
    margin-bottom: 2px;
    flex-shrink: 0;
    vertical-align: baseline;
    border-radius: 2px;
    position: relative;
    transform: translateY(6px);
  }

  .cursor::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #ffffff 0%, #00ff64 100%);
    border-radius: 2px;
    opacity: 0.8;
    animation: horizontalCursorGlow 2.5s ease-in-out infinite;
  }

  @keyframes horizontalBlink {
    0%, 45% { 
      opacity: 1; 
      transform: translateY(6px) scaleX(1) scaleY(1);
    }
    50%, 95% { 
      opacity: 0.3; 
      transform: translateY(6px) scaleX(0.8) scaleY(0.9);
    }
    100% { 
      opacity: 1; 
      transform: translateY(6px) scaleX(1) scaleY(1);
    }
  }

  @keyframes horizontalCursorGlow {
    0%, 100% { 
      opacity: 0.5;
      transform: scaleX(1);
    }
    50% { 
      opacity: 0.9;
      transform: scaleX(1.2);
    }
  }

  .status-bar {
    background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
    padding: 8px 20px;
    border-top: 1px solid #30363d;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #7c8b95;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00ff64;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(0, 255, 100, 0.7);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(0.9);
      box-shadow: 0 0 0 4px rgba(0, 255, 100, 0);
    }
  }

  .terminal-output {
    scroll-behavior: smooth;
  }

  .cmd-container {
    display: flex;
    align-items: baseline;
    width: 100%;
    min-height: 27px;
  }

  .typing-container {
    display: flex;
    align-items: baseline;
    flex: 1;
  }

  .typing-text {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: none;
    animation: typeReveal 0.15s ease-out;
  }

  @keyframes typeReveal {
    0% {
      transform: translateX(-1px);
      opacity: 0.8;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .terminal-cmd {
    overflow: visible;
    white-space: nowrap;
  }

  .typing-char {
    display: inline-block;
    opacity: 0;
    transform: translateX(-2px) scale(0.995);
    animation: slideInChar 0.18s cubic-bezier(.25,.46,.45,.94) forwards;
  }
  
  @keyframes slideInChar {
    0% {
      opacity: 0;
      transform: translateX(-2px) scale(0.995);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .typing-special-char {
    display: inline;
    opacity: 0;
    transform: translateY(-2px) scale(0.9);
    animation: slideInSpecialChar 0.12s cubic-bezier(.25,.46,.45,.94) forwards;
  }
  
  @keyframes slideInSpecialChar {
    0% {
      opacity: 0;
      transform: translateY(-2px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>

<div class="terminal-container">
  <div class="terminal-window">
    <div class="glow-effect"></div>
    <div class="terminal-header">
      <div class="terminal-buttons">
        <div class="terminal-dot red"></div>
        <div class="terminal-dot yellow"></div>
        <div class="terminal-dot green"></div>
      </div>
      <div class="terminal-title">nd0@darkter</div>
      <div class="flex items-center gap-4 ml-auto">
        <span class="inline-block align-middle" style="width:20px;height:20px;">
          <!-- SVG icon lịch outline đẹp, màu xám nhạt -->
          <svg width="20" height="20" fill="none" stroke="#b0b0b0" stroke-width="1.5" viewBox="0 0 24 24">
            <rect x="4" y="6" width="16" height="14" rx="2" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>
            <path d="M16 2v4M8 2v4M4 10h16" stroke="#b0b0b0" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="text-base font-medium" style="color:rgb(146, 74, 218); text-shadow: 0 0 8px #00ff64aa;">
  <span>{timeParts.dateStr}</span>
  <span class="mx-2 text-[#b0b0b0]">•</span>
  <span>{timeParts.hourStr}</span>
  <span class="mx-2 text-[#b0b0b0]">•</span>
  <span class="text-xs text-[#b0b0b0]">{timeParts.offsetStr}</span>
</span>
      </div>
    </div>
    <div class="terminal-content">
      <div class="terminal-output">
        {#each displayedLines as line, i (i)}
          {#if line.type === 'cmd'}
            <div class="terminal-line">
              <span class="terminal-prompt">nd0@darkter:/# </span>
              <span class="terminal-cmd" class:executable={line.text === './welcome'}>{line.text}</span>
            </div>
          {:else if line.special && line.isContainer}
            <div class="special-container">
              {#each specialLines as completedLine, idx}
                <div class="special-line" style="animation-delay: {idx * 0.1}s">
                  {completedLine}
                </div>
              {/each}
              {#if isTypingSpecial}
                <div class="special-typing-line">
                  {#each typingSpecialChars as char, idx}
                    <span class="typing-special-char" style="animation-delay: {idx * 0.02}s">{char}</span>
                  {/each}
                  <span class="cursor"></span>
                </div>
              {/if}
            </div>
          {:else}
            <div class="terminal-line fade-in">
              <span class="terminal-result" class:executable={line.text === 'welcome'}>{line.text}</span>
            </div>
          {/if}
        {/each}
        {#if isTyping}
          <div class="terminal-line">
            <div class="cmd-container">
              <span class="terminal-prompt">nd0@darkter:/# </span>
              <div class="typing-container">
                <span class="terminal-cmd typing-text" class:executable={typing === './welcome'}>
                  {#each typingChars as char, idx}
                    <span class="typing-char" style="animation-delay: {idx * 0.02}s">{char}</span>
                  {/each}
                </span>
                {#if showCursor}
                  <span class="cursor"></span>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>