While you already know this, here is a reminder of the key PhpPact classes, interfaces, and methods you will need to use to create a Pact test in PHP (having omitted deprecated and implementation-detail members):

## Config

File: ./src/PhpPact/Config/PactConfigInterface.php

```php
interface PactConfigInterface
{
    function getConsumer(): string;
    function setConsumer(string $consumer): self;
    function getProvider(): string;
    function setProvider(string $provider): self;
    function getPactDir(): string;
    function setPactDir(?string $pactDir): self;
    function getPactSpecificationVersion(): string;
    function setPactSpecificationVersion(string $pactSpecificationVersion): self;
    function getLog(): ?string;
    function setLog(string $log): self;
    function getLogLevel(): ?string;
    function setLogLevel(string $logLevel): self;
    function getPactFileWriteMode(): WriteMode;
    function setPactFileWriteMode(string|WriteMode $pactFileWriteMode): self;
}
```

File: ./src/PhpPact/Standalone/MockService/MockServerConfigInterface.php

```php
interface MockServerConfigInterface extends PactConfigInterface
{
    function getHost(): string;
    function setHost(string $host): self;
    function getPort(): int;
    function setPort(int $port): self;
    function isSecure(): bool;
    function setSecure(bool $secure): self;
    function getBaseUri(): UriInterface;
}
```

## Matchers

File: ./src/PhpPact/Consumer/Matcher/Matcher.php

```php
class Matcher
{
    public function __construct(private readonly bool $plugin = false);
    public function somethingLike(mixed $value): Type;
    public function like(mixed $value): Type;
    public function eachLike(mixed $value): MinType;
    public function atLeastOneLike(mixed $value): MinType;
    public function atLeastLike(mixed $value, int $min): MinType;
    public function atMostLike(mixed $value, int $max): MaxType;
    public function constrainedArrayLike(mixed $value, int $min, int $max): MinMaxType;
    public function term(string|array|null $values, string $pattern): Regex;
    public function regex(string|array|null $values, string $pattern): Regex;
    public function dateISO8601(string $value = '2013-02-01'): Regex;
    public function timeISO8601(string $value = 'T22:44:30.652Z'): Regex;
    public function dateTimeISO8601(string $value = '2015-08-06T16:53:10+01:00'): Regex;
    public function dateTimeWithMillisISO8601(string $value = '2015-08-06T16:53:10.123+01:00'): Regex;
    public function timestampRFC3339(string $value = 'Mon, 31 Oct 2016 15:21:41 -0400'): Regex;
    public function boolean(?bool $value = null): Type;
    public function integer(?int $value = null): Type;
    public function decimal(?float $value = null): Type;
    public function booleanV3(?bool $value = null): Boolean;
    public function integerV3(?int $value = null): Integer;
    public function decimalV3(?float $value = null): Decimal;
    public function hexadecimal(?string $value = null): Regex;
    public function uuid(?string $value = null): Regex;
    public function ipv4Address(?string $ip = '127.0.0.13'): Regex;
    public function ipv6Address(?string $ip = '::ffff:192.0.2.128'): Regex;
    public function email(?string $email = 'hello@pact.io'): Regex;
    public function nullValue(): NullValue;
    public function date(string $format = 'yyyy-MM-dd', ?string $value = null): Date;
    public function time(string $format = 'HH:mm:ss', ?string $value = null): Time;
    public function datetime(string $format = "yyyy-MM-dd'T'HH:mm:ss", ?string $value = null): DateTime;
    public function string(?string $value = null): StringValue;
    public function fromProviderState(MatcherInterface&GeneratorAwareInterface $matcher, string $expression): MatcherInterface&GeneratorAwareInterface;
    public function equal(mixed $value): Equality;
    public function includes(string $value): Includes;
    public function number(int|float|null $value = null): Number;
    public function arrayContaining(array $variants): ArrayContains;
    public function notEmpty(mixed $value): NotEmpty;
    public function semver(?string $value = null): Semver;
    public function statusCode(string|HttpStatus $status, ?int $value = null): StatusCode;
    public function values(array $values): Values;
    public function contentType(string $contentType): ContentType;
    public function eachKey(array|object $values, array $rules): EachKey;
    public function eachValue(array|object $values, array $rules): EachValue;
    public function url(string $url, string $regex, bool $useMockServerBasePath = true): Regex;
    public function matchingField(string $fieldName): MatchingField;
    public function matchAll(object|array $value, array $matchers): MatchAll;
    public function atLeast(int $min): Min;
    public function atMost(int $max): Max;
}
```

