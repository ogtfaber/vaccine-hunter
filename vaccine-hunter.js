const dotenv = require('dotenv')
const cron = require('node-cron')
const express = require('express')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

// Setup important stuff
const app = express()
dotenv.config()

const hunt = async () => {
  try {
    const { stdout, stderr } = await exec('sh scripts/ca-hunt.sh')
    if (stdout) {
      const data = JSON.parse(stdout).responsePayloadData.data['CA']
      const availableCities = data.filter(d => d.status !== 'Fully Booked').map(d => d.city).join(', ')
      return availableCities
    }
  } catch (err) {
    console.error(err)
  }
}

cron.schedule('*/5  * * * *', function () {
  console.log('---------------------')
  console.log('Running Hunter')
  
  hunt().then((res) => {
    console.log('Checked ', new Date().toISOString())
    if (res) {
      exec('say vaccine found in ' + res)
    } else {
      // exec('say no vaccine found yet')
    }
  })
})

app.listen(process.env.PORT)
console.log(`Vaccine hunter has started on port ${process.env.PORT}`)
