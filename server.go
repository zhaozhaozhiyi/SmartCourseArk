package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"
)

type ServerInfo struct {
	GoVersion    string
	OS           string
	Arch         string
	NumCPU       int
	StartTime    time.Time
	Uptime       string
	RequestCount int
}

var serverInfo ServerInfo

func init() {
	serverInfo = ServerInfo{
		GoVersion: runtime.Version(),
		OS:        runtime.GOOS,
		Arch:      runtime.GOARCH,
		NumCPU:    runtime.NumCPU(),
		StartTime: time.Now(),
	}
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/api/info", infoHandler)
	http.HandleFunc("/api/time", timeHandler)
	http.HandleFunc("/health", healthHandler)

	port := getPort()
	addr := fmt.Sprintf(":%s", port)

	fmt.Println("╔════════════════════════════════════════╗")
	fmt.Println("║       Simple HTTP Server               ║")
	fmt.Println("╚════════════════════════════════════════╝")
	fmt.Printf("\n🚀 Server is running on http://localhost%s\n", addr)
	fmt.Printf("📝 Press Ctrl+C to stop the server\n\n")

	log.Fatal(http.ListenAndServe(addr, nil))
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	serverInfo.RequestCount++
	serverInfo.Uptime = formatDuration(time.Since(serverInfo.StartTime))

	tmpl := `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple HTTP Server</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 0.9em;
        }
        .info-grid {
            display: grid;
            gap: 15px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .info-label {
            color: #666;
            font-weight: 500;
        }
        .info-value {
            color: #333;
            font-weight: 600;
            font-family: 'Monaco', 'Courier New', monospace;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            font-size: 0.85em;
            margin-bottom: 20px;
        }
        .links {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }
        .link {
            display: block;
            color: #667eea;
            text-decoration: none;
            padding: 10px 0;
            transition: padding-left 0.2s;
        }
        .link:hover {
            padding-left: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 0.85em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">● 运行中</div>
        <h1>🚀 Simple HTTP Server</h1>
        <p class="subtitle">基于 Go 语言的轻量级 HTTP 服务器</p>
        
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Go 版本</span>
                <span class="info-value">{{.GoVersion}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">操作系统</span>
                <span class="info-value">{{.OS}} / {{.Arch}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">CPU 核心</span>
                <span class="info-value">{{.NumCPU}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">运行时间</span>
                <span class="info-value">{{.Uptime}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">请求次数</span>
                <span class="info-value">{{.RequestCount}}</span>
            </div>
        </div>

        <div class="links">
            <strong>API 端点：</strong>
            <a href="/api/info" class="link" target="_blank">📊 /api/info - 服务器信息 (JSON)</a>
            <a href="/api/time" class="link" target="_blank">🕐 /api/time - 当前时间 (JSON)</a>
            <a href="/health" class="link" target="_blank">💚 /health - 健康检查</a>
        </div>

        <div class="footer">
            Powered by Go | 双击运行，无需环境配置
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("index").Parse(tmpl)
	t.Execute(w, serverInfo)
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serverInfo)
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"timestamp": time.Now().Unix(),
		"datetime":  time.Now().Format("2006-01-02 15:04:05"),
		"timezone":  time.Now().Location().String(),
	}
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
	}
	json.NewEncoder(w).Encode(response)
}

func formatDuration(d time.Duration) string {
	d = d.Round(time.Second)
	h := d / time.Hour
	d -= h * time.Hour
	m := d / time.Minute
	d -= m * time.Minute
	s := d / time.Second

	if h > 0 {
		return fmt.Sprintf("%d小时%d分钟%d秒", h, m, s)
	} else if m > 0 {
		return fmt.Sprintf("%d分钟%d秒", m, s)
	}
	return fmt.Sprintf("%d秒", s)
}


