package main

type ConfigStruct struct {
	ProxyPort int
	ErrorPort int
	DbDriver string
	DbConnectString string
}

var Config ConfigStruct

