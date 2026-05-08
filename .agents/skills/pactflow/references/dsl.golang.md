While you already know this, here is a reminder of the key Pact Go interfaces, types, structs and methods you will need to use to create a Pact test in Golang (having omitted deprecated and unadvised methods):

## Models

File: ./models/pact_file.go

```go
package models

type SpecificationVersion string
const (
	V2 SpecificationVersion = "2.0.0"
	V3 = "3.0.0"
	V4 = "4.0.0"
)
```

File: ./models/provider_state.go

```go
package models

type ProviderState struct {
	Name string
	Parameters map[string]interface{}
}
type ProviderStateResponse map[string]interface{}
type StateHandler func(setup bool, state ProviderState) (ProviderStateResponse, error)
type StateHandlers map[string]StateHandler
```

## Log

File: ./log/log.go

```go
package log

func SetLogLevel(level logutils.LogLevel) error
func LogLevel() logutils.LogLevel
func PactCrash(err error)
```

## Matchers

### V2 Matchers

File: ./matchers/matcher.go

```go
package matchers

func EachLike(content interface{}, minRequired int) Matcher
var ArrayMinLike = EachLike
func Like(content interface{}) Matcher
func Term(generate string, matcher string) Matcher
func HexValue() Matcher
func Identifier() Matcher
func IPAddress() Matcher
var IPv4Address = IPAddress
func IPv6Address() Matcher
func Timestamp() Matcher
func Date() Matcher
func Time() Matcher
func UUID() Matcher
var Regex = Term
type Matcher interface {
	// isMatcher is how we tell the compiler that strings
	// and other types are the same / allowed
	isMatcher()

	// GetValue returns the raw generated value for the matcher
	// without any of the matching detail context
	GetValue() interface{}
}
type S string
func (s S) GetValue() interface{}
func (s S) MarshalJSON() ([]byte, error)
type String string
func (s String) GetValue() interface{}
func (s String) MarshalJSON() ([]byte, error)
type StructMatcher map[string]interface{}
func (m StructMatcher) GetValue() interface{}
type MapMatcher map[string]Matcher
type Map MapMatcher
func (m *MapMatcher) UnmarshalJSON(bytes []byte) (err error)
type HeadersMatcher = map[string][]Matcher
type MetadataMatcher = MapMatcher
type QueryMatcher map[string][]Matcher
func MatchV2(src interface{}) Matcher
```

### V3 Matchers

File: ./matchers/matcher_v3.go

```go
package matchers

func Decimal(example float64) Matcher
func Integer(example int) Matcher
type Null struct {}
func (n Null) GetValue() interface{}
func (n Null) MarshalJSON() ([]byte, error)
func Equality(content interface{}) Matcher
func Includes(content string) Matcher
func FromProviderState(expression, example string) Matcher
func EachKeyLike(key string, template interface{}) Matcher
func ArrayContaining(variants []interface{}) Matcher
func ArrayMinMaxLike(content interface{}, min int, max int) Matcher
func ArrayMaxLike(content interface{}, max int) Matcher
func DateGenerated(example string, format string) Matcher
func TimeGenerated(example string, format string) Matcher
func DateTimeGenerated(example string, format string) Matcher
```

## Consumer

### HTTP V2

File: ./consumer/http_v2.go