## HTTP Consumer

File: ./src/PhpPact/Consumer/BuilderInterface.php

```php
interface BuilderInterface
{
    function verify(): bool;
}
```

File: ./src/PhpPact/Consumer/InteractionBuilder.php

```php
class InteractionBuilder implements BuilderInterface
{
    public function __construct(MockServerConfigInterface $config, ?InteractionDriverFactoryInterface $driverFactory = null);
    public function given(string $providerState, array $params = [], bool $overwrite = false): self;
    public function uponReceiving(string $description): self;
    public function with(ConsumerRequest $request): self;
    public function willRespondWith(ProviderResponse $response, bool $startMockServer = true): bool;
    public function verify(): bool;
    public function key(?string $key): self;
    public function pending(?bool $pending): self;
    public function comments(array $comments): self;
    public function comment(string $comment): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/MethodTrait.php

```php
trait MethodTrait
{
    public function getMethod(): string;
    public function setMethod(string $method): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/PathTrait.php

```php
trait PathTrait
{
    public function getPath(): string;
    public function setPath(MatcherInterface|string $path): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/QueryTrait.php

```php
trait QueryTrait
{
    public function getQuery(): array;
    public function setQuery(array $query): self;
    public function addQueryParameter(string $key, array|string|MatcherInterface|null $value): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/HeadersTrait.php

```php
trait HeadersTrait
{
    public function getHeaders(): array;
    public function setHeaders(array $headers): self;
    public function addHeader(string $header, array|string|MatcherInterface $value): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/BodyTrait.php

```php
trait BodyTrait
{
    public function getBody(): Text|Binary|Multipart|null;
    public function setBody(mixed $body): self;
}
```

File: ./src/PhpPact/Consumer/Model/Interaction/StatusTrait.php

```php
trait StatusTrait
{
    public function getStatus(): string;
    public function setStatus(int|MatcherInterface $status): self;
}
```

## Message Consumer

File: ./src/PhpPact/Consumer/MessageBuilder.php

```php
class MessageBuilder implements BuilderInterface
{
    public function __construct(PactConfigInterface $config, ?MessageDriverFactoryInterface $driverFactory = null);
    public function given(string $name, array $params = [], bool $overwrite = false): self;
    public function expectsToReceive(string $description): self;
    public function withMetadata(array $metadata): self;
    public function withContent(mixed $contents): self;
    public function key(?string $key): self;
    public function pending(?bool $pending): self;
    public function comments(array $comments): self;
    public function comment(string $comment): self;
    public function setCallback(callable $callback, ?string $description = null): self;
    public function reify(): string;
    public function verifyMessage(callable $callback, ?string $description = null): bool;
    public function verify(): bool;
}
```

File: ./src/PhpPact/SyncMessage/SyncMessageBuilder.php

```php
class SyncMessageBuilder implements BuilderInterface
{
    public function __construct(MockServerConfigInterface $config, ?SyncMessageDriverFactoryInterface $driverFactory = null);
    public function given(string $name, array $params = [], bool $overwrite = false): self;
    public function expectsToReceive(string $description): self;
    public function withMetadata(array $metadata): self;
    public function withContent(mixed $contents): self;
    public function key(?string $key): self;
    public function pending(?bool $pending): self;
    public function comments(array $comments): self;
    public function comment(string $comment): self;
    public function withRequestContents(mixed $requestContents): self;
    public function withResponseContentsList(array $contentsList): self;
    public function withResponseContents(array $responseContents): self;
    public function withRequestMatchingRules(string $requestMatchingRules): self;
    public function withResponseMatchingRules(string $responseMatchingRules): self;
    public function withRequestGenerators(string $requestGenerators): self;
    public function withResponseGenerators(string $responseGenerators): self;
    public function registerMessage(): void;
    public function verify(): bool;
}
```

## Provider Verifier

File: ./src/PhpPact/Standalone/ProviderVerifier/Verifier.php

```php
class Verifier
{
    public function __construct(VerifierConfigInterface $config, private readonly ?LoggerInterface $logger = null, ?ClientInterface $client = null);
    public function addFile(string $file): self;
    public function addDirectory(string $directory): self;
    public function addUrl(UrlInterface $url): self;
    public function addBroker(BrokerInterface $broker): self;
    public function verify(): bool;
}
```

File: ./src/PhpPact/Standalone/ProviderVerifier/Model/VerifierConfigInterface.php

```php
interface VerifierConfigInterface
{
    function setCallingApp(CallingAppInterface $callingApp): self;
    function getCallingApp(): CallingAppInterface;
    function setProviderInfo(ProviderInfoInterface $providerInfo): self;
    function getProviderInfo(): ProviderInfoInterface;
    function setProviderTransports(array $providerTransports): self;
    function addProviderTransport(ProviderTransportInterface $providerTransport): self;
    function getProviderTransports(): array;
    function setFilterInfo(FilterInfoInterface $filterInfo): self;
    function getFilterInfo(): FilterInfoInterface;
    function setProviderState(ProviderStateInterface $providerState): self;
    function getProviderState(): ProviderStateInterface;
    function setPublishOptions(?PublishOptionsInterface $publishOptions): self;
    function getPublishOptions(): ?PublishOptionsInterface;
    function isPublishResults(): bool;
    function setConsumerFilters(ConsumerFiltersInterface $consumerFilters): self;
    function getConsumerFilters(): ConsumerFiltersInterface;
    function setVerificationOptions(VerificationOptionsInterface $verificationOptions): self;
    function getVerificationOptions(): VerificationOptionsInterface;
    function getLogLevel(): ?string;
    function setLogLevel(string $logLevel): self;
    function setCustomHeaders(CustomHeadersInterface $customHeaders): self;
    function getCustomHeaders(): CustomHeadersInterface;
}
```

File: ./src/PhpPact/Standalone/ProviderVerifier/Model/Source/UrlInterface.php

```php
interface UrlInterface
{
    function getUrl(): UriInterface;
    function setUrl(UriInterface $url): static;
    function getToken(): ?string;
    function setToken(?string $token): static;
    function getUsername(): ?string;
    function setUsername(string $username): static;
    function getPassword(): ?string;
    function setPassword(string $password): static;
}
```

File: ./src/PhpPact/Standalone/ProviderVerifier/Model/Source/BrokerInterface.php

```php
interface BrokerInterface extends UrlInterface
{
    function setEnablePending(bool $enablePending): self;
    function isEnablePending(): bool;
    function setIncludeWipPactSince(?string $date): self;
    function getIncludeWipPactSince(): ?string;
    function getProviderTags(): array;
    function setProviderTags(array $providerTags): self;
    function addProviderTag(string $providerTag): self;
    function getProviderBranch(): ?string;
    function setProviderBranch(?string $providerBranch): self;
    function getConsumerVersionSelectors(): ConsumerVersionSelectors;
    function setConsumerVersionSelectors(ConsumerVersionSelectors $selectors): self;
    function getConsumerVersionTags(): array;
    function setConsumerVersionTags(array $consumerVersionTags): self;
    function addConsumerVersionTag(string $consumerVersionTag): self;
}
```
