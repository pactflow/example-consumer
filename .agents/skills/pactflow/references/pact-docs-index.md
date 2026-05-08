# Pact Documentation Index

> Source: https://docs.pact.io/llms.txt — Fast and reliable testing for your APIs and microservices during development. Safety during deployment.

All pages below are available at `https://docs.pact.io/{path}` and as clean markdown at `https://docs.pact.io/{path}.md`.

---

## Getting Started

- [5 minute guide](/5-minute-getting-started-guide.md): From zero to running Pact tests in 5 mins
- [Conceptual Overview](/getting_started/conceptual_overview.md): Using Pact successfully requires you to understand how Pact works and the concepts and terminology behind Pact.
- [Terminology](/getting_started/terminology.md): Service Consumer, Service Provider, Mock Service Provider, Interaction, Pact file, Pact verification, Provider state, Pact specification, Pact Broker, PactFlow, The Matrix, Can-I-Deploy, Pacticipant.
- [How Pact works](/getting_started/how_pact_works.md): Consumer testing, provider verification, putting it all together. Also covers Message Pact for async systems.
- [Matching](/getting_started/matching.md): Regular expressions, type matching, flexible length arrays, query params.
- [Gotchas](/getting_started/matching/gotchas.md): Pact follows Postel's law — be liberal in what you accept.
- [Provider states](/getting_started/provider_states.md): Preconditions for test scenarios. Analog of `Given` in Cucumber.
- [Provider verification](/getting_started/provider_verification.md): What is it? How to run it. Best practices.
- [Sharing Pacts with the Pact Broker](/getting_started/sharing_pacts.md): Consumer CI generates pact files; provider CI generates verification results. These artifacts must be shared.
- [Pact Specification](/getting_started/specification.md): V1–V4 specification versions and language support.
- [Local API stubs](/getting_started/stubs.md): Use Pact contracts as locally running API stubs.
- [Testing scope](/getting_started/testing-scope.md): What scope should Pact tests cover?
- [Verifying Pacts](/getting_started/verifying_pacts.md): Replaying requests from pact files against the provider.
- [Versioning in the Pact Broker](/getting_started/versioning_in_the_pact_broker.md): How application version numbers should be set. Best practices.
- [When to use Pact](/getting_started/what_is_pact_good_for.md): Good fits and bad fits for contract testing.
- [Comparisons with other tools](/getting_started/comparisons.md): How Pact differs from Spring Cloud Contract, Swagger, etc.
- [Further reading](/getting_started/further_reading.md): Talks, presentations, books.

---

## Consumer Guide

- [Writing Consumer tests](/consumer.md): The Golden Rule. Focus on the messages, not the behaviour. Use matchers. Avoid UI testing. Isolated unit tests only.
- [Contract Tests vs Functional Tests](/consumer/contract_tests_not_functional_tests.md): Contract tests check messages, not side effects. Don't use Pact to test business logic.
- [Recommended configuration for publishing pacts](/consumer/recommended_configuration.md): Branch-based workflow. Always publish with a branch name. Tag with environment after deploy.
- [Using Pact to support UI testing](/consumer/using_pact_to_support_ui_testing.md): Use generated pacts as HTTP stubs for UI tests, not the other way around.

---

## Provider Guide

- [Verifying Pacts](/provider.md): Run against a locally running provider. Stub downstream dependencies. Publish results to broker.
- [Handling authentication and authorization](/provider/handling_auth.md): Stub auth services, use hardcoded credentials, provider states, or request filters.
- [Help! My pact verification tests are failing](/provider/how_to_fix_failing_verification_tests.md): Step-by-step debug guide for Ruby/JS/Python/Go/Swift and JVM.
- [Recommended configuration for verifying pacts](/provider/recommended_configuration.md): Consumer version selectors, pending pacts, WIP pacts. Full JS and Ruby examples.
- [Using provider states effectively](/provider/using_provider_states_effectively.md): Avoid false positives. Echo query params in responses. Use multiple data points in provider states.

---

## Pact Broker