```go
package consumer

type V2HTTPMockProvider struct {}
func NewV2Pact(config MockHTTPProviderConfig) (*V2HTTPMockProvider, error)
func (p *V2HTTPMockProvider) AddInteraction() *V2UnconfiguredInteraction
type V2UnconfiguredInteraction struct {}
func (i *V2UnconfiguredInteraction) Given(state string) *V2UnconfiguredInteraction
type V2InteractionWithRequest struct {}
type V2RequestBuilderFunc func(*V2RequestBuilder)
type V2RequestBuilder struct {}
func (i *V2UnconfiguredInteraction) UponReceiving(description string) *V2UnconfiguredInteraction
func (i *V2UnconfiguredInteraction) WithCompleteRequest(request Request) *V2InteractionWithCompleteRequest
type V2InteractionWithCompleteRequest struct {}
func (i *V2InteractionWithCompleteRequest) WithCompleteResponse(response Response) *V2InteractionWithResponse
func (i *V2UnconfiguredInteraction) WithRequest(method Method, path string, builders ...V2RequestBuilderFunc) *V2InteractionWithRequest
func (i *V2UnconfiguredInteraction) WithRequestPathMatcher(method Method, path matchers.Matcher, builders ...V2RequestBuilderFunc) *V2InteractionWithRequest
func (i *V2RequestBuilder) Query(key string, values ...matchers.Matcher) *V2RequestBuilder
func (i *V2RequestBuilder) Header(key string, values ...matchers.Matcher) *V2RequestBuilder
func (i *V2RequestBuilder) Headers(headers matchers.HeadersMatcher) *V2RequestBuilder
func (i *V2RequestBuilder) JSONBody(body interface{}) *V2RequestBuilder
func (i *V2RequestBuilder) BinaryBody(body []byte) *V2RequestBuilder
func (i *V2RequestBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V2RequestBuilder
func (i *V2RequestBuilder) Body(contentType string, body []byte) *V2RequestBuilder
func (i *V2RequestBuilder) BodyMatch(body interface{}) *V2RequestBuilder
func (i *V2InteractionWithRequest) WillRespondWith(status int, builders ...V2ResponseBuilderFunc) *V2InteractionWithResponse
type V2ResponseBuilderFunc func(*V2ResponseBuilder)
type V2ResponseBuilder struct {}
type V2InteractionWithResponse struct {}
func (i *V2ResponseBuilder) Header(key string, values ...matchers.Matcher) *V2ResponseBuilder
func (i *V2ResponseBuilder) Headers(headers matchers.HeadersMatcher) *V2ResponseBuilder
func (i *V2ResponseBuilder) JSONBody(body interface{}) *V2ResponseBuilder
func (i *V2ResponseBuilder) BinaryBody(body []byte) *V2ResponseBuilder
func (i *V2ResponseBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V2ResponseBuilder
func (i *V2ResponseBuilder) Body(contentType string, body []byte) *V2ResponseBuilder
func (i *V2ResponseBuilder) BodyMatch(body interface{}) *V2ResponseBuilder
```

### HTTP V3

File: ./consumer/http_v3.go

```go
package consumer

type V3HTTPMockProvider struct {}
func NewV3Pact(config MockHTTPProviderConfig) (*V3HTTPMockProvider, error)
func (p *V3HTTPMockProvider) AddInteraction() *V3UnconfiguredInteraction
type V3UnconfiguredInteraction struct {}
func (i *V3UnconfiguredInteraction) Given(state string) *V3UnconfiguredInteraction
func (i *V3UnconfiguredInteraction) GivenWithParameter(state models.ProviderState) *V3UnconfiguredInteraction
type V3InteractionWithRequest struct {}
type V3RequestBuilderFunc func(*V3RequestBuilder)
type V3RequestBuilder struct {}
func (i *V3UnconfiguredInteraction) UponReceiving(description string) *V3UnconfiguredInteraction
func (i *V3UnconfiguredInteraction) WithCompleteRequest(request Request) *V3InteractionWithCompleteRequest
type V3InteractionWithCompleteRequest struct {}
func (i *V3InteractionWithCompleteRequest) WithCompleteResponse(response Response) *V3InteractionWithResponse
func (i *V3UnconfiguredInteraction) WithRequest(method Method, path string, builders ...V3RequestBuilderFunc) *V3InteractionWithRequest
func (i *V3UnconfiguredInteraction) WithRequestPathMatcher(method Method, path matchers.Matcher, builders ...V3RequestBuilderFunc) *V3InteractionWithRequest
func (i *V3RequestBuilder) Query(key string, values ...matchers.Matcher) *V3RequestBuilder
func (i *V3RequestBuilder) Header(key string, values ...matchers.Matcher) *V3RequestBuilder
func (i *V3RequestBuilder) Headers(headers matchers.HeadersMatcher) *V3RequestBuilder
func (i *V3RequestBuilder) JSONBody(body interface{}) *V3RequestBuilder
func (i *V3RequestBuilder) BinaryBody(body []byte) *V3RequestBuilder
func (i *V3RequestBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V3RequestBuilder
func (i *V3RequestBuilder) Body(contentType string, body []byte) *V3RequestBuilder
func (i *V3RequestBuilder) BodyMatch(body interface{}) *V3RequestBuilder
func (i *V3InteractionWithRequest) WillRespondWith(status int, builders ...V3ResponseBuilderFunc) *V3InteractionWithResponse
type V3ResponseBuilderFunc func(*V3ResponseBuilder)
type V3ResponseBuilder struct {}
type V3InteractionWithResponse struct {}
func (i *V3ResponseBuilder) Header(key string, values ...matchers.Matcher) *V3ResponseBuilder
func (i *V3ResponseBuilder) Headers(headers matchers.HeadersMatcher) *V3ResponseBuilder
func (i *V3ResponseBuilder) JSONBody(body interface{}) *V3ResponseBuilder
func (i *V3ResponseBuilder) BinaryBody(body []byte) *V3ResponseBuilder
func (i *V3ResponseBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V3ResponseBuilder
func (i *V3ResponseBuilder) Body(contentType string, body []byte) *V3ResponseBuilder
func (i *V3ResponseBuilder) BodyMatch(body interface{}) *V3ResponseBuilder
```

