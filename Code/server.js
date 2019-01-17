const express = require("express")
let path = require('path')
const fs = require('fs')

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/src'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})


// Endpoint for sending a video to the html page.
app.get('/video-feed-1', (req, res) => {
    const filePath = 'test/Ehhhhhhhhhhhhh.mp4'
  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range

    if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(filePath, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(filePath).pipe(res)
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})