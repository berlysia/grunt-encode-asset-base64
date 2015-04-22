grunt-encode-asset-base64
=====
grunt plugin to encode assets to base64 data URI scheme for embedding to JavaScript code

### install
```
$ npm install grunt-encode-asset-base64
```

### usage

```javascript
var grunt = require("grunt");

module.exports = function(){
	grunt.initConfig({
		assetsenc: {
			map: {
				"json": function(filepath){
					return JSON.stringify(JSON.parse(require("fs").readFileSync(filepath)));
				},
				"bmp": "image/bmp"
			},
			pathToAssets: "path/to/assets",
			rootAlias: "assets",
			dst: "assets/assets.js",
			template: "assets/assets.template.js"
		}
	});

	grunt.loadNpmTasks('grunt-encode-asset-base64');
};
```

```
$ grunt encode-asset-base64
```

### options

```javascript
assetsenc: {
	map: {
		"expr": "mime/types", // add expression to encode to data URI scheme with mime type.
		"json": function(filepath){
			return JSON.stringify(JSON.parse(require("fs").readFileSync(filepath)));
			// if you want some specified result, write your process. given [filepath].
		}
	}, // default: {}
	pathToAssets: "path/to/assets", // required
	rootAlias: "assets", // default: processed pathToAssets(omit '.', '..', './', '../' at the beginning of path)
	dst: "assets/assets.js", // required. output file goes here(override if exists)
	template: "assets/assets.template.js" // required. lodash template style.
}
```

#### built-in mapping

* .jpe?g => image/jpeg
* .png => image/png
* .gif => image/gif

### template and output

```javascript
var Assets = {};
<% Object.keys(assets).forEach(function(key){%>
Assets['<%= key %>'] = '<%= this[key] %>';
<% }, assets); %> 
```
dirs
```
assets
|-Hoge
||-A.jpg
|-Fuga
||-FugaFuga
|||-B.png
```

results

```javascript
var Assets = {};

Assets['assets/Hoge/A'] = 'data:image/jpeg;base64,....';
Assets['assets/Fuga/FugaFuga/B'] = 'data:image/png;base64,.... ';
```

### License
MIT