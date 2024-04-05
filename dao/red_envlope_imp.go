package dao

import (
	"context"
	"encoding/json"
	"log"

	"github.com/machinebox/graphql"
)

var client *graphql.Client

func init() {
	client = graphql.NewClient("https://api.studio.thegraph.com/query/70193/luckyredenvelope/version/latest")

}

// 查询前n条
func GetRedEnvlopeList(first int) string {

	// make a request
	req := graphql.NewRequest(`
    query ($key: Int!) {
        redEnvelopes (first:$key) {
            id
            status
            userTickets
            injectTickets
            autoClaim
            maxTickets
            ticketPirce
            startTimestamp
            endTimeTimestamp
        }
    }
`)

	// set any variables
	req.Var("key", first)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	var respData interface{}
	if err := client.Run(ctx, req, &respData); err != nil {
		log.Fatal(err)
	}
	data, err := json.Marshal(respData)
	if err != nil {
		log.Fatal(err)
	}
	return string(data)
}

// 查询某一条的详情
func GetRedEnvlope(id string) string {
	// make a request
	req := graphql.NewRequest(`
    query ($key: String!) {
        redEnvelope (id:$key) {
            id
            status
            userTickets
            injectTickets
            autoClaim
            maxTickets
            ticketPirce
            startTimestamp
            endTimeTimestamp
            createdEvent{
                blockNumber
                transactionHash
                blockTimestamp
            }
            closedEvent{
                blockNumber
                transactionHash
                blockTimestamp
            }
            claimableEvent{
                blockNumber
                transactionHash
                blockTimestamp
            }
            ticketsInjectList{
                sender
                ticketNumbers
                transactionHash
            }
            ticketsPurchaseList{
                sender
                receiveAddress
                ticketNumbers
                transactionHash
            }
            prizeDrawnList{
                winner
                amount
            }
            claimPrizeList{
                winner
                totalAmount
                autoClaim
                transactionHash
            }

        }
    }
`)

	// set any variables
	req.Var("key", id)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	var respData interface{}
	if err := client.Run(ctx, req, &respData); err != nil {
		log.Fatal(err)
	}
	data, err := json.Marshal(respData)
	if err != nil {
		log.Fatal(err)
	}
	return string(data)
}

func GetUserInfo(addr string) string {
	req := graphql.NewRequest(`
    query ($key: String!) {
        userInfo (id:$key) {
            id
            ticketsPurchaseList{
                redEnvelope{
                    id
                }
                sender
                receiveAddress
                ticketNumbers
                transactionHash
            }
            prizeDrawnList{
                redEnvelope{
                    id
                }
                amount
                transactionHash
            }
            claimPrizeList{
                redEnvelope{
                    id
                }
                totalAmount
                transactionHash
            }
        }
    }
`)

	// set any variables
	req.Var("key", addr)

	// set header fields
	req.Header.Set("Cache-Control", "no-cache")

	// define a Context for the request
	ctx := context.Background()

	// run it and capture the response
	var respData interface{}
	if err := client.Run(ctx, req, &respData); err != nil {
		log.Fatal(err)
	}
	data, err := json.Marshal(respData)
	if err != nil {
		log.Fatal(err)
	}
	return string(data)
}
