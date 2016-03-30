var http = require('http');
 	mysql = require("mysql"); 
    
    console.log("getting connection")
    // Create the connection. 
    // Data is default to new mysql installation and should be changed according to your configuration. 
    console.log("creating Server.")

   var getStatus = function(req, res) {
      var connection = mysql.createConnection({ 
         user: "steve", 
         password: "steve", 
         database: "metocean",
         host: "10.1.1.156"
         }); 
      connection.query('SELECT site, product, obs_type, status_code, status_text, disabled, source  '+
                        'FROM monitor_obs mo '+
                        'LEFT OUTER JOIN obs_source os ON os.id = mo.site '+
                        '   AND os.type = mo.obs_type '+
                        '   AND mo.product like os.tag '+
                        'ORDER BY disabled, status_code desc, site, product;', function (error, rows, fields) { 
        req.on('end', function () {
            res.writeHead(200, {'Content-Type': 'html'});
        });
        var now = new Date()
        res.write( "<html><body>"+now.toUTCString()
                  +"<br><table border=\"1\" style=\"text-align:top\" >"
                  +"<tr><th>"
                  +"</th><th>site"
                  +"</th><th>product"
                  +"</th><th>type"
                  +"</th><th>status"
                  +"</th><th>Source"
                  +"</th><th>Status Description"
                  +"</th></tr>")
        for (var data in rows) {
            if (rows[data].disabled === 1) {
                res.write("<tr><td><a href=\"\edit?site="+rows[data].site+"&product="+rows[data].product+"\">Edit</a>"
                    +"</td><td>"+rows[data].site
                    +"</td><td>"+rows[data].product
                    +"</td><td>"+rows[data].obs_type
                    +"</td><td>Disabled"
                    +"</td><td>"+(rows[data].source || "")
                    +"</td><td></td></tr>");                
            }
            else {
                res.write("<tr><td><a href=\"\edit?site="+rows[data].site+"&product="+rows[data].product+"\">Edit</a>"
                    +"</td><td>"+rows[data].site
                    +"</td><td>"+rows[data].product
                    +"</td><td>"+rows[data].obs_type
                    +"</td><td>"+rows[data].status_code
                    +"</td><td>"+(rows[data].source || "")
                    +"</td><td><div style=\"overflow-y :scroll ; height:90px\">"
                        +rows[data].status_text
                    +"</div></td></tr>");
            }
        };

        res.write("</table></body></html>");
        res.end();
      });
      connection.end()
      };

      var editObsCheck = function(req, res) {
        if (req.url.split("?").length > 1) {
            parameters = parseParams(req);
        }
      var connection = mysql.createConnection({ 
         user: "steve", 
         password: "steve", 
         database: "metocean",
         host: "10.1.1.156"
         }); 

        connection.query('SELECT * FROM monitor_obs where site = \''+parameters.site+'\' and product = \''+parameters.product+'\';', function (error, rows, fields) { 
        req.on('end', function () {
            res.writeHead(200, {'Content-Type': 'text/html'});
        });
        for (var data in rows) {
            res.write( "<form action=\"save\"><table border=\"1\" style=\"text-align:top\" >"
               +"<tr><th>Attribute</th><th>Value</th><th>Description</th></tr>"
               +"<tr><td>site</td><td><input type=\"text\" name=\"site\" value=\""
               +rows[data].site+"\"></td><td>Name of the site to check the observations</td></tr>"
               +"<tr><td>product</td><td><input type=\"text\" name=\"product\" value=\""
               +rows[data].product+"\"></td><td>Name of the product</td></tr>\""
               +"<tr><td>type</td><td><select name=\"obs_type\">")
            if (rows[data].obs_type === 'aws') {
               res.write("<option selected value=\"aws\" >Meteo(aws) </option>"
                  +"<option value=\"cur\" >Current</option>"
                  +"<option value=\"wave\" >Wave</option></select>"
                  +"</td><td>Obs type to check: valid values are: aws, cur, wave</td></tr>");
            }
            else if (rows[data].obs_type === 'cur'){
               res.write("<option value=\"aws\" >Meteo(aws) </option>"
                  +"<option selected value=\"cur\" >Current</option>"
                  +"<option value=\"wave\" >Wave</option></select>"
                  +"</td><td>Obs type to check: valid values are: aws, cur, wave</td></tr>");
            }
            else if (rows[data].obs_type === 'wave'){
               res.write("<option value=\"aws\" >Meteo(aws) </option>"
                  +"<option value=\"cur\" >Current</option>"
                  +"<option selected value=\"wave\" >Wave</option></select>"
                  +"</td><td>Obs type to check: valid values are: aws, cur, wave</td></tr>");
            }
           
            if (rows[data].disabled === 1) {
               res.write("<tr><td>Initialize</td><td><input type=\"checkbox\" name=\"initialize\" "
                  +" checked=\"yes\"></td><td>Set True to automatically caclulate the below options.</td></tr>")
            }
            else {
               res.write("<tr><td>Initialize</td><td><input type=\"checkbox\" name=\"init\" >"
                  +"</td><td>Set True to automatically caclulate the below options.</td></tr>")
            }
            res.write("<tr><td>Obs Missed to warn</td><td><input type=\"text\" name=\"missed_to_warn\" value=\""
                  +rows[data].missed_to_warn+"\"></td><td>How many observations to miss before setting status to warning.</td></tr>"
                  +"<tr><td>Obs missed to alert</td><td><input type=\"text\" name=\"missed_to_alert\" value=\""
                  +rows[data].missed_to_alert+"\"></td><td>How many observations to miss before sending alarm emails.</td></tr>"
                  +"<tr><td>frequency</td><td><input type=\"text\" name=\"frequency\" value=\""
                  +rows[data].frequency+"\"></td><td>Frequency to check for obs missing.</td></tr>"
                  +"<tr><td>stride</td><td><input type=\"text\" name=\"stride\" value=\""
                  +rows[data].stride+"\"></td><td>Most common time between regularized observation times.</td></tr>"
                  +"<tr><td>Buffer</td><td><input type=\"text\" name=\"stride_buffer\" value=\""
                  +rows[data].stride_buffer+"\"></td><td>Buffer from now to number of strides to not check for obs.</td></tr>");
            if (rows[data].disabled === 1) {
                  res.write("<tr><td>disabled</td><td><input type=\"checkbox\" name=\"disabled\" "
                      +"checked=\"yes\"></th><td>Set True to disable checking of Obs</td></tr>");
            }
            else {
                  res.write("<tr><td>disabled</td><td><input type=\"checkbox\" name=\"disabled\" "
                      +"></th><td>Set True to disable checking of Obs</td></tr>");
            }
        };

        res.write("</table><input type=\"submit\" value=\"Submit\"></form>");
        res.end();
      });
      connection.end()
      }

      var newObsCheck = function(req, res) {
         req.on('end', function () {
            res.writeHead(200, {'Content-Type': 'text/html'});
         });
         res.write( "<form action=\"add\"><table border=\"1\" style=\"text-align:top\" >"
            +"<tr><th>Attribute</th><th>Value</th><th>Description</th></tr>"
            +"<tr><td>site</td><td><input type=\"text\" name=\"site\" "
            +"></td><td>Name of the site to check the observations</td></tr>"
            +"<tr><td>product</td><td><input type=\"text\" name=\"product\""
            +"></td><td>Name of the product</td></tr>\""
            +"<tr><td>type</td><td><select name=\"obs_type\">"
            +"<option selected value=\"aws\" >Meteo(aws) </option>"
            +"<option value=\"cur\" >Current</option>"
            +"<option value=\"wave\" >Wave</option></select>"
            +"</td><td>Obs type to check: valid values are: aws, cur, wave</td></tr>"
            +"<tr><td>Initialize</td><td><input type=\"checkbox\" name=\"initialize\" "
            +" checked=\"yes\"></td><td>Set True to automatically caclulate the below options.</td></tr>"
            +"<tr><td>Obs Missed to warn</td><td><input type=\"text\" name=\"missed_to_warn\" "
            +"></td><td>How many observations to miss before setting status to warning.</td></tr>"
            +"<tr><td>Obs Missed to Alert</td><td><input type=\"text\" name=\"missed_to_alert\" "
            +"\"></td><td>How many observations to miss before sending alarm emails.</td></tr>"
            +"<tr><td>frequency</td><td><input type=\"text\" name=\"frequency\" "
            +"\"></td><td>Frequency to check for obs missing.</td></tr>"
            +"<tr><td>stride</td><td><input type=\"text\" name=\"stride\" "
            +"\"></td><td>Most common time between regularized observation times.</td></tr>"
            +"<tr><td>Buffer</td><td><input type=\"text\" name=\"stride_buffer\" "
            +"></td><td>Buffer from now to number of strides to not check for obs.</td></tr>"
            +"<tr><td>disabled</td><td><input type=\"checkbox\" name=\"disabled\" "
            +"checked=\"yes\"></th><td>Set True to disable checking of Obs</td></tr>");
        res.write("</table><input type=\"submit\" value=\"Submit\"></form>");
        res.end();
      };

      var saveObsCheck = function(req, res) {
         if (req.url.split("?").length > 1) {
             parameters = parseParams(req);
         }

         if (!parameters.hasOwnProperty('disabled')) {
            parameters['disabled'] = 'off'
         }
         if (!parameters.hasOwnProperty('init')) {
            parameters['init'] = 'off'
         }

        updateList = ''
        for (var item in parameters) {
            if (item === 'site' || item === 'product' ) {
            }
            else if (item === 'disabled' || item === 'init') {
               if (parameters[item] === 'on') {
                  updateList += item+"="+"1, "
               }
               else {
                  updateList += item+"="+"0, "
               }
            }
            else if (item === 'obs_type') {
                  updateList += item+"='"+parameters[item]+"', "
               }
            else {
                  if (parameters[item] != null) {
                     updateList += item+"="+parameters[item]+", "
                  }
               }
            }
         var connection = mysql.createConnection({ 
            user: "steve", 
            password: "steve", 
            database: "metocean",
            host: "10.1.1.156"
            }); 
            
         updateStatement = "update monitor_obs set "+ updateList.substring(0, updateList.length-2)
                         + " where site = '"+parameters.site
                         +"' and product='"+parameters.product+"'"
         console.log(updateStatement)
         
        connection.query(updateStatement, function (error, rows, fields) { 
         req.on('end', function () {
             res.writeHead(200, {'Content-Type': 'text/html'});
         });
        });
        
        connection.end()
        
         res.writeHead(302, {
            'Location' : 'http://' + req.headers['host'] +"/status"
         });
      
        res.end()
      };
      
      var parseParams = function (req) {
            parameters = {}
            tparm = req.url.split("?")[1].split("&")
            for (var item in tparm) { 
                parameters[tparm[item].split("=")[0]] = tparm[item].split("=")[1]
            }
            return parameters;

      }

      var addObsCheck = function(req, res) {
         if (req.url.split("?").length > 1) {
             parameters = parseParams(req);
         }

         if (!parameters.hasOwnProperty('disabled')) {
            parameters['disabled'] = 'off'
         }
         if (!parameters.hasOwnProperty('init')) {
            parameters['init'] = 'off'
         }

         fieldList = ''
         valueList = ''
        for (var item in parameters) {
            if (item === 'disabled' || item === 'init') {
               fieldList += item  + ', ' 
               valueList += 1 + ', '
            }
            else {
               if (item === 'site' || item === 'product' || item === 'obs_type') {
                  fieldList += item  + ', ' 
                  valueList += "'"+parameters[item] + '\', '
               }
               else {
                  if (parameters[item] === null) {
                     fieldList += item  + ', '
                     valueList += parameters[item] + ', '
                  }
               }
            }
         }
         insertStatement = "insert into monitor_obs("+fieldList.substring(0, fieldList.length-2)
                         +") values ("+valueList.substring(0, valueList.length-2)+")";
         var connection = mysql.createConnection({ 
            user: "steve", 
            password: "steve", 
            database: "metocean",
            host: "10.1.1.156"
            }); 
         
         console.log(insertStatement);
         connection.query(insertStatement, function (error, rows, fields) { 
         connection.end()
         });
        
         res.writeHead(302, {
            'Location' : 'http://' + req.headers['host'] +"/status"
         });
      
        res.end()
      };
      
      var parseParams = function (req) {
            parameters = {}
            tparm = req.url.split("?")[1].split("&")
            for (var item in tparm) { 
                parameters[tparm[item].split("=")[0]] = tparm[item].split("=")[1]
            }
            return parameters;

      }
    
    http.createServer(function (req, res) {
        urlpath = req.url.split("?")[0]
        if (urlpath === "/" || urlpath === '/status')
        {
            getStatus(req, res);
        }
        else if (urlpath === "/edit")
        {
            editObsCheck(req, res)
        }
        else if (urlpath === "/save")
        {
            saveObsCheck(req, res)
        }
        else if (urlpath=== "/new")
        {
            newObsCheck(req, res)
        }
        else if (urlpath=== "/add")
        {
            addObsCheck(req, res)
        }
        else {
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end("path not known.");
        }
    }).listen(8081);

console.log('Server running at 8081');

