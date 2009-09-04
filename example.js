window.addEvent('domready', init);

var TestTest = new Class({
  Extends: SSUnitTest.TestCase,
  
  setup: function() {},
  tearDown: function() {},
  
  testAdd: function() {
    this.doc("add two numbers");
    this.assertEqual(1 + 2, 3);
  },
  
  testSubtract: function() {
    this.doc("subtract two numbers")
    this.assertEqual(3 - 1, 1);
  }
});

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

function init() {
  console.log("init");
  new TestTest({autoCollect: true});
  SSUnitTest.main();
}