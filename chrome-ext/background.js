const API = 'ws://ip:port'
let WS = new WebSocket(API)
WS.onopen = (e) => {
  console.log('link start')
  chrome.storage.sync.set({ state: true })
}
WS.onclose = (e) => {
  console.log('link end')
  chrome.storage.sync.set({ state: false })
  WS = null
}
WS.onerror = (e) => {
  console.log('link error', e)
  chrome.storage.sync.set({ state: false })
  WS = null
}
WS.onmessage = (e) => {
  console.log('recv', e.data)
  data = JSON.parse(e.data)
  if (data.u) {
    let url = data.u
    chrome.storage.sync.set({ url })
    chrome.runtime.sendMessage({ url })
  }
  if (data.t) {
    let ts = new Date().getTime()
    let time = (ts - parseInt(data.ts)) / 1000 + parseFloat(data.t)
    chrome.storage.sync.set({ time })
    chrome.runtime.sendMessage({ time })
  }
}
chrome.runtime.onMessage.addListener(async (req) => {
  if (!WS) {
    WS = new WebSocket(API)
    return
  }
  if (req.st) {
    req.ts = new Date().getTime().toString()
  }
  WS.send(JSON.stringify(req))
})