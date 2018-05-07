var CommonFunctions = $.import('../CommonFunctions.xsjslib');


function checkURL(RequestData, ConnectionMappingData)
{
    var oldURL = RequestData.ParamValue;
    var tempURL = [];
    tempURL = oldURL.split('##');
    var i, j;
    var selectQuery ="";
    var selectTable = "";
    var newURL ="";
    for (i = 0; i < tempURL.length; i++)
    {
        switch(tempURL[i])
        {
            case 'FIELDS':
                for (j = 0; j < ConnectionMappingData.length; j++)
                {
                    selectQuery = selectQuery + "+" + ConnectionMappingData[j].SourceField + ",";
                }
                selectQuery = selectQuery.substring(0, selectQuery.length - 1);
                newURL = oldURL.replace('##FIELDS##', selectQuery);
	            break;
	            
	        case 'TABLE':
	            selectTable = "+" + ConnectionMappingData[0].SourceTable;
	            newURL = newURL.replace('##TABLE##', selectTable);
        }
    }
    RequestData.ParamValue = newURL;
    return RequestData.ParamValue;
}










function getTokenData(Request, Dest, RequestData) 
{
	
	var client = new $.net.http.Client();
	var GRANT_TYPE = "grant_type=" + RequestData.RequestParamData.GRANT_TYPE;
	var CLIENT_ID = "client_id=" + RequestData.RequestParamData.CLIENT_ID;
	var CLIENT_SECRET = "client_secret=" + RequestData.RequestParamData.CLIENT_SECRET;
	var USERNAME = "username=" + RequestData.RequestParamData.USERNAME;
	var PASSWORD = "password=" + RequestData.RequestParamData.PASSWORD;
	
	Request.headers.set("Content-Type","application/x-www-form-urlencoded");
    Request.setBody(GRANT_TYPE+"&"+CLIENT_ID+"&"+CLIENT_SECRET+"&"+USERNAME+"&"+PASSWORD);
	
	client.request(Request, Dest);
	
	var response = client.getResponse();
	
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
	
	var token_type = parse_data.token_type;
	var token = parse_data.access_token;
	
	var tokenData = token_type + " " + token;
	
	return tokenData;
}

function getData(request, dest, tokenData) 
{
    var client = new $.net.http.Client();
    
	request.headers.set("Authorization",tokenData);
	
	client.request(request, dest);
	
	var response = client.getResponse();
	
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
	
	parse_data = parse_data.records;

    return parse_data;
}

function startProcess(conn, JobItemData)
{
    var TokenDestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "SF_Token");
	var TokenRequestData = CommonFunctions.getRequestData(conn, JobItemData, "token");
	var ConnectionMappingData = CommonFunctions.getConnectionMappingData(conn, JobItemData);
	var TokenDest = CommonFunctions.createDestination(TokenDestinationData);
	var TokenRequest = CommonFunctions.createRequest(TokenRequestData);
	var TokenData = getTokenData(TokenRequest, TokenDest, TokenRequestData);
	var DestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "SF_Data");
	var RequestData = CommonFunctions.getRequestData(conn, JobItemData, "query");
	checkURL(RequestData, ConnectionMappingData);
	var Dest = CommonFunctions.createDestination(DestinationData);
	var Request = CommonFunctions.createRequest(RequestData);
	var Data = getData(Request, Dest, TokenData);
	CommonFunctions.insertData(conn, Data, JobItemData, ConnectionMappingData);
}

