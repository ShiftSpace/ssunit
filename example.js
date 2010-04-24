window.addEvent('domready', init);


var get = function(rsrc) 
{
  return new Request({
    url: 'data/'+rsrc+'.json'
  });
}.future();


var TestA = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestA",
  
  setup: function() {},
  tearDown: function() {},
  
  add: $fixture(
    "Add two numbers",
    function() { SSUnit.assertEqual(1 + 2, 3); }
  )
});


var TestB = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestB",
  
  setup: function() {},
  tearDown: function() {},
  
  add: $fixture(
    "Add two numbers",
    function() { SSUnit.assertEqual(1 + 2, 3); }
  ),
  
  subtract: $fixture(
    "Subtract two numbers",
    function() { SSUnit.assertEqual(3 - 1, 1); }
  )
});


var TestC = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestC",
  
  onStart: function() { console.log("Start TestC"); },
  onComplete: function() { console.log("End TestC"); },
  
  setup: function() {},
  tearDown: function() {},
  
  add1: $fixture(
    "Check adding two remote resources",
    function() { 
      var hook = SSUnit.startAsync(),
          p1 = get("a"),
          p2 = get("b");
      (function(a, b) {
        SSUnit.assertEqual(a + b, "ac", hook);
        SSUnit.endAsync(hook);
      }.future())(p1, p2);
    }
  ),
  
  add2: $fixture(
    "Check adding two remote resources",
    function() { 
      var hook = SSUnit.startAsync(),
          p1 = get("a"),
          p2 = get("b");
      (function(a, b) {
        SSUnit.assertEqual(a + b, "ab", hook);
        SSUnit.endAsync(hook);
      }.future())(p1, p2);
    }
  ),
  
  add3: $fixture(
    "Check adding two remote resources",
    function() { 
      var hook = SSUnit.startAsync(),
          p1 = get("b"),
          p2 = get("c");
      (function(b, c) {
        SSUnit.assertEqual(b + c, "bc", hook);
        SSUnit.endAsync(hook);
      }.future())(p1, p2);
    }
  )
});


var TestD = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestD",
  
  setup: function() {},
  tearDown: function() {},
  
  uncaught: $fixture(
    "An uncaught exception",
    function() { return a + b; }
  )
});


var TestSuite = new Class({
  Extends: SSUnitTest.TestSuite,
  name: "TestSuite",
  
  initialize: function() {
    this.parent();
    this.addTest(TestB);
  }
});


function init() {
  console.log("init");
}

function demo1() {
  var t = new TestB(),
      r = t.results(),
      f = new SSUnitTest.ResultFormatter.Console();
  t.run();
  f.output(r);
}


function demo2() {
  var t = new TestB();
  SSUnitTest.main();
}


function demo3() {
  var s = new TestSuite(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}


function demo4() {
  var t = new TestA(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}


function demo5() {
  var t = new TestC(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}


function demo6() {
  var t = new TestD(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}