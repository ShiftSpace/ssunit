window.addEvent('domready', init);

var TestTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: "TestTest",
  
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
    this.addTest(TestTest);
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

function demo() {
  var t = new TestTest();
  var r = t.results();
  var f = new SSUnitTest.ResultFormatter.Console();
  t.run();
  f.output(r);
}

function demo2() {
  var t = new TestTest();
  SSUnitTest.main();
}

function demo3() {
  var s = new TestSuite();
  SSUnitTest.main();
}

function demo3() {
  var s = new TestSuite();
  var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('results')});
  SSUnitTest.main({formatter:f});
}