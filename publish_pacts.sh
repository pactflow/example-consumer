export $(cat .env | xargs)

GIT_COMMIT="$(git rev-parse HEAD)"
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli"
${PACT_CLI} publish ${PWD}/pacts --consumer-app-version ${GIT_COMMIT} --branch ${GIT_BRANCH}
