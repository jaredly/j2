
# Fixtures

So I'm thinking that 'expect tests' are for
- in the type land, for asserting matches or not matches
- in the expr land, for `@expr:ok()`, like no error decorators
	- also `@type:shouldMatch(:t)`
	- and eventually `@expect(someValue)`

And fixtures are for
- error decorator locations
- basic parsing/printing of everything

So there's
- input / output:expected / output:failed

# Expect Tests

Values
and
Types

Should all tests go in the same ~file?

or should I have 'fixture tests' and 'expect tests'?

fixture tests certainly are more fragile
probably a good idea to bias toward expect tests.

btw can also do `expect:equals` and stuff once I have a runtime.
