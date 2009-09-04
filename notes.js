/*
"function $9hello(a, b) { cool(); }(".match(/function \S*\((.*?)\)/)
var sum = $arity(
  function(a) { return a };
  function(a, b) { return a + b.first(); };
)
*/

function $not(fn) {
  return function() {
    return !fn.apply(this, $A(arguments));
  }
}
function $isnull(v) { return v === null; };
function $notnull(v) { return v !== null; };

function $arity()
{
  var fns = $A(arguments);
  var dispatch = [];
  fns.each(function(fn) {
    var arglist = fn.toString().match(/function \S*\((.*?)\)/)[1].split(',');
    dispatch[arglist.length] = fn;
  });
  return function () {
    var args = $A(arguments).filter($notnull);
    return dispatch[args.length].apply(this, args);
  }
}

var sum = $arity(
  function(a) { return a; },
  function(a, b) { return a + (($type(b) == 'array') ? b.first() || 0 : b); }
);

function $reduce(fn, ary) {
  ary = $A(ary);
  var result = ary.first();
  while(ary.length != 0) {
    var rest = ary.rest();
    result = fn(result, rest);
    ary = rest;
  }
  return result;
}

var SSUnit = {};
SSUnit.assertEqual = function(a, b) {
  var caller = SSUnit.assertEqual.caller;
  console.log(caller.__name, caller.__doc, caller.__istest);
};

function $deftest(doc, fn) {
  fn.__doc = doc;
  fn.__istest = true;
  return fn;
}

function $doc(fn) { return fn.__doc; };
function $name(fn) { return fn.__name; };
function $origin(fn) { return fn._origin };

function $processTest(test) {
  for(var field in test) {
    var v = test[field];
    if($type(v) == "function") {
      var origin = $origin(v);
      if(origin.__istest) {
        v.__istest = true;
        v.__doc = origin.__doc;
        v.__name = field;
        origin.__name = field;
      }
    }
  }
  return test;
}

var unittest = new Class({
  login: $deftest(
    "Verify that login works",
    function() {
      SSUnit.assertEqual(3, 4);
    }
  )
});