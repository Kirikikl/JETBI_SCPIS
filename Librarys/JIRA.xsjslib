var CommonFunctions = $.import('../CommonFunctions.xsjslib');

function checkData (parse_data, ConnectionMappingData)
{
    try
    {
        var SourceField;
        var field, tempObj, fieldValue;
        var question = "?, ";
        var values = "";
        var tempValue;
        var setNull = "null, ";
        var parseSourceFields = [];
        for (var i = 0; i < ConnectionMappingData.length; i++)
        {
            SourceField = ConnectionMappingData[i].SourceField;
            var splitArr = SourceField.split('.');
            parseSourceFields[i] = splitArr; 
        }
        for (i = 0; i < parse_data.length; i++)
        {
            var entry = parse_data[i];
            for (var j = 0; j < parseSourceFields.length; j++)
            {
                tempValue = question;
                for (var k = 0; k < parseSourceFields[j].length; k++)
                {
                    field = parseSourceFields[j][k];
                    tempObj = entry[parseSourceFields[j][k]];
                    try
                    {
                        if (k > 0)
                        {
                            fieldValue = fieldValue[field];    
                        } else
                        {
                            fieldValue = tempObj;    
                        }    
                    } catch(err)
                    {
                        if (err.columnNumber === 28)   //Variable is underfined!!!
                        {
                            tempValue = setNull;
                        }    
                    }
                }
                values = values + tempValue;
            }
            var temp = values;
            values = "";
            //код для insert
        }        
    } catch(e)
    {
        var code = e.columnNumber;
    }
    return values;
}



function getData(request, dest, RequestData, ConnectionMappingData) 
{
    var client = new $.net.http.Client();
    
	request.headers.set("Authorization",RequestData.RequestParamData.Authorization);
	
	client.request(request, dest);
	
	var response = client.getResponse();
	
	var data = response.body.asString();
	
	var parse_data = JSON.parse(data);
	
	checkData(parse_data, ConnectionMappingData);
}

function startProcess(conn, JobItemData)
{
	var DestinationData = CommonFunctions.getDestinationData(conn, JobItemData, "JIRA");
	var RequestData = CommonFunctions.getRequestData(conn, JobItemData, "query");
	var ConnectionMappingData = CommonFunctions.getConnectionMappingData(conn, JobItemData);
	var Dest = CommonFunctions.createDestination(DestinationData);
	var Request = CommonFunctions.createRequest(RequestData);
	var Data = getData(Request, Dest, RequestData, ConnectionMappingData);
	//CommonFunctions.insertData(conn, Data, JobItemData, ConnectionMappingData);
}