const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json" 
    };
    
    let reqsJson;
    
    try{
        switch (event.routeKey) {
        case 'POST /items':
            reqsJson = JSON.parse(event.body);
            await dynamo
                .put({
                    TableName: "Product",
                    Item: {
                        id: reqsJson.id,
                        price: reqsJson.price,
                        name: reqsJson.name
                    }
                })
                .promise();
            body = `Put item ${reqsJson.id}`;
            break;
            
        case 'DELETE /items/{id}':
           console.log(event.pathParameters.id);
            await dynamo
                .delete({
                    TableName: "Product",
                    Key: {
                        id: event.pathParameters.id
                    }
                })
                .promise();
            body = `Deleted item ${event.pathParameters.id}`;
            break;
            
        case 'GET /items/{id}':
          
          body =  await dynamo
                .get({
                    TableName: "Product",
                    Key: {
                        id: event.pathParameters.id
                    }
                })
                .promise();
            break;
            
        case 'GET /items':
            body = await dynamo.scan({ TableName: "Product"}).promise();
            break;
            
        case 'PUT /items/{id}':
            reqsJson = JSON.parse(event.body);
            await dynamo
                .update({
                    TableName: "Product",
                    Key: {
                        id: event.pathParameters.id
                    },
                    UpdateExpression: 'set price = :r',
                    ExpressionAttributeValues: {
                        ':r': reqsJson.price,
                    },
                })
                .promise();
            body = `Put item ${event.pathParameters.id}`;
            break;
            
        default:
            throw new Error(`Unsupported route: "${event.routeKey}"`);
    }    
    }catch(e){
        statusCode = 400;
        body = e.message;
    }
    finally{
        body = JSON.stringify(body);
    }
    
    return {
      statusCode,
      body,
      headers
      }; 
};
