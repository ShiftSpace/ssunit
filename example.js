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

function init() {
  console.log("init");
  new TestTest({autoCollect: true});
  SSUnitTest.main();
}