package main

type ConfigStruct struct {
	ProxyPort int
	ErrorPort int
	DbDriver string
	DbConnectString string
	InjectScript string
}

var Config ConfigStruct