### HTTP V4

File: ./consumer/http_v4.go

```go
package consumer

type V4HTTPMockProvider struct {}
func NewV4Pact(config MockHTTPProviderConfig) (*V4HTTPMockProvider, error)
func (p *V4HTTPMockProvider) AddInteraction() *V4UnconfiguredInteraction
type V4UnconfiguredInteraction struct {}
func (i *V4UnconfiguredInteraction) Given(state string) *V4UnconfiguredInteraction
func (i *V4UnconfiguredInteraction) GivenWithParameter(state models.ProviderState) *V4UnconfiguredInteraction
type V4InteractionWithRequest struct {}
type V4RequestBuilderFunc func(*V4RequestBuilder)
type V4RequestBuilder struct {}
func (i *V4UnconfiguredInteraction) UponReceiving(description string) *V4UnconfiguredInteraction
func (i *V4UnconfiguredInteraction) WithCompleteRequest(request Request) *V4InteractionWithCompleteRequest
type V4InteractionWithCompleteRequest struct {}
func (i *V4InteractionWithCompleteRequest) WithCompleteResponse(response Response) *V4InteractionWithResponse
func (i *V4UnconfiguredInteraction) WithRequest(method Method, path string, builders ...V4RequestBuilderFunc) *V4InteractionWithRequest
func (i *V4UnconfiguredInteraction) WithRequestPathMatcher(method Method, path matchers.Matcher, builders ...V4RequestBuilderFunc) *V4InteractionWithRequest
func (i *V4RequestBuilder) Query(key string, values ...matchers.Matcher) *V4RequestBuilder
func (i *V4RequestBuilder) Header(key string, values ...matchers.Matcher) *V4RequestBuilder
func (i *V4RequestBuilder) Headers(headers matchers.HeadersMatcher) *V4RequestBuilder
func (i *V4RequestBuilder) JSONBody(body interface{}) *V4RequestBuilder
func (i *V4RequestBuilder) BinaryBody(body []byte) *V4RequestBuilder
func (i *V4RequestBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V4RequestBuilder
func (i *V4RequestBuilder) Body(contentType string, body []byte) *V4RequestBuilder
func (i *V4RequestBuilder) BodyMatch(body interface{}) *V4RequestBuilder
func (i *V4InteractionWithRequest) WillRespondWith(status int, builders ...V4ResponseBuilderFunc) *V4InteractionWithResponse
type V4ResponseBuilderFunc func(*V4ResponseBuilder)
type V4ResponseBuilder struct {}
type V4InteractionWithResponse struct {}
func (i *V4ResponseBuilder) Header(key string, values ...matchers.Matcher) *V4ResponseBuilder
func (i *V4ResponseBuilder) Headers(headers matchers.HeadersMatcher) *V4ResponseBuilder
func (i *V4ResponseBuilder) JSONBody(body interface{}) *V4ResponseBuilder
func (i *V4ResponseBuilder) BinaryBody(body []byte) *V4ResponseBuilder
func (i *V4ResponseBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V4ResponseBuilder
func (i *V4ResponseBuilder) Body(contentType string, body []byte) *V4ResponseBuilder
func (i *V4ResponseBuilder) BodyMatch(body interface{}) *V4ResponseBuilder
type PluginConfig struct {
	Plugin string
	Version string
}
type V4InteractionWithPlugin struct {}
func (i *V4UnconfiguredInteraction) UsingPlugin(config PluginConfig) *V4InteractionWithPlugin
func (i *V4InteractionWithPlugin) UsingPlugin(config PluginConfig) *V4InteractionWithPlugin
type V4InteractionWithPluginRequest struct {}
type PluginRequestBuilderFunc func(*V4InteractionWithPluginRequestBuilder)
type V4InteractionWithPluginRequestBuilder struct {}
func (i *V4InteractionWithPlugin) WithRequest(method Method, path string, builders ...PluginRequestBuilderFunc) *V4InteractionWithPluginRequest
func (i *V4InteractionWithPlugin) WithRequestPathMatcher(method Method, path matchers.Matcher, builders ...PluginRequestBuilderFunc) *V4InteractionWithPluginRequest
func (i *V4InteractionWithPluginRequest) WillRespondWith(status int, builders ...PluginResponseBuilderFunc) *V4InteractionWithPluginResponse
type PluginResponseBuilderFunc func(*V4InteractionWithPluginResponseBuilder)
type V4InteractionWithPluginResponseBuilder struct {}
type V4InteractionWithPluginResponse struct {}
func (i *V4InteractionWithPluginRequestBuilder) Query(key string, values ...matchers.Matcher) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) Header(key string, values ...matchers.Matcher) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) Headers(headers matchers.HeadersMatcher) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) PluginContents(contentType string, contents string) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) JSONBody(body interface{}) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) BinaryBody(body []byte) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) Body(contentType string, body []byte) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginRequestBuilder) BodyMatch(body interface{}) *V4InteractionWithPluginRequestBuilder
func (i *V4InteractionWithPluginResponseBuilder) Header(key string, values ...matchers.Matcher) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) Headers(headers matchers.HeadersMatcher) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) PluginContents(contentType string, contents string) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) JSONBody(body interface{}) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) BinaryBody(body []byte) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) MultipartBody(contentType string, filename string, mimePartName string) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) Body(contentType string, body []byte) *V4InteractionWithPluginResponseBuilder
func (i *V4InteractionWithPluginResponseBuilder) BodyMatch(body interface{}) *V4InteractionWithPluginResponseBuilder
```

