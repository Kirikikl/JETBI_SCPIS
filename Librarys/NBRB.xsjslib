var CommonFunctions = $.import('../CommonFunctions.xsjslib');

function getData(request, dest) {
    
    var client = new $.net.http.Client();
	client.request(request, dest);
	var response = client.getResponse();
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
    
    var tempArr = [];
    var output_data = [];
    var k, i, temp;
    for (k = 0; k < parse_data.length; k++) 
    {
        temp = parse_data[k];
        for (i in temp) {
            if (temp.hasOwnProperty(i)) 
            {
                tempArr.push(temp[i]);
            }
        }
        output_data[k] = tempArr;
        tempArr = [];
    }
    return output_data;
}

function startProcess(conn, JobItemData)
{
	var DestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "NBRB");
	var RequestData = CommonFunctions.getRequestData(conn, JobItemData, "query");
	var ConnectionMappingData = CommonFunctions.getConnectionMappingData(conn, JobItemData);
	var Dest = CommonFunctions.createDestination(DestinationData);
	var Request = CommonFunctions.createRequest(RequestData);
	var Data = getData(Request, Dest);
	CommonFunctions.insertData(conn, Data, JobItemData, ConnectionMappingData);
}



