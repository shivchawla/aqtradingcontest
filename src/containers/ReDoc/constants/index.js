export const apiSpec = {
    "swagger": "2.0",
    "info": {
      //"description": "AdviceQube API publisher",
      "version": "1.0.0",
      "title": "AdviceQube Stock Prediction API",
      "termsOfService": "http://www.adviceqube.com/policies/tnc",
      "contact": {
        "email": "support@adviceqube.com"
      },
      // "license": {
      //   "name": "Apache 2.0",
      //   "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      // }
    },
    "host": "api.adviceqube.com",
    "basePath": "/api/v2",
    "tags": [
      {
        "name": "Stock Prediction",
        "description": "Set of REST APIs to create, get and exit stock prediction. Use these API to programmatically create and manage predictions from any source",
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
            "Stock Prediction"
          ],
          "summary": "Add stock predictions",
          "description": "Add stock predictions",
          "operationId": "updateDailyContestPredictions",
          "security": [
            {
              "Authorization Token": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "Authorization Token",
              "type": "string",
              "required": true
            },
            {
              "name": "body",
              "in": "body",
              "required": true,
              "description": "schema body",
              "schema": {
                "$ref": "#/definitions/DailyContestPredictions"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Request"
            },
            "403": {
              "description": "Invalid Authorization Token"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        },

        "get": {
          "tags": [
            "Stock Prediction"
          ],
          "summary": "Get stock predictions",
          "description": "Get stock predictions based on chosen category (all/ended/started) on a date",
          "operationId": "getDailyContestPredictions",
          "security": [
            {
              "Authorization Token": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "Authorization Token",
              "type": "string",
              "required": true
            },
            {
              "name": "date",
              "in": "query",
              "type": "string",
              "format": "date",
              "description": "Date for which prediction are required in yyyy-mm-dd  format",
              "required": false
            },
            {
              "name": "category",
              "in": "query",
              "type": "string",
              "description": "status of prediction",
              "default": "all",
              "enum": ["started", "ended", "all"],
              "required": false
            }
          ],
          
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Request"
            },
            "403": {
              "description": "Invalid Authorization Token"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      },
      "/dailycontest/exitPrediction": {
        "post": {
          "tags": [
            "Stock Prediction"
          ],
          "summary": "Exit stock prediction",
          "description": "Exit stock predictions",
          "operationId": "exitDailyContestPrediction",
          "security": [
            {
              "Authorization Token": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "Authorization Token",
              "type": "string",
              "required": true
            },
            {
              "name": "predictionId",
              "in": "query",
              "description": "prediction id",
              "type": "string",
              "required": true
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Request"
            },
            "403": {
              "description": "Invalid Authorization Token"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      },
      "/dailycontest/portfoliostats": {
        "get": {
          "tags": [
            "Stock Prediction"
          ],
          "summary": "Get the portfolio metrics",
          "description": "Use this API to check portfolio metrics like Net Equity, Net Cash, Available Cash etc.",
          "operationId": "getDailyContestPortfolioStatsForDate",
          "security": [
            {
              "Authorization Token": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "Authorization Token",
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
            }
          ],
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Request"
            },
            "403": {
              "description": "Invalid Authorization Token"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      },
      "/dailycontest/stats": {
        "get": {
          "tags": [
            "Stock Prediction"
          ],
          "summary": "Get stock prediction statistics",
          "description": "Get stock prediction stats like Average PnL, Max PnL, Min PnL etc.",
          "operationId": "getDailyContestStats",
          "security": [
            {
              "Authorization Token": []
            }
          ],
          "parameters": [
            {
              "name": "aimsquant-token",
              "in": "header",
              "description": "Authorization Token",
              "type": "string",
              "required": true
            },
            {
              "name": "symbol",
              "in": "query",
              "type": "string",
              "description": "Optional stock ticker for ticker specific stats",
              "required": false
            }
          ],
          
          "responses": {
            "200": {
              "description": "OK"
            },
            "400": {
              "description": "Invalid Request"
            },
            "403": {
              "description": "Invalid Authorization Token"
            }
          },
          "x-swagger-router-controller": "DailyContest"
        }
      }
    },

    "securityDefinitions": {
      "Authorization Token": {
        "type": "apiKey",
        "name": "aimsquant-token",
        "in": "header"
      }
    },
    "definitions": {
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