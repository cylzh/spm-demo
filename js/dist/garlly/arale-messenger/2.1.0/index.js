define("garlly/arale-messenger/2.1.0/index",[],function(t,e,n){n.exports=function(){function t(t,e){var n="";if(arguments.length<2?n="target error - target and name are both required":"object"!=typeof t?n="target error - target itself must be window object":"string"!=typeof e&&(n="target error - target name must be string type"),n)throw new Error(n);this.target=t,this.name=e}function e(t,e){this.targets={},this.name=t,this.listenFunc=[],n=e||n,this.initListen()}var n="arale-messenger",i="postMessage"in window;return t.prototype.send=i?function(t){this.target.postMessage(n+t,"*")}:function(t){var e=window.navigator[n+this.name];if("function"!=typeof e)throw new Error("target callback function is not defined");e(n+t,window)},e.prototype.addTarget=function(e,n){var i=new t(e,n);this.targets[n]=i},e.prototype.initListen=function(){var t=this,e=function(e){"object"==typeof e&&e.data&&(e=e.data),e=e.slice(n.length);for(var i=0;i<t.listenFunc.length;i++)t.listenFunc[i](e)};i?"addEventListener"in document?window.addEventListener("message",e,!1):"attachEvent"in document&&window.attachEvent("onmessage",e):window.navigator[n+this.name]=e},e.prototype.listen=function(t){this.listenFunc.push(t)},e.prototype.clear=function(){this.listenFunc=[]},e.prototype.send=function(t){var e,n=this.targets;for(e in n)n.hasOwnProperty(e)&&n[e].send(t)},e}()});