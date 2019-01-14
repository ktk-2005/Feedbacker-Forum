package main

import (
	"os"
	"log"
	"strconv"
	"path/filepath"
	"github.com/ktk-2005/Feedbacker-Forum/proxy/server"
	"github.com/ktk-2005/Feedbacker-Forum/proxy/resolver"
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

	var resolverConfig resolver.Config
	var serverConfig server.Config

	resolverConfig.DbDriver = getEnv("FFGP_DB_DRIVER", "sqlite3")
	resolverConfig.DbConnectString = getEnv("FFGP_DB_CONNECT", filepath.Join(path, "../server/dev_db.sqlite"))
	serverConfig.ProxyPort = getEnvInt("FFGP_PROXY_PORT", "8086")
	serverConfig.ErrorPort = getEnvInt("FFGP_ERROR_PORT", "8087")
	serverConfig.InjectScript = getEnv("FFGP_INJECT_SCRIPT", "http://localhost:8080/main.js")

	err := resolver.Initialize(&resolverConfig)
	if err != nil {
		log.Fatalf("Failed to initialize container database: %v", err)
	}

	err = server.StartServing(&serverConfig)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

