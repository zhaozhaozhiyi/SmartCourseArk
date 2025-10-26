package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// 嵌入前端构建后的静态资源
//go:embed dist/*
var staticFiles embed.FS

// 嵌入VitePress文档资源
//go:embed docs/.vitepress/dist/*
var docsFiles embed.FS

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
	// 启动HTTP服务器
	port := startServer()
	
	// 在默认浏览器中打开应用
	url := fmt.Sprintf("http://localhost:%d", port)
	openBrowser(url)
	
	// 保持服务器运行
	fmt.Println("按 Ctrl+C 停止服务器")
	select {} // 永久阻塞
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		fmt.Printf("请手动打开浏览器访问: %s\n", url)
		return
	}
	
	if err := cmd.Start(); err != nil {
		fmt.Printf("无法自动打开浏览器，请手动访问: %s\n", url)
	}
}

func startServer() int {
	// 创建子文件系统
	fsys, err := fs.Sub(staticFiles, "dist")
	if err != nil {
		log.Fatal("Failed to create static file system:", err)
	}
	
	docsFsys, err := fs.Sub(docsFiles, "docs/.vitepress/dist")
	if err != nil {
		log.Printf("Warning: Failed to create docs file system: %v", err)
	}
	
	// API路由
	http.HandleFunc("/api/info", infoHandler)
	http.HandleFunc("/api/time", timeHandler)
	http.HandleFunc("/health", healthHandler)
	
	// 文档路由
	if docsFsys != nil {
		http.Handle("/docs/", http.StripPrefix("/docs/", http.FileServer(http.FS(docsFsys))))
	}
	
	// SPA路由支持 - 处理前端路由
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		
		// API路由
		if strings.HasPrefix(path, "/api/") || path == "/health" {
			http.NotFound(w, r)
			return
		}
		
		// 文档路由
		if strings.HasPrefix(path, "/docs/") && docsFsys != nil {
			http.StripPrefix("/docs/", http.FileServer(http.FS(docsFsys))).ServeHTTP(w, r)
			return
		}
		
		// 尝试读取静态文件
		file, err := fsys.Open(strings.TrimPrefix(path, "/"))
		if err == nil {
			defer file.Close()
			fileInfo, _ := file.Stat()
			if !fileInfo.IsDir() {
				http.ServeContent(w, r, path, time.Time{}, file)
				return
			}
		}
		
		// 404时返回index.html（SPA支持）
		index, err := fsys.Open("index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer index.Close()
		
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		http.ServeContent(w, r, "index.html", time.Time{}, index)
	})
	
	// 监听随机可用端口
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
	
	port := listener.Addr().(*net.TCPAddr).Port
	
	// 启动服务器（非阻塞）
	go func() {
		fmt.Printf("🚀 Server started on http://localhost:%d\n", port)
		log.Fatal(http.Serve(listener, nil))
	}()
	
	// 等待服务器启动
	time.Sleep(100 * time.Millisecond)
	
	return port
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	serverInfo.RequestCount++
	serverInfo.Uptime = formatDuration(time.Since(serverInfo.StartTime))
	
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







