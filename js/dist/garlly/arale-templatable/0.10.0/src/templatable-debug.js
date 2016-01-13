define("garlly/arale-templatable/0.10.0/src/templatable-debug", ["garlly/jquery/1.7.2/jquery-debug","garlly/handlebars/1.3.0/dist/cjs/handlebars-debug"], function(require, exports, module){
var $ = require("garlly/jquery/1.7.2/jquery-debug");
var Handlebars = require("garlly/handlebars/1.3.0/dist/cjs/handlebars-debug")['default'];

var compiledTemplates = {};

// 提供 Template 模板支持，默认引擎是 Handlebars
module.exports = {

  // Handlebars 的 helpers
  templateHelpers: null,

  // Handlebars 的 partials
  templatePartials: null,

  // template 对应的 DOM-like object
  templateObject: null,

  // 根据配置的模板和传入的数据，构建 this.element 和 templateElement
  parseElementFromTemplate: function () {
    // template 支持 id 选择器
    var t, template = this.get('template');
    if (/^#/.test(template) && (t = document.getElementById(template.substring(1)))) {
      template = t.innerHTML;
      this.set('template', template);
    }
    this.templateObject = convertTemplateToObject(template);
    this.element = $(this.compile());
  },

  // 编译模板，混入数据，返回 html 结果
  compile: function (template, model) {
    template || (template = this.get('template'));

    model || (model = this.get('model')) || (model = {});
    if (model.toJSON) {
      model = model.toJSON();
    }

    // handlebars runtime，注意 partials 也需要预编译
    if (isFunction(template)) {
      return template(model, {
        helpers: this.templateHelpers,
        partials: precompile(this.templatePartials)
      });
    } else {
      var helpers = this.templateHelpers;
      var partials = this.templatePartials;
      var helper, partial;

      // 注册 helpers
      if (helpers) {
        for (helper in helpers) {
          if (helpers.hasOwnProperty(helper)) {
            Handlebars.registerHelper(helper, helpers[helper]);
          }
        }
      }
      // 注册 partials
      if (partials) {
        for (partial in partials) {
          if (partials.hasOwnProperty(partial)) {
            Handlebars.registerPartial(partial, partials[partial]);
          }
        }
      }

      var compiledTemplate = compiledTemplates[template];
      if (!compiledTemplate) {
        compiledTemplate = compiledTemplates[template] = Handlebars.compile(template);
      }

      // 生成 html
      var html = compiledTemplate(model);

      // 卸载 helpers
      if (helpers) {
        for (helper in helpers) {
          if (helpers.hasOwnProperty(helper)) {
            delete Handlebars.helpers[helper];
          }
        }
      }
      // 卸载 partials
      if (partials) {
        for (partial in partials) {
          if (partials.hasOwnProperty(partial)) {
            delete Handlebars.partials[partial];
          }
        }
      }
      return html;
    }
  },

  // 刷新 selector 指定的局部区域
  renderPartial: function (selector) {
    if (this.templateObject) {
      var template = convertObjectToTemplate(this.templateObject, selector);

      if (template) {
        if (selector) {
          this.$(selector).html(this.compile(template));
        } else {
          this.element.html(this.compile(template));
        }
      } else {
        this.element.html(this.compile());
      }
    }

    // 如果 template 已经编译过了，templateObject 不存在
    else {
      var all = $(this.compile());
      var selected = all.find(selector);
      if (selected.length) {
        this.$(selector).html(selected.html());
      } else {
        this.element.html(all.html());
      }
    }

    return this;
  }
};


// Helpers
// -------
var _compile = Handlebars.compile;

Handlebars.compile = function (template) {
  return isFunction(template) ? template : _compile.call(Handlebars, template);
};

// 将 template 字符串转换成对应的 DOM-like object


function convertTemplateToObject(template) {
  return isFunction(template) ? null : $(encode(template));
}

// 根据 selector 得到 DOM-like template object，并转换为 template 字符串


function convertObjectToTemplate(templateObject, selector) {
  if (!templateObject) return;

  var element;
  if (selector) {
    element = templateObject.find(selector);
    if (element.length === 0) {
      throw new Error('Invalid template selector: ' + selector);
    }
  } else {
    element = templateObject;
  }
  return decode(element.html());
}

function encode(template) {
  return template
  // 替换 {{xxx}} 为 <!-- {{xxx}} -->
  .replace(/({[^}]+}})/g, '<!--$1-->')
  // 替换 src="{{xxx}}" 为 data-TEMPLATABLE-src="{{xxx}}"
  .replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g, ' data-templatable-$1=$2$3$2');
}

function decode(template) {
  return template.replace(/(?:<|&lt;)!--({{[^}]+}})--(?:>|&gt;)/g, '$1').replace(/data-templatable-/ig, '');
}

function isFunction(obj) {
  return typeof obj === "function";
}

function precompile(partials) {
  if (!partials) return {};

  var result = {};
  for (var name in partials) {
    var partial = partials[name];
    result[name] = isFunction(partial) ? partial : Handlebars.compile(partial);
  }
  return result;
};

// 调用 renderPartial 时，Templatable 对模板有一个约束：
// ** template 自身必须是有效的 html 代码片段**，比如
//   1. 代码闭合
//   2. 嵌套符合规范
//
// 总之，要保证在 template 里，将 `{{...}}` 转换成注释后，直接 innerHTML 插入到
// DOM 中，浏览器不会自动增加一些东西。比如：
//
// tbody 里没有 tr：
//  `<table><tbody>{{#each items}}<td>{{this}}</td>{{/each}}</tbody></table>`
//
// 标签不闭合：
//  `<div><span>{{name}}</div>`

});
