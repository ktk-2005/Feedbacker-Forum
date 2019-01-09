package main

import (
	"os"
	"log"
	"strconv"
	"path/filepath"
)

func getEnv(name, defaultValue string) string {
	val := os.Getenv(name)
	if val == "" {
		val = defaultValue
	}
	return val
}

func getEnvInt(name, defaultValue string) int {
	str := getEnv(name, defaultValue)
	val, err := strconv.Atoi(str)
	if err != nil {
		log.Fatalf("Invalid %s: %s, %v", name, str, err)
	}
	return val
}

func main() {
	path := filepath.Dir(os.Args[0])

	Config.ProxyPort = getEnvInt("FFGP_PROXY_PORT", "8086")
	Config.ErrorPort = getEnvInt("FFGP_ERROR_PORT", "8087")
	Config.DbDriver = getEnv("FFGP_DB_DRIVER", "sqlite3")
	Config.DbConnectString = getEnv("FFGP_DB_DRIVER", filepath.Join(path, "../server/dev_db.sqlite"))
	Config.InjectScript = getEnv("FFGP_INJECT_SCRIPT", "http://localhost:8080/main.js")

	err := InitializeContainers()
	if err != nil {
		log.Fatalf("Failed to initialize container database: %v", err)
	}
	err = StartProxy()
	if err != nil {
		log.Fatalf("Failed to start proxy: %v", err)
	}
}

