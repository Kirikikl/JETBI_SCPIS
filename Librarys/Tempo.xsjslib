var CommonFunctions = $.import('../CommonFunctions.xsjslib');

function getData(request, dest, RequestData) 
{
    var client = new $.net.http.Client();
    
	request.headers.set("Authorization",RequestData.RequestParamData.Authorization);
	
	client.request(request, dest);
	
	var response = client.getResponse();
	
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
	
    return parse_data;
}

function startProcess(conn, JobItemData)
{
	var DestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "Tempo");
	var RequestData = CommonFunctions.getRequestData(conn, JobItemData, "query");
	var ConnectionMappingData = CommonFunctions.getConnectionMappingData(conn, JobItemData);
	var Dest = CommonFunctions.createDestination(DestinationData);
	var Request = CommonFunctions.createRequest(RequestData);
	var Data = getData(Request, Dest, RequestData);
	CommonFunctions.insertData(conn, Data, JobItemData, ConnectionMappingData);
}