- [Introduction](/pact_broker.md): Application for sharing consumer driven contracts and verification results.
- [Overview](/pact_broker/overview.md): How the Pact Broker supports contract testing.
- [Quick start guide](/pact_broker/quick_start.md)
- [Set up Checklist](/pact_broker/set_up_checklist.md): High-level checklist for setting up an integration.
- [Versioning in the Pact Broker](/pact_broker/pacticipant_version_numbers.md): Version numbers, how pact content is versioned behind the scenes.
- [Publishing and retrieving pacts](/pact_broker/publishing_and_retrieving_pacts.md)
- [Branches](/pact_broker/branches.md): First-class branch support from v2.82.0. Supersedes tags for branch tracking.
- [Recording deployments and releases](/pact_broker/recording_deployments_and_releases.md): `record-deployment` vs `record-release`. When to use each. Migration from tags.
- [Tags](/pact_broker/tags.md): Legacy; superseded by branches and environments. Still supported.
- [Can I Deploy](/pact_broker/can_i_deploy.md): The Pact Matrix. CLI usage. Exit codes. Examples. Tags vs environments.
- [Webhooks](/pact_broker/webhooks.md): Trigger provider builds when pacts change. Events: `contract_published`, `contract_requiring_verification_published`, `verification_published`.
- [Debugging webhooks](/pact_broker/webhooks/debugging_webhooks.md)
- [Dynamic variable substitution](/pact_broker/webhooks/dynamic_variable_sub.md): `${pactbroker.consumerName}`, `${pactbroker.providerName}`, etc.
- [Webhooks template library](/pact_broker/webhooks/template_library.md): GitHub Actions, CircleCI, GitLab, Jenkins, Travis CI examples.
- [Terraform Provider](/pact_broker/terraform_provider.md): Automate Pact Broker configuration with Terraform.
- [Configuration settings](/pact_broker/configuration/settings.md): Full list of Pact Broker config options.
- [Docker images](/pact_broker/docker_images.md): `pactfoundation/pact-broker` on Dockerhub.
- [Kubernetes / Helm](/pact_broker/kubernetes.md): Deploy with Helm.
- [Administration](/pact_broker/administration.md): HAL Browser, deleting resources, maintenance.
- [Changelog](/pact_broker/changelog.md)

### Pact Broker — Advanced Topics

- [Consumer Version Selectors](/pact_broker/advanced_topics/consumer_version_selectors.md): `mainBranch`, `branch`, `deployedOrReleased`, `deployed`, `released`, `matchingBranch`, `environment`, `tag`, `latest`, `consumer`. Recommended and advanced examples.
- [Pending pacts](/pact_broker/advanced_topics/pending_pacts.md): Protects provider builds from new consumer interactions. Enable with `enablePending: true`.
- [Work In Progress pacts](/pact_broker/advanced_topics/wip_pacts.md): Auto-verifies new pacts in the provider's main pipeline. Enable with `includeWipPactsSince`.
- [Matrix selectors](/pact_broker/advanced_topics/matrix_selectors.md): Advanced query syntax for the verification matrix.
- [Provider verification badges](/pact_broker/advanced_topics/provider_verification_badges.md)
- [Provider verification results](/pact_broker/advanced_topics/provider_verification_results.md): Publishing results back to the broker.
- [How to see what has changed in a pact](/pact_broker/advanced_topics/see_changes_pact.md)
- [Using TLS](/pact_broker/advanced_topics/using-tls.md)
- [Troubleshooting](/pact_broker/advanced_topics/troubleshooting.md)

### Pact Broker — API Docs

- [Pacticipants API](/pact_broker/api/pacticipants.md)
- [Webhooks API](/pact_broker/api/webhooks.md)
- [Pagination](/pact_broker/api/pagination.md)
- [Publishing pacts API](/pact_broker/advanced_topics/api_docs/publish_pact.md)
- [Publishing verification results API](/pact_broker/advanced_topics/api_docs/publish_verification_result.md)

---

## Pact Nirvana — CI/CD Setup Guide

The progressive steps to full contract testing in CI/CD:

