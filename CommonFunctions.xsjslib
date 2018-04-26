// Подключение библиотек
var SF = $.import('Librarys/SF.xsjslib');
var NBRB = $.import('Librarys/NBRB.xsjslib');


// Открытие подключения к БД SAP HANA
function DBconnection() 
{
	var conn = $.db.getConnection();
	return conn;
}



// Закрытие conn, pstmt, rs
function closeDBconnection(closables) 
{  
    var closable;  
    var i;  
    for (i = 0; i < closables.length; i++) 
    {
        closable = closables[i];  
        if(closable) 
        {  
            closable.close();  
        }  
    }  
}



// Функция получения Job, его текстов, а также всех JobItem, которые входят в Job
function jobItemData(conn, iJob) 
{
    var count = "SELECT COUNT(*) FROM \"JETBI_SCPIS\".\"JOBITEM_DATA\" WHERE \"Version\" = 'A' AND \"JobID\" = " + iJob;
    var query = "SELECT \"ID\", \"JobID\", \"SourceSystemID\", \"JobItemOrder\", \"JobItemName\", \"fRecreateTable\", \"fRemoveDataBeforLoading\" \
                FROM \"JETBI_SCPIS\".\"JOBITEM_DATA\" WHERE \"Version\" = 'A' AND \"JobID\" = " + iJob +  " ORDER BY \"JobItemOrder\"";
	
    var pstmt = conn.prepareStatement(count);
	var rs = pstmt.executeQuery();
	if (!rs.next()) 
	{
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	else 
	{
	    count = rs.getString(1);
	    count = Number(count);
	}
	closeDBconnection([rs, pstmt]);

	
	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();
	var i, JobItemID, JobID, JobItemName, JobItemOrder, SourceSystemID, fRecreateTable, fRemoveDataBeforLoading;
	var JobItemData = [];
	
	for (i = 0; i < count; i++)
	{
    	if (!rs.next()) 
    	{
    		$.response.setBody( "Failed to retrieve data");
    		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	}
    	else 
    	{
    	    JobItemID = rs.getString(1);
    	    JobID = rs.getString(2);
    	    SourceSystemID = rs.getString(3);
    	    JobItemOrder = rs.getString(4);
    	    JobItemName = rs.getString(5);
            fRecreateTable = rs.getString(6);
            fRemoveDataBeforLoading = rs.getString(7);
            
    	    JobItemData[i] = {"JobItemID": JobItemID,
    	        "JobID": JobID, 
    	        "SourceSystemID": SourceSystemID, 
    	        "JobItemOrder": JobItemOrder, 
    	        "JobItemName": JobItemName,
    	        "fRecreateTable": fRecreateTable,
    	        "fRemoveDataBeforLoading": fRemoveDataBeforLoading};
    	}
	}
    return JobItemData;
}



// Функция получения параметров destination для запроса во внешнюю систему
function getDestinationData(conn, JobItemData, DestinationName)
{
    var count = "SELECT COUNT(*) FROM \"JETBI_SCPIS\".\"DESTINATION_NAME_DATA\" \
    WHERE \"Version\" = 'A' AND \"SourceSystemID\" = " + JobItemData.SourceSystemID + " AND \"DestinationName\" = '" + DestinationName + "'";
    
    var query = "SELECT \"DestinationName\", \"ParamName\", \"ParamValue\" FROM \"JETBI_SCPIS\".\"DESTINATION_NAME_DATA\" \
    WHERE \"Version\" = 'A' AND \"SourceSystemID\" = " + JobItemData.SourceSystemID + " AND \"DestinationName\" = '" + DestinationName + "'";
    
    var pstmt = conn.prepareStatement(count);
	var rs = pstmt.executeQuery();
	if (!rs.next()) 
	{
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	else 
	{
	    count = rs.getString(1);
	    count = Number(count);
	}
	closeDBconnection([rs, pstmt]);

	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();
	var i, DestinationName, ParamName, ParamValue;
	var Destination = [];
	var DestinationData = []; 
	
	for (i = 0; i < count; i++)
	{
    	if (!rs.next()) 
    	{
    		$.response.setBody( "Failed to retrieve data");
    		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	}
    	else 
    	{
    	    DestinationName = rs.getString(1);
    	    ParamName = rs.getString(2);
    	    ParamValue = rs.getString(3);

    	    Destination[ParamName] = ParamValue;
    	}
	}
    return Destination;
}



// Функция получения информации о запросе (название запроса, URL, Method) + дополнительные параметры для Body и/или Header
function getRequestData(conn, JobItemData, ParamName)
{
    var countRequest = "SELECT COUNT(*) FROM \"JETBI_SCPIS\".\"REQUEST_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemID\" = " + JobItemData.JobItemID + " AND \"ParamName\" = '" + ParamName + "'";
    
    var queryRequest = "SELECT \"ID\", \"ParamName\", \"ParamValue\", \"RequestMethod\" FROM \"JETBI_SCPIS\".\"REQUEST_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemID\" = " + JobItemData.JobItemID + " AND \"ParamName\" = '" + ParamName + "'";
    
    var pstmt = conn.prepareStatement(countRequest);
	var rs = pstmt.executeQuery();
	if (!rs.next()) 
	{
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	else 
	{
	    countRequest = rs.getString(1);
	    countRequest = Number(countRequest);
	}
	closeDBconnection([rs, pstmt]);

	
	pstmt = conn.prepareStatement(queryRequest);
	rs = pstmt.executeQuery();
	var i, RequestID, ParamName, ParamValue, RequestMethod;
	var RequestData = []; 
	
	for (i = 0; i < countRequest; i++)
	{
    	if (!rs.next()) 
    	{
    		$.response.setBody( "Failed to retrieve data");
    		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	}
    	else 
    	{
    	    RequestID = rs.getString(1);
    	    ParamName = rs.getString(2);
    	    ParamValue = rs.getString(3);
    	    RequestMethod = rs.getString(4);

    	    RequestData = {"RequestID": RequestID,
    	                   "ParamValue": ParamValue,
    	                   "RequestMethod": RequestMethod};
    	}
	}
	
	closeDBconnection([rs, pstmt]);
	
	var countParam = "SELECT COUNT(*) FROM \"JETBI_SCPIS\".\"REQUESTPARAMS_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemRequestID\" = " + RequestData.RequestID + " AND \"ParamType\" = 'Param'";
    
    var queryParam = "SELECT \"ParamName\", \"ParamValue\" FROM \"JETBI_SCPIS\".\"REQUESTPARAMS_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemRequestID\" = " + RequestData.RequestID + " AND \"ParamType\" = 'Param'";
    
    pstmt = conn.prepareStatement(countParam);
	rs = pstmt.executeQuery();
	if (!rs.next()) 
	{
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	else 
	{
	    countParam = rs.getString(1);
	    countParam = Number(countParam);
	}
	
	closeDBconnection([rs, pstmt]);

	
	pstmt = conn.prepareStatement(queryParam);
	rs = pstmt.executeQuery();
	ParamName = ""; ParamValue = "";
	var RequestParamData = []; 
	
	for (i = 0; i < countParam; i++)
	{
    	if (!rs.next()) 
    	{
    		$.response.setBody( "Failed to retrieve data");
    		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	}
    	else 
    	{
    	    ParamName = rs.getString(1);
    	    ParamValue = rs.getString(2);

    	    RequestParamData[ParamName] = ParamValue;
    	}
	}
	
	RequestData["RequestParamData"] = RequestParamData;
	
	closeDBconnection([rs, pstmt]);
	
    return RequestData;
}



// Функция получения таблицы мэппинга
function getConnectionMappingData(conn, JobItemData)
{
    var count = "SELECT COUNT(*) FROM \"JETBI_SCPIS\".\"CONNECTIONMAPPING_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemID\" = " + JobItemData.JobItemID;
    
    var query = "SELECT \"SourceTable\", \"SourceField\", \"TargetSchema\", \"TargetTable\", \"TargetField\", \"TargetFieldType\" FROM \"JETBI_SCPIS\".\"CONNECTIONMAPPING_DATA\" \
    WHERE \"Version\" = 'A' AND \"JobItemID\" = " + JobItemData.JobItemID;
    
    var pstmt = conn.prepareStatement(count);
	var rs = pstmt.executeQuery();
	if (!rs.next()) 
	{
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	else 
	{
	    count = rs.getString(1);
	    count = Number(count);
	}
	
	closeDBconnection([rs, pstmt]);

	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();
	var i, SourceTable, SourceField, TargetSchema, TargetTable, TargetField, TargetFieldType;
	var ConnectionMappingData = []; 
	
	for (i = 0; i < count; i++)
	{
    	if (!rs.next()) 
    	{
    		$.response.setBody( "Failed to retrieve data");
    		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	}
    	else 
    	{
    	    SourceTable = rs.getString(1);
    	    SourceField = rs.getString(2);
    	    TargetSchema = rs.getString(3);
            TargetTable = rs.getString(4);
            TargetField = rs.getString(5);
            TargetFieldType = rs.getString(6);
            
    	    ConnectionMappingData[i] = {"SourceTable": SourceTable,
    	                             "SourceField": SourceField,
    	                             "TargetSchema": TargetSchema,
    	                             "TargetTable": TargetTable,
    	                             "TargetField": TargetField,
    	                             "TargetFieldType": TargetFieldType};
    	}
	}
    return ConnectionMappingData;
}



function generateInsertQuery(ConnectionMappingData) {
    var question = "?, ";
    var values = "";
    var i;
    for (i = 0; i < ConnectionMappingData.length; i++) {
        values = values + question;
    }
    
    var ready_template_values = "(" + values.slice(0,-2) + ")";
    
    var get_insert_data_query = "INSERT INTO \"" + ConnectionMappingData[0].TargetSchema + "\". \"" + ConnectionMappingData[0].TargetTable + "\" VALUES " + ready_template_values;
    return get_insert_data_query;
}


function generateCreateTableQuery(conn, ConnectionMappingData) 
{
    var TargetField;
    var TargetFieldType;
    var Result = "";
    var i;
    for (i = 0; i < ConnectionMappingData.length; i++) {
        TargetField = ConnectionMappingData[i].TargetField;
        TargetFieldType = ConnectionMappingData[i].TargetFieldType;
        Result = Result + TargetField + " " + TargetFieldType + ",";
    }
    
    var brackets = "(" + Result.slice(0,-1) + ")";
    
    var table_schema = "\"" + ConnectionMappingData[0].TargetSchema + "\"" + "." + "\"" + ConnectionMappingData[0].TargetTable + "\"";
    
    var get_create_table_query = "CREATE TABLE " + table_schema + brackets;
    

    var pstmt = conn.prepareStatement(get_create_table_query);
    pstmt.execute();  
    conn.commit();
    closeDBconnection(pstmt);
}



function generateDropTableQuery(conn, ConnectionMappingData)
{
    var table_schema = "\"" + ConnectionMappingData[0].TargetSchema + "\"" + "." + "\"" + ConnectionMappingData[0].TargetTable + "\"";
    
    var get_drop_table_query = "DROP TABLE " + table_schema;
    
    var pstmt = conn.prepareStatement(get_drop_table_query);
    pstmt.execute();  
    conn.commit();
    closeDBconnection(pstmt);
}



function generateDeleteTableDataQuery(conn, ConnectionMappingData)
{
    var table_schema = "\"" + ConnectionMappingData[0].TargetSchema + "\"" + "." + "\"" + ConnectionMappingData[0].TargetTable + "\"";
    
    var get_delete_data_table_query = "TRUNCATE TABLE " + table_schema;
    
    var pstmt = conn.prepareStatement(get_delete_data_table_query);
    pstmt.execute();  
    conn.commit();
    closeDBconnection(pstmt);
}



function generateCheckTableQuery(conn, ConnectionMappingData)
{
    var table_schema = "\"" + ConnectionMappingData[0].TargetSchema + "\"" + "." + "\"" + ConnectionMappingData[0].TargetTable + "\"";
    
    var get_check_table_query = "SELECT * FROM " + table_schema + " LIMIT 0";
    
    return get_check_table_query;
}



function getStatusCode(msg) {
    var m = msg.match('\\:\\s(\\d+)\\s\\-');
    return (m) ? parseInt(m[1], 10) : null;
}


function insertData(conn, data, JobItemData, ConnectionMappingData) 
{
    var insertQuery = generateInsertQuery(ConnectionMappingData);
    var checkTableQuery = generateCheckTableQuery(conn, ConnectionMappingData);
    var pstmt;
    try
    {
        pstmt = conn.prepareStatement(checkTableQuery);
        pstmt.execute();  
        conn.commit();
        closeDBconnection(pstmt);
    } catch(e)
    {
        var code = getStatusCode(e.message);
        if (code === 259)
        {
            generateCreateTableQuery(conn, ConnectionMappingData);    
        }
    }
    
    if (JobItemData.fRecreateTable === "X")
    {
        generateDropTableQuery(conn, ConnectionMappingData);
        generateCreateTableQuery(conn, ConnectionMappingData);
    }
    
    if (JobItemData.fRemoveDataBeforLoading === "X")
    {
        generateDeleteTableDataQuery(conn, ConnectionMappingData);
    } 
    
    pstmt = conn.prepareStatement(insertQuery);
    var i,j;
    try
    {
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < ConnectionMappingData.length; j++) {
                switch (typeof data[i][j])
                {
                    case 'string':
                        pstmt.setString(j+1,data[i][j]);
                        break;
                    case 'number':
                        if ((data[i][j] % 1) === 0)
                        {
                            pstmt.setInt(j+1,data[i][j]);    
                        } else
                        {
                            pstmt.setDouble(j+1,data[i][j]);    
                        }
                        break;
                    case 'object':
                        pstmt.setNull(j+1,data[i][j]);
                        break;
                }
            }
            pstmt.execute();  
            conn.commit();
        }
        closeDBconnection(pstmt);    
    } catch(e)
    {
        code = getStatusCode(e.message);    
    }
}




function createDestination(TokenDestinationData)
{
    var Dest = $.net.http.readDestination(TokenDestinationData.destination_package, TokenDestinationData.destination_name);
    return Dest;
}



function createRequest(RequestData) {
    var Request;

    switch(RequestData.RequestMethod){
        case 'GET':
           Request = new $.web.WebRequest($.net.http.GET, RequestData.ParamValue);
	       break;
	   
	    case 'HEAD':
	       Request = new $.web.WebRequest($.net.http.HEAD, RequestData.ParamValue);
	       break;
	       
	    case 'POST':
	       Request = new $.web.WebRequest($.net.http.POST, RequestData.ParamValue);
	       break;
	       
	    case 'PUT':
	       Request = new $.web.WebRequest($.net.http.PUT, RequestData.ParamValue);
	       break;
	       
	    case 'DELETE':
	       Request = new $.web.WebRequest($.net.http.DELETE, RequestData.ParamValue);
	       break;
    }
    return Request;
}


// Функция выполнения JobItem
function startJobItem(conn, JobItemData)
{
    switch(JobItemData.SourceSystemID)
    {
        case '1':
            SF.startProcess(conn, JobItemData);
	        break;
	   
	    case '2':
	        break;
	       
	    case '3':
	        break;
	       
	    case '4':
	        NBRB.startProcess(conn, JobItemData);
	        break;
    } 
}



// Функция запуска Job
function startJob(jobID)
{
    var conn = DBconnection();
    
    var JobItemData = jobItemData(conn, jobID);
    for (var jiCounter = 0; jiCounter < JobItemData.length; jiCounter++)
    {
        startJobItem(conn, JobItemData[jiCounter], jiCounter);  
    }
    
    closeDBconnection(conn);
}