### HTTP Config

File: ./consumer/http.go

```go
package consumer

type MockHTTPProviderConfig struct {
	Consumer string
	Provider string
	LogDir string
	PactDir string
	Host string
	AllowedMockServerPorts string
	Port int
	ClientTimeout time.Duration
	TLS bool
}
type MockServerConfig struct {
	Port int
	Host string
	TLSConfig *tls.Config
}
func GetTLSConfigForTLSMockServer() *tls.Config
```

### Interaction

File: ./consumer/interaction.go

```go
package consumer

type Interaction struct {}
func (i *Interaction) WithCompleteRequest(request Request) *Interaction
func (i *Interaction) WithCompleteResponse(response Response) *Interaction
```

### Request / Response

File: ./consumer/request.go

```go
package consumer

type Request struct {
	Method string
	Path matchers.Matcher
	Query matchers.MapMatcher
	Headers matchers.MapMatcher
	Body interface{}
}
type Method string
```

File: ./consumer/response.go

```go
package consumer

type Response struct {
	Status int
	Headers matchers.MapMatcher
	Body interface{}
}
```

## Message

File: ./message/message.go

```go
package message

type Body interface{}
type Metadata map[string]interface{}
type Handler func([]models.ProviderState) (Body, Metadata, error)
type Producer Handler
type Handlers map[string]Handler
```

### V3 Async Message

File: ./message/v3/asynchronous_message.go

```go
package v3

type AsynchronousMessageBuilder struct {
	Type interface{}
}
type UnconfiguredAsynchronousMessageBuilder struct {}
func (m *AsynchronousMessageBuilder) GivenWithParameter(state models.ProviderState) *AsynchronousMessageBuilder
func (m *AsynchronousMessageBuilder) Given(state string) *AsynchronousMessageBuilder
func (m *AsynchronousMessageBuilder) ExpectsToReceive(description string) *UnconfiguredAsynchronousMessageBuilder
func (m *UnconfiguredAsynchronousMessageBuilder) WithMetadata(metadata map[string]string) *UnconfiguredAsynchronousMessageBuilder
type AsynchronousMessageBuilderWithContents struct {}
func (m *UnconfiguredAsynchronousMessageBuilder) WithBinaryContent(contentType string, body []byte) *AsynchronousMessageBuilderWithContents
func (m *UnconfiguredAsynchronousMessageBuilder) WithContent(contentType string, body []byte) *AsynchronousMessageBuilderWithContents
func (m *UnconfiguredAsynchronousMessageBuilder) WithJSONContent(content interface{}) *AsynchronousMessageBuilderWithContents
func (m *AsynchronousMessageBuilderWithContents) AsType(t interface{}) *AsynchronousMessageBuilderWithContents
type AsynchronousMessageBuilderWithConsumer struct {}
func (m *AsynchronousMessageBuilderWithContents) ConsumedBy(handler AsynchronousConsumer) *AsynchronousMessageBuilderWithConsumer
func (m *AsynchronousMessageBuilderWithConsumer) Verify(t *testing.T) error
type AsynchronousPact struct {}
var NewMessagePact = NewAsynchronousPact
func NewAsynchronousPact(config Config) (*AsynchronousPact, error)
func (p *AsynchronousPact) AddMessage() *AsynchronousMessageBuilder
func (p *AsynchronousPact) AddAsynchronousMessage() *AsynchronousMessageBuilder
func (p *AsynchronousPact) Verify(t *testing.T, message *AsynchronousMessageBuilder, handler AsynchronousConsumer) error
```

