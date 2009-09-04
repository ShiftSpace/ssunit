var add = function(a, b) { return a + b; }.asPromise();
var sum = $arity(
  function(a) { return a; }.asPromise(),
  function(a, b) { return add(a, (($type(b) == 'array') ? b.first() || 0 : b)); }.asPromise()
);