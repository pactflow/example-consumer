While you already know this, here is a reminder of the key pact-jvm Java lambda DSL classes and methods you will need to use to create a Pact test in Java (having omitted deprecated and implementation-detail members):

## Lambda DSL Entry Points

File: ./consumer/src/main/java/au/com/dius/pact/consumer/dsl/LambdaDsl.java

```java
class LambdaDsl {
    public static LambdaDslJsonArray newJsonArray(Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArray(Integer examples, Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayLike(Consumer<LambdaDslObject> obj);
    public static LambdaDslJsonArray newJsonArrayLike(Integer examples, Consumer<LambdaDslObject> obj);
    public static LambdaDslJsonArray newJsonArrayMinLike(Integer size, Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayMaxLike(Integer size, Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayMinMaxLike(Integer minSize, Integer maxSize, Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayUnordered(final Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayMinUnordered(int size, final Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayMaxUnordered(int size, final Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonArray newJsonArrayMinMaxUnordered(int minSize, int maxSize, final Consumer<LambdaDslJsonArray> array);
    public static LambdaDslJsonBody newJsonBody(Consumer<LambdaDslJsonBody> array);
    public static LambdaDslJsonBody newJsonBody(LambdaDslJsonBody baseTemplate, Consumer<LambdaDslJsonBody> array);
}
```

## Lambda DSL Body Builders

File: ./consumer/src/main/java/au/com/dius/pact/consumer/dsl/LambdaDslObject.java