### V3 Sync Message

File: ./message/v3/message.go

```go
package v3

type Body interface{}
type Metadata map[string]interface{}
type AsynchronousConsumer func(MessageContents) error
type MessageContents struct {
	Content Body
	Metadata Metadata
}
type Config struct {
	Consumer string
	Provider string
	PactDir string
}
```

### V4 Sync Message

File: ./message/v4/synchronous_message.go

```go
package v4

type SynchronousPact struct {}
type SynchronousMessage struct {
	Request MessageContents
	Response []MessageContents
}
type SynchronousMessageBuilder struct {}
func (m *UnconfiguredSynchronousMessageBuilder) Given(state string) *UnconfiguredSynchronousMessageBuilder
func (m *UnconfiguredSynchronousMessageBuilder) GivenWithParameter(state models.ProviderState) *UnconfiguredSynchronousMessageBuilder
type UnconfiguredSynchronousMessageBuilder struct {}
func (m *UnconfiguredSynchronousMessageBuilder) UsingPlugin(config PluginConfig) *SynchronousMessageWithPlugin
func (m *SynchronousMessageWithPlugin) UsingPlugin(config PluginConfig) *SynchronousMessageWithPlugin
func (m *UnconfiguredSynchronousMessageBuilder) WithRequest(r RequestBuilderFunc) *SynchronousMessageWithRequest
type SynchronousMessageWithRequest struct {}
type RequestBuilderFunc func(*SynchronousMessageWithRequestBuilder)
type SynchronousMessageWithRequestBuilder struct {}
func (m *SynchronousMessageWithRequestBuilder) WithMetadata(metadata map[string]string) *SynchronousMessageWithRequestBuilder
func (m *SynchronousMessageWithRequestBuilder) WithContent(contentType string, body []byte) *SynchronousMessageWithRequestBuilder
func (m *SynchronousMessageWithRequestBuilder) WithJSONContent(content interface{}) *SynchronousMessageWithRequestBuilder
func (m *SynchronousMessageWithRequest) WithResponse(builder ResponseBuilderFunc) *SynchronousMessageWithResponse
type SynchronousMessageWithResponse struct {}
type ResponseBuilderFunc func(*SynchronousMessageWithResponseBuilder)
type SynchronousMessageWithResponseBuilder struct {}
func (m *SynchronousMessageWithResponseBuilder) WithMetadata(metadata map[string]string) *SynchronousMessageWithResponseBuilder
func (m *SynchronousMessageWithResponseBuilder) WithContent(contentType string, body []byte) *SynchronousMessageWithResponseBuilder
func (m *SynchronousMessageWithResponseBuilder) WithJSONContent(content interface{}) *SynchronousMessageWithResponseBuilder
type SynchronousMessageWithPlugin struct {}
func (s *SynchronousMessageWithPlugin) WithContents(contents string, contentType string) *SynchronousMessageWithPluginContents
type SynchronousMessageWithPluginContents struct {}
func (s *SynchronousMessageWithPluginContents) StartTransport(transport string, address string, config map[string][]interface{}) *SynchronousMessageWithTransport
type SynchronousMessageWithTransport struct {}
type PluginConfig struct {
	Plugin string
	Version string
}
func NewSynchronousPact(config Config) (*SynchronousPact, error)
func (m *SynchronousPact) AddSynchronousMessage(description string) *UnconfiguredSynchronousMessageBuilder
```

### V4 Async Message

File: ./message/v4/asynchronous_message.go

