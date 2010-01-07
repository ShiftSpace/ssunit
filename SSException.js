// ==Builder==
// @name              SSException
// @package           System
// ==/Builder==

var SSException = new Class({
  name: 'SSException',
  initialize: function(err, message) {
    this.err = err;
    this.message = message;
  },
  originalError: function() { return this.theError; }
});
SSException.prototype.toString = function() {
  return "[SSException message:{message} fileName:{fileName} lineNumber:{lineNumber}]".substitute(
    $merge({lineNumber: "n/a", fileName: "n/a"}, this.err, {message: this.message})
  );
};

function SSError(ns, base, rest) {
  rest = $splat(rest);
  rest.each(function(aname) {
    ns[aname] = new Class({
      Extends: base,
      name: aname
    });
  });
};