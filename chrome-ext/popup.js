document.getElementById('host').addEventListener("click", async (event) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: host,
    })
})
document.getElementById('follow').addEventListener("click", async (event) => {
    chrome.runtime.sendMessage({ gu: '1' })
})
document.getElementById('sync').addEventListener("click", async (event) => {
    chrome.runtime.sendMessage({ gt: '1' })
})
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.url) {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if(tab.url === msg.url){
            return
        }
        chrome.tabs.create({ url: msg.url })
    }
    if (msg.time) {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.url.substr(0, 4) !== 'http') {
            console.log('cant jump:', tab.url)
            return
        }
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: jump,
        })
    }
})
function host() {
    const lock = document.getElementById(location.href)
    if (lock) {
        console.log('alreay hosted')
        return
    }
    const lockNode = document.createElement('a')
    lockNode.id = location.href
    lockNode.style = 'display:none'
    document.body.appendChild(lockNode)

    let v = document.getElementsByTagName("video")[0]
        , passTime = 0, currUrl = ''
    if (v === undefined) {
        alert('video not found!')
        return
    }
    v.addEventListener('timeupdate', () => {
        if (currUrl != location.href) {
            chrome.runtime.sendMessage({ su: location.href })
            currUrl = location.href
        }
        if (Math.abs(v.currentTime - passTime) > 5) {
            chrome.runtime.sendMessage({ st: v.currentTime.toString() })
            passTime = v.currentTime
        }
    })
}
function jump() {
    let v = document.getElementsByTagName("video")[0]
    if (v === undefined) {
        alert('video not found!')
        return
    }
    chrome.storage.sync.get('time', ({ time }) => {
        console.log('jump:', time)
        v.currentTime = time
    })
}
function state() {
    chrome.storage.sync.get('state', ({ state }) => {
        let d = document.getElementById('state')
        d.removeAttribute('class')
        let cl = state ? 'connected' : 'disconnect'
        d.setAttribute('class', cl)
        d.innerText = cl
    })
}
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'state') {
            state()
        }
    }
})
state()
