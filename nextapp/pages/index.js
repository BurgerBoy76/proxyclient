import { useState } from 'react'

export default function Home() {
  const [tabs, setTabs] = useState([{ id: 1, iframes: [] }])
  const [active, setActive] = useState(1)

  const newTab = (url = '') => {
    const id = Date.now()
    setTabs([...tabs, { id, iframes: [] }])
    setActive(id)
    if (url) loadUrl(id, url)
  }

  const loadUrl = (id, directUrl) => {
    const url = directUrl || document.getElementById(`url-${id}`).value
    fetch('http://localhost:5000/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
      .then(r => r.text())
      .then(html => {
        document.getElementById(`frame-${id}`).srcdoc = html
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const frames = Array.from(doc.querySelectorAll('iframe[src]')).map(f => f.getAttribute('src'))
        setTabs(tabs => tabs.map(t => t.id === id ? { ...t, iframes: frames } : t))
      })
  }

  return (
    <div>
      <button onClick={newTab}>New Tab</button>
      <div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}>Tab {t.id}</button>
        ))}
      </div>
      {tabs.map(tab => (
        <div key={tab.id} style={{ display: active === tab.id ? 'block' : 'none' }}>
          <input id={`url-${tab.id}`} type="text" size={40} placeholder="Enter URL" />
          <button onClick={() => loadUrl(tab.id)}>Go</button>
          <div>
            {tab.iframes.map(src => (
              <button key={src} onClick={() => newTab(src)}>Open {src}</button>
            ))}
          </div>
          <iframe id={`frame-${tab.id}`} style={{ width: '100%', height: '80vh' }} />
        </div>
      ))}
    </div>
  )
}