```java
class LambdaDslObject {
    public LambdaDslObject stringValue(final String name, final String value);
    public LambdaDslObject stringType(final String name, final String example);
    public LambdaDslObject stringType(final String name);
    public LambdaDslObject stringType(final String name, final String... examples);
    public LambdaDslObject stringTypes(final String... names);
    public LambdaDslObject stringMatcher(final String name, final String regex);
    public LambdaDslObject stringMatcher(final String name, final String regex, final String example);
    public LambdaDslObject numberValue(final String name, final Number value);
    public LambdaDslObject numberType(final String name, final Number example);
    public LambdaDslObject numberType(final String... names);
    public LambdaDslObject integerType(final String name, final Integer example);
    public LambdaDslObject integerType(final String... names);
    public LambdaDslObject decimalType(final String name, final BigDecimal example);
    public LambdaDslObject decimalType(final String name, final Double example);
    public LambdaDslObject decimalType(final String... names);
    public LambdaDslObject numberMatching(String name, String regex, Number example);
    public LambdaDslObject decimalMatching(String name, String regex, Double example);
    public LambdaDslObject integerMatching(String name, String regex, Integer example);
    public LambdaDslObject booleanValue(final String name, final Boolean value);
    public LambdaDslObject booleanType(final String name, final Boolean example);
    public LambdaDslObject booleanType(final String... names);
    public LambdaDslObject id();
    public LambdaDslObject id(final String name);
    public LambdaDslObject id(final String name, Long example);
    public LambdaDslObject uuid(final String name);
    public LambdaDslObject uuid(final String name, UUID example);
    public LambdaDslObject date();
    public LambdaDslObject date(String name);
    public LambdaDslObject date(String name, String format);
    public LambdaDslObject date(String name, String format, Date example);
    public LambdaDslObject date(String name, String format, Date example, TimeZone timeZone);
    public LambdaDslObject date(String name, String format, ZonedDateTime example);
    public LambdaDslObject date(String name, String format, LocalDate example);
    public LambdaDslObject time();
    public LambdaDslObject time(String name);
    public LambdaDslObject time(String name, String format);
    public LambdaDslObject time(String name, String format, Date example);
    public LambdaDslObject time(String name, String format, Date example, TimeZone timeZone);
    public LambdaDslObject time(String name, String format, ZonedDateTime example);
    public LambdaDslObject timestamp();
    public LambdaDslObject datetime(String name);
    public LambdaDslObject datetime(String name, String format);
    public LambdaDslObject datetime(String name, String format, Date example);
    public LambdaDslObject datetime(String name, String format, Instant example);
    public LambdaDslObject datetime(String name, String format, Date example, TimeZone timeZone);
    public LambdaDslObject datetime(String name, String format, ZonedDateTime example);
    public LambdaDslObject ipV4Address(String name);
    public LambdaDslObject valueFromProviderState(String name, String expression, Object example);
    public LambdaDslObject and(String name, Object value, MatchingRule... rules);
    public LambdaDslObject or(String name, Object value, MatchingRule... rules);
    public LambdaDslObject array(final String name, final Consumer<LambdaDslJsonArray> array);
    public LambdaDslObject array(final String name);
    public LambdaDslObject object(final String name, final Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject object(final String name);
    public LambdaDslObject eachLike(String name, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject eachLike(String name, int numberExamples, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject eachLike(String name, PactDslJsonRootValue value);
    public LambdaDslObject eachLike(String name, PactDslJsonRootValue value, int numberExamples);
    public LambdaDslObject minArrayLike(String name, Integer size, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject minArrayLike(String name, Integer size, int numberExamples,
                                        Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject minArrayLike(String name, Integer size, PactDslJsonRootValue value, int numberExamples);
    public LambdaDslObject maxArrayLike(String name, Integer size, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject maxArrayLike(String name, Integer size, int numberExamples,
                                        Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject maxArrayLike(String name, Integer size, PactDslJsonRootValue value, int numberExamples);
    public LambdaDslObject minMaxArrayLike(String name, Integer minSize, Integer maxSize, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject minMaxArrayLike(String name, Integer minSize, Integer maxSize, int numberExamples,
                                           Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject minMaxArrayLike(String name, Integer minSize, Integer maxSize, PactDslJsonRootValue value,
                                           int numberExamples);
    public LambdaDslObject nullValue(String fieldName);
    public LambdaDslObject eachArrayLike(String name, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayLike(String name, int numberExamples, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMaxLike(String name, Integer size, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMaxLike(String name, int numberExamples, Integer size,
                                                Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMinLike(String name, Integer size, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMinLike(String name, int numberExamples, Integer size,
                                                Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMinMaxLike(String name, Integer minSize, Integer maxSize, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachArrayWithMinMaxLike(String name, Integer minSize, Integer maxSize, int numberExamples,
                                                   Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachKeyMappedToAnArrayLike(String exampleKey, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject eachKeyLike(String exampleKey, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject eachKeyLike(String exampleKey, PactDslJsonRootValue value);
    public LambdaDslObject eachValueLike(String exampleKey, Consumer<LambdaDslObject> nestedObject);
    public LambdaDslObject eachValueLike(String exampleKey, PactDslJsonRootValue value);
    public LambdaDslObject dateExpression(String name, String expression);
    public LambdaDslObject dateExpression(String name, String expression, String format);
    public LambdaDslObject timeExpression(String name, String expression);
    public LambdaDslObject timeExpression(String name, String expression, String format);
    public LambdaDslObject datetimeExpression(String name, String expression);
    public LambdaDslObject datetimeExpression(String name, String expression, String format);
    public LambdaDslObject unorderedArray(String name, final Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject unorderedMinArray(String name, int size, final Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject unorderedMaxArray(String name, int size, final Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject unorderedMinMaxArray(String name, int minSize, int maxSize, final Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject matchUrl(String name, String basePath, Object... pathFragments);
    public LambdaDslObject matchUrl2(String name, Object... pathFragments);
    public LambdaDslObject arrayContaining(String name, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslObject eachKeyMatching(Matcher matcher);
    public LambdaDslObject eachValueMatching(String exampleKey, final Consumer<LambdaDslObject> nestedObject);
}
```

File: ./consumer/src/main/java/au/com/dius/pact/consumer/dsl/LambdaDslJsonBody.java

```java
class LambdaDslJsonBody {
    public DslPart build();
}
```

File: ./consumer/src/main/java/au/com/dius/pact/consumer/dsl/LambdaDslJsonArray.java

```java
class LambdaDslJsonArray {
    public LambdaDslJsonArray object(final Consumer<LambdaDslObject> o);
    public LambdaDslJsonArray array(final Consumer<LambdaDslJsonArray> a);
    public LambdaDslJsonArray unorderedArray(final Consumer<LambdaDslJsonArray> a);
    public LambdaDslJsonArray unorderedMinArray(int size, final Consumer<LambdaDslJsonArray> a);
    public LambdaDslJsonArray unorderedMaxArray(int size, final Consumer<LambdaDslJsonArray> a);
    public LambdaDslJsonArray unorderedMinMaxArray(int minSize, int maxSize, final Consumer<LambdaDslJsonArray> a);
    public LambdaDslJsonArray stringValue(final String value);
    public LambdaDslJsonArray stringType(final String example);
    public LambdaDslJsonArray stringMatcher(final String regex, final String example);
    public LambdaDslJsonArray numberValue(final Number value);
    public LambdaDslJsonArray numberType(final Number example);
    public LambdaDslJsonArray integerType();
    public LambdaDslJsonArray integerType(final Long example);
    public LambdaDslJsonArray decimalType();
    public LambdaDslJsonArray decimalType(final BigDecimal example);
    public LambdaDslJsonArray decimalType(final Double example);
    public LambdaDslJsonArray numberMatching(String regex, Number example);
    public LambdaDslJsonArray decimalMatching(String regex, Double example);
    public LambdaDslJsonArray integerMatching(String regex, Integer example);
    public LambdaDslJsonArray booleanValue(final Boolean value);
    public LambdaDslJsonArray booleanType(final Boolean example);
    public LambdaDslJsonArray date();
    public LambdaDslJsonArray date(final String format);
    public LambdaDslJsonArray date(final String format, final Date example);
    public LambdaDslJsonArray time();
    public LambdaDslJsonArray time(final String format);
    public LambdaDslJsonArray time(final String format, final Date example);
    public LambdaDslJsonArray timestamp();
    public LambdaDslJsonArray timestamp(final String format);
    public LambdaDslJsonArray timestamp(final String format, final Date example);
    public LambdaDslJsonArray timestamp(final String format, final Instant example);
    public LambdaDslJsonArray datetime();
    public LambdaDslJsonArray datetime(final String format);
    public LambdaDslJsonArray datetime(final String format, final Date example);
    public LambdaDslJsonArray datetime(final String format, final Instant example);
    public LambdaDslJsonArray id();
    public LambdaDslJsonArray id(final Long example);
    public LambdaDslJsonArray uuid();
    public LambdaDslJsonArray uuid(final String example);
    public LambdaDslJsonArray hexValue();
    public LambdaDslJsonArray hexValue(final String example);
    public LambdaDslJsonArray ipV4Address();
    public LambdaDslJsonArray and(Object value, MatchingRule... rules);
    public LambdaDslJsonArray or(Object value, MatchingRule... rules);
    public LambdaDslJsonArray eachLike(Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray eachLike(PactDslJsonRootValue value);
    public LambdaDslJsonArray eachLike(PactDslJsonRootValue value, int numberExamples);
    public LambdaDslJsonArray eachLike(int numberExamples, Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray minArrayLike(Integer size, Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray minArrayLike(Integer size, int numberExamples,
                                           Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray maxArrayLike(Integer size, Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray maxArrayLike(Integer size, int numberExamples,
                                           Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray minMaxArrayLike(Integer minSize, Integer maxSize, Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray minMaxArrayLike(Integer minSize, Integer maxSize, int numberExamples,
                                              Consumer<LambdaDslJsonBody> nestedObject);
    public LambdaDslJsonArray nullValue();
    public LambdaDslJsonArray eachArrayLike(Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayLike(int numberExamples, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMaxLike(Integer size, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMaxLike(int numberExamples, Integer size,
                                                   Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMinLike(Integer size, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMinLike(int numberExamples, Integer size,
                                                   Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMinMaxLike(Integer minSize, Integer maxSize, Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray eachArrayWithMinMaxLike(Integer minSize, Integer maxSize, int numberExamples,
                                                      Consumer<LambdaDslJsonArray> nestedArray);
    public LambdaDslJsonArray dateExpression(String expression);
    public LambdaDslJsonArray dateExpression(String expression, String format);
    public LambdaDslJsonArray timeExpression(String expression);
    public LambdaDslJsonArray timeExpression(String expression, String format);
    public LambdaDslJsonArray datetimeExpression(String expression);
    public LambdaDslJsonArray datetimeExpression(String expression, String format);
    public DslPart build();
}
```
