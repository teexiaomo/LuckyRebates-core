package dao

import (
	"log"
	"testing"
)

func TestGetRedEnvlopeList(t *testing.T) {
	str := GetRedEnvlopeList(10, 0, 0)
	log.Println(str)
}

func TestGetRedEnvlope(t *testing.T) {
	str := GetRedEnvlope("1")
	log.Println(str)
}

func TestUserInfo(t *testing.T) {
	str := GetUserInfo("0x874ba02ec75e3a6ffdde59fb79e993d4e42053ac")
	log.Println(str)
}
