var express = require('express');
var app = express();

mysql = require("mysql"); 
    
console.log("getting connection")
// Create the connection. 
// Data is default to new mysql installation and should be changed according to your configuration. 
//var connection = mysql.createConnection({ 
//   user: "steve", 
//   password: "steve", 
//   database: "metocean",
//   host: "10.1.1.156"
//}); 
console.log("creating Server.")
    
app.use(express.static('public'));

var parseParams = function (req) {
      parameters = {}
      tparm = req.url.split("?")[1].split("&")
      for (var item in tparm) { 
          parameters[tparm[item].split("=")[0]] = tparm[item].split("=")[1]
      }
      return parameters;

}


app.get("/", function(req, res){
    res.sendFile("index.html")
});

app.get("/currentstatus", function(req, res) {
    var connection = mysql.createConnection({ 
       user: "steve", 
       password: "steve", 
       database: "metocean",
       host: "10.1.1.156"
    }); 
    connection.query('SELECT site, product, obs_type, status_code, status_text, disabled '+
            'FROM monitor_obs order by disabled, status_code desc, site, product;',
            function (error, rows, fields) {
        res.send(JSON.stringify(rows));
    });
    connection.end();
});

app.get("/editdata", function(req, res) {
    console.log(parseParams(req))
    var connection = mysql.createConnection({ 
       user: "steve", 
       password: "steve", 
       database: "metocean",
       host: "10.1.1.156"
    });
    params = parseParams(req)

    if (params.hasOwnProperty("site")) {
        connection.query('SELECT * FROM monitor_obs where site = \''+params.site+
                         '\' and product = \''+params.product+'\';',
                function (error, rows, fields) {
            res.send(JSON.stringify(rows));
        }); 
    }
    else {
        connection.query('SELECT site, product, obs_type, status_code, status_text, disabled '+
                'FROM monitor_obs order by disabled, status_code desc, site, product;',
                function (error, rows, fields) {
            res.send(JSON.stringify(rows));
        
    });
    };
    connection.end()
});

var server = app.listen(3000);

