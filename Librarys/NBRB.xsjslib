var CommonFunctions = $.import('../CommonFunctions.xsjslib');

function getData(request, dest, ConnectionMappingData) 
{
    var i, j, jsonKeyNames, insertQuery;
    var conMapKeyNames = [];
    var client = new $.net.http.Client();
	client.request(request, dest);
	var response = client.getResponse();
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
	for (i = 0; i < parse_data.length; i++)
	{
	    jsonKeyNames = Object.keys(parse_data[i]);
	    for (j = 0; j < ConnectionMappingData.length; j++)
	    {
	        conMapKeyNames[j] = ConnectionMappingData[j].SourceField;    
	    }
	    
	    var question = "?, ";
	    var setNull = "null, ";
        var values = "";
        var k, l;
        for (k = 0; k < conMapKeyNames.length; k++) 
        {
            l = 0;
            if (jsonKeyNames[l] === conMapKeyNames[k])
            {
                values = values + question;
                l++;
            } else
            {
                values = values + setNull;
                
            }
        }
        var ready_template_values = "(" + values.slice(0,-2) + ")";
        var k = 0;
	}
    /*var tempArr = [];
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
    }*/
    return parse_data;
}

function startProcess(conn, JobItemData)
{
	var DestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "NBRB");
	var RequestData = CommonFunctions.getRequestData(conn, JobItemData, "query");
	var ConnectionMappingData = CommonFunctions.getConnectionMappingData(conn, JobItemData);
	var Dest = CommonFunctions.createDestination(DestinationData);
	var Request = CommonFunctions.createRequest(RequestData);
	var Data = getData(Request, Dest, ConnectionMappingData);
	//CommonFunctions.insertData(conn, Data, JobItemData, ConnectionMappingData);
}