```go
package v4

type AsynchronousMessageBuilder struct {
	Type interface{}
}
func (m *AsynchronousMessageBuilder) Given(state string) *AsynchronousMessageBuilder
func (m *AsynchronousMessageBuilder) GivenWithParameter(state models.ProviderState) *AsynchronousMessageBuilder
func (m *AsynchronousMessageBuilder) ExpectsToReceive(description string) *UnconfiguredAsynchronousMessageBuilder
type UnconfiguredAsynchronousMessageBuilder struct {}
func (m *UnconfiguredAsynchronousMessageBuilder) UsingPlugin(config PluginConfig) *AsynchronousMessageWithPlugin
type AsynchronousMessageWithPlugin struct {}
func (s *AsynchronousMessageWithPlugin) WithContents(contents string, contentType string) *AsynchronousMessageWithPluginContents
type AsynchronousMessageWithPluginContents struct {}
func (s *AsynchronousMessageWithPluginContents) StartTransport(transport string, address string, config map[string][]interface{}) *AsynchronousMessageWithTransport
type AsynchronousMessageWithTransport struct {}
func (m *UnconfiguredAsynchronousMessageBuilder) WithMetadata(metadata map[string]string) *UnconfiguredAsynchronousMessageBuilder
type AsynchronousMessageWithContents struct {}
func (m *UnconfiguredAsynchronousMessageBuilder) WithContent(contentType string, body []byte) *AsynchronousMessageWithContents
func (m *UnconfiguredAsynchronousMessageBuilder) WithJSONContent(content interface{}) *AsynchronousMessageWithContents
func (m *AsynchronousMessageWithContents) AsType(t interface{}) *AsynchronousMessageWithContents
func (m *AsynchronousMessageWithContents) ConsumedBy(handler AsynchronousConsumer) *AsynchronousMessageWithConsumer
type AsynchronousMessageWithConsumer struct {}
func (m *AsynchronousMessageWithConsumer) Verify(t *testing.T) error
type AsynchronousPact struct {}
func NewAsynchronousPact(config Config) (*AsynchronousPact, error)
func (p *AsynchronousPact) AddMessage() *AsynchronousMessageBuilder
func (p *AsynchronousPact) AddAsynchronousMessage() *AsynchronousMessageBuilder
func (p *AsynchronousPact) Verify(t *testing.T, message *AsynchronousMessageBuilder, handler AsynchronousConsumer) error
```

## Provider

File: ./provider/verifier.go

```go
package provider

const MESSAGE_PATH = "/__messages"
type Verifier struct {
	ClientTimeout time.Duration
	Hostname string
}
func NewVerifier() *Verifier
func (v *Verifier) VerifyProvider(t *testing.T, request VerifyRequest) error
func WaitForPort(port int, network string, address string, timeoutDuration time.Duration, message string) error
```

File: ./provider/verify_request.go

```go
package provider

type Hook func() error
type VerifyRequest struct {
	ProviderBaseURL string
	Transports []Transport
	BuildURL string
	FilterConsumers []string
	FilterDescription string
	FilterState string
	FilterNoState bool
	PactURLs []string
	PactFiles []string
	PactDirs []string
	BrokerURL string
	ConsumerVersionSelectors []Selector
	Tags []string
	ProviderTags []string
	ProviderBranch string
	ProviderStatesSetupURL string
	Provider string
	BrokerUsername string
	BrokerPassword string
	BrokerToken string
	FailIfNoPactsFound bool
	PublishVerificationResults bool
	ProviderVersion string
	StateHandlers models.StateHandlers
	MessageHandlers message.Handlers
	BeforeEach Hook
	AfterEach Hook
	RequestFilter proxy.Middleware
	CustomTLSConfig *tls.Config
	EnablePending bool
	IncludeWIPPactsSince *time.Time
	RequestTimeout time.Duration
	DisableSSLVerification bool
	DisableColoredOutput bool
}
```

File: ./provider/consumer_version_selector.go

```go
package provider

type ConsumerVersionSelector struct {
	Tag string
	FallbackTag string
	Latest bool
	Consumer string
	DeployedOrReleased bool
	Deployed bool
	Released bool
	Environment string
	MainBranch bool
	MatchingBranch bool
	Branch string
}
func (c *ConsumerVersionSelector) IsSelector()
type UntypedConsumerVersionSelector map[string]interface{}
func (c *UntypedConsumerVersionSelector) IsSelector()
type Selector interface {
	IsSelector()
}
```

File: ./provider/transport.go

```go
package provider

type Transport struct {
	Scheme string
	Protocol string
	Port uint16
	Path string
}
```
