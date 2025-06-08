package main

import (
    "encoding/json"
    "io"
    "log"
    "net/http"
    "sync"
    "time"
)

type LogEntry struct {
    IP        string `json:"ip"`
    UserAgent string `json:"user_agent"`
    Path      string `json:"path"`
}

var (
    logs []LogEntry
    mu   sync.Mutex
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", indexHandler)
    mux.HandleFunc("/fetch", fetchHandler)
    mux.HandleFunc("/logs", logsHandler)

    handler := logMiddleware(mux)

    log.Println("Server running on :5000")
    if err := http.ListenAndServe(":5000", handler); err != nil {
        log.Fatal(err)
    }
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "static/index.html")
}

func fetchHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    var body struct{ URL string `json:"url"` }
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.URL == "" {
        http.Error(w, "url missing", http.StatusBadRequest)
        return
    }
    client := http.Client{Timeout: 10 * time.Second}
    resp, err := client.Get(body.URL)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()
    for k, v := range resp.Header {
        if len(v) > 0 && (k == "Content-Type" || k == "Content-Length") {
            w.Header().Set(k, v[0])
        }
    }
    w.WriteHeader(resp.StatusCode)
    io.Copy(w, resp.Body)
}

func logsHandler(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(logs)
}

func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        next.ServeHTTP(w, r)
        mu.Lock()
        logs = append(logs, LogEntry{
            IP:        r.RemoteAddr,
            UserAgent: r.UserAgent(),
            Path:      r.URL.Path,
        })
        mu.Unlock()
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    })
}
