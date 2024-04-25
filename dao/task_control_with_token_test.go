package dao

import (
	"log"
	"testing"
)

func TestGetUserInfoWithTaskToken(t *testing.T) {
	str := GetUserInfoWithTaskToken("0x71427b6409bc1f51deaa2ea7e54f64bc34b8fff0", 0)
	log.Println(str)
}
