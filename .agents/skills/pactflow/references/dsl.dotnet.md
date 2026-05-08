While you already know this, here is a reminder of the key PactNet interfaces, types, and methods you will need to use to create a Pact test in .NET (having omitted deprecated and implementation-detail members):

## Matchers

File: ./src/PactNet.Abstractions/Matchers/IMatcher.cs

```csharp
namespace PactNet.Matchers
{
    public interface IMatcher
    {
        string Type { get; }
        dynamic Value { get; }
    }
}
```

File: ./src/PactNet.Abstractions/Matchers/Match.cs

```csharp
namespace PactNet.Matchers
{
    public static class Match
    {
        public static IMatcher Regex(string example, string regex);
        public static IMatcher Type(dynamic example);
        public static IMatcher MinType(dynamic example, int min);
        public static IMatcher MaxType(dynamic example, int max);
        public static IMatcher MinMaxType(dynamic example, int min, int max);
        public static IMatcher Integer(int example);
        public static IMatcher Decimal(double example);
        public static IMatcher Decimal(float example);
        public static IMatcher Decimal(decimal example);
        public static IMatcher Number(int example);
        public static IMatcher Number(double example);
        public static IMatcher Number(float example);
        public static IMatcher Number(decimal example);
        public static IMatcher Equality(dynamic example);
        public static IMatcher Null();
        public static IMatcher Include(string example);
    }
}
```

## Pact

File: ./src/PactNet.Abstractions/IPact.cs

```csharp
namespace PactNet
{
    public interface IPact
    {
        string Consumer { get; }
        string Provider { get; }
        PactConfig Config { get; }
    }

    public interface IPactV2
    {

    }

    public interface IPactV3
    {

    }

    public interface IPactV4
    {

    }
}
```

File: ./src/PactNet.Abstractions/Pact.cs

```csharp
namespace PactNet
{
    public class Pact
    {
        public string Consumer { get; }
        public string Provider { get; }
        public PactConfig Config { get; }
        public static IPactV2 V2(string consumer, string provider);
        public static IPactV2 V2(string consumer, string provider, PactConfig config);
        public static IPactV3 V3(string consumer, string provider);
        public static IPactV3 V3(string consumer, string provider, PactConfig config);
        public static IPactV4 V4(string consumer, string provider);
        public static IPactV4 V4(string consumer, string provider, PactConfig config);
    }
}
```

File: ./src/PactNet.Abstractions/PactConfig.cs

```csharp
namespace PactNet
{
    public class PactConfig
    {
        public string PactDir { get; set; }
        public PactLogLevel LogLevel { get; set; }
        public IEnumerable<IOutput> Outputters { get; set; }
        public JsonSerializerOptions DefaultJsonSettings { get; set; }
        public PactConfig();
    }
}
```

File: ./src/PactNet.Abstractions/LogLevel.cs

```csharp
namespace PactNet
{
    public enum PactLogLevel
    {
        Trace,
        Debug,
        Information,
        Warn,
        Error,
        None
    }
}
```

File: ./src/PactNet.Abstractions/ProviderState.cs

```csharp
namespace PactNet
{
    public class ProviderState
    {
        public string State { get; set; }
        public IDictionary<string, string> Params { get; set; }
    }
}
```

File: ./src/PactNet.Abstractions/IConsumerContext.cs

```csharp
namespace PactNet
{
    public interface IConsumerContext
    {
        Uri MockServerUri { get; }
    }
}
```

## HTTP Consumer

File: ./src/PactNet.Abstractions/IPactBuilder.cs

```csharp
namespace PactNet
{
    public interface IPactBuilder
    {
        void Verify(Action<IConsumerContext> interact);
        Task VerifyAsync(Func<IConsumerContext, Task> interact);
    }

    public interface IPactBuilderV2
    {
        IRequestBuilderV2 UponReceiving(string description);
    }

    public interface IPactBuilderV3
    {
        IRequestBuilderV3 UponReceiving(string description);
    }

    public interface IPactBuilderV4
    {
        IRequestBuilderV4 UponReceiving(string description);
    }
}
```