- [Overview](/pact_nirvana.md): "The steps for reaching Pact Nirvana". Independent deployments with confidence.
- [Step 1: Learn about Pact](/pact_nirvana/step_1.md): Prerequisites.
- [Step 2: Talk — get team alignment](/pact_nirvana/step_2.md): Consumer and provider teams must coordinate.
- [Step 3: Bronze — single test working manually](/pact_nirvana/step_3.md): Consumer test → pact file → provider verification locally.
- [Step 4: Silver — manually integrate with Pact Broker](/pact_nirvana/step_4.md): Publish pacts to broker. Verify via URL. Consumer version selectors.
- [Step 5: Gold — integrate with PR pipelines](/pact_nirvana/step_5.md): Run consumer tests in CI. Publish pacts. Provider verifies in CI.
- [Step 6: Platinum — can-i-deploy with branch to PR pipelines](/pact_nirvana/step_6.md): Add `can-i-deploy` gate. Add webhook to trigger provider build on pact change. Record deployments.
- [Step 7: Diamond — independent deployments](/pact_nirvana/step_7.md): Verify against deployed versions. Deploy consumer and provider independently with confidence.
- [Universal CI/CD pipeline notes](/pact_nirvana/notes_1.md): Handling `can-i-deploy` in shared pipelines where not all services use Pact.

---

## Recipes — Common Scenarios

- [Overview](/recipes.md)
- [API Gateway](/recipes/apigateway.md)
- [AWS API Gateway Signed Requests](/recipes/awssignedrequests.md)
- [Cypress](/recipes/cypress.md): Use pact contracts as HTTP stubs for Cypress tests.
- [GraphQL](/recipes/graphql.md): GraphQL is an HTTP abstraction — test via Pact HTTP.
- [Kafka](/recipes/kafka.md): Message pacts for Kafka.
- [Lambda (async)](/recipes/lambdaasync.md): Async Lambda and FaaS testing.
- [Lambda (HTTP)](/recipes/lambdahttp.md): HTTP-based Lambda with AWS SAM.
- [Optional Fields](/recipes/optional.md): Strategies for handling optional response fields.

---

## Implementation Guides — CLI Tools

- [Pact Broker Client CLI](/implementation_guides/cli/pact-broker-cli.md): `pact-broker` CLI — can-i-deploy, record-deployment, record-release, publish pacts, webhooks.
- [Pact CLI](/implementation_guides/cli/pact-cli.md): Combined CLI image.
- [Pact Mock Server CLI](/implementation_guides/cli/pact-mock-server.md)
- [Pact Stub Server](/implementation_guides/cli/pact-stub-server.md): Run a stub server from a pact file.
- [Pact Verifier CLI](/implementation_guides/cli/pact-verifier.md)
- [Pact Plugin CLI](/implementation_guides/cli/pact-plugin.md)

---

## Implementation Guides — Languages

