import { useEffect, useState } from 'react'

export default function Admin() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/logs')
      .then(r => r.json())
      .then(setLogs)
  }, [])

  return (
    <div>
      <h1>Client Logs</h1>
      <table border="1">
        <thead>
          <tr>
            <th>IP</th>
            <th>User Agent</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td>{log.ip}</td>
              <td>{log.user_agent}</td>
              <td>{log.path}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