File: ./src/PactNet.Abstractions/IRequestBuilder.cs

```csharp
namespace PactNet
{
    public interface IRequestBuilderV2
    {
        IRequestBuilderV2 Given(string providerState);
        IRequestBuilderV2 WithRequest(HttpMethod method, string path);
        IRequestBuilderV2 WithRequest(string method, string path);
        IRequestBuilderV2 WithQuery(string key, string value);
        IRequestBuilderV2 WithHeader(string key, string value);
        IRequestBuilderV2 WithHeader(string key, IMatcher matcher);
        IRequestBuilderV2 WithJsonBody(dynamic body);
        IRequestBuilderV2 WithJsonBody(dynamic body, string contentType);
        IRequestBuilderV2 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IRequestBuilderV2 WithJsonBody(dynamic body, JsonSerializerOptions settings, string contentType);
        IRequestBuilderV2 WithBody(string body, string contentType);
        IResponseBuilderV2 WillRespond();
    }

    public interface IRequestBuilderV3
    {
        IRequestBuilderV3 Given(string providerState);
        IRequestBuilderV3 Given(string providerState, IDictionary<string, string> parameters);
        IRequestBuilderV3 WithRequest(HttpMethod method, string path);
        IRequestBuilderV3 WithRequest(string method, string path);
        IRequestBuilderV3 WithQuery(string key, string value);
        IRequestBuilderV3 WithQuery(string key, IMatcher matcher);
        IRequestBuilderV3 WithHeader(string key, string value);
        IRequestBuilderV3 WithHeader(string key, IMatcher matcher);
        IRequestBuilderV3 WithJsonBody(dynamic body);
        IRequestBuilderV3 WithJsonBody(dynamic body, string contentType);
        IRequestBuilderV3 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IRequestBuilderV3 WithJsonBody(dynamic body, JsonSerializerOptions settings, string contentType);
        IRequestBuilderV3 WithBody(string body, string contentType);
        IResponseBuilderV3 WillRespond();
    }

    public interface IRequestBuilderV4
    {
        IRequestBuilderV4 Given(string providerState);
        IRequestBuilderV4 Given(string providerState, IDictionary<string, string> parameters);
        IRequestBuilderV4 WithRequest(HttpMethod method, string path);
        IRequestBuilderV4 WithRequest(string method, string path);
        IRequestBuilderV4 WithQuery(string key, string value);
        IRequestBuilderV4 WithQuery(string key, IMatcher matcher);
        IRequestBuilderV4 WithHeader(string key, string value);
        IRequestBuilderV4 WithHeader(string key, IMatcher matcher);
        IRequestBuilderV4 WithJsonBody(dynamic body);
        IRequestBuilderV4 WithJsonBody(dynamic body, string contentType);
        IRequestBuilderV4 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IRequestBuilderV4 WithJsonBody(dynamic body, JsonSerializerOptions settings, string contentType);
        IRequestBuilderV4 WithBody(string body, string contentType);
        IResponseBuilderV4 WillRespond();
    }
}
```

File: ./src/PactNet.Abstractions/IResponseBuilder.cs

```csharp
namespace PactNet
{
    public interface IResponseBuilderV2
    {
        IResponseBuilderV2 WithStatus(HttpStatusCode status);
        IResponseBuilderV2 WithStatus(ushort status);
        IResponseBuilderV2 WithHeader(string key, string value);
        IResponseBuilderV2 WithHeader(string key, IMatcher matcher);
        IResponseBuilderV2 WithJsonBody(dynamic body);
        IResponseBuilderV2 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IResponseBuilderV2 WithBody(string body, string contentType);
    }

    public interface IResponseBuilderV3
    {
        IResponseBuilderV3 WithStatus(HttpStatusCode status);
        IResponseBuilderV3 WithStatus(ushort status);
        IResponseBuilderV3 WithHeader(string key, string value);
        IResponseBuilderV3 WithHeader(string key, IMatcher matcher);
        IResponseBuilderV3 WithJsonBody(dynamic body);
        IResponseBuilderV3 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IResponseBuilderV3 WithBody(string body, string contentType);
    }

    public interface IResponseBuilderV4
    {
        IResponseBuilderV4 WithStatus(HttpStatusCode status);
        IResponseBuilderV4 WithStatus(ushort status);
        IResponseBuilderV4 WithHeader(string key, string value);
        IResponseBuilderV4 WithHeader(string key, IMatcher matcher);
        IResponseBuilderV4 WithJsonBody(dynamic body);
        IResponseBuilderV4 WithJsonBody(dynamic body, JsonSerializerOptions settings);
        IResponseBuilderV4 WithBody(string body, string contentType);
    }
}
```

