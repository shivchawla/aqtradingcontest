export const apiSpec = {
    "swagger": "2.0",
    "info": {
      "description": "AdviceQube api publisher",
      "version": "1.0.0",
      "title": "AdviceQube api",
      "termsOfService": "http://www.aimsquant.com/terms/",
      "contact": {
        "email": "shiv.chawla@aimsquant.com"
      },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      }
    },
    "host": "api.adviceqube.com",
    "basePath": "/api/v2",
    "tags": [
      {
        "name": "dailycontest",
        "description": "operations on dailycontest",
        "externalDocs": {
          "description": "Find out more about us",
          "url": "http://www.adviceqube.com"
        }
      }
    ],
    "schemes": [
      "https"
    ],
    "produces": [
      "application/json"
    ],
    "paths": {
      "/dailycontest/prediction": {
        "post": {
          "tags": [
            "dailycontest"
          ],
          "summary": "Add stock predictions",
          "description": "add stock predictions",
          "operationId": "updateDailyContestPredictions",
          "security": [
            {
              "api_key": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "auth token",
              "type": "string",
              "required": true
            },
            {
              "name": "advisorId",
              "required": false,
              "in": "query",
              "description": "advisorId of the user for which the prediction is to be made",
              "type": "string"
            },
            {
              "name": "body",
              "in": "body",
              "required": true,
              "description": "schema body",
              "schema": {
                "$ref": "#/definitions/DailyContestPredictions"
              }
            },
            {
              "name": "operation",
              "in": "query",
              "required": true,
              "type": "string",
              "default": "insert",
              "enum": [
                "update",
                "insert"
              ]
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Input"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      },
      "/dailycontest/exitPrediction": {
        "post": {
          "tags": [
            "dailycontest"
          ],
          "summary": "Exit stock prediction",
          "description": "exit stock predictions",
          "operationId": "exitDailyContestPrediction",
          "security": [
            {
              "api_key": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "auth token",
              "type": "string",
              "required": true
            },
            {
              "name": "predictionId",
              "in": "query",
              "description": "prediction id",
              "type": "string",
              "required": true
            },
            {
              "name": "advisorId",
              "in": "query",
              "description": "advisor id",
              "type": "string",
              "required": false
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Input"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      },
      "/dailycontest/portfoliostats": {
        "get": {
          "tags": [
            "dailycontest"
          ],
          "summary": "get the portfolio-stats of contest entry",
          "description": "get the portfolio-stats of contest entry",
          "operationId": "getDailyContestPortfolioStatsForDate",
          "security": [
            {
              "api_key": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "auth token",
              "type": "string",
              "required": true
            },
            {
              "name": "date",
              "in": "query",
              "type": "string",
              "format": "date",
              "description": "date of contest",
              "required": false
            },
            {
              "name": "advisorId",
              "required": false,
              "in": "query",
              "description": "advisorId of the user for which the prediction is to be made",
              "type": "string"
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Input"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      }
    },
    "securityDefinitions": {
      "api_key": {
        "type": "apiKey",
        "name": "aimsquant-token",
        "in": "header"
      }
    },
    "definitions": {
      "User": {
        "type": "object",
        "required": [
          "firstName",
          "lastName",
          "email",
          "password"
        ],
        "properties": {
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "phone": {
            "type": "string"
          },
          "photo": {
            "type": "string"
          },
          "aboutme": {
            "type": "string"
          },
          "education": {
            "type": "string"
          },
          "profession": {
            "type": "string"
          }
        }
      },
      "Login": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      },
      "GoogleLogin": {
        "type": "object",
        "properties": {
          "accessToken": {
            "type": "string"
          }
        }
      },
      "Thread": {
        "type": "object",
        "required": [
          "category",
          "title",
          "markdownText"
        ],
        "properties": {
          "category": {
            "type": "string",
            "enum": [
              "Share your Idea",
              "Questions and Answers",
              "News and Announcements"
            ]
          },
          "title": {
            "type": "string"
          },
          "markdownText": {
            "type": "string"
          },
          "backtestId": {
            "type": "string"
          }
        }
      },
      "resetpassword": {
        "type": "object",
        "required": [
          "password1",
          "password2",
          "code"
        ],
        "properties": {
          "password1": {
            "type": "string"
          },
          "password2": {
            "type": "string"
          },
          "code": {
            "type": "string",
            "format": "uuid"
          }
        }
      },
      "updateToken": {
        "type": "object",
        "required": [
          "token",
          "email"
        ],
        "properties": {
          "token": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "force": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "captchaToken": {
        "type": "object",
        "required": [
          "token"
        ],
        "properties": {
          "token": {
            "type": "string"
          }
        }
      },
      "Error": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        }
      },
      "Strategy": {
        "type": "object",
        "required": [
          "name",
          "type",
          "language",
          "description"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "language": {
            "type": "string",
            "enum": [
              "julia",
              "python",
              "nodejs",
              "java"
            ]
          },
          "description": {
            "type": "string"
          },
          "code": {
            "type": "string"
          }
        }
      },
      "BacktestSettings": {
        "type": "object",
        "required": [
          "startDate",
          "endDate",
          "initialCash"
        ],
        "properties": {
          "startDate": {
            "type": "string"
          },
          "endDate": {
            "type": "string"
          },
          "initialCash": {
            "type": "number",
            "format": "long"
          },
          "universe": {
            "type": "string"
          },
          "advanced": {
            "type": "string"
          }
        }
      },
      "Backtest": {
        "type": "object",
        "required": [
          "settings"
        ],
        "properties": {
          "settings": {
            "$ref": "#/definitions/BacktestSettings"
          }
        }
      },
      "Forwardtest": {
        "type": "object",
        "required": [
          "strategyId",
          "backtestId"
        ],
        "properties": {
          "strategyId": {
            "type": "string"
          },
          "backtestId": {
            "type": "string"
          }
        }
      },
      "Feedback": {
        "type": "object",
        "required": [
          "feedback",
          "subject",
          "from",
          "to"
        ],
        "properties": {
          "feedback": {
            "type": "string"
          },
          "subject": {
            "type": "string"
          },
          "from": {
            "type": "string"
          },
          "to": {
            "type": "string",
            "default": "feedback@aimsquant.com"
          }
        }
      },
      "invite": {
        "type": "object",
        "required": [
          "emailList"
        ],
        "properties": {
          "emailList": {
            "type": "string"
          }
        }
      },
      "infoEmail": {
        "type": "object",
        "required": [
          "templateFileName",
          "subject"
        ],
        "properties": {
          "templateFileName": {
            "type": "string"
          },
          "subject": {
            "type": "string"
          }
        }
      },
      "Security": {
        "type": "object",
        "required": [
          "ticker"
        ],
        "properties": {
          "ticker": {
            "type": "string"
          },
          "securityType": {
            "type": "string",
            "default": "EQ"
          },
          "country": {
            "type": "string",
            "default": "IN"
          },
          "exchange": {
            "type": "string",
            "default": "NSE"
          }
        }
      },
      "Position": {
        "type": "object",
        "required": [
          "security"
        ],
        "properties": {
          "security": {
            "$ref": "#/definitions/Security"
          },
          "investment": {
            "type": "number",
            "format": "number",
            "default": 0
          },
          "quantity": {
            "type": "number",
            "format": "long",
            "default": 0
          },
          "avgPrice": {
            "type": "number",
            "default": 0
          }
        }
      },
      "Transaction": {
        "type": "object",
        "required": [
          "security",
          "quantity",
          "date"
        ],
        "properties": {
          "security": {
            "$ref": "#/definitions/Security"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number",
            "default": 0
          },
          "fee": {
            "type": "number"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "commission": {
            "type": "number",
            "default": 0
          },
          "cashLinked": {
            "type": "boolean",
            "default": false
          },
          "advice": {
            "type": "string",
            "format": "uuid",
            "default": ""
          },
          "_id": {
            "type": "string",
            "format": "uuid",
            "default": ""
          }
        }
      },
      "TransactionsAction": {
        "type": "object",
        "required": [
          "preview",
          "action",
          "transactions"
        ],
        "properties": {
          "preview": {
            "type": "boolean",
            "default": true
          },
          "action": {
            "type": "string",
            "enum": [
              "add",
              "update",
              "delete"
            ],
            "default": "add"
          },
          "transactions": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/Transaction"
            }
          }
        }
      },
      "CreatePortfolio": {
        "type": "object",
        "required": [
          "name",
          "benchmark",
          "transactions",
          "preview"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "benchmark": {
            "$ref": "#/definitions/Security"
          },
          "transactions": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/Transaction"
            }
          },
          "preview": {
            "type": "boolean",
            "default": true
          },
          "setdefault": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "PortfolioDetail": {
        "type": "object",
        "required": [
          "positions",
          "cash",
          "positionType"
        ],
        "properties": {
          "startDate": {
            "type": "string",
            "format": "date"
          },
          "endDate": {
            "type": "string",
            "format": "date"
          },
          "positions": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/Position"
            }
          },
          "cash": {
            "type": "number",
            "default": 0
          },
          "positionType": {
            "type": "string",
            "default": "shares",
            "enum": [
              "shares",
              "notional"
            ]
          }
        }
      },
      "Portfolio": {
        "type": "object",
        "required": [
          "detail",
          "benchmark"
        ],
        "properties": {
          "name": {
            "type": "string",
            "default": ""
          },
          "detail": {
            "$ref": "#/definitions/PortfolioDetail"
          },
          "benchmark": {
            "$ref": "#/definitions/Security"
          }
        }
      },
      "Advice": {
        "type": "object",
        "required": [
          "name",
          "portfolio",
          "rebalance",
          "maxNotional",
          "investmentObjective"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "portfolio": {
            "$ref": "#/definitions/Portfolio"
          },
          "rebalance": {
            "type": "string",
            "enum": [
              "Daily",
              "Weekly",
              "Bi-Weekly",
              "Monthly",
              "Quartely"
            ]
          },
          "maxNotional": {
            "type": "integer",
            "enum": [
              10000,
              20000,
              50000,
              75000,
              100000,
              200000,
              300000,
              500000,
              750000,
              1000000
            ]
          },
          "investmentObjective": {
            "$ref": "#/definitions/InvestmentObjective"
          },
          "public": {
            "type": "boolean",
            "default": false
          },
          "contestOnly": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "Investor": {
        "type": "object"
      },
      "Advisor": {
        "type": "object"
      },
      "AdvisorProfile": {
        "type": "object",
        "properties": {
          "isCompany": {
            "type": "boolean",
            "default": false
          },
          "companyName": {
            "type": "string",
            "default": ""
          },
          "companyRegistrationNum": {
            "type": "string",
            "default": ""
          },
          "isSebiRegistered": {
            "type": "boolean",
            "default": false
          },
          "sebiRegistrationNum": {
            "type": "string",
            "default": ""
          },
          "webUrl": {
            "type": "string",
            "default": ""
          },
          "photoUrl": {
            "type": "string",
            "default": ""
          },
          "address": {
            "$ref": "#/definitions/Address"
          },
          "phone": {
            "type": "string",
            "default": ""
          },
          "linkedIn": {
            "$ref": "#/definitions/SocialProfile"
          },
          "facebook": {
            "$ref": "#/definitions/SocialProfile"
          },
          "twitter": {
            "$ref": "#/definitions/SocialProfile"
          }
        }
      },
      "Watchlist": {
        "type": "object",
        "required": [
          "name",
          "securities"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "securities": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/Security"
            }
          }
        }
      },
      "Address": {
        "type": "object",
        "properties": {
          "line1": {
            "type": "string",
            "default": ""
          },
          "line2": {
            "type": "string",
            "default": ""
          },
          "line3": {
            "type": "string",
            "default": ""
          },
          "city": {
            "type": "string",
            "default": ""
          },
          "state": {
            "type": "string",
            "default": ""
          },
          "pincode": {
            "type": "number"
          },
          "country": {
            "type": "string",
            "default": "IN"
          }
        }
      },
      "ApprovalMessage": {
        "type": "object",
        "required": [
          "message",
          "approved",
          "prohibit"
        ],
        "properties": {
          "message": {
            "type": "string"
          },
          "approved": {
            "type": "boolean"
          },
          "prohibit": {
            "type": "boolean"
          }
        }
      },
      "ApprovalMessageNew": {
        "type": "object",
        "required": [
          "message",
          "status"
        ],
        "properties": {
          "message": {
            "type": "string"
          },
          "status": {
            "type": "boolean"
          },
          "detail": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/Approval"
            }
          },
          "investmentObjective": {
            "$ref": "#/definitions/InvestmentObjective"
          }
        }
      },
      "Approval": {
        "type": "object",
        "required": [
          "field"
        ],
        "properties": {
          "field": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "requirements": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "InvestmentObjective": {
        "type": "object",
        "properties": {
          "goal": {
            "type": "object",
            "$ref": "#/definitions/Goal"
          },
          "sectors": {
            "type": "object",
            "$ref": "#/definitions/Sectors"
          },
          "portfolioValuation": {
            "type": "object",
            "$ref": "#/definitions/PortfolioValuation"
          },
          "capitalization": {
            "type": "object",
            "$ref": "#/definitions/Capitalization"
          },
          "userText": {
            "type": "object",
            "$ref": "#/definitions/UserText"
          }
        }
      },
      "Goal": {
        "type": "object",
        "required": [
          "field"
        ],
        "properties": {
          "field": {
            "type": "string"
          },
          "investorType": {
            "type": "string"
          },
          "suitability": {
            "type": "string"
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "Sectors": {
        "type": "object",
        "properties": {
          "detail": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "PortfolioValuation": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string",
            "enum": [
              "Growth",
              "Value",
              "Blend"
            ]
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "Capitalization": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string",
            "enum": [
              "Small Cap",
              "Mid Cap",
              "Large Cap"
            ]
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "UserText": {
        "type": "object",
        "properties": {
          "detail": {
            "type": "string"
          },
          "valid": {
            "type": "boolean",
            "default": false
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "SocialProfile": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "photoUrl": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          }
        }
      },
      "ContestEntry": {
        "type": "object",
        "required": [
          "name",
          "portfolio"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "portfolio": {
            "$ref": "#/definitions/Portfolio"
          }
        }
      },
      "Contest": {
        "type": "object",
        "required": [
          "name",
          "startDate",
          "endDate",
          "active",
          "rules"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "startDate": {
            "type": "string",
            "format": "date"
          },
          "endDate": {
            "type": "string",
            "format": "date"
          },
          "active": {
            "type": "boolean",
            "default": false
          },
          "rules": {
            "type": "object",
            "$ref": "#/definitions/ContestRules"
          }
        }
      },
      "ContestPatch": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "startDate": {
            "type": "string",
            "format": "date"
          },
          "endDate": {
            "type": "string",
            "format": "date"
          },
          "active": {
            "type": "boolean",
            "default": true
          },
          "rules": {
            "type": "object",
            "$ref": "#/definitions/ContestRules"
          }
        }
      },
      "ContestRules": {
        "type": "object",
        "required": [
          "prize",
          "ruleTemplateFileName"
        ],
        "properties": {
          "prize": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/ContestPrize"
            }
          },
          "ruleTemplateFileName": {
            "type": "string"
          }
        }
      },
      "ContestPrize": {
        "type": "object",
        "required": [
          "rank",
          "value"
        ],
        "properties": {
          "rank": {
            "type": "number"
          },
          "value": {
            "type": "number"
          }
        }
      },
      "StockPrediction": {
        "type": "object",
        "required": [
          "position",
          "startDate",
          "endDate",
          "target"
        ],
        "properties": {
          "position": {
            "type": "object",
            "$ref": "#/definitions/Position"
          },
          "startDate": {
            "type": "string",
            "format": "date"
          },
          "endDate": {
            "type": "string",
            "format": "date"
          },
          "target": {
            "type": "number"
          },
          "stopLoss": {
            "type": "number",
            "default": -1
          }
        }
      },
      "DailyContestPredictions": {
        "type": "object",
        "required": [
          "predictions"
        ],
        "properties": {
          "predictions": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/StockPrediction"
            }
          }
        }
      }
    }
  }