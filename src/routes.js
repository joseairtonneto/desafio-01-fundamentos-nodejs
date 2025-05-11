import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select(
        'tasks',
        search
          ? {
              title: search,
              description: search,
            }
          : null
      )

      return res.end(JSON.stringify(tasks))
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title && !description)
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'Title or description are required' }))

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        update_at: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const [task] = database.select('tasks', { id })

      if (!task)
        return res.writeHead(400).end(JSON.stringify({ message: 'Task does not exists' }))

      if (!title && !description)
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'Title or description are required' }))

      database.update('tasks', id, {
        title: title ?? task.title,
        description: description ?? task.description,
      })

      return res.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task)
        return res.writeHead(400).end(JSON.stringify({ message: 'Task does not exists' }))

      database.update('tasks', id, {
        completed_at: !task.completed_at ? new Date() : null,
      })

      return res.writeHead(204).end()
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task)
        return res.writeHead(400).end(JSON.stringify({ message: 'Task does not exists' }))

      database.delete('tasks', id)

      return res.writeHead(204).end()
    },
  },
]
