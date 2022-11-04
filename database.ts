import retry from 'async-retry'
import {createPool, RowDataPacket} from 'mysql2/promise'

import {Todo, TodoStatus} from './index'

const TABLE_NAME = 'todos'

enum TableColumn {
  Id = 'id',
  Text = 'text',
  Status = 'status',
}

const pool = createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

export function initialize() {
  return new Promise(async resolve => {
    const x = {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    }
    console.log(`2 pool is ${JSON.stringify(x)}`)
    console.log("1 Creating table")
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        ${TableColumn.Id} INT NOT NULL UNIQUE AUTO_INCREMENT,
        ${TableColumn.Text} VARCHAR(255) NOT NULL,
        ${TableColumn.Status} INT NOT NULL,
        PRIMARY KEY (${TableColumn.Id})
        ) ENGINE=InnoDB;
        `).catch(e => {
         console.log(`error: ${e}`)
    })
    resolve(null)
  })
}

// export async function initialize() {
//     const x = {
//       host: process.env.MYSQL_HOST,
//       port: Number(process.env.MYSQL_PORT),
//       user: process.env.MYSQL_USER,
//       password: process.env.MYSQL_PASSWORD,
//       database: process.env.MYSQL_DATABASE,
//     }
//     console.log(`2 pool is ${JSON.stringify(x)}`)
//     console.log("1 Creating table")
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
//                                                  ${TableColumn.Id} INT NOT NULL UNIQUE AUTO_INCREMENT,
//                                                  ${TableColumn.Text} VARCHAR(255) NOT NULL,
//                                                  ${TableColumn.Status} INT NOT NULL,
//                                                  PRIMARY KEY (${TableColumn.Id})
//       ) ENGINE=InnoDB;
//     `)
// }

export async function insertTodo(text: string): Promise<Todo> {
  const [row] = await pool.query(
    `
    INSERT INTO ${TABLE_NAME} (${TableColumn.Status}, ${TableColumn.Text})
    VALUES (?, ?);
    `,
    [TodoStatus.Unchecked, text]
  )

  return {
    id: (row as any).insertId,
    text,
    status: TodoStatus.Unchecked,
  }
}

export async function checkTodo(id: string) {
  await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET ${TableColumn.Status} = ${TodoStatus.Done}
    WHERE ${TableColumn.Id} = ?;
    `,
    [id]
  )
}

export async function deleteTodo(id: string) {
  await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET ${TableColumn.Status} = ${TodoStatus.Deleted}
    WHERE ${TableColumn.Id} = ?;
    `,
    [id]
  )
}

export async function getTodos(): Promise<Todo[]> {
  const [rows] = await pool.query(
    `
    SELECT * FROM ${TABLE_NAME}
    WHERE ${TableColumn.Status} != ${TodoStatus.Deleted};
    `
  )

  return (rows as RowDataPacket[]).map(row => {
    return {
      id: row[TableColumn.Id],
      text: row[TableColumn.Text],
      status: row[TableColumn.Status],
    }
  })
}
