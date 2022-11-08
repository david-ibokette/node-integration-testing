import {GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait} from "testcontainers";
import {Todo, TodoStatus} from "./index";
import axios from "axios";
import {
    StartedDockerComposeEnvironment
} from "testcontainers/dist/docker-compose-environment/started-docker-compose-environment";
const path = require("path");
const { DockerComposeEnvironment } = require("testcontainers");

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
    let environment: StartedDockerComposeEnvironment;

    beforeAll(async () => {
        const composeFilePath = path.resolve(__dirname, "");
        const composeFile = "docker-compose.yml";

        environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
            .withEnvironment({
                MYSQL_HOST: "test_mysql",
                MYSQL_PORT: "3306",
                MYSQL_USER: "root",
                MYSQL_DATABASE: "test",
                MYSQL_PASSWORD: "password",
                MYSQL_ROOT_PASSWORD: "password",
            })
            .withWaitStrategy("mysql-1", Wait.forLogMessage("ready for connections"))
            .withWaitStrategy("api-1", Wait.forLogMessage("about to listen"))
            .up();

        try {
            mysqlContainer = environment.getContainer('mysql_1')
        } catch (e) {
            mysqlContainer = environment.getContainer('mysql-1')
        }

        try {
            apiContainer = environment.getContainer('api_1')
        } catch (e) {
            apiContainer = environment.getContainer('api-1')
        }

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
    afterAll(async () => {
        // await apiContainer.stop()
        // await mysqlContainer.stop()
        // await network.stop()
        await environment.down()
    })

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