## Message Consumer

File: ./src/PactNet.Abstractions/IMessagePactBuilder.cs

```csharp
namespace PactNet
{
    public interface IMessagePactBuilderV3
    {
        IMessageBuilderV3 ExpectsToReceive(string description);
        IMessagePactBuilderV3 WithPactMetadata(string @namespace, string name, string value);
    }

    public interface IMessagePactBuilderV4
    {
        IMessageBuilderV4 ExpectsToReceive(string description);
        IMessagePactBuilderV4 WithPactMetadata(string @namespace, string name, string value);
    }
}
```

File: ./src/PactNet.Abstractions/IMessageBuilder.cs

```csharp
namespace PactNet
{
    public interface IMessageBuilderV3
    {
        IMessageBuilderV3 Given(string providerState);
        IMessageBuilderV3 Given(string providerState, IDictionary<string, string> parameters);
        IMessageBuilderV3 WithMetadata(string key, string value);
        IConfiguredMessageVerifier WithJsonContent(dynamic body);
        IConfiguredMessageVerifier WithJsonContent(dynamic body, JsonSerializerOptions settings);
    }

    public interface IMessageBuilderV4
    {
        IMessageBuilderV4 Given(string providerState);
        IMessageBuilderV4 Given(string providerState, IDictionary<string, string> parameters);
        IMessageBuilderV4 WithMetadata(string key, string value);
        IConfiguredMessageVerifier WithJsonContent(dynamic body);
        IConfiguredMessageVerifier WithJsonContent(dynamic body, JsonSerializerOptions settings);
    }
}
```

File: ./src/PactNet.Abstractions/IConfiguredMessageVerifier.cs

```csharp
namespace PactNet
{
    public interface IConfiguredMessageVerifier
    {
        void Verify<T>(Action<T> handler);
        Task VerifyAsync<T>(Func<T, Task> handler);
    }
}
```

## Extension Methods

File: ./src/PactNet/PactExtensions.cs

```csharp
namespace PactNet
{
    public static class PactExtensions
    {
        public static IPactBuilderV2 WithHttpInteractions(this IPactV2 pact, int? port = null, IPAddress host = IPAddress.Loopback);
        public static IPactBuilderV3 WithHttpInteractions(this IPactV3 pact, int? port = null, IPAddress host = IPAddress.Loopback);
        public static IPactBuilderV4 WithHttpInteractions(this IPactV4 pact, int? port = null, IPAddress host = IPAddress.Loopback);
        public static IMessagePactBuilderV3 WithMessageInteractions(this IPactV3 pact);
        public static IMessagePactBuilderV4 WithMessageInteractions(this IPactV4 pact);
    }
}
```

## Provider Verifier

File: ./src/PactNet.Abstractions/Verifier/IPactVerifier.cs

