window.addEvent('domready', init);

var get = function(rsrc) 
{
  return new Request({
    url: 'data/'+rsrc+'.json'
  });
}.decorate(promise)

var TestA = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestA",
  
  setup: function() {},
  tearDown: function() {},
  
  add: $deftest(
    "Add two numbers",
    function() { SSUnit.assertEqual(1 + 2, 3); }
  )
});

var TestB = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestB",
  
  setup: function() {},
  tearDown: function() {},
  
  add: $deftest(
    "Add two numbers",
    function() { SSUnit.assertEqual(1 + 2, 3); }
  ),
  
  subtract: $deftest(
    "Subtract two numbers",
    function() { SSUnit.assertEqual(3 - 1, 1); }
  )
});

var TestC = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestC",
  
  setup: function() {},
  tearDown: function() {},
  
  add: $deftest(
    "Add two numbers",
    function() 
    { 
      var hook = SSUnit.startAsync();
      SSUnit.assertEqual(1 + 2, 3, hook);
      SSUnit.endAsync(hook);
    }
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
  var t = new TestB();
  var r = t.results();
  var f = new SSUnitTest.ResultFormatter.Console();
  t.run();
  f.output(r);
}

function demo2() {
  var t = new TestB();
  SSUnitTest.main();
}

function demo3() {
  var s = new TestSuite();
  var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}

function demo4() {
  var t = new TestA();
  var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}

function demo5() {
  var t = new TestC();
  var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}