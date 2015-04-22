fs = require 'fs'
path = require 'path'

module.exports = (grunt) ->
	cfgName = "assetenc"
	taskName = "encode-asset-base64"
	taskDescription = "encode asset(s) to base64"
	grunt.registerTask taskName, taskDescription, ->
		config = grunt.config cfgName

		getPaths = (startPath) ->
			dirs = [startPath] # push/shift
			files = []
			bfs = (target) ->
				ls = fs.readdirSync target
				ls = ls.filter((x)->x.indexOf(".")!=0).map((x)->path.join(target, x))
				dirs = dirs.concat ls.filter (x)->fs.lstatSync(x).isDirectory()
				files = files.concat ls.filter (x)->fs.lstatSync(x).isFile()
			bfs(dirs.shift()) until dirs.length==0
			files

		toDataschemeBase64 = (filepath, mime) ->
			"data:#{mime};base64,#{new Buffer(fs.readFileSync filepath).toString("base64")}"

		trimName = (naivePath, givenRoot, assetRoot) ->
			unless assetRoot?
				assetRoot = givenRoot
				assetRoot = assetRoot.replace(/^\.|^\//, "") while /^\.|^\//.test assetRoot
			naivePath.replace givenRoot, assetRoot

		encode = (args)->
			givenMap = config.map || {};
			result = {}
			args.forEach (filepath) ->
				name = trimName(filepath.substr(0, filepath.lastIndexOf(".")), config.pathToAssets, config.rootAlias)
				exp = filepath.substr(filepath.lastIndexOf(".")+1, filepath.length-1).toLowerCase()
				if Object.keys(givenMap).indexOf(exp) >= 0
					if typeof givenMap[exp] is "function"
						result[name] = givenMap[exp](filepath)
					else
						result[name] = toDataschemeBase64(filepath, givenMap[exp])
				else
					switch true
						when /jpe?g/.test exp
							result[name] = toDataschemeBase64(filepath, "image/jpeg")
						when exp is "png"
							result[name] = toDataschemeBase64(filepath, "image/png")
						when exp is "gif"
							result[name] = toDataschemeBase64(filepath, "image/gif")
			result

		compile = (assets) ->
			template = fs.readFileSync(config.template, "utf-8")
			target = config.dst
			fs.writeFileSync(target, grunt.template.process(template, data: {assets: assets}))

		compile encode getPaths config.pathToAssets