```csharp
namespace PactNet.Verifier
{
    public interface IPactVerifier
    {
        IPactVerifier WithHttpEndpoint(Uri pactUri);
        IPactVerifier WithMessages(Action<IMessageScenarios> configure);
        IPactVerifier WithMessages(Action<IMessageScenarios> configure, JsonSerializerOptions settings);
        IPactVerifierSource WithFileSource(FileInfo pactFile);
        IPactVerifierSource WithDirectorySource(DirectoryInfo directory, params string[] consumers);
        IPactVerifierSource WithUriSource(Uri pactUri);
        IPactVerifierSource WithUriSource(Uri pactUri, Action<IPactUriOptions> configure);
        IPactVerifierSource WithPactBrokerSource(Uri brokerBaseUri);
        IPactVerifierSource WithPactBrokerSource(Uri brokerBaseUri, Action<IPactBrokerOptions> configure);
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/IPactVerifierSource.cs

```csharp
namespace PactNet.Verifier
{
    public interface IPactVerifierSource
    {
        IPactVerifierSource WithProviderStateUrl(Uri providerStateUri);
        IPactVerifierSource WithProviderStateUrl(Uri providerStateUri, Action<IProviderStateOptions> configure);
        IPactVerifierSource WithFilter(string description = null, string providerState = null);
        IPactVerifierSource WithRequestTimeout(TimeSpan timeout);
        IPactVerifierSource WithSslVerificationDisabled();
        IPactVerifierSource WithCustomHeader(string name, string value);
        void Verify();
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/IPactBrokerOptions.cs

```csharp
namespace PactNet.Verifier
{
    public interface IPactBrokerOptions
    {
        IPactBrokerOptions BasicAuthentication(string username, string password);
        IPactBrokerOptions TokenAuthentication(string token);
        IPactBrokerOptions EnablePending();
        IPactBrokerOptions ProviderBranch(string branch);
        IPactBrokerOptions ProviderTags(params string[] tags);
        IPactBrokerOptions ConsumerTags(params string[] tags);
        IPactBrokerOptions ConsumerVersionSelectors(ICollection<ConsumerVersionSelector> selectors);
        IPactBrokerOptions ConsumerVersionSelectors(params ConsumerVersionSelector[] selectors);
        IPactBrokerOptions IncludeWipPactsSince(DateTime date);
        IPactBrokerOptions PublishResults(string providerVersion);
        IPactBrokerOptions PublishResults(string providerVersion, Action<IPactBrokerPublishOptions> configure);
        IPactBrokerOptions PublishResults(bool condition, string providerVersion);
        IPactBrokerOptions PublishResults(bool condition, string providerVersion, Action<IPactBrokerPublishOptions> configure);
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/IPactBrokerPublishOptions.cs

```csharp
namespace PactNet.Verifier
{
    public interface IPactBrokerPublishOptions
    {
        IPactBrokerPublishOptions ProviderTags(params string[] tags);
        IPactBrokerPublishOptions ProviderBranch(string branch);
        IPactBrokerPublishOptions BuildUri(Uri uri);
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/PactVerifierConfig.cs

```csharp
namespace PactNet.Verifier
{
    public class PactVerifierConfig
    {
        public PactLogLevel LogLevel { get; set; }
        public IEnumerable<IOutput> Outputters { get; set; }
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/ConsumerVersionSelector.cs

```csharp
namespace PactNet.Verifier
{
    public class ConsumerVersionSelector
    {
        public bool MainBranch { get; set; }
        public bool MatchingBranch { get; set; }
        public string Branch { get; set; }
        public string FallbackBranch { get; set; }
        public string Tag { get; set; }
        public string FallbackTag { get; set; }
        public bool Deployed { get; set; }
        public bool Released { get; set; }
        public bool DeployedOrReleased { get; set; }
        public string Environment { get; set; }
        public bool? Latest { get; set; }
        public string Consumer { get; set; }
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/Messaging/IMessageScenarios.cs

```csharp
namespace PactNet.Verifier.Messaging
{
    public interface IMessageScenarios
    {
        IMessageScenarios Add(string description, Func<dynamic> factory);
        IMessageScenarios Add(string description, Action<IMessageScenarioBuilder> configure);
        IMessageScenarios Add(string description, Func<IMessageScenarioBuilder, Task> configure);
    }
}
```

File: ./src/PactNet.Abstractions/Verifier/Messaging/IMessageScenarioBuilder.cs

```csharp
namespace PactNet.Verifier.Messaging
{
    public interface IMessageScenarioBuilder
    {
        IMessageScenarioBuilder WithMetadata(dynamic metadata);
        void WithContent(Func<dynamic> factory);
        void WithContent(Func<dynamic> factory, JsonSerializerOptions settings);
        Task WithContentAsync(Func<Task<dynamic>> factory);
        Task WithContentAsync(Func<Task<dynamic>> factory, JsonSerializerOptions settings);
    }
}
```
