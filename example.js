window.addEvent('domready', init);

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

var TestSuite = new Class({
  Extends: SSUnitTest.TestSuite,
  name: "TestSuite",
  
  initialize: function() {
    this.parent();
    this.addTest(TestB);
  }
});

/*
var TestAsync = new Class({
  Extends: SSUnitTest.TestCase,
  
  setup: function() {},
  tearDown: function() {},
  
  testUI: $deftest(
    "test loading interface",
    function() 
    {
      var p = SSUnit.async();
      var p1 = SSLoadFile('foobar.html');
      var p2 = this.initUI(p1);
      p2.op(function(v) { 
        SSUnit.assertEqual(SSControllerForNode($('foobar')).getName(), "barbaz", p);
        SSUnit.endAsync(p);
        })
    }
  )
});
*/

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