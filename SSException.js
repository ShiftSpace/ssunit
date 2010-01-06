// ==Builder==
// @name              SSException
// @package           System
// ==/Builder==

var SSExceptionPrinter = new Class({
  toString: function() {
    return ["["+this.name+"] message: " + this.message(), " fileName:" + this.fileName(), " lineNumber: " + this.lineNumber(), (this.originalError() && this.originalError().message) || 'no original error'].join(", ");
  }
});

var SSException = new Class({
  Implements: SSExceptionPrinter,
  name: 'SSException',
  initialize: function(_error) { this.theError = _error; },
  setMessage: function(msg) { this.__message = msg; },
  message: function() { return this.__message || (this.theError && this.theError.message) || 'n/a'; },
  fileName: function() { return (this.theError && this.theError.fileName) || 'n/a'; },
  lineNumber: function() { return (this.theError && this.theError.lineNumber) || 'n/a'; },
  originalError: function() { return this.theError; }
});

function SSDescribeException(_exception) {
  var temp = [];
  for(var prop in _exception) temp.push(prop + ':' + _exception[prop]);
  return "Exception:{ " + temp.join(', ') +" }";
};

function SSError(ns, base, rest) {
  rest = $splat(rest);
  rest.each(function(name) {
    ns[name] = new Class({
      Extends: base,
      Implements: SSExceptionPrinter,
      name: name
    });
  });
};