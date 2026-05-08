While you already know this, here is a reminder of the key PactSwift classes and types you will need to use to create a Pact test in Swift (having omitted deprecated and implementation-detail members):

## MockService (Consumer Tests)

File: ./Sources/MockService.swift

```swift
open class MockService {
    public init(consumer: String, provider: String, scheme: TransferProtocol, writePactTo directory: URL?, merge: Bool)
    public func uponReceiving(_ description: String) -> Interaction
    public func run(_ file: FileString?, line: UInt?, verify interactions: [Interaction]?, timeout: TimeInterval?, testFunction: @escaping (_ baseURL: String, _ done: (@escaping @Sendable () -> Void)) throws -> Void)
}
```

File: ./Sources/MockService+Concurrency.swift

```swift
// Async/await API (macOS 12+, iOS 15+)
extension MockService {
    func run(_ file: FileString?, line: UInt?, verify interactions: [Interaction]?, timeout: TimeInterval?, testFunction: @escaping @Sendable (_ baseURL: String) async throws -> Void) async throws
}
```

## Interaction Builder

File: ./Sources/Model/Interaction.swift

```swift
class Interaction {
    func uponReceiving(_ interactionDescription: String) -> Interaction
    public func given(_ providerState: String) -> Interaction
    public func given(_ providerStates: [ProviderState]) -> Interaction
    public func given(_ providerStates: ProviderState...) -> Interaction
    public func withRequest(method: PactHTTPMethod, path: PactPathParameter, query: [String: [Any]]?, headers: [String: Any]?, body: Any?) -> Interaction
    public func willRespondWith(status: Int, headers: [String: Any]?, body: Any?) -> Interaction
}
```

## Matchers

```swift
struct Matcher.DecimalLike {
    public init(_ value: Decimal)
}

struct Matcher.EachKeyLike {
    public init(_ value: Any)
}

struct Matcher.EachLike {
    public init(_ value: Any, count: Int)
    public init(_ value: Any, min: Int, count: Int)
    public init(_ value: Any, max: Int, count: Int)
    public init(_ value: Any, min: Int, max: Int, count: Int)
}

struct Matcher.EqualTo {
    public init(_ value: Any)
}

struct Matcher.FromProviderState {
    enum ParameterType {
    case bool
    case double
    case float
    case int
    case string
    case decimal
    }
    public init(parameter: String, value: ParameterType)
}

struct Matcher.IncludesLike {
    enum IncludeCombine {
    case AND
    case OR
    }
    public init(_ values: String..., combine: IncludeCombine, generate: String?)
    public init(_ values: [String], combine: IncludeCombine, generate: String?)
}

struct Matcher.IntegerLike {
    public init(_ value: Int)
}

struct Matcher.MatchNull {
    public init()
}

struct Matcher.OneOf {
    public init(values: [AnyHashable])
}

struct Matcher.RegexLike {
    public init(value: String, pattern: String)
}

struct Matcher.SomethingLike {
    public init(_ value: Any)
}
```

## Example Generators

```swift
struct ExampleGenerator.DateTime {
    public init(format: String, use date: Date)
}

struct ExampleGenerator.DateTimeExpression {
    public init(expression: String, format: String)
}

struct ExampleGenerator.RandomBool {
    public init()
}

struct ExampleGenerator.RandomDate {
    public init(format: String?)
}

struct ExampleGenerator.RandomDateTime {
    public init(format: String?)
}

struct ExampleGenerator.RandomDecimal {
    public init(digits: Int)
}

struct ExampleGenerator.RandomHexadecimal {
    public init(digits: UInt8)
}

struct ExampleGenerator.RandomInt {
    public init(min: Int, max: Int)
}

struct ExampleGenerator.RandomString {
    public init(size: Int)
    public init(regex: String)
}

struct ExampleGenerator.RandomTime {
    public init(format: String?)
}

struct ExampleGenerator.RandomUUID {
    public init(format: Format)
    enum Format {
    case simple
    case lowercaseHyphenated
    case uppercaseHyphenated
    case urn
    }
}
```

## Supporting Types

File: ./Sources/Model/PactHTTPMethod.swift

```swift
enum PactHTTPMethod: Int {
    case GET
    case HEAD
    case POST
    case PUT
    case PATCH
    case DELETE
    case TRACE
    case CONNECT
    case OPTIONS
}
```

File: ./Sources/Model/TransferProtocol.swift

```swift
enum TransferProtocol: Int {
    case standard
    case secure
}
```

File: ./Sources/Model/ProviderState.swift

```swift
struct ProviderState: Encodable {
    public init(description: String, params: [String: String])
}
```

## Provider Verifier

File: ./Sources/ProviderVerifier.swift

```swift
public final class ProviderVerifier {
    public init()
    public func verify(options: Options, file: FileString?, line: UInt?, completionBlock: (() -> Void)?) -> Result<Bool, ProviderVerifier.VerificationError>
}
```

File: ./Sources/Model/ProviderVerifier+Options.swift

```swift
// ProviderVerifier.Options and its nested types
struct ProviderVerifier.Options {
    enum LogLevel {
    case error
    case warn
    case info
    case debug
    case trace
    case none
    }
    enum PactsSource {
    case broker
    case directories
    case files
    case urls
    }
    enum FilterPacts {
    case noState
    case states
    case descriptions
    case consumers
    }
    public init(provider: Provider, pactsSource: PactsSource, filter: FilterPacts?, stateChangeURL: URL?, logLevel: LogLevel)
}
```

File: ./Sources/Model/ProviderVerifier+Provider.swift

```swift
struct ProviderVerifier.Provider {
    public init(url: URL?, port: Int)
}
```

File: ./Sources/Model/PactBroker.swift

```swift
struct PactBroker {
    enum Either {
    case auth
    case token
    }
    struct SimpleAuth {
        public init(username: String, password: String)
    }
    struct APIToken {
        public init(_ token: String)
    }
    struct VerificationResults {
        public init(providerVersion version: String, providerTags tags: [String]?)
    }
    public init(url: URL, auth: Either<SimpleAuth, APIToken>, providerName: String, consumerTags: [VersionSelector]?, includePending: Bool?, includeWIP: WIPPacts?, publishResults verificationResults: VerificationResults?)
}
```

File: ./Sources/Model/VersionSelector.swift

```swift
struct VersionSelector: Codable, Equatable {
    public init(tag: String, fallbackTag: String?, latest: Bool, consumer: String?)
}
```
