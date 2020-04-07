let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let request = require('request');
const path = require('path');
const Tabletop = require('tabletop'); //arjunvenkatraman added to load data from Google Sheets directly
let arrayWithData = [];
const app = express();
const port = process.env.PORT || 5000;
const datasrc = "SHEET" // "TSV" or "SHEET"
const approvedSheetName = 'People';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
const publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1KZtJDrmyam3LW4cK59ECbL7UKDzvQgWzaJAfyNK9XBI/edit?usp=sharing";

app.get('/', (req, res) => {
  res.send("Hello");
})

// Datasource check with datasrc var
app.get('/getBlockData', async (req, res) => {
  if (datasrc === "TSV") {
    let rawtsv = fs.readFileSync('./RawData/VideoData.tsv', 'utf8')
    let revisedJSON = await tsvJSON(rawtsv);
    fs.writeFileSync('./RawData/VideoData.json', JSON.stringify(revisedJSON, null, 2))
    console.log("Sending back TSV Response")
    res.send(revisedJSON)
  }
  if (datasrc === "SHEET") {
    let revisedJSON = await getSheetData();
    fs.writeFileSync('./RawData/VideoData.json', JSON.stringify(revisedJSON, null, 2))
    console.log("Sending Sheet Response")
    res.send(revisedJSON)
  }

})

// Pulling from Google Sheets with Tabletop
function getSheetData() {
  return new Promise((resolve) => {
    Tabletop.init({
      key: publicSpreadsheetUrl,
      callback: function(data, tabletop) {
        resolve(processSheetData(tabletop));
      },
      simpleSheet: true
    })
  })
}

//Cleaning up the sheet data
function processSheetData(tabletop) {
  if(tabletop.models[approvedSheetName]){
    let data = tabletop.models[approvedSheetName].elements;
    console.log(data[0])
    let newjson = {"states":{},"totalBlocks":0}
    data.map(currentline => {
        if(!isNaN(currentline['Latitude (°N)']) && !isNaN(currentline['Longitude (°E)'])) {
            if(newjson.states[currentline['State']] !== undefined) {
                newjson.states[currentline['State']].blocks.push({
                    link: "",//currentline['Content URL'],
                    caption: currentline['Name'],
                    //caption: currentline['Caption'],
                    //date: currentline['Event Date'],
                    //protestName: currentline['Protest Name'],
                    //eventType: currentline['Event Type'],
                    //eventLocation: currentline['Event Location'],
                    //sourceURL: currentline['Source URL']
                })
            }
            else {
                newjson.states[currentline['State']] = {
                    blocks: [{
                      link: "", //currentline['Content URL'],
                      caption: currentline['Name'],
                      //date: currentline['Event Date'],
                      //protestName: currentline['Protest Name'],
                      //eventType: currentline['Event Type'],
                      //eventLocation: currentline['Event Location'],
                      //sourceURL: currentline['Source URL']
                    }],
                    coordinates: {
                      latitude: currentline['Latitude (°N)'],
                      longitude: currentline['Longitude (°E)']
                    }
                }
            }
        }
    })
    let sortable = [];
    for (let city in newjson.states) {
        sortable.push([city, newjson.states[city]]);
    }
    sortable.sort((a,b) => (a[1].blocks.length > b[1].blocks.length) ? 1 : ((b[1].blocks.length > a[1].blocks.length) ? -1 : 0));
    let objSorted = {}
    sortable.forEach(function(item){
        objSorted[item[0]]=item[1]
    })
    newjson.states = objSorted
    newjson.totalBlocks = data.length;
    return (newjson)
  }
  else {
    console.log(`No sheet called ${approvedSheetName}`)
    return (`No sheet is called ${approvedSheetName}`)
  }
}

//Cleaning up the TSV data
function tsvJSON(tsv) {
  return new Promise((resolve, reject) => {
    var lines = tsv.split(/\r?\n/);
    let titleLine = lines.shift();
    let captionIndex = titleLine.split(/\t/).indexOf('Caption');
    let dateIndex = titleLine.split(/\t/).indexOf('Date');
    let latIndex = titleLine.split(/\t/).indexOf('Latitude (°N)');
    let longIndex = titleLine.split(/\t/).indexOf('Longitude (°E)');
    let linkIndex = titleLine.split(/\t/).indexOf('Link');
    let cityIndex = titleLine.split(/\t/).indexOf('City');
    let newjson = {"states":{},"totalBlocks":0}

    lines.map(line => {
        let currentline = line.split(/\t/);
        if(!isNaN(currentline['Latitude (°N)']) && !isNaN(currentline['Longitude (°E)'])) {
            if(newjson.states[currentline[cityIndex]] != undefined) {
                newjson.states[currentline[cityIndex]].blocks.push({
                    link: currentline[linkIndex],
                    caption: currentline[captionIndex],
                    date: currentline[dateIndex]
                })
            }
            else {
                newjson.states[currentline[cityIndex]] = {
                    videos: [{
                        link: currentline[linkIndex],
                        caption: currentline[captionIndex],
                        date: currentline[dateIndex]
                    }],
                    coordinates: {
                        latitude: currentline[latIndex],
                        longitude: currentline[longIndex]
                    }
                }
            }
        }
    })
    newjson.totalBlocks = lines.length;
    resolve(newjson);
    // reject({
    //   error: 'something went wrong in tsv to JSON conversion'
    // })
  })
}

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port: ${port}`));


//TWITTER EMBED API INFO
// app.post('/getTwitterEmbedInfo', async (req, res) => {
//     console.log("inside getTwitterEmbedInfo")
//     let reqUrl = await buildUrl('https://publish.twitter.com/oembed', {url: req.body.url,theme: 'dark',widget_type: 'video'})
//     request( {url: reqUrl}, (err, resp, body) => {
//         let bodyJSON = JSON.parse(body);
//         console.log(bodyJSON)
//         res.send(bodyJSON)
//     })
// })

// function buildUrl(url, parameters) {
//     return new Promise((resolve, reject) => {
//         let qs = "";
//         for (const key in parameters) {
//             if (parameters.hasOwnProperty(key)) {
//                 const value = parameters[key];
//                 qs +=
//                     encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
//             }
//         }
//         if (qs.length > 0) {
//             qs = qs.substring(0, qs.length - 1); //chop off last "&"
//             url = url + "?" + qs;
//         }
//         console.log(url);
//         resolve(url);
//     })
// }
