let express = require('express');
let helpers = require('./helpers');

let app = express()

app.get('/hotels/search', function (req, res) {
  helpers.fetchDataFromProviders((error, results) => {
    if(error) {
      res.send({error: error});
    }
    res.send({results:results});
  });
});

app.listen(8000, function () {
  console.log('Hipmunk App listening on port 8000');
});
