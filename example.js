window.addEvent('domready', init);


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

// check console output
function demo1() {
  var t = new TestB(),
      r = t.results(),
      f = new SSUnitTest.ResultFormatter.Console();
  t.run();
  f.output(r);
}

// check test suites
function demo2() {
  var t = new TestB();
  SSUnitTest.main();
}

// check dom formatter
function demo3() {
  var s = new TestSuite(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}

// check dom formatter
function demo4() {
  var t = new TestA(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}

// Check uncaught exceptions
function demo5() {
  var t = new TestC(),
      f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}