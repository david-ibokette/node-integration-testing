import {GenericContainer, Network, StartedNetwork, StartedTestContainer} from "testcontainers";
import {Todo, TodoStatus} from "./index";
import axios from "axios";

describe('test suite', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000

    let network: StartedNetwork
    let mysqlContainer: StartedTestContainer
    let apiContainer: StartedTestContainer
    let apiUrl: string

    const text1 = 'Write unit tests'
    const text2 = 'Write integration tests'

    const todo1: Todo = {id: 1, text: text1, status: TodoStatus.Unchecked}
    const todo2: Todo = {id: 2, text: text2, status: TodoStatus.Unchecked}

    beforeAll(async () => {
        console.log("network")
        network = await new Network({name: 'test'}).start()

        console.log("mysql")
        mysqlContainer = await new GenericContainer('mysql:8')
            .withName('test_mysql')
            .withNetworkAliases('test_mysql')
            .withExposedPorts(3306)
            .withEnvironment({
                MYSQL_ROOT_PASSWORD: "password",
                MYSQL_DATABASE: "test",
            })
            .withNetwork(network)
            .start()

        console.log("api")
        apiContainer = await new GenericContainer('node:14')
            .withExposedPorts(3000)
            .withEnvironment({
                MYSQL_HOST: "test_mysql",
                MYSQL_PORT: "3306",
                MYSQL_USER: "root",
                MYSQL_DATABASE: "test",
                MYSQL_PASSWORD: "password",
            })
            .withBindMounts([
                {
                    // source: "node_modules",
                    source: "/Users/dibokette/IdeaProjects/node-integration-testing/node_modules",
                    target:"/node_modules"
                }, {
                    // source: "tsconfig.json",
                    source: "/Users/dibokette/IdeaProjects/node-integration-testing/tsconfig.json",
                    target:"/tsconfig.json",
                }, {
                    // source: "package.json",
                    source: "/Users/dibokette/IdeaProjects/node-integration-testing/package.json",
                    target:"/package.json",
                }, {
                    // source: "database.ts",
                    source: "/Users/dibokette/IdeaProjects/node-integration-testing/database.ts",
                    target:"/database.ts",
                }, {
                    // source: "index.ts",
                    source: "/Users/dibokette/IdeaProjects/node-integration-testing/index.ts",
                    target:"/index.ts",
                }
            ])
            .withCommand(['yarn', 'run', 'ts-node-dev', 'index'])
            .withNetwork(network)
            .start()

        apiUrl = `http://${apiContainer.getHost()}:${apiContainer.getMappedPort(3000)}`

        console.log("stream")
        const stream = await apiContainer.logs();
        stream
            .on("data", line => console.log(line))
            .on("err", line => console.error(line))
            .on("end", () => console.log("Stream closed"));
    })

    it('placeholder', async () => {
    })
    // afterAll(async () => {
    //     await apiContainer.stop()
    //     await mysqlContainer.stop()
    //     await network.stop()
    // })

    it('adds new todos', async () => {
        const response1 = await axios.post(`${apiUrl}/add-todo`, {text: text1})
        expect(response1.data).toEqual(todo1)

        const response2 = await axios.post(`${apiUrl}/add-todo`, {text: text2})
        expect(response2.data).toEqual(todo2)
    })

    it('gets existing todos', async () => {
        const response = await axios.get(`${apiUrl}/todos`)
        expect(response.data).toEqual([todo1, todo2])
    })

    it('checks todos', async () => {
        await axios.post(`${apiUrl}/check-todo`, {id: todo1.id})
        const response = await axios.get(`${apiUrl}/todos`)
        expect(response.data).toEqual([{...todo1, status: TodoStatus.Done}, todo2])
    })

    it('deletes todos', async () => {
        await axios.post(`${apiUrl}/delete-todo`, {id: todo1.id})
        const response1 = await axios.get(`${apiUrl}/todos`)
        expect(response1.data).toEqual([todo2])

        await axios.post(`${apiUrl}/delete-todo`, {id: todo2.id})
        const response2 = await axios.get(`${apiUrl}/todos`)
        expect(response2.data).toEqual([])
    })
})