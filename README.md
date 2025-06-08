# proxyclient

This project provides a simple web proxy with a tabbed browser interface.
The backend is now implemented in Go for better performance while the UI is built with Next.js.

## Running

### Backend

1. Build the Go server:
   ```bash
   go build -o server
   ```
2. Start the server:
   ```bash
   ./server
   ```

### Frontend

The Next.js app is located in `nextapp`.

1. Install Node dependencies:
   ```bash
   cd nextapp
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser. Use the **New Tab** button on
   the homepage. When a loaded page contains iframes, buttons appear allowing you to open each iframe in its own tab. The `/admin` route displays logged client information collected by the backend.

## Testing

Execute all tests using:

```bash
pytest
```
