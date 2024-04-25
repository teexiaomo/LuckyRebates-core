package dao

import (
	"context"
	"encoding/json"
	"log"

	"github.com/machinebox/graphql"
)

var taskControlClient *graphql.Client

func init() {
	taskControlClient = graphql.NewClient("https://api.studio.thegraph.com/proxy/70193/taskcontrolwithtoken/version/latest")

}

const (
	tokenMintList = `tokenMintList(orderBy:blockTimestamp,orderDirection :desc) {	
		id
		sender
		taskAddr
		receiveAddress
		amount
		transactionHash
	  }`
	ticketGetList = `ticketGetList(orderBy:blockTimestamp,orderDirection :desc)  {
		id
		redEnvelope
		fromAddress
		receiveAddress
		amount
		ticketNumbers
		buy
		transactionHash
	  }`
)

// 查询指定用户的task token明细记录（暂不包含普通转账）
//
// userAddr:用户地址
// queryType:0.全查；1.仅查领取记录 2.仅查消耗记录
func GetUserInfoWithTaskToken(userAddr string, queryType int) string {
	var query string

	if queryType == 1 {
		query = tokenMintList
	} else if queryType == 2 {
		query = ticketGetList
	} else {
		query = tokenMintList + ticketGetList
	}

	req := graphql.NewRequest(`
    query ($userAddr: String!) {
        userInfo (id:$userAddr) {
            id
			balance
			` + query + `
        }
    }
`)

	// set any variables
	req.Var("userAddr", userAddr)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	var respData interface{}
	if err := taskControlClient.Run(ctx, req, &respData); err != nil {
		log.Fatal(err)
	}
	data, err := json.Marshal(respData)
	if err != nil {
		log.Fatal(err)
	}
	return string(data)
}
