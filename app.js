const express = require("express");  
const app = express();
var fs = require('fs');

app.use(express.static(__dirname + '/public'));
  
app.get('/data', (req, res) => {
   // res.header("Content-Type",'application/json');
   // res.sendFile(path.join(__dirname, 'chartdata.json'));
   fs.readFile('chartdata.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    res.send(JSON.stringify(obj));
  });
})
  
app.get("/", function(request, response){      
    response.sendFile(__dirname + "/index.html");
});
  
app.listen(3000);