var SSUnit = {};
SSUnit.assertEqual = function(a, b) {
  var caller = SSUnit.assertEqual.caller;
  console.log(caller.__name, caller.__doc, caller.__istest);
};

function deftest(doc, fn) {
  fn.__doc = doc;
  fn.__istest = true;
  return fn;
}

function processTest(test) {
  for(var field in test) {
    var v = test[field];
    if($type(v) == "function") {
      var origin = v._origin;
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
  login: deftest(
    "Verify that login works",
    function() {
      SSUnit.assertEqual(3, 4);
    }
  )
});