let request = require('request');
let async = require('async');
let appConfig = require('./config.js')['appConfig'];

module.exports.fetchDataFromProviders = function(cb){
  async.map(appConfig.provider_url(), function(url, callback) {
    request(url, function(err, response, body) {
      if (err) {
        callback(err);
      } else {
        if(response.statusCode === 200){
          callback(null, JSON.parse(body)['results']);
        } else {
          console.log('ERROR: Request processing failed for ', url);  
          callback(null, false);
        }
      }
    });
  }, function(err, aggregatedResult) {
      if (err) {
        cb(err);
      }
      
      var inputArr = [];
      var tempOutputArr = [];
      var partionStartIndex = []; 
      var partionEndIndex = [];

      // aggregatedResult is an array containing response from all providers and 'false' for failed request. So before processing the results just removing the 'false'
      aggregatedResult = aggregatedResult.filter((value) => value !== false);

      // Merging all response arrays into one array and tracking the reponse start and end indexes in final array
      for(var i = 0; i < aggregatedResult.length; i++) {
        for(var j = 0; j < aggregatedResult[i].length; j++) {
          inputArr.push(aggregatedResult[i][j]);
        }
        if(i == 0) {
          partionStartIndex[i] = 0;
          partionEndIndex[i] = aggregatedResult[i].length - 1;
        } else {
          partionStartIndex[i] = partionStartIndex[i-1] + aggregatedResult[i-1].length;
          partionEndIndex[i] = partionStartIndex[i] + aggregatedResult[i].length - 1;
        }  

      }

      // merge all the partitions 
      let noOfPartitions = partionStartIndex.length;

      while(noOfPartitions > 1) {
        // Merging 2 providers at a time
        for(let p = 0; p < partionStartIndex.length-1; p += 2) {
          merge(inputArr, tempOutputArr, partionStartIndex[p], partionEndIndex[p], partionStartIndex[p+1], partionEndIndex[p+1]);

          // This will prepare for next round of partion merging
          partionStartIndex[p/2] = partionStartIndex[p];
          partionEndIndex[p/2] = partionEndIndex[p+1];
        }

        noOfPartitions = noOfPartitions % 2 == 0 ? parseInt(noOfPartitions / 2) : parseInt(noOfPartitions / 2) + 1;

        // Removing processed partion start and end indexes
        if(partionStartIndex.length % 2 == 0) {
          partionStartIndex.splice(partionStartIndex.length/2);
          partionEndIndex.splice(partionEndIndex.length/2);
        } else {
          let startInt = parseInt(partionStartIndex.length/2);
          partionStartIndex.splice(startInt, startInt);
          let endInt = parseInt(partionEndIndex.length/2);
          partionEndIndex.splice(endInt, endInt);
        }
      }
      cb(null,inputArr)
    });

  // Merging 2 provider's result based on the 'ecstasy'
  function merge(inputArr, tempOutputArr, part1StartIndex, part1EndIndex, part2StartIndex, part2EndIndex) {
    let outputArrIndex = 0;
    let part1Start = part1StartIndex;
    
    while(part1StartIndex <= part1EndIndex && part2StartIndex <= part2EndIndex) {

      if(inputArr[part1StartIndex]['ecstasy'] > inputArr[part2StartIndex]['ecstasy']) {
        tempOutputArr[outputArrIndex++] = inputArr[part1StartIndex++];
      } else {
        tempOutputArr[outputArrIndex++] = inputArr[part2StartIndex++];
      }
    }

    while (part1StartIndex <= part1EndIndex) {
      tempOutputArr[outputArrIndex++] = inputArr[part1StartIndex++];
    }

    while (part2StartIndex <= part2EndIndex) {
      tempOutputArr[outputArrIndex++] = inputArr[part2StartIndex++];
    }    
    
    for(var j=0; j<outputArrIndex; j++) {
      inputArr[part1Start+j] = tempOutputArr[j];
    }
  }
}

