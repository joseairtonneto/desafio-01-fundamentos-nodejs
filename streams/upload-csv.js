import fs from 'node:fs'
import { parse } from 'csv-parse'

const csvPath = new URL('tasks.csv', import.meta.url)

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2,
})

async function uploadCSV() {
  const lines = stream.pipe(csvParse)

  for await (const line of lines) {
    const [title, description] = line

    console.log(JSON.stringify({ title, description }))

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
  }
}

uploadCSV()
