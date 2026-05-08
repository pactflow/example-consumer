While you already know this, here is a reminder of the key pact-jvm Kotlin classes and methods you will need to use to create a Pact test in Kotlin (having omitted deprecated and implementation-detail members):


## HTTP Consumer DSL

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/ConsumerPactBuilder.kt
```kotlin
class ConsumerPactBuilder(
  /**
   * Returns the name of the consumer
   * @return consumer name
   */
  val consumerName: String
  ) {
    /**
    * Name the provider that the consumer has a pact with
    * @param provider provider name
    */
    fun hasPactWith(provider: String): PactDslWithProvider
    fun pactSpecVersion(version: PactSpecVersion): ConsumerPactBuilder
    companion object {
        /**
        * Name the consumer of the pact
        * @param consumer Consumer name
        */
        fun consumer(consumer: String): ConsumerPactBuilder
        fun jsonBody(): PactDslJsonBody
        fun xmlToString(body: Document): String
    }
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslWithProvider.kt
```kotlin
class PactDslWithProvider@JvmOverloads constructor(
  val consumerPactBuilder: ConsumerPactBuilder,
  private val providerName: String,
  val version: PactSpecVersion = PactSpecVersion.V3
) {
    /**
    * Describe the state the provider needs to be in for the pact test to be verified.
    *
    * @param state Provider state
    */
    fun given(state: String): PactDslWithState
    /**
    * Describe the state the provider needs to be in for the pact test to be verified.
    *
    * @param state Provider state
    * @param params Data parameters for the state
    */
    fun given(state: String, params: Map<String, Any?>): PactDslWithState
    /**
    * Describe the state the provider needs to be in for the pact test to be verified.
    *
    * @param firstKey Key of first parameter element
    * @param firstValue Value of first parameter element
    * @param paramsKeyValuePair Additional parameters in key-value pairs
    */
    fun given(state: String, firstKey: String, firstValue: Any?, vararg paramsKeyValuePair: Any): PactDslWithState
    /**
    * Description of the request that is expected to be received
    *
    * @param description request description
    */
    fun uponReceiving(description: String): PactDslRequestWithoutPath
    fun setDefaultRequestValues(defaultRequestValues: PactDslRequestWithoutPath)
    fun setDefaultResponseValues(defaultResponseValues: PactDslResponse)
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactDslWithProvider
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactDslWithProvider
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslWithState.kt
```kotlin
class PactDslWithState@JvmOverloads constructor(
  private val consumerPactBuilder: ConsumerPactBuilder,
  var consumerName: String,
  var providerName: String,
  private val defaultRequestValues: PactDslRequestWithoutPath?,
  private val defaultResponseValues: PactDslResponse?,
  val version: PactSpecVersion = PactSpecVersion.V3,
  private var additionalMetadata: MutableMap<String, JsonValue> = mutableMapOf()
) {
    /**
    * Description of the request that is expected to be received
    *
    * @param description request description
    */
    fun uponReceiving(description: String): PactDslRequestWithoutPath
    /**
    * Adds another provider state to this interaction
    * @param stateDesc Description of the state
    */
    fun given(stateDesc: String): PactDslWithState
    /**
    * Adds another provider state to this interaction
    * @param stateDesc Description of the state
    * @param params State data parameters
    */
    fun given(stateDesc: String, params: Map<String, Any?>): PactDslWithState
    /**
    * Adds a comment to this interaction
    */
    fun comment(comment: String): PactDslWithState
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactDslWithState
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactDslWithState
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslRequestWithoutPath.kt
```kotlin
class PactDslRequestWithoutPath@JvmOverloads constructor(
    private val consumerPactBuilder: ConsumerPactBuilder,
    private val pactDslWithState: PactDslWithState,
    private val description: String,
    defaultRequestValues: PactDslRequestWithoutPath?,
    private val defaultResponseValues: PactDslResponse?,
    version: PactSpecVersion = PactSpecVersion.V3,
    private val additionalMetadata: MutableMap<String, JsonValue>
) : PactDslRequestBase(defaultRequestValues, pactDslWithState.comments, version) {
    /**
    * The HTTP method for the request
    *
    * @param method Valid HTTP method
    */
    fun method(method: String): PactDslRequestWithoutPath
    /**
    * Headers to be included in the request
    *
    * @param headers Key-value pairs
    */
    fun headers(headers: Map<String, String>): PactDslRequestWithoutPath
    /**
    * Headers to be included in the request
    *
    * @param firstHeaderName      The name of the first header
    * @param firstHeaderValue     The value of the first header
    * @param headerNameValuePairs Additional headers in name-value pairs.
    */
    fun headers(
    firstHeaderName: String,
    firstHeaderValue: String,
    vararg headerNameValuePairs: String
  ): PactDslRequestWithoutPath
    /**
    * The query string for the request
    *
    * @param query query string
    */
    fun query(query: String): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String, contentType: String): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String, contentType: ContentType): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>, contentType: String): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>, contentType: ContentType): PactDslRequestWithoutPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String): PactDslRequestWithoutPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String, contentType: String): PactDslRequestWithoutPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String, contentType: ContentType): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Request body in JSON form
    */
    fun body(body: JSONObject): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Built using the Pact body DSL
    */
    fun body(body: DslPart): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body XML Document
    */
    fun body(body: Document): PactDslRequestWithoutPath
    /**
    * XML Response body to return
    *
    * @param xmlBuilder XML Builder used to construct the XML document
    */
    fun body(xmlBuilder: PactXmlBuilder): PactDslRequestWithoutPath
    /**
    * The body of the request
    *
    * @param body Built using MultipartEntityBuilder
    */
    fun body(body: MultipartEntityBuilder): PactDslRequestWithoutPath
    /**
    * Sets up a content type matcher to match any body of the given content type
    */
    fun bodyMatchingContentType(contentType: String, exampleContents: String): PactDslRequestWithoutPath
    /**
    * Request body as a binary data. It will match any expected bodies against the content type.
    * @param example Example contents to use in the consumer test
    * @param contentType Content type of the data
    */
    fun withBinaryData(example: ByteArray, contentType: String): PactDslRequestWithoutPath
    /**
    * The path of the request
    *
    * @param path string path
    */
    fun path(path: String): PactDslRequestWithPath
    /**
    * Variant of [PactDslRequestWithPath.path] that introduces a Lambda DSL syntax to better visually separate
    * request and response in a pact.
    *
    * @see PactDslRequestWithPath.path
    * @sample au.com.dius.pact.consumer.dsl.samples.PactLambdaDslSamples.requestResponse
    */
    fun path(
    path: String,
    addRequestMatchers: PactDslRequestWithPath.() -> PactDslRequestWithPath
  ): PactDslRequestWithPath
    /**
    * The path of the request. This will generate a random path to use when generating requests
    *
    * @param pathRegex string path regular expression to match with
    */
    fun matchPath(pathRegex: String, path: String = Random.generateRandomString(pathRegex)): PactDslRequestWithPath
    /**
    * Variant of [PactDslRequestWithoutPath.matchPath] that introduces a Lambda DSL syntax to better visually separate
    * request and response in a pact.
    *
    * @see PactDslRequestWithoutPath.matchPath
    * @sample au.com.dius.pact.consumer.dsl.samples.PactLambdaDslSamples.requestResponse
    */
    fun matchPath(
    pathRegex: String,
    path: String = Random.generateRandomString(pathRegex),
    addRequestMatchers: PactDslRequestWithPath.() -> PactDslRequestWithPath
  ): PactDslRequestWithPath
    /**
    * Sets up a file upload request. This will add the correct content type header to the request
    * @param partName This is the name of the part in the multipart body.
    * @param fileName This is the name of the file that was uploaded
    * @param fileContentType This is the content type of the uploaded file
    * @param data This is the actual file contents
    */
    fun withFileUpload(
    partName: String,
    fileName: String,
    fileContentType: String?,
    data: ByteArray
  ): PactDslRequestWithoutPath
    /**
    * Adds a header that will have it's value injected from the provider state
    * @param name Header Name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun headerFromProviderState(name: String, expression: String, example: String): PactDslRequestWithoutPath
    /**
    * Adds a query parameter that will have it's value injected from the provider state
    * @param name Name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun queryParameterFromProviderState(name: String, expression: String, example: String): PactDslRequestWithoutPath
    /**
    * Sets the path to have it's value injected from the provider state
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun pathFromProviderState(expression: String, example: String): PactDslRequestWithPath
    /**
    * Variant of [PactDslRequestWithoutPath.pathFromProviderState] that introduces a Lambda DSL syntax to better
    * visually separate request and response in a pact.
    *
    * @see PactDslRequestWithoutPath.pathFromProviderState
    * @sample au.com.dius.pact.consumer.dsl.samples.PactLambdaDslSamples.requestResponse
    */
    fun pathFromProviderState(
    expression: String,
    example: String,
    addRequestMatchers: PactDslRequestWithPath.() -> PactDslRequestWithPath
  ): PactDslRequestWithPath
    /**
    * Matches a date field using the provided date pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingDate(field: String, pattern: String, example: String): PactDslRequestWithoutPath
    /**
    * Matches a date field using the provided date pattern. The current system date will be used for the example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingDate(field: String, pattern: String): PactDslRequestWithoutPath
    /**
    * Matches a time field using the provided time pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingTime(field: String, pattern: String, example: String): PactDslRequestWithoutPath
    /**
    * Matches a time field using the provided time pattern. The current system time will be used for the example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingTime(field: String, pattern: String): PactDslRequestWithoutPath
    /**
    * Matches a datetime field using the provided pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingDatetime(field: String, pattern: String, example: String): PactDslRequestWithoutPath
    /**
    * Matches a datetime field using the provided pattern. The current system date and time will be used for the
    * example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingDatetime(field: String, pattern: String): PactDslRequestWithoutPath
    /**
    * Matches a date field using the ISO date pattern.  The current system date will be used for the example value
    * if not provided.
    * @param field field name
    * @param example Example value
    */
    fun queryMatchingISODate(field: String, example: String? = null): PactDslRequestWithoutPath
    /**
    * Matches a time field using the ISO time pattern
    * @param field field name
    * @param example Example value
    */
    fun queryMatchingISOTime(field: String, example: String?): PactDslRequestWithoutPath
    /**
    * Matches a time field using the ISO time pattern. The current system time will be used for the example value.
    * @param field field name
    */
    fun queryMatchingTime(field: String): PactDslRequestWithoutPath
    /**
    * Matches a datetime field using the ISO pattern. The current system date and time will be used for the example
    * value if not provided.
    * @param field field name
    * @param example Example value
    */
    fun queryMatchingISODatetime(field: String, example: String? = null): PactDslRequestWithoutPath
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactDslRequestWithoutPath
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactDslRequestWithoutPath
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslRequestWithPath.kt
```kotlin
class PactDslRequestWithPath : PactDslRequestBase {
    /**
    * The HTTP method for the request
    *
    * @param method Valid HTTP method
    */
    fun method(method: String): PactDslRequestWithPath
    /**
    * Headers to be included in the request
    *
    * @param firstHeaderName      The name of the first header
    * @param firstHeaderValue     The value of the first header
    * @param headerNameValuePairs Additional headers in name-value pairs.
    */
    fun headers(
    firstHeaderName: String,
    firstHeaderValue: String,
    vararg headerNameValuePairs: String
  ): PactDslRequestWithPath
    /**
    * Headers to be included in the request
    *
    * @param headers Key-value pairs
    */
    fun headers(headers: Map<String, String>): PactDslRequestWithPath
    /**
    * The query string for the request
    *
    * @param query query string
    */
    fun query(query: String): PactDslRequestWithPath
    /**
    * The encoded query string for the request
    *
    * @param query query string
    */
    fun encodedQuery(query: String): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String, contentType: String): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in string form
    */
    fun body(body: String, contentType: ContentType): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>, contentType: String): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>, contentType: ContentType): PactDslRequestWithPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String): PactDslRequestWithPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String, contentType: String): PactDslRequestWithPath
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String, contentType: ContentType): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Request body in JSON form
    */
    fun body(body: JSONObject): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Built using the Pact body DSL
    */
    fun body(body: DslPart): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body XML Document
    */
    fun body(body: Document): PactDslRequestWithPath
    /**
    * XML body to return
    *
    * @param xmlBuilder XML Builder used to construct the XML document
    */
    fun body(xmlBuilder: PactXmlBuilder): PactDslRequestWithPath
    /**
    * The body of the request
    *
    * @param body Built using MultipartEntityBuilder
    */
    fun body(body: MultipartEntityBuilder): PactDslRequestWithPath
    /**
    * Sets up a content type matcher to match any body of the given content type
    */
    fun bodyMatchingContentType(contentType: String, exampleContents: String): PactDslRequestWithPath
    /**
    * Request body as a binary data. It will match any expected bodies against the content type.
    * @param example Example contents to use in the consumer test
    * @param contentType Content type of the data
    */
    fun withBinaryData(example: ByteArray, contentType: String): PactDslRequestWithPath
    /**
    * The path of the request
    *
    * @param path string path
    */
    fun path(path: String): PactDslRequestWithPath
    /**
    * The path of the request. This will generate a random path to use when generating requests if
    * the example value is not provided.
    *
    * @param path      string path to use when generating requests
    * @param pathRegex regular expression to use to match paths
    */
    fun matchPath(pathRegex: String, path: String = Random.generateRandomString(pathRegex)): PactDslRequestWithPath
    /**
    * Match a request header. A random example header value will be generated from the provided regular expression
    * if the example value is not provided.
    *
    * @param header        Header to match
    * @param regex         Regular expression to match
    * @param headerExample Example value to use
    */
    fun matchHeader(
    header: String,
    regex: String,
    headerExample: String = Random.generateRandomString(regex)
  ): PactDslRequestWithPath
    /**
    * Define the response to return
    */
    fun willRespondWith(): PactDslResponse
    /**
    * Variant of [PactDslRequestWithPath.willRespondWith] that introduces a Lambda DSL syntax to better visually
    * separate request and response in a pact.
    *
    * @see PactDslRequestWithPath.willRespondWith
    * @sample au.com.dius.pact.consumer.dsl.samples.PactLambdaDslSamples.requestResponse
    */
    fun willRespondWith(addResponseMatchers: PactDslResponse.() -> PactDslResponse): PactDslResponse
    /**
    * Match a query parameter with a regex. A random query parameter value will be generated from the regex
    * if the example value is not provided.
    *
    * @param parameter Query parameter
    * @param regex     Regular expression to match with
    * @param example   Example value to use for the query parameter (unencoded)
    */
    fun matchQuery(
    parameter: String,
    regex: String,
    example: String = Random.generateRandomString(regex)
  ): PactDslRequestWithPath
    /**
    * Match a repeating query parameter with a regex.
    *
    * @param parameter Query parameter
    * @param regex     Regular expression to match with each element
    * @param example   Example value list to use for the query parameter (unencoded)
    */
    fun matchQuery(parameter: String, regex: String, example: List<String>): PactDslRequestWithPath
    /**
    * Sets up a file upload request. This will add the correct content type header to the request
    * @param partName This is the name of the part in the multipart body.
    * @param fileName This is the name of the file that was uploaded
    * @param fileContentType This is the content type of the uploaded file
    * @param data This is the actual file contents
    */
    fun withFileUpload(
    partName: String,
    fileName: String,
    fileContentType: String?,
    data: ByteArray
  ): PactDslRequestWithPath
    /**
    * Adds a header that will have it's value injected from the provider state
    * @param name Header Name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun headerFromProviderState(name: String, expression: String, example: String): PactDslRequestWithPath
    /**
    * Adds a query parameter that will have it's value injected from the provider state
    * @param name Name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun queryParameterFromProviderState(name: String, expression: String, example: String): PactDslRequestWithPath
    /**
    * Sets the path to have it's value injected from the provider state
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun pathFromProviderState(expression: String, example: String): PactDslRequestWithPath
    /**
    * Matches a date field using the provided date pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingDate(field: String, pattern: String, example: String): PactDslRequestWithPath
    /**
    * Matches a date field using the provided date pattern. The current system date will be used for the example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingDate(field: String, pattern: String): PactDslRequestWithPath
    /**
    * Matches a time field using the provided time pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingTime(field: String, pattern: String, example: String): PactDslRequestWithPath
    /**
    * Matches a time field using the provided time pattern. The current system time will be used for the example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingTime(field: String, pattern: String): PactDslRequestWithPath
    /**
    * Matches a datetime field using the provided pattern
    * @param field field name
    * @param pattern pattern to match
    * @param example Example value
    */
    fun queryMatchingDatetime(field: String, pattern: String, example: String): PactDslRequestWithPath
    /**
    * Matches a datetime field using the provided pattern. The current system date and time will be used for
    * the example value.
    * @param field field name
    * @param pattern pattern to match
    */
    fun queryMatchingDatetime(field: String, pattern: String): PactDslRequestWithPath
    /**
    * Matches a date field using the ISO date pattern. The current system date will be used for the example value.
    * @param field field name
    */
    fun queryMatchingISODate(field: String, example: String? = null): PactDslRequestWithPath
    /**
    * Matches a time field using the ISO time pattern
    * @param field field name
    * @param example Example value
    */
    fun queryMatchingISOTime(field: String, example: String?): PactDslRequestWithPath
    /**
    * Matches a time field using the ISO time pattern. The current system time will be used for the example value.
    * @param field field name
    */
    fun queryMatchingTime(field: String): PactDslRequestWithPath
    /**
    * Matches a datetime field using the ISO pattern. The current system date and time will be used for the example
    * value if not provided.
    * @param field field name
    * @param example Example value
    */
    fun queryMatchingISODatetime(field: String, example: String? = null): PactDslRequestWithPath
    /**
    * Sets the body using the builder
    * @param builder Body Builder
    */
    fun body(builder: BodyBuilder): PactDslRequestWithPath
    /**
    * Adds a comment to this interaction
    */
    fun comment(comment: String): PactDslRequestWithPath
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactDslRequestWithPath
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactDslRequestWithPath
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslResponse.kt
```kotlin
class PactDslResponse@JvmOverloads constructor(
    private val consumerPactBuilder: ConsumerPactBuilder,
    private val request: PactDslRequestWithPath?,
    private val defaultRequestValues: PactDslRequestWithoutPath? = null,
    private val defaultResponseValues: PactDslResponse? = null,
    private val comments: MutableList<String> = mutableListOf(),
    val version: PactSpecVersion = PactSpecVersion.V3,
    private val additionalMetadata: MutableMap<String, JsonValue> = mutableMapOf()
) {
    /**
    * Response status code
    *
    * @param status HTTP status code
    */
    fun status(status: Int): PactDslResponse
    /**
    * Response headers to return
    *
    * Provide the headers you want to validate, other headers will be ignored.
    *
    * @param headers key-value pairs of headers
    */
    fun headers(headers: Map<String, String>): PactDslResponse
    /**
    * Response body to return
    *
    * @param body Response body in string form
    */
    fun body(body: String): PactDslResponse
    /**
    * Response body to return
    *
    * @param body body in string form
    * @param contentType the Content-Type response header value
    */
    fun body(body: String, contentType: String): PactDslResponse
    /**
    * Response body to return
    *
    * @param body body in string form
    * @param contentType the Content-Type response header value
    */
    fun body(body: String, contentType: ContentType): PactDslResponse
    /**
    * The body of the request
    *
    * @param body Response body in Java Functional Interface Supplier that must return a string
    */
    fun body(body: Supplier<String>): PactDslResponse
    /**
    * The body of the request
    *
    * @param body Response body in Java Functional Interface Supplier that must return a string
    * @param contentType the Content-Type response header value
    */
    fun body(body: Supplier<String>, contentType: String): PactDslResponse
    /**
    * The body of the request
    *
    * @param body Response body in Java Functional Interface Supplier that must return a string
    * @param contentType the Content-Type response header value
    */
    fun body(body: Supplier<String>, contentType: ContentType): PactDslResponse
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    */
    fun bodyWithSingleQuotes(body: String): PactDslResponse
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    * @param contentType the Content-Type response header value
    */
    fun bodyWithSingleQuotes(body: String, contentType: String): PactDslResponse
    /**
    * The body of the request with possible single quotes as delimiters
    * and using [QuoteUtil] to convert single quotes to double quotes if required.
    *
    * @param body Request body in string form
    * @param contentType the Content-Type response header value
    */
    fun bodyWithSingleQuotes(body: String, contentType: ContentType): PactDslResponse
    /**
    * Response body to return
    *
    * @param body Response body in JSON form
    */
    fun body(body: JSONObject): PactDslResponse
    /**
    * Response body to return
    *
    * @param body Response body built using the Pact body DSL
    */
    fun body(body: DslPart): PactDslResponse
    /**
    * Response body to return
    *
    * @param body Response body as an XML Document
    */
    fun body(body: Document): PactDslResponse
    /**
    * Sets the body using the builder
    * @param builder Body Builder
    */
    fun body(builder: BodyBuilder): PactDslResponse
    /**
    * Response body as a binary data. It will match any expected bodies against the content type.
    * @param example Example contents to use in the consumer test
    * @param contentType Content type of the data
    */
    fun withBinaryData(example: ByteArray, contentType: String): PactDslResponse
    /**
    * Match a response header. A random example header value will be generated from the provided regular
    * expression if the example value is not provided.
    *
    * @param header        Header to match
    * @param regexp        Regular expression to match
    * @param headerExample Example value to use
    */
    fun matchHeader(header: String, regexp: String?, headerExample: String = Random.generateRandomString(regexp.orEmpty())): PactDslResponse
    /**
    * Terminates the DSL and builds a pact to represent the interactions
    */
    fun toPact(pactClass: Class<P>): P
    /**
    * Terminates the DSL and builds a pact to represent the interactions
    */
    fun toPact(): RequestResponsePact
    /**
    * Description of the request that is expected to be received
    *
    * @param description request description
    */
    fun uponReceiving(description: String): PactDslRequestWithPath
    /**
    * Adds a provider state to this interaction
    * @param state Description of the state
    */
    fun given(state: String): PactDslWithState
    /**
    * Adds a provider state to this interaction
    * @param state Description of the state
    * @param params Data parameters for this state
    */
    fun given(state: String, params: Map<String, Any>): PactDslWithState
    /**
    * Adds a header that will have it's value injected from the provider state
    * @param name Header Name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to use in the consumer test
    */
    fun headerFromProviderState(name: String, expression: String, example: String): PactDslResponse
    /**
    * Match a set cookie header
    * @param cookie Cookie name to match
    * @param regex Regex to match the cookie value with
    * @param example Example value
    */
    fun matchSetCookie(cookie: String, regex: String, example: String): PactDslResponse
    /**
    * XML Response body to return
    *
    * @param xmlBuilder XML Builder used to construct the XML document
    */
    fun body(xmlBuilder: PactXmlBuilder): PactDslResponse
    /**
    * Adds a comment to this interaction
    */
    fun comment(comment: String): PactDslResponse
    /**
    * Match any HTTP Information response status (100-199)
    */
    fun informationStatus(): PactDslResponse
    /**
    * Match any HTTP success response status (200-299)
    */
    fun successStatus(): PactDslResponse
    /**
    * Match any HTTP redirect response status (300-399)
    */
    fun redirectStatus(): PactDslResponse
    /**
    * Match any HTTP client error response status (400-499)
    */
    fun clientErrorStatus(): PactDslResponse
    /**
    * Match any HTTP server error response status (500-599)
    */
    fun serverErrorStatus(): PactDslResponse
    /**
    * Match any HTTP non-error response status (< 400)
    */
    fun nonErrorStatus(): PactDslResponse
    /**
    * Match any HTTP error response status (>= 400)
    */
    fun errorStatus(): PactDslResponse
    /**
    * Match any HTTP status code in the provided list
    */
    fun statusCodes(statusCodes: List<Int>): PactDslResponse
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactDslResponse
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactDslResponse
    /**
    * Sets up a content type matcher to match any body of the given content type
    */
    fun bodyMatchingContentType(contentType: String, exampleContents: String): PactDslResponse
}
```


## Body / Matching DSL

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslJsonBody.kt
```kotlin
class PactDslJsonBody : DslPart {
    /**
    * Attribute that must be the specified value
    * @param name attribute name
    * @param value string value
    */
    fun stringValue(name: String, vararg values: String?): PactDslJsonBody
    /**
    * Attribute that must be the specified number
    * @param name attribute name
    * @param value number value
    */
    fun numberValue(name: String, vararg values: Number): PactDslJsonBody
    /**
    * Attribute that must be the specified boolean
    * @param name attribute name
    * @param value boolean value
    */
    fun booleanValue(name: String, vararg values: Boolean?): PactDslJsonBody
    /**
    * Attribute that must be the same type as the example
    * @param name attribute name
    */
    fun like(name: String, vararg examples: Any?): PactDslJsonBody
    /**
    * Attribute that can be any string
    * @param name attribute name
    */
    fun stringType(name: String): PactDslJsonBody
    /**
    * Attributes that can be any string
    * @param names attribute names
    */
    fun stringTypes(vararg names: String?): PactDslJsonBody
    /**
    * Attribute that can be any string
    * @param name attribute name
    * @param example example value to use for generated bodies
    */
    fun stringType(name: String, vararg examples: String?): PactDslJsonBody
    /**
    * Attribute that can be any number
    * @param name attribute name
    */
    fun numberType(name: String): PactDslJsonBody
    /**
    * Attributes that can be any number
    * @param names attribute names
    */
    fun numberTypes(vararg names: String?): PactDslJsonBody
    /**
    * Attribute that can be any number
    * @param name attribute name
    * @param number example number to use for generated bodies
    */
    fun numberType(name: String, vararg numbers: Number?): PactDslJsonBody
    /**
    * Attribute that must be an integer
    * @param name attribute name
    */
    fun integerType(name: String): PactDslJsonBody
    /**
    * Attributes that must be an integer
    * @param names attribute names
    */
    fun integerTypes(vararg names: String?): PactDslJsonBody
    /**
    * Attribute that must be an integer
    * @param name attribute name
    * @param number example integer value to use for generated bodies
    */
    fun integerType(name: String, vararg numbers: Long?): PactDslJsonBody
    /**
    * Attribute that must be an integer
    * @param name attribute name
    * @param number example integer value to use for generated bodies
    */
    fun integerType(name: String, vararg numbers: Int?): PactDslJsonBody
    /**
    * Attribute that must be a decimal value (has significant digits after the decimal point)
    * @param name attribute name
    */
    fun decimalType(name: String): PactDslJsonBody
    /**
    * Attributes that must be a decimal values (have significant digits after the decimal point)
    * @param names attribute names
    */
    fun decimalTypes(vararg names: String?): PactDslJsonBody
    /**
    * Attribute that must be a decimalType value (has significant digits after the decimal point)
    * @param name attribute name
    * @param number example decimalType value
    */
    fun decimalType(name: String, vararg numbers: BigDecimal?): PactDslJsonBody
    /**
    * Attribute that must be a decimalType value (has significant digits after the decimal point)
    * @param name attribute name
    * @param number example decimalType value
    */
    fun decimalType(name: String, vararg numbers: Double?): PactDslJsonBody
    /**
    * Attribute that can be any number and which must match the provided regular expression
    * @param name attribute name
    * @param regex Regular expression that the numbers string form must match
    * @param example example number to use for generated bodies
    */
    fun numberMatching(name: String, regex: String, example: Number): PactDslJsonBody
    /**
    * Attribute that can be any number decimal number (has significant digits after the decimal point) and which must
    * match the provided regular expression
    * @param name attribute name
    * @param regex Regular expression that the numbers string form must match
    * @param example example number to use for generated bodies
    */
    fun decimalMatching(name: String, regex: String, example: Double): PactDslJsonBody
    /**
    * Attribute that can be any integer and which must match the provided regular expression
    * @param name attribute name
    * @param regex Regular expression that the numbers string form must match
    * @param example example integer to use for generated bodies
    */
    fun integerMatching(name: String, regex: String, example: Int): PactDslJsonBody
    /**
    * Attributes that must be a boolean
    * @param names attribute names
    */
    fun booleanTypes(vararg names: String?): PactDslJsonBody
    /**
    * Attribute that must be a boolean
    * @param name attribute name
    * @param example example boolean to use for generated bodies
    */
    fun booleanType(name: String, vararg examples: Boolean? = arrayOf(true)): PactDslJsonBody
    /**
    * Attribute that must match the regular expression
    * @param name attribute name
    * @param regex regular expression
    * @param value example value to use for generated bodies
    */
    fun stringMatcher(name: String, regex: String, vararg values: String?): PactDslJsonBody
    /**
    * Attribute that must match the regular expression
    * @param name attribute name
    * @param regex regular expression
    */
    fun stringMatcher(name: String, regex: String): PactDslJsonBody
    /**
    * Attribute that must be an ISO formatted datetime
    * @param name
    */
    fun datetime(name: String): PactDslJsonBody
    /**
    * Attribute that must match the given datetime format
    * @param name attribute name
    * @param format datetime format
    */
    fun datetime(name: String, format: String): PactDslJsonBody
    /**
    * Attribute that must match the given datetime format
    * @param name attribute name
    * @param format datetime format
    * @param example example date and time to use for generated bodies
    * @param timeZone time zone used for formatting of example date and time
    */
    fun datetime(
    name: String,
    format: String,
    example: Date,
    timeZone: TimeZone = TimeZone.getDefault()
  )
    /**
    * Attribute that must match the given datetime format
    * @param name attribute name
    * @param format datetime format
    * @param example example date and time to use for generated bodies
    * @param timeZone time zone used for formatting of example date and time
    */
    fun datetime(
    name: String,
    format: String,
    timeZone: TimeZone = TimeZone.getDefault(),
    vararg examples: Date
  ): PactDslJsonBody
    /**
    * Attribute that must match the given datetime format
    * @param name attribute name
    * @param format timestamp format
    * @param example example date and time to use for generated bodies
    * @param timeZone time zone used for formatting of example date and time
    */
    fun datetime(
    name: String,
    format: String,
    example: Instant,
    timeZone: TimeZone = TimeZone.getDefault()
  )
    /**
    * Attribute that must match the given datetime format
    * @param name attribute name
    * @param format timestamp format
    * @param examples example dates and times to use for generated bodies
    * @param timeZone time zone used for formatting of example date and time
    */
    fun datetime(
    name: String,
    format: String,
    timeZone: TimeZone = TimeZone.getDefault(),
    vararg examples: Instant
  ): PactDslJsonBody
    /**
    * Attribute that must be formatted as an ISO date
    * @param name attribute name
    */
    fun date(name: String = "date"): PactDslJsonBody
    /**
    * Attribute that must match the provided date format
    * @param name attribute date
    * @param format date format to match
    */
    fun date(name: String, format: String): PactDslJsonBody
    /**
    * Attribute that must match the provided date format
    * @param name attribute date
    * @param format date format to match
    * @param example example date to use for generated values
    * @param timeZone time zone used for formatting of example date
    */
    fun date(name: String, format: String, example: Date, timeZone: TimeZone = TimeZone.getDefault())
    /**
    * Attribute that must match the provided date format
    * @param name attribute date
    * @param format date format to match
    * @param examples example dates to use for generated values
    * @param timeZone time zone used for formatting of example date
    */
    fun date(
    name: String,
    format: String,
    timeZone: TimeZone = TimeZone.getDefault(),
    vararg examples: Date
  ): PactDslJsonBody
    /**
    * Attribute that must match the provided date format
    * @param name attribute date
    * @param format date format to match
    * @param example example date to use for generated values
    */
    fun localDate(name: String, format: String, vararg examples: LocalDate): PactDslJsonBody
    /**
    * Attribute named 'time' that must be an ISO formatted time
    */
    fun time(name: String = "time"): PactDslJsonBody
    /**
    * Attribute that must match the given time format
    * @param name attribute name
    * @param format time format to match
    */
    fun time(name: String, format: String): PactDslJsonBody
    /**
    * Attribute that must match the given time format
    * @param name attribute name
    * @param format time format to match
    * @param example example time to use for generated bodies
    * @param timeZone time zone used for formatting of example time
    */
    fun time(
    name: String,
    format: String,
    example: Date,
    timeZone: TimeZone = TimeZone.getDefault()
  )
    /**
    * Attribute that must match the given time format
    * @param name attribute name
    * @param format time format to match
    * @param examples example times to use for generated bodies
    * @param timeZone time zone used for formatting of example time
    */
    fun time(
    name: String,
    format: String,
    timeZone: TimeZone = TimeZone.getDefault(),
    vararg examples: Date
  ): PactDslJsonBody
    /**
    * Attribute that must be an IP4 address
    * @param name attribute name
    */
    fun ipAddress(name: String): PactDslJsonBody
    /**
    * Attribute that is a JSON object
    * @param name field name
    */
    fun `object`(name: String): PactDslJsonBody
    fun `object`(): PactDslJsonBody
    /**
    * Attribute that is a JSON object defined from a DSL part
    * @param name field name
    * @param value DSL Part to set the value as
    */
    fun `object`(name: String, value: DslPart): PactDslJsonBody
    /**
    * Closes the current JSON object
    */
    fun closeObject(): DslPart?
    fun close(): DslPart?
    /**
    * Attribute that is an array
    * @param name field name
    */
    fun array(name: String): PactDslJsonArray
    fun array(): PactDslJsonArray
    fun unorderedArray(name: String): PactDslJsonArray
    fun unorderedArray(): PactDslJsonArray
    fun unorderedMinArray(name: String, size: Int): PactDslJsonArray
    fun unorderedMinArray(size: Int): PactDslJsonArray
    fun unorderedMaxArray(name: String, size: Int): PactDslJsonArray
    fun unorderedMaxArray(size: Int): PactDslJsonArray
    fun unorderedMinMaxArray(name: String, minSize: Int, maxSize: Int): PactDslJsonArray
    fun unorderedMinMaxArray(minSize: Int, maxSize: Int): PactDslJsonArray
    /**
    * Closes the current array
    */
    fun closeArray(): DslPart?
    /**
    * Attribute that is an array where each item must match the following example
    * @param name field name
    */
    fun eachLike(name: String): PactDslJsonBody
    fun eachLike(name: String, obj: DslPart): PactDslJsonBody
    fun eachLike(): PactDslJsonBody
    fun eachLike(obj: DslPart): PactDslJsonArray
    /**
    * Attribute that is an array where each item must match the following example
    * @param name field name
    * @param numberExamples number of examples to generate
    */
    fun eachLike(name: String, numberExamples: Int): PactDslJsonBody
    fun eachLike(numberExamples: Int): PactDslJsonBody
    /**
    * Attribute that is an array of values that are not objects where each item must match the following example
    * @param name field name
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun eachLike(name: String, value: PactDslJsonRootValue, numberExamples: Int = 1): PactDslJsonBody
    /**
    * Attribute that is an array with a minimum size where each item must match the following example
    * @param name field name
    * @param size minimum size of the array
    */
    fun minArrayLike(name: String, size: Int): PactDslJsonBody
    fun minArrayLike(size: Int): PactDslJsonBody
    fun minArrayLike(name: String, size: Int, obj: DslPart): PactDslJsonBody
    fun minArrayLike(size: Int, obj: DslPart): PactDslJsonArray
    /**
    * Attribute that is an array with a minimum size where each item must match the following example
    * @param name field name
    * @param size minimum size of the array
    * @param numberExamples number of examples to generate
    */
    fun minArrayLike(name: String, size: Int, numberExamples: Int): PactDslJsonBody
    fun minArrayLike(size: Int, numberExamples: Int): PactDslJsonBody
    /**
    * Attribute that is an array of values with a minimum size that are not objects where each item must match
    * the following example
    * @param name field name
    * @param size minimum size of the array
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun minArrayLike(name: String, size: Int, value: PactDslJsonRootValue, numberExamples: Int = 2): PactDslJsonBody
    /**
    * Attribute that is an array of values with a minimum size that are not objects where each item must match
    * the following example
    * @param name field name
    * @param size minimum size of the array
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun minArrayLike(name: String, size: Int, value: DslPart, numberExamples: Int): PactDslJsonBody
    /**
    * Attribute that is an array with a maximum size where each item must match the following example
    * @param name field name
    * @param size maximum size of the array
    */
    fun maxArrayLike(name: String, size: Int): PactDslJsonBody
    fun maxArrayLike(size: Int): PactDslJsonBody
    fun maxArrayLike(name: String, size: Int, obj: DslPart): PactDslJsonBody
    fun maxArrayLike(size: Int, obj: DslPart): PactDslJsonArray
    /**
    * Attribute that is an array with a maximum size where each item must match the following example
    * @param name field name
    * @param size maximum size of the array
    * @param numberExamples number of examples to generate
    */
    fun maxArrayLike(name: String, size: Int, numberExamples: Int): PactDslJsonBody
    fun maxArrayLike(size: Int, numberExamples: Int): PactDslJsonBody
    /**
    * Attribute that is an array of values with a maximum size that are not objects where each item must match the
    * following example
    * @param name field name
    * @param size maximum size of the array
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun maxArrayLike(name: String, size: Int, value: PactDslJsonRootValue, numberExamples: Int = 1): PactDslJsonBody
    /**
    * Attribute that is an array of values with a maximum size that are not objects where each item must match the
    * following example
    * @param name field name
    * @param size maximum size of the array
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun maxArrayLike(name: String, size: Int, value: DslPart, numberExamples: Int): PactDslJsonBody
    /**
    * Attribute that must be a numeric identifier
    * @param name attribute name, defaults to 'id', that must be a numeric identifier
    */
    fun id(name: String = "id"): PactDslJsonBody
    /**
    * Attribute that must be a numeric identifier
    * @param name attribute name
    * @param examples example ids to use for generated bodies
    */
    fun id(name: String, vararg examples: Long): PactDslJsonBody
    /**
    * Attribute that must be encoded as a hexadecimal value
    * @param name attribute name
    */
    fun hexValue(name: String): PactDslJsonBody
    /**
    * Attribute that must be encoded as a hexadecimal value
    * @param name attribute name
    * @param hexValue example value to use for generated bodies
    */
    fun hexValue(name: String, vararg examples: String): PactDslJsonBody
    /**
    * Attribute that must be encoded as an UUID
    * @param name attribute name
    */
    fun uuid(name: String): PactDslJsonBody
    /**
    * Attribute that must be encoded as an UUID
    * @param name attribute name
    * @param uuid example UUID to use for generated bodies
    */
    fun uuid(name: String, vararg uuids: UUID): PactDslJsonBody
    /**
    * Attribute that must be encoded as an UUID
    * @param name attribute name
    * @param uuid example UUID to use for generated bodies
    */
    fun uuid(name: String, vararg examples: String): PactDslJsonBody
    /**
    * Sets the field to a null value
    * @param fieldName field name
    */
    fun nullValue(fieldName: String): PactDslJsonBody
    fun eachArrayLike(name: String): PactDslJsonArray
    fun eachArrayLike(): PactDslJsonArray
    fun eachArrayLike(name: String, numberExamples: Int): PactDslJsonArray
    fun eachArrayLike(numberExamples: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(name: String, size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(name: String, numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(name: String, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(name: String, numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(numberExamples: Int, size: Int): PactDslJsonArray
    /**
    * Accepts any key, and each key is mapped to a list of items that must match the following object definition
    * @param exampleKey Example key to use for generating bodies
    */
    fun eachKeyMappedToAnArrayLike(exampleKey: String): PactDslJsonBody
    /**
    * Accepts any key, and each key is mapped to a map that must match the following object definition
    * @param exampleKey Example key to use for generating bodies
    */
    fun eachKeyLike(exampleKey: String): PactDslJsonBody
    /**
    * Accepts any key, and each key is mapped to a map that must match the provided object definition
    * @param exampleKey Example key to use for generating bodies
    * @param value Value to use for matching and generated bodies
    */
    fun eachKeyLike(exampleKey: String, value: PactDslJsonRootValue): PactDslJsonBody
    /**
    * Accepts any key, and each key is mapped to a value that must match the following object definition
    * @param exampleKey Example key to use for generating bodies
    */
    fun eachValueLike(exampleKey: String): PactDslJsonBody
    /**
    * Accepts any key, and each key is mapped to a map that must match the provided object definition
    * @param exampleKey Example key to use for generating bodies
    * @param value Value to use for matching and generated bodies
    */
    fun eachValueLike(exampleKey: String, value: PactDslJsonRootValue): PactDslJsonBody
    /**
    * Attribute that must include the provided string value
    * @param name attribute name
    * @param value Value that must be included
    */
    fun includesStr(name: String, value: String): PactDslJsonBody
    /**
    * Attribute that must be equal to the provided value.
    * @param name attribute name
    * @param value Value that will be used for comparisons
    */
    fun equalTo(name: String, vararg examples: Any?): PactDslJsonBody
    /**
    * Combine all the matchers using AND
    * @param name Attribute name
    * @param value Attribute example value
    * @param rules Matching rules to apply
    */
    fun and(name: String, value: Any?, vararg rules: MatchingRule): PactDslJsonBody
    /**
    * Combine all the matchers using OR
    * @param name Attribute name
    * @param value Attribute example value
    * @param rules Matching rules to apply
    */
    fun or(name: String, value: Any?, vararg rules: MatchingRule): PactDslJsonBody
    /**
    * Matches a URL that is composed of a base path and a sequence of path expressions
    * @param name Attribute name
    * @param basePath The base path for the URL (like "http://localhost:8080/") which will be excluded from the matching
    * @param pathFragments Series of path fragments to match on. These can be strings or regular expressions.
    */
    fun matchUrl(name: String, basePath: String?, vararg pathFragments: Any): PactDslJsonBody
    fun matchUrl(basePath: String?, vararg pathFragments: Any): DslPart
    /**
    * Matches a URL that is composed of a base path and a sequence of path expressions. Base path from the mock server
    * will be used.
    * @param name Attribute name
    * @param pathFragments Series of path fragments to match on. These can be strings or regular expressions.
    */
    fun matchUrl2(name: String, vararg pathFragments: Any): PactDslJsonBody
    fun matchUrl2(vararg pathFragments: Any): DslPart
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int): PactDslJsonBody
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int, obj: DslPart): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int, obj: DslPart): PactDslJsonArray
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int, numberExamples: Int): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int, numberExamples: Int): PactDslJsonBody
    fun eachArrayWithMinMaxLike(name: String, minSize: Int, maxSize: Int): PactDslJsonArray
    fun eachArrayWithMinMaxLike(minSize: Int, maxSize: Int): PactDslJsonArray
    fun eachArrayWithMinMaxLike(
    name: String,
    numberExamples: Int,
    minSize: Int,
    maxSize: Int
  ): PactDslJsonArray
    fun eachArrayWithMinMaxLike(numberExamples: Int, minSize: Int, maxSize: Int): PactDslJsonArray
    /**
    * Attribute that is an array of values with a minimum and maximum size that are not objects where each item must
    * match the following example
    * @param name field name
    * @param minSize minimum size
    * @param maxSize maximum size
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun minMaxArrayLike(
    name: String,
    minSize: Int,
    maxSize: Int,
    value: PactDslJsonRootValue,
    numberExamples: Int
  ): PactDslJsonBody
    /**
    * Attribute that is an array of values with a minimum and maximum size that are not objects where each item must
    * match the following example
    * @param name field name
    * @param minSize minimum size
    * @param maxSize maximum size
    * @param value Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun minMaxArrayLike(
    name: String,
    minSize: Int,
    maxSize: Int,
    value: DslPart,
    numberExamples: Int
  ): PactDslJsonBody
    /**
    * Adds an attribute that will have its value injected from the provider state
    * @param name Attribute name
    * @param expression Expression to be evaluated from the provider state
    * @param example Example value to be used in the consumer test
    */
    fun valueFromProviderState(name: String, expression: String, example: Any?): PactDslJsonBody
    /**
    * Adds a date attribute with the value generated by the date expression
    * @param name Attribute name
    * @param expression Date expression to use to generate the values
    * @param format Date format to use
    */
    fun dateExpression(
    name: String,
    expression: String,
    format: String = DateFormatUtils.ISO_DATE_FORMAT.pattern
  ): PactDslJsonBody
    /**
    * Adds a time attribute with the value generated by the time expression
    * @param name Attribute name
    * @param expression Time expression to use to generate the values
    * @param format Time format to use
    */
    fun timeExpression(
    name: String,
    expression: String,
    format: String = DateFormatUtils.ISO_TIME_NO_T_FORMAT.pattern
  ): PactDslJsonBody
    /**
    * Adds a datetime attribute with the value generated by the expression
    * @param name Attribute name
    * @param expression Datetime expression to use to generate the values
    * @param format Datetime format to use
    */
    fun datetimeExpression(
    name: String,
    expression: String,
    format: String = DateFormatUtils.ISO_DATETIME_FORMAT.pattern
  ): PactDslJsonBody
    fun arrayContaining(name: String): DslPart
    /**
    * Extends this JSON object from a base template.
    */
    fun extendFrom(baseTemplate: PactDslJsonBody)
    /**
    * Applies a matching rule to each key in the object, ignoring the values.
    */
    fun eachKeyMatching(matcher: Matcher): PactDslJsonBody
    /**
    * Applies matching rules to each value in the object, ignoring the keys.
    */
    fun eachValueMatching(exampleKey: String): PactDslJsonBody
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactDslJsonArray.kt
```kotlin
class PactDslJsonArray : DslPart {
    /**
    * Closes the current array
    */
    fun closeArray(): DslPart?
    fun eachLike(name: String): PactDslJsonBody
    fun eachLike(name: String, obj: DslPart): PactDslJsonBody
    fun eachLike(name: String, numberExamples: Int): PactDslJsonBody
    /**
    * Element that is an array where each item must match the following example
    */
    fun eachLike(): PactDslJsonBody
    fun eachLike(obj: DslPart): PactDslJsonArray
    /**
    * Element that is an array where each item must match the following example
    *
    * @param numberExamples Number of examples to generate
    */
    fun eachLike(numberExamples: Int): PactDslJsonBody
    fun minArrayLike(name: String, size: Int): PactDslJsonBody
    /**
    * Element that is an array with a minimum size where each item must match the following example
    *
    * @param size minimum size of the array
    */
    fun minArrayLike(size: Int): PactDslJsonBody
    fun minArrayLike(name: String, size: Int, obj: DslPart): PactDslJsonBody
    fun minArrayLike(size: Int, obj: DslPart): PactDslJsonArray
    fun minArrayLike(name: String, size: Int, numberExamples: Int): PactDslJsonBody
    /**
    * Element that is an array with a minimum size where each item must match the following example
    *
    * @param size           minimum size of the array
    * @param numberExamples number of examples to generate
    */
    fun minArrayLike(size: Int, numberExamples: Int): PactDslJsonBody
    fun maxArrayLike(name: String, size: Int): PactDslJsonBody
    /**
    * Element that is an array with a maximum size where each item must match the following example
    *
    * @param size maximum size of the array
    */
    fun maxArrayLike(size: Int): PactDslJsonBody
    fun maxArrayLike(name: String, size: Int, obj: DslPart): PactDslJsonBody
    fun maxArrayLike(size: Int, obj: DslPart): PactDslJsonArray
    fun maxArrayLike(name: String, size: Int, numberExamples: Int): PactDslJsonBody
    /**
    * Element that is an array with a maximum size where each item must match the following example
    *
    * @param size           maximum size of the array
    * @param numberExamples number of examples to generate
    */
    fun maxArrayLike(size: Int, numberExamples: Int): PactDslJsonBody
    /**
    * Element that must be the specified value
    *
    * @param value string value
    */
    fun stringValue(value: String?): PactDslJsonArray
    /**
    * Element that must be the specified value
    *
    * @param value string value
    */
    fun string(value: String?): PactDslJsonArray
    fun numberValue(value: Number): PactDslJsonArray
    /**
    * Element that must be the specified value
    *
    * @param value number value
    */
    fun number(value: Number): PactDslJsonArray
    /**
    * Element that must be the specified value
    *
    * @param value boolean value
    */
    fun booleanValue(value: Boolean): PactDslJsonArray
    /**
    * Element that must be the same type as the example
    */
    fun like(example: Any?): PactDslJsonArray
    /**
    * Element that can be any string
    */
    fun stringType(): PactDslJsonArray
    /**
    * Element that can be any string
    *
    * @param example example value to use for generated bodies
    */
    fun stringType(example: String): PactDslJsonArray
    /**
    * Element that can be any number
    */
    fun numberType(): PactDslJsonArray
    /**
    * Element that can be any number
    *
    * @param number example number to use for generated bodies
    */
    fun numberType(number: Number): PactDslJsonArray
    /**
    * Element that must be an integer
    */
    fun integerType(): PactDslJsonArray
    /**
    * Element that must be an integer
    *
    * @param number example integer value to use for generated bodies
    */
    fun integerType(number: Long): PactDslJsonArray
    /**
    * Element that must be a decimal value (has significant digits after the decimal point)
    */
    fun decimalType(): PactDslJsonArray
    /**
    * Element that must be a decimalType value (has significant digits after the decimal point)
    *
    * @param number example decimalType value
    */
    fun decimalType(number: BigDecimal): PactDslJsonArray
    /**
    * Attribute that must be a decimalType value (has significant digits after the decimal point)
    *
    * @param number example decimalType value
    */
    fun decimalType(number: Double): PactDslJsonArray
    /**
    * Attribute that can be any number and which must match the provided regular expression
    * @param regex Regular expression that the numbers string form must match
    * @param example example number to use for generated bodies
    */
    fun numberMatching(regex: String, example: Number): PactDslJsonArray
    /**
    * Attribute that can be any number decimal number (has significant digits after the decimal point) and which must
    * match the provided regular expression
    * @param regex Regular expression that the numbers string form must match
    * @param example example number to use for generated bodies
    */
    fun decimalMatching(regex: String, example: Double): PactDslJsonArray
    /**
    * Attribute that can be any integer and which must match the provided regular expression
    * @param regex Regular expression that the numbers string form must match
    * @param example example integer to use for generated bodies
    */
    fun integerMatching(regex: String, example: Int): PactDslJsonArray
    /**
    * Element that must be a boolean
    */
    fun booleanType(): PactDslJsonArray
    /**
    * Element that must be a boolean
    *
    * @param example example boolean to use for generated bodies
    */
    fun booleanType(example: Boolean): PactDslJsonArray
    /**
    * Element that must match the regular expression
    *
    * @param regex regular expression
    * @param value example value to use for generated bodies
    */
    fun stringMatcher(regex: String, value: String): PactDslJsonArray
    /**
    * Element that must be an ISO formatted timestamp
    */
    fun datetime(): PactDslJsonArray
    /**
    * Element that must match the given timestamp format
    *
    * @param format timestamp format
    */
    fun datetime(format: String): PactDslJsonArray
    /**
    * Element that must match the given timestamp format
    *
    * @param format  timestamp format
    * @param example example date and time to use for generated bodies
    */
    fun datetime(format: String, example: Date): PactDslJsonArray
    /**
    * Element that must match the given timestamp format
    *
    * @param format  timestamp format
    * @param example example date and time to use for generated bodies
    */
    fun datetime(format: String, example: Instant): PactDslJsonArray
    /**
    * Element that must be formatted as an ISO date
    */
    fun date(): PactDslJsonArray
    /**
    * Element that must match the provided date format
    *
    * @param format date format to match
    */
    fun date(format: String): PactDslJsonArray
    /**
    * Element that must match the provided date format
    *
    * @param format  date format to match
    * @param example example date to use for generated values
    */
    fun date(format: String, example: Date): PactDslJsonArray
    /**
    * Element that must be an ISO formatted time
    */
    fun time(): PactDslJsonArray
    /**
    * Element that must match the given time format
    *
    * @param format time format to match
    */
    fun time(format: String): PactDslJsonArray
    /**
    * Element that must match the given time format
    *
    * @param format  time format to match
    * @param example example time to use for generated bodies
    */
    fun time(format: String, example: Date): PactDslJsonArray
    /**
    * Element that must be an IP4 address
    */
    fun ipAddress(): PactDslJsonArray
    fun `object`(name: String): PactDslJsonBody
    /**
    * Element that is a JSON object
    */
    fun `object`(): PactDslJsonBody
    fun closeObject(): DslPart?
    fun close(): DslPart?
    fun arrayContaining(name: String): DslPart
    fun array(name: String): PactDslJsonArray
    /**
    * Element that is a JSON array
    */
    fun array(): PactDslJsonArray
    fun unorderedArray(name: String): PactDslJsonArray
    fun unorderedArray(): PactDslJsonArray
    fun unorderedMinArray(name: String, size: Int): PactDslJsonArray
    fun unorderedMinArray(size: Int): PactDslJsonArray
    fun unorderedMaxArray(name: String, size: Int): PactDslJsonArray
    fun unorderedMaxArray(size: Int): PactDslJsonArray
    fun unorderedMinMaxArray(name: String, minSize: Int, maxSize: Int): PactDslJsonArray
    fun unorderedMinMaxArray(minSize: Int, maxSize: Int): PactDslJsonArray
    /**
    * Matches rule for all elements in array
    *
    * @param rule Matching rule to apply across array
    */
    fun wildcardArrayMatcher(rule: MatchingRule): PactDslJsonArray
    /**
    * Element that must be a numeric identifier
    */
    fun id(): PactDslJsonArray
    /**
    * Element that must be a numeric identifier
    *
    * @param id example id to use for generated bodies
    */
    fun id(id: Long): PactDslJsonArray
    /**
    * Element that must be encoded as a hexadecimal value
    */
    fun hexValue(): PactDslJsonArray
    /**
    * Element that must be encoded as a hexadecimal value
    *
    * @param hexValue example value to use for generated bodies
    */
    fun hexValue(hexValue: String): PactDslJsonArray
    /**
    * Element that must be encoded as an UUID
    */
    fun uuid(): PactDslJsonArray
    /**
    * Element that must be encoded as an UUID
    *
    * @param uuid example UUID to use for generated bodies
    */
    fun uuid(uuid: String): PactDslJsonArray
    /**
    * Adds the template object to the array
    *
    * @param template template object
    */
    fun template(template: DslPart): PactDslJsonArray
    /**
    * Adds a number of template objects to the array
    *
    * @param template    template object
    * @param occurrences number to add
    */
    fun template(template: DslPart, occurrences: Int): PactDslJsonArray
    /**
    * Adds a null value to the list
    */
    fun nullValue(): PactDslJsonArray
    fun eachArrayLike(name: String): PactDslJsonArray
    fun eachArrayLike(name: String, numberExamples: Int): PactDslJsonArray
    fun eachArrayLike(): PactDslJsonArray
    fun eachArrayLike(numberExamples: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(name: String, size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(name: String, numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(size: Int): PactDslJsonArray
    fun eachArrayWithMaxLike(numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(name: String, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(name: String, numberExamples: Int, size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(size: Int): PactDslJsonArray
    fun eachArrayWithMinLike(numberExamples: Int, size: Int): PactDslJsonArray
    /**
    * Array of values that are not objects where each item must match the provided example
    *
    * @param value Value to use to match each item
    */
    fun eachLike(value: PactDslJsonRootValue?, numberExamples: Int = 1): PactDslJsonArray
    /**
    * Array of values with a minimum size that are not objects where each item must match the provided example
    *
    * @param size           minimum size of the array
    * @param value          Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun minArrayLike(size: Int, value: PactDslJsonRootValue?, numberExamples: Int = size): PactDslJsonArray
    /**
    * Array of values with a maximum size that are not objects where each item must match the provided example
    *
    * @param size           maximum size of the array
    * @param value          Value to use to match each item
    * @param numberExamples number of examples to generate
    */
    fun maxArrayLike(size: Int, value: PactDslJsonRootValue?, numberExamples: Int = 1): PactDslJsonArray
    /**
    * List item that must include the provided string
    *
    * @param value Value that must be included
    */
    fun includesStr(value: String): PactDslJsonArray
    /**
    * Attribute that must be equal to the provided value.
    *
    * @param value Value that will be used for comparisons
    */
    fun equalsTo(value: Any?): PactDslJsonArray
    /**
    * Combine all the matchers using AND
    *
    * @param value Attribute example value
    * @param rules Matching rules to apply
    */
    fun and(value: Any?, vararg rules: MatchingRule): PactDslJsonArray
    /**
    * Combine all the matchers using OR
    *
    * @param value Attribute example value
    * @param rules Matching rules to apply
    */
    fun or(value: Any?, vararg rules: MatchingRule): PactDslJsonArray
    /**
    * Matches a URL that is composed of a base path and a sequence of path expressions
    *
    * @param basePath      The base path for the URL (like "http://localhost:8080/") which will be
    * excluded from the matching
    * @param pathFragments Series of path fragments to match on. These can be strings or regular expressions.
    */
    fun matchUrl(basePath: String?, vararg pathFragments: Any): PactDslJsonArray
    fun matchUrl(name: String, basePath: String?, vararg pathFragments: Any): DslPart
    fun matchUrl2(name: String, vararg pathFragments: Any): PactDslJsonBody
    /**
    * Matches a URL that is composed of a base path and a sequence of path expressions. Base path from the mock server
    * will be used.
    *
    * @param pathFragments Series of path fragments to match on. These can be strings or regular expressions.
    */
    fun matchUrl2(vararg pathFragments: Any): DslPart
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int): PactDslJsonBody
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int, obj: DslPart): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int, obj: DslPart): PactDslJsonArray
    fun minMaxArrayLike(name: String, minSize: Int, maxSize: Int, numberExamples: Int): PactDslJsonBody
    fun minMaxArrayLike(minSize: Int, maxSize: Int, numberExamples: Int): PactDslJsonBody
    fun eachArrayWithMinMaxLike(name: String, minSize: Int, maxSize: Int): PactDslJsonArray
    fun eachArrayWithMinMaxLike(minSize: Int, maxSize: Int): PactDslJsonArray
    fun eachArrayWithMinMaxLike(
    name: String,
    numberExamples: Int,
    minSize: Int,
    maxSize: Int
  ): PactDslJsonArray
    fun eachArrayWithMinMaxLike(numberExamples: Int, minSize: Int, maxSize: Int): PactDslJsonArray
    /**
    * Adds an element that will have it's value injected from the provider state
    *
    * @param expression Expression to be evaluated from the provider state
    * @param example    Example value to be used in the consumer test
    */
    fun valueFromProviderState(expression: String?, example: Any?): PactDslJsonArray
    /**
    * Adds a date value with the value generated by the date expression
    *
    * @param expression Date expression to use to generate the values
    * @param format     Date format to use
    */
    fun dateExpression(expression: String, format: String = DateFormatUtils.ISO_DATE_FORMAT.pattern): PactDslJsonArray
    /**
    * Adds a time value with the value generated by the time expression
    *
    * @param expression Time expression to use to generate the values
    * @param format     Time format to use
    */
    fun timeExpression(
    expression: String,
    format: String = DateFormatUtils.ISO_TIME_NO_T_FORMAT.pattern
  ): PactDslJsonArray
    /**
    * Adds a datetime value with the value generated by the expression
    *
    * @param expression Datetime expression to use to generate the values
    * @param format     Datetime format to use
    */
    fun datetimeExpression(
    expression: String,
    format: String = DateFormatUtils.ISO_DATETIME_FORMAT.pattern
  ): PactDslJsonArray
}
```


## Message Consumer DSL

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/MessagePactBuilder.kt
```kotlin
class MessagePactBuilder@JvmOverloads constructor(
  /**
   * The consumer for the pact.
   */
  private var consumer: Consumer = Consumer(),

  /**
   * The provider for the pact.
   */
  private var provider: Provider = Provider(),

  /**
   * Provider states
   */
  private var providerStates: MutableList<ProviderState> = mutableListOf(),

  /**
   * Messages for the pact
   */
  private var messages: MutableList<V4Interaction.AsynchronousMessage> = mutableListOf(),

  /**
   * Specification Version
   */
  private var specVersion: PactSpecVersion = PactSpecVersion.V3
) {
    /**
    * Name the consumer of the pact
    *
    * @param consumer Consumer name
    */
    fun consumer(consumer: String): MessagePactBuilder
    /**
    * Name the provider that the consumer has a pact with.
    *
    * @param provider provider name
    * @return this builder.
    */
    fun hasPactWith(provider: String): MessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState description of the provider state
    * @return this builder.
    */
    fun given(providerState: String): MessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState description of the provider state
    * @param params key/value pairs to describe state
    * @return this builder.
    */
    fun given(providerState: String, params: Map<String, Any>): MessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState state of the provider
    * @return this builder.
    */
    fun given(providerState: ProviderState): MessagePactBuilder
    /**
    * Adds a message expectation in the pact.
    *
    * @param description message description.
    */
    fun expectsToReceive(description: String): MessagePactBuilder
    /**
    *  Adds the expected metadata to the message
    */
    fun withMetadata(metadata: Map<String, Any>): MessagePactBuilder
    /**
    *  Adds the expected metadata to the message using a builder
    */
    fun withMetadata(consumer: java.util.function.Consumer<MetadataBuilder>): MessagePactBuilder
    /**
    * Adds the JSON body as the message content
    */
    fun withContent(body: DslPart): MessagePactBuilder
    /**
    * Adds the XML body as the message content
    */
    fun withContent(xmlBuilder: PactXmlBuilder): MessagePactBuilder
    /**
    * Adds the text as the message contents
    */
    fun withContent(contents: String, contentType: String = "text/plain"): MessagePactBuilder
    /**
    * Adds the JSON body as the message content
    */
    fun withContent(json: JSONObject): MessagePactBuilder
    /**
    * Terminates the DSL and builds a pact to represent the interactions
    */
    fun toPact(pactClass: Class<P>): P
    /**
    * Convert this builder into a Pact
    */
    fun toPact(): P
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/SynchronousMessagePactBuilder.kt
```kotlin
class SynchronousMessagePactBuilder@JvmOverloads constructor(
  /**
   * The consumer for the pact.
   */
  private var consumer: Consumer = Consumer(),

  /**
   * The provider for the pact.
   */
  private var provider: Provider = Provider(),

  /**
   * Provider states
   */
  private var providerStates: MutableList<ProviderState> = mutableListOf(),

  /**
   * Interactions for the pact
   */
  private var messages: MutableList<V4Interaction.SynchronousMessages> = mutableListOf(),

  /**
   * Specification Version
   */
  private var specVersion: PactSpecVersion = PactSpecVersion.V4
) {
    /**
    * Name the consumer of the pact
    *
    * @param consumer Consumer name
    */
    fun consumer(consumer: String): SynchronousMessagePactBuilder
    /**
    * Name the provider that the consumer has a pact with.
    *
    * @param provider provider name
    * @return this builder.
    */
    fun hasPactWith(provider: String): SynchronousMessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState description of the provider state
    * @return this builder.
    */
    fun given(providerState: String): SynchronousMessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState description of the provider state
    * @param params key/value pairs to describe state
    * @return this builder.
    */
    fun given(providerState: String, params: Map<String, Any>): SynchronousMessagePactBuilder
    /**
    * Sets the provider state.
    *
    * @param providerState state of the provider
    * @return this builder.
    */
    fun given(providerState: ProviderState): SynchronousMessagePactBuilder
    /**
    * Marks the interaction as pending.
    */
    fun pending(pending: Boolean): SynchronousMessagePactBuilder
    /**
    * Adds a text comment to the interaction
    */
    fun comment(comment: String): SynchronousMessagePactBuilder
    /**
    * Adds an external reference for the interaction. The reference will be stored in the Pact
    * file comments under the group key. For instance, you could store the OpenAPI operation ID
    * that the interaction corresponds to as an external reference.
    */
    fun reference(group: String, name: String, value: Any): SynchronousMessagePactBuilder
    /**
    * Sets the unique key for the interaction. If this is not set, or is empty, a key will be calculated from the
    * contents of the interaction.
    */
    fun key(key: String?): SynchronousMessagePactBuilder
    /**
    * Adds a message expectation to the pact.
    *
    * @param description message description.
    */
    fun expectsToReceive(description: String): SynchronousMessagePactBuilder
    /**
    *  Adds the expected request message to the interaction
    */
    fun withRequest(callback: java.util.function.Consumer<MessageContentsBuilder>): SynchronousMessagePactBuilder
    /**
    *  Adds the expected response message to the interaction. Calling this multiple times will add a new response message
    *  for each call.
    */
    fun withResponse(callback: java.util.function.Consumer<MessageContentsBuilder>): SynchronousMessagePactBuilder
    /**
    * Terminates the DSL and builds a pact to represent the interactions
    */
    fun toPact(pactClass: Class<P>): P
    /**
    * Convert this builder into a Pact
    */
    fun toPact(): V4Pact
}
```

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/SynchronousMessageInteractionBuilder.kt
```kotlin
class SynchronousMessageInteractionBuilder(
  description: String,
  providerStates: MutableList<ProviderState>,
  comments: MutableList<JsonValue.StringValue>
) {
    /**
    * Sets the unique key for the interaction. If this is not set, or is empty, a key will be calculated from the
    * contents of the interaction.
    */
    fun key(key: String?): SynchronousMessageInteractionBuilder
    /**
    * Sets the interaction description
    */
    fun description(description: String): SynchronousMessageInteractionBuilder
    /**
    * Adds a provider state to the interaction.
    */
    fun state(stateDescription: String, params: Map<String, Any?> = emptyMap()): SynchronousMessageInteractionBuilder
    /**
    * Adds a provider state to the interaction with a parameter.
    */
    fun state(stateDescription: String, paramKey: String, paramValue: Any?): SynchronousMessageInteractionBuilder
    /**
    * Adds a provider state to the interaction with parameters a pairs of key/values.
    */
    fun state(stateDescription: String, vararg params: Pair<String, Any?>): SynchronousMessageInteractionBuilder
    /**
    * Marks the interaction as pending.
    */
    fun pending(pending: Boolean): SynchronousMessageInteractionBuilder
    /**
    * Adds a text comment to the interaction
    */
    fun comment(comment: String): SynchronousMessageInteractionBuilder
    /**
    * Adds an external reference for the interaction. The reference will be stored in the Pact
    * file comments under the group key. For instance, you could store the OpenAPI operation ID
    * that the interaction corresponds to as an external reference.
    */
    fun reference(group: String, name: String, value: Any): SynchronousMessageInteractionBuilder
    /**
    * Build the request part of the interaction using a contents builder
    */
    fun withRequest(
    builderFn: (MessageContentsBuilder) -> MessageContentsBuilder?
  ): SynchronousMessageInteractionBuilder
    /**
    * Build the response part of the interaction using a response builder. This can be called multiple times to add
    * additional response messages.
    */
    fun willRespondWith(
    builderFn: (MessageContentsBuilder) -> MessageContentsBuilder?
  ): SynchronousMessageInteractionBuilder
    fun build(): V4Interaction
}
```


## V4 Pact Builder

File: ./consumer/src/main/kotlin/au/com/dius/pact/consumer/dsl/PactBuilder.kt
```kotlin
interface DslBuilder {
    fun addPluginConfiguration(matcher: ContentMatcher, pactConfiguration: Map<String, JsonValue>)
}

interface PluginInteractionBuilder {
    /**
    * Construct the map of configuration that is to be passed through to the plugin
    */
    fun build(): Map<String, Any?>
}

class PactBuilder(
  var consumer: String = "consumer",
  var provider: String = "provider",
  var pactVersion: PactSpecVersion = PactSpecVersion.V4
) : DslBuilder {
    /**
    * Use the old HTTP Pact DSL
    */
    fun usingLegacyDsl(): PactDslWithProvider
    /**
    * Use the old Message Pact DSL
    */
    fun usingLegacyMessageDsl(): MessagePactBuilder
    /**
    * Use the Synchronous Message DSL
    */
    fun usingSynchronousMessageDsl(): SynchronousMessagePactBuilder
    /**
    * Sets the Pact specification version
    */
    fun pactSpecVersion(version: PactSpecVersion)
    /**
    * Enable a plugin
    */
    fun usingPlugin(name: String, version: String? = null): PactBuilder
    /**
    * Describe the state the provider needs to be in for the pact test to be verified. Any parameters for the provider
    * state can be provided in the second parameter.
    */
    fun given(state: String, params: Map<String, Any?> = emptyMap()): PactBuilder
    /**
    * Describe the state the provider needs to be in for the pact test to be verified.
    *
    * @param firstKey Key of first parameter element
    * @param firstValue Value of first parameter element
    * @param paramsKeyValuePair Additional parameters in key-value pairs
    */
    fun given(state: String, firstKey: String, firstValue: Any?, vararg paramsKeyValuePair: Any): PactBuilder
    /**
    * Describe the state the provider needs to be in for the pact test to be verified.
    *
    * @param params Additional parameters in key-value pairs
    */
    fun given(state: String, vararg params: Pair<String, Any>): PactBuilder
    /**
    * Adds an interaction with the given description and type. If interactionType is not specified (is the empty string)
    * will default to an HTTP interaction
    *
    * @param description The interaction description. Must be unique.
    * @param interactionType The key of the interaction type as found in the catalogue manager. If empty, will default to
    * a HTTP interaction ('core/transport/http').
    * @param key (Optional) unique key to assign to the interaction
    */
    fun expectsToReceive(description: String, interactionType: String, key: String? = null): PactBuilder
    /**
    * Values to configure the interaction. In the case of an interaction configured by a plugin, you need to follow
    * the plugin documentation of what values must be specified here.
    */
    fun with(values: Map<String, Any?>): PactBuilder
    /**
    * Configure the interaction using a builder supplied by the plugin author.
    */
    fun with(builder: PluginInteractionBuilder): PactBuilder
    fun addPluginConfiguration(matcher: ContentMatcher, pactConfiguration: Map<String, JsonValue>)
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: String): PactBuilder
    /**
    * Adds additional values to the metadata section of the Pact file
    */
    fun addMetadataValue(key: String, value: JsonValue): PactBuilder
    /**
    * Terminates this builder and returns the created Pact object
    */
    fun toPact(): V4Pact
    /**
    * Adds a text comment to the Pact interaction
    */
    fun comment(comment: String): PactBuilder
    /**
    * Creates a new HTTP interaction with the given description, and passes a builder to the builder function to
    * construct it.
    */
    fun expectsToReceiveHttpInteraction(
    description: String,
    builderFn: (HttpInteractionBuilder) -> HttpInteractionBuilder?
  ): PactBuilder
    /**
    * Creates a new asynchronous message interaction with the given description, and passes a builder to the builder
    * function to construct it.
    */
    fun expectsToReceiveMessageInteraction(
    description: String,
    builderFn: (MessageInteractionBuilder) -> MessageInteractionBuilder?
  ): PactBuilder
    /**
    * Creates a new synchronous message interaction with the given description, and passes a builder to the builder
    * function to construct it.
    */
    fun expectsToReceiveSynchronousMessageInteraction(
    description: String,
    builderFn: (SynchronousMessageInteractionBuilder) -> SynchronousMessageInteractionBuilder?
  ): PactBuilder
}
```


## JUnit 5 Consumer Annotations

File: ./consumer/junit5/src/main/kotlin/au/com/dius/pact/consumer/junit5/PactTestFor.kt
```kotlin
annotation class PactTestFor(
        /**
         * Providers name. This will be recorded in the pact file
         */
        val providerName: String = "",

        /**
         * Host interface to use for the mock server. Only used for synchronous provider tests and defaults to the
         * loopback adapter (127.0.0.1).
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val hostInterface: String = "",

        /**
         * Port number to bind to. Only used for synchronous provider tests and defaults to 0, which causes a random free port to be chosen.
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val port: String = "",

        /**
         * Pact specification version to support. Will default to V3.
         */
        val pactVersion: PactSpecVersion = PactSpecVersion.UNSPECIFIED,

        /**
         * Test method that provides the Pact to use for the test. Default behaviour is to use the first one found.
         */
        val pactMethod: String = "",

        /**
         * Type of provider (synchronous HTTP or asynchronous messages)
         */
        val providerType: ProviderType = ProviderType.UNSPECIFIED,

        /**
         * If HTTPS should be used. If enabled, a mock server with a self-signed cert will be started.
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val https: Boolean = false,

        /**
         * Test methods that provides the Pacts to use for the test. This allows multiple providers to be
         * used in the same test.
         */
        val pactMethods: Array<String> = [],

        /**
         * If an external keystore should be provided to the mockServer. This allows to provide a path to
         * keystore file
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val keyStorePath: String = "",

        /**
         * This property allows to provide the alias name of the certificate should be used.
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val keyStoreAlias: String = "",

        /**
         * This property allows to provide the password for the keystore
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val keyStorePassword: String = "",

        /**
         * This property allows to provide the password for the private key entry in the keystore
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val privateKeyPassword: String = "",

        /**
         * * The type of mock server implementation to use. The default is to use the Java server for HTTP and the KTor
         * server for HTTPS
         */
        @Deprecated("This has been replaced with the @MockServerConfig annotation")
        val mockServerImplementation: MockServerImplementation = MockServerImplementation.Default
)
```


## Provider Annotations & Verification

File: ./provider/src/main/kotlin/au/com/dius/pact/provider/junitsupport/Provider.kt
```kotlin
annotation class Provider(
  /**
   * @return provider name for pact test running
   */
  val value: String = ""
)
```

File: ./provider/src/main/kotlin/au/com/dius/pact/provider/junitsupport/Consumer.kt
```kotlin
annotation class Consumer(
  /**
   * @return consumer name for pact test running
   */
  val value: String = ""
)
```

File: ./provider/junit5/src/main/kotlin/au/com/dius/pact/provider/junit5/PactVerificationContext.kt
```kotlin
class PactVerificationContext@JvmOverloads constructor(
  private val store: ExtensionContext.Store,
  private val context: ExtensionContext,
  var target: TestTarget = HttpTestTarget(port = 8080),
  var verifier: IProviderVerifier? = null,
  var valueResolver: ValueResolver = SystemPropertyResolver,
  var providerInfo: IProviderInfo,
  val consumer: IConsumerInfo,
  val interaction: Interaction,
  val pact: Pact,
  var testExecutionResult: MutableList<VerificationResult.Failed> = mutableListOf(),
  val additionalTargets: MutableList<TestTarget> = mutableListOf()
) {
    /**
    * Called to verify the interaction from the test template method.
    *
    * @throws AssertionError Throws an assertion error if the verification fails.
    */
    fun verifyInteraction()
    fun withStateChangeHandlers(vararg stateClasses: Any): PactVerificationContext
    fun addStateChangeHandlers(vararg stateClasses: Any)
    /**
    * Adds additional targets to the context for the test.
    */
    fun addAdditionalTarget(target: TestTarget)
    fun currentTarget(): TestTarget?
}
```
