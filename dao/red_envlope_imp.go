package dao

import (
	"context"
	"encoding/json"
	"log"

	"github.com/machinebox/graphql"
)

var client *graphql.Client

func init() {
	client = graphql.NewClient("https://api.studio.thegraph.com/proxy/70193/luckyredenvelopev2/version/latest")

}

// 查询最新的n个红包
//
//model:0.全查；1.仅查buy model模式的；2.仅查get model模式的
//status:0.全查；1.open 2.Close 3.Feed 4.Claimable
func GetRedEnvlopeList(first int, model int, status int) string {
	whereList := ""
	if model != 0 {
		whereList = "model:$modelkey"
	}
	if status != 0 {
		if whereList != "" {
			whereList += ","
		}
		whereList = whereList + "status:$statuskey"
	}
	query := string(`query ($firstkey: Int!,$modelkey: Int!,$statuskey: Int!) { 
        redEnvelopes (first:$firstkey,orderBy:id,orderDirection :desc,where:{` + whereList + `}){
            id
            ticketToken
            ticketPirce

            status
            model

            sendAllowAddr

            buyTickets
            sendTickets
            injectTickets

            autoClaim
            maxTickets
            maxPrizeNum
            endTime
    
    		startTimestamp
    		endTimestamp
        }
    }`)
	// make a request
	req := graphql.NewRequest(query)

	// set any variables
	req.Var("firstkey", first)
	req.Var("modelkey", model)
	req.Var("statuskey", status)

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
            ticketToken
            ticketPirce

            status
            model

            sendAllowAddr

            buyTickets
            sendTickets
            injectTickets

            autoClaim
            maxTickets
            maxPrizeNum
            endTime
    
    		startTimestamp
    		endTimestamp

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
            TicketsGetList{
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
            TicketsGetList{
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
