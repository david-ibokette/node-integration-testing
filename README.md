<div align="center">
  <h1>This is a copy of the repo from the below youtube tutorial. My repo has considerable deviations from the original author's repo for a few reasons:</h1>
  <div>1) The original repo used a version of the testcontainers-node API which was quite old. Instead of trying to fish out what older version to use, I simply applied the code to the newer version - which had some significant differneces.</div>
  <div>2) yarn versions also seemed to be off when trying Github actions.</div>
</div>
<hr/>
<div align="center">
  <a href="https://github.com/flolu/auth">
    <img width="100px" height="auto" src="./.github/check.png" />
  </a>
  <br>

  <h1>Integration Testing</h1>
  <p>Example for Easy and Effective Integration Testing with Node.js and Testcontainers</p>
  <a href="https://youtu.be/eRPkNd40n94">
    <img width="320px" height="180px" src="https://img.youtube.com/vi/eRPkNd40n94/mqdefault.jpg" style="border-radius: 1rem;" />
    <p>Watch the YouTube Tutorial</p>
  </a>
</div>

# Usage

**Recommended OS**: Linux

**Requirements**: Yarn, Node.js

**Optional**: Docker, Docker Compose

**Setup**

- `yarn install`

**Development**

- `make dev` or `yarn dev` (Start development backend services, http://localhost:3000)

# Codebase

- [`index.ts`](index.ts) entry point to a simple todo management Node.js API
- [`docker-compose.yml`](docker-compose.yml) to start the backend for development

# Testing

- `yarn ts-node node_modules/jasmine/bin/jasmine --random=false index.test.ts # running in testcontainers!` 

# Credits

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

