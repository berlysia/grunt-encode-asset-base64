// Generated by CoffeeScript 1.9.2
var fs, path;

fs = require('fs');

path = require('path');

module.exports = function(grunt) {
  var cfgName, taskDescription, taskName;
  cfgName = "assetenc";
  taskName = "encode-asset-base64";
  taskDescription = "encode asset(s) to base64";
  return grunt.registerTask(taskName, taskDescription, function() {
    var compile, config, encode, getPaths, toDataschemeBase64, trimName;
    config = grunt.config(cfgName);
    getPaths = function(startPath) {
      var bfs, dirs, files;
      dirs = [startPath];
      files = [];
      bfs = function(target) {
        var ls;
        ls = fs.readdirSync(target);
        ls = ls.filter(function(x) {
          return x.indexOf(".") !== 0;
        }).map(function(x) {
          return path.join(target, x);
        });
        dirs = dirs.concat(ls.filter(function(x) {
          return fs.lstatSync(x).isDirectory();
        }));
        return files = files.concat(ls.filter(function(x) {
          return fs.lstatSync(x).isFile();
        }));
      };
      while (dirs.length !== 0) {
        bfs(dirs.shift());
      }
      return files;
    };
    toDataschemeBase64 = function(filepath, mime) {
      return "data:" + mime + ";base64," + (new Buffer(fs.readFileSync(filepath)).toString("base64"));
    };
    trimName = function(naivePath, givenRoot, assetRoot) {
      if (assetRoot == null) {
        assetRoot = givenRoot;
        while (/^\.|^\//.test(assetRoot)) {
          assetRoot = assetRoot.replace(/^\.|^\//, "");
        }
      }
      return naivePath.replace(givenRoot, assetRoot).split(path.sep).join("/");
    };
    encode = function(args) {
      var givenMap, result;
      givenMap = config.map || {};
      result = {};
      args.forEach(function(filepath) {
        var exp, name;
        name = trimName(filepath.substr(0, filepath.lastIndexOf(".")), config.pathToAssets, config.rootAlias);
        exp = filepath.substr(filepath.lastIndexOf(".") + 1, filepath.length - 1).toLowerCase();
        if (Object.keys(givenMap).indexOf(exp) >= 0) {
          if (typeof givenMap[exp] === "function") {
            return result[name] = givenMap[exp](filepath);
          } else {
            return result[name] = toDataschemeBase64(filepath, givenMap[exp]);
          }
        } else {
          switch (true) {
            case /jpe?g/.test(exp):
              return result[name] = toDataschemeBase64(filepath, "image/jpeg");
            case exp === "png":
              return result[name] = toDataschemeBase64(filepath, "image/png");
            case exp === "gif":
              return result[name] = toDataschemeBase64(filepath, "image/gif");
          }
        }
      });
      return result;
    };
    compile = function(assets) {
      var target, template;
      template = fs.readFileSync(config.template, "utf-8");
      target = config.dst;
      return fs.writeFileSync(target, grunt.template.process(template, {
        data: {
          assets: assets
        }
      }));
    };
    return compile(encode(getPaths(config.pathToAssets)));
  });
};