- **JavaScript/TypeScript** (pact-js): [Overview](/implementation_guides/javascript/readme.md) · [Consumer](/implementation_guides/javascript/docs/consumer.md) · [Provider](/implementation_guides/javascript/docs/provider.md) · [Matching](/implementation_guides/javascript/docs/matching.md) · [Messages](/implementation_guides/javascript/docs/messages.md) · [GraphQL](/implementation_guides/javascript/docs/graphql.md) · [Plugins](/implementation_guides/javascript/docs/plugins.md) · [Troubleshooting](/implementation_guides/javascript/docs/troubleshooting.md)
- **Java/JVM** (pact-jvm): [Overview](/implementation_guides/jvm.md) · [Consumer](/implementation_guides/jvm/consumer.md) · [Provider](/implementation_guides/jvm/provider.md) · [Matching](/implementation_guides/jvm/matching.md) · [Gradle](/implementation_guides/jvm/provider/gradle.md) · [Maven](/implementation_guides/jvm/provider/maven.md) · [JUnit 5](/implementation_guides/jvm/provider/junit5.md) · [Spring](/implementation_guides/jvm/provider/spring.md)
- **Go** (pact-go): [Overview](/implementation_guides/go.md) · [Consumer](/implementation_guides/go/docs/consumer.md) · [Provider](/implementation_guides/go/docs/provider.md) · [Messages](/implementation_guides/go/docs/messages.md) · [Plugins](/implementation_guides/go/docs/plugins.md) · [Troubleshooting](/implementation_guides/go/docs/troubleshooting.md)
- **Python** (pact-python): [Overview](/implementation_guides/python.md) · [Consumer](/implementation_guides/python/docs/consumer.md) · [Provider](/implementation_guides/python/docs/provider.md)
- **Ruby** (pact-ruby): [Creating pacts](/implementation_guides/ruby/creating_pacts.md) · [Verifying pacts](/implementation_guides/ruby/verifying_pacts.md) · [Matching](/implementation_guides/ruby/matching.md) · [Provider states](/implementation_guides/ruby/provider_states.md) · [Configuration](/implementation_guides/ruby/configuration.md)
- **Rust**: [Overview](/implementation_guides/rust.md) · [pact_consumer](/implementation_guides/rust/pact_consumer.md) · [pact_ffi](/implementation_guides/rust/pact_ffi.md) · [pact_verifier](/implementation_guides/rust/pact_verifier.md)
- **.NET** (PactNet): [Overview](/implementation_guides/net.md) · [Messaging](/implementation_guides/net/docs/messaging-pacts.md) · [Upgrading to v4](/implementation_guides/net/docs/upgrading-to-4.md) · [Upgrading to v5](/implementation_guides/net/docs/upgrading-to-5.md)
- **PHP**: [Consumer](/implementation_guides/php/docs/consumer.md) · [Provider](/implementation_guides/php/docs/provider.md) · [Messages](/implementation_guides/php/docs/messages.md)
- **C++**: [Consumer DSL](/implementation_guides/cpp/consumer.md)
- **Swift**: [Overview](/implementation_guides/swift.md) — v2 spec only
- **Scala**: [Overview](/implementation_guides/scala.md) — github.com/ITV/scala-pact
- [Other Languages](/implementation_guides/other_languages.md): Strategies when no Pact client exists
- [Feature toggles](/implementation_guides/feature_toggles.md): Working with configurable behavior
- [SSL/TLS](/implementation_guides/ssl.md): TLS configuration and proxy settings

---

## Pact Plugins Framework

- [Overview](/implementation_guides/pact_plugins.md): Extend Pact to support new protocols and content types.
- [Quick start](/plugins/quick_start.md)
- [Plugin directory](/plugins/directory.md)
- [Writing a plugin guide](/implementation_guides/pact_plugins/docs/writing-plugin-guide.md): Plugins are gRPC servers that run as child processes.
- [gRPC examples](/implementation_guides/pact_plugins/examples/grpc.md)
- [Protobuf examples](/implementation_guides/pact_plugins/examples/protobuf.md)
- [CSV examples](/implementation_guides/pact_plugins/examples/csv.md)

---

## Pact University — Workshops

- [Introduction to Pact workshop (JS)](/university/introduction.md): 13 steps from zero to full CI/CD setup with PactFlow.
- [Message Pact (async) workshop](/university/message-pact-async/00_1_Intro.md): Async messaging with Kafka.

---

## Community & Support

- [FAQ](/faq.md): Technical and complex questions answered.
- [Convince me](/faq/convinceme.md): How to make the case for contract testing.
- [Where to go for help](/help.md): Slack, documentation, GitHub issues.
- [SmartBear / PactFlow](/help/smartbear.md): Commercial entity behind PactFlow.
- [Community projects](/community_repos.md)
- [Case studies](/users/case_studies.md): Atlassian, Gov.UK Pay, M1 Finance, Boost Insurance.
- [Who is using Pact](/users.md)
- [History](/history.md): Pact origins at realestate.com.au in 2013.
- [Roadmap](/roadmap.md): Feature roadmap and language support matrix.
- [Feature support by language](/roadmap/feature_support.md)
- [Telemetry](/telemetry.md)
- [Contributing](/contributing.md)
