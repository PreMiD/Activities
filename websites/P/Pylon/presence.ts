const presence = new Presence({
		clientId: "779062000412000307",
	}),
	// https://github.com/iCrawl/discord-vscode/blob/master/src/data/languages.json
	knownExtensions: { [key: string]: { image: string } } = {
		".ahk": { image: "ahk" },
		".ahkl": { image: "ahk" },
		"androidmanifest.xml": { image: "android" },
		"/^angular[^.]*\\.js$/i": { image: "angular" },
		".applescript": { image: "applescript" },
		"/(\\.)?appveyor\\.yml/i": { image: "appveyor" },
		".ino": { image: "arduino" },
		".swf": { image: "as" },
		".as": { image: "as" },
		".jsfl": { image: "as" },
		".swc": { image: "as" },
		".asp": { image: "asp" },
		".asax": { image: "asp" },
		".ascx": { image: "asp" },
		".ashx": { image: "asp" },
		".asmx": { image: "asp" },
		".aspx": { image: "asp" },
		".axd": { image: "asp" },
		"/\\.setTrayTitle(l?a|[ls]?o|out|s|a51|asm|axf|elf|prx|puff|z80)$/i": {
			image: "assembly",
		},
		".agc": { image: "assembly" },
		".ko": { image: "assembly" },
		".lst": { image: "assembly" },
		"/\\.setTrayTitle((c([+px]{2}?)?-?)?objdump|bsdiff|bin|dat|pak|pdb)$/i": {
			image: "assembly",
		},
		".d-objdump": { image: "assembly" },
		"/\\.gcode|\\.gco/i": { image: "assembly" },
		"/\\.rpy[bc]$/i": { image: "assembly" },
		"/\\.py[co]$/i": { image: "assembly" },
		".swp": { image: "assembly" },
		".DS_Store": { image: "assembly" },
		".au3": { image: "autoit" },
		"babel.config.js": { image: "babel" },
		"/\\.babelrc/i": { image: "babel" },
		".bat": { image: "bat" },
		".batch": { image: "bat" },
		".cmd": { image: "bat" },
		"/\\.setTrayTitle(exe|com|msi)$/i": { image: "bat" },
		".reg": { image: "bat" },
		"/^(\\.bowerrc|bower\\.json|Bowerfile)$/i": { image: "bower" },
		"/\\.bf?$/i": { image: "brainfuck" },
		"/\\.c$/i": { image: "c" },
		"/(cargo.toml|cargo.lock)/i": { image: "cargo" },
		"circle.yml": { image: "circleci" },
		".clj": { image: "clojure" },
		".cl2": { image: "clojure" },
		".cljc": { image: "clojure" },
		".cljx": { image: "clojure" },
		".hic": { image: "clojure" },
		"/\\.cljs(cm)?$/i": { image: "clojure" },
		".cmake": { image: "cmake" },
		"/^CMakeLists\\.txt$/": { image: "cmake" },
		"/\\.codeclimate\\.setTrayTitle(yml|json)/i": { image: "codeclimate" },
		".coffee": { image: "coffee" },
		".cjsx": { image: "coffee" },
		".coffee.ecr": { image: "coffee" },
		".coffee.erb": { image: "coffee" },
		".litcoffee": { image: "coffee" },
		".iced": { image: "coffee" },
		"/\\.c[+px]{2}$|\\.cc$/i": { image: "cpp" },
		"/\\.h[+px]{2}$/i": { image: "cpp" },
		"/\\.[it]pp$/i": { image: "cpp" },
		"/\\.setTrayTitle(tcc|inl)$/i": { image: "cpp" },
		".cats": { image: "cpp" },
		".idc": { image: "cpp" },
		".w": { image: "cpp" },
		".nc": { image: "cpp" },
		".upc": { image: "cpp" },
		".xpm": { image: "cpp" },
		"/\\.e?cr$/i": { image: "crystal" },
		".cs": { image: "csharp" },
		".csx": { image: "csharp" },
		".cshtml": { image: "cshtml" },
		//    ".css": { "image": "css" },
		".css.map": { image: "cssmap" },
		".cu": { image: "cuda" },
		"/\\.di?$/i": { image: "d" },
		".dart": { image: "dart" },
		".dfm": { image: "delphi" },
		".dpr": { image: "delphi" },
		".dsc": { image: "denizen" },
		".dm": { image: "dm" },
		".dme": { image: "dm" },
		".dmm": { image: "dm" },
		"/^(Dockerfile|docker-compose)|\\.docker(file|ignore)$/i": {
			image: "docker",
		},
		"/^docker-sync\\.yml$/i": { image: "docker" },
		".editorconfig": { image: "editorconfig" },
		".ejs": { image: "ejs" },
		".ex": { image: "elixir" },
		"/\\.setTrayTitle(exs|l?eex)$/i": { image: "elixir" },
		"/^mix\\.setTrayTitle(exs?|lock)$/i": { image: "elixir" },
		".elm": { image: "elm" },
		".env": { image: "env" },
		".erl": { image: "erlang" },
		".beam": { image: "erlang" },
		".hrl": { image: "erlang" },
		".xrl": { image: "erlang" },
		".yrl": { image: "erlang" },
		".app.src": { image: "erlang" },
		"/^Emakefile$/": { image: "erlang" },
		"/^rebar(\\.config)?\\.lock$/i": { image: "erlang" },
		"/\\.setTrayTitle(eslintrc|eslintignore)/i": { image: "eslint" },
		"/(\\.firebaserc|firebase\\.json)/i": { image: "firebase" },
		".flowconfig": { image: "flowconfig" },
		".fs": { image: "fsharp" },
		".fsi": { image: "fsharp" },
		".fsscript": { image: "fsharp" },
		".fsx": { image: "fsharp" },
		"/gatsby-(browser|node|ssr|config)\\.js/i": { image: "gatsbyjs" },
		"/^Gemfile(\\.lock)?$/i": { image: "gemfile" },
		"/^\\.git|^\\.keep$|\\.mailmap$/i": { image: "git" },
		".go": { image: "go" },
		".gd": { image: "godot" },
		".gradle": { image: "gradle" },
		gradlew: { image: "gradle" },
		".gql": { image: "graphql" },
		".graphql": { image: "graphql" },
		".groovy": { image: "groovy" },
		".gvy": { image: "groovy" },
		".gy": { image: "groovy" },
		".gsh": { image: "groovy" },
		"/gruntfile\\.setTrayTitle(js|coffee)/i": { image: "gruntfile" },
		"gulpfile.js": { image: "gulp" },
		"/\\.setTrayTitle(hbs|handlebars|(mu)?stache)$/i": { image: "handlebars" },
		".prg": { image: "harbour" },
		".hbp": { image: "harbour" },
		".hbc": { image: "harbour" },
		".rc": { image: "harbour" },
		".fmg": { image: "harbour" },
		".hs": { image: "haskell" },
		".hsc": { image: "haskell" },
		".c2hs": { image: "haskell" },
		".lhs": { image: "haskell" },
		".hx": { image: "haxe" },
		".hxml": { image: "haxe" },
		"/^procfile/i": { image: "heroku" },
		"heroku.yml": { image: "heroku" },
		".hjson": { image: "hjson" },
		"/\\.x?html?$/i": { image: "html" },
		".http": { image: "http" },
		".rest": { image: "http" },
		".jar": { image: "java" },
		".java": { image: "java" },
		"jest.config.js": { image: "jest" },
		//    ".js": { "image": "js" },
		".es6": { image: "js" },
		".es": { image: "js" },
		".mjs": { image: "js" },
		".js.map": { image: "jsmap" },
		//    ".json": { "image": "json" },
		".jsonc": { image: "json" },
		".jsx": { image: "jsx" },
		"/\\.setTrayTitle(jil|jl)/i": { image: "julia" },
		".ipynb": { image: "jupyter" },
		".kt": { image: "kotlin" },
		".ktm": { image: "kotlin" },
		".kts": { image: "kotlin" },
		".less": { image: "less" },
		".lsp": { image: "lisp" },
		".lisp": { image: "lisp" },
		".l": { image: "lisp" },
		".nl": { image: "lisp" },
		".ny": { image: "lisp" },
		".podsl": { image: "lisp" },
		".sexp": { image: "lisp" },
		".ls": { image: "livescript" },
		".log": { image: "log" },
		".lua": { image: "lua" },
		".pd_lua": { image: "lua" },
		".rbxs": { image: "lua" },
		".wlua": { image: "lua" },
		"/^Makefile/": { image: "makefile" },
		"/^mk\\.config$/": { image: "makefile" },
		"/\\.setTrayTitle(mk|mak|make)$/i": { image: "makefile" },
		"/^BSDmakefile$/i": { image: "makefile" },
		"/^GNUmakefile$/i": { image: "makefile" },
		"/^makefile\\.sco$/i": { image: "makefile" },
		"/^Kbuild$/": { image: "makefile" },
		"/^makefile$/": { image: "makefile" },
		"/^mkfile$/i": { image: "makefile" },
		"/^\\.?qmake$/i": { image: "makefile" },
		"/\\.setTrayTitle(h|geo|topo)$/i": { image: "manifest" },
		".cson": { image: "manifest" },
		".json5": { image: "manifest" },
		".ndjson": { image: "manifest" },
		".fea": { image: "manifest" },
		".json.eex": { image: "manifest" },
		".proto": { image: "manifest" },
		".pytb": { image: "manifest" },
		".pydeps": { image: "manifest" },
		"/\\.pot?$/i": { image: "manifest" },
		".ejson": { image: "manifest" },
		".edn": { image: "manifest" },
		".eam.fs": { image: "manifest" },
		".qml": { image: "manifest" },
		".qbs": { image: "manifest" },
		".ston": { image: "manifest" },
		".ttl": { image: "manifest" },
		".rviz": { image: "manifest" },
		".syntax": { image: "manifest" },
		".webmanifest": { image: "manifest" },
		"/^pkginfo$/": { image: "manifest" },
		"/^mime\\.types$/i": { image: "manifest" },
		"/^METADATA\\.pb$/": { image: "manifest" },
		"/[\\/\\\\](?:magic[\\/\\\\]Magdir|file[\\/\\\\]magic)[\\/\\\\][-.\\w]+$/i":
			{
				image: "manifest",
			},
		"/(\\\\|\\/)dev[-\\w]+\\1(?:[^\\\\\\/]+\\1)*(?!DESC|NOTES)(?:[A-Z][-A-Z]*)(?:\\.in)?$/":
			{
				image: "manifest",
			},
		"lib/icons/.icondb.js": { image: "manifest" },
		"/\\.git[\\/\\\\](.*[\\/\\\\])?(HEAD|ORIG_HEAD|packed-refs|logs[\\/\\\\](.+[\\/\\\\])?[^\\/\\\\]+)$/":
			{
				image: "manifest",
			},
		"/\\.setTrayTitle(md|mdown|markdown|mkd|mkdown|mdwn|mkdn|rmd|ron|pmd)$/i": {
			image: "markdown",
		},
		".mdx": { image: "markdownx" },
		".marko": { image: "marko" },
		".nim": { image: "nim" },
		".nims": { image: "nim" },
		".nimble": { image: "nim" },
		".nix": { image: "nix" },
		"nodemon.json": { image: "nodemon" },
		".npmrc": { image: "npm" },
		"/\\.mm?$/i": { image: "objc" },
		".pch": { image: "objc" },
		".x": { image: "objc" },
		".ml": { image: "ocaml" },
		".mli": { image: "ocaml" },
		".eliom": { image: "ocaml" },
		".eliomi": { image: "ocaml" },
		".ml4": { image: "ocaml" },
		".mll": { image: "ocaml" },
		".mly": { image: "ocaml" },
		"/\\.pas(cal)?$/i": { image: "pascal" },
		".lpr": { image: "pascal" },
		".p": { image: "pawn" },
		".inc": { image: "pawn" },
		".sma": { image: "pawn" },
		".pwn": { image: "pawn" },
		".sp": { image: "pawn" },
		"/\\.p(er)?l$/i": { image: "perl" },
		".al": { image: "perl" },
		".ph": { image: "perl" },
		".plx": { image: "perl" },
		".pm": { image: "perl" },
		"/\\.setTrayTitle(psgi|xs)$/i": { image: "perl" },
		".pl6": { image: "perl" },
		"/\\.[tp]6$|\\.6pl$/i": { image: "perl" },
		"/\\.setTrayTitle(pm6|p6m)$/i": { image: "perl" },
		".6pm": { image: "perl" },
		".nqp": { image: "perl" },
		".p6l": { image: "perl" },
		".pod6": { image: "perl" },
		"/^Rexfile$/": { image: "perl" },
		"/\\.php([st\\d]|_cs)?$/i": { image: "php" },
		"/^Phakefile/": { image: "php" },
		".pony": { image: "ponylang" },
		".pcss": { image: "postcss" },
		".ps1": { image: "powershell" },
		".psd1": { image: "powershell" },
		".psm1": { image: "powershell" },
		".ps1xml": { image: "powershell" },
		".prettierignore": { image: "prettier" },
		"/\\.prettier((rc)|(\\.setTrayTitle(toml|yml|yaml|json|js))?$){2}/i": {
			image: "prettier",
		},
		"prettier.config.js": { image: "prettier" },
		"prisma.yml": { image: "prisma" },
		".pde": { image: "processing" },
		".jade": { image: "pug" },
		".pug": { image: "pug" },
		".purs": { image: "purescript" },
		".py": { image: "python" },
		".ipy": { image: "python" },
		".isolate": { image: "python" },
		".pep": { image: "python" },
		".gyp": { image: "python" },
		".gypi": { image: "python" },
		".pyde": { image: "python" },
		".pyp": { image: "python" },
		".pyt": { image: "python" },
		".py3": { image: "python" },
		".pyi": { image: "python" },
		".pyw": { image: "python" },
		".tac": { image: "python" },
		".wsgi": { image: "python" },
		".xpy": { image: "python" },
		".rpy": { image: "python" },
		"/\\.?(pypirc|pythonrc|python-venv)$/i": { image: "python" },
		"/^(SConstruct|SConscript)$/": { image: "python" },
		"/^(Snakefile|WATCHLISTS)$/": { image: "python" },
		"/^wscript$/": { image: "python" },
		"/\\.setTrayTitle(r|Rprofile|rsx|rd)$/i": { image: "r" },
		".re": { image: "reasonml" },
		"/\\.setTrayTitle(rb|ru|ruby|erb|gemspec|god|mspec|pluginspec|podspec|rabl|rake|opal)$/i":
			{
				image: "ruby",
			},
		"/^\\.?(irbrc|gemrc|pryrc|ruby-(gemset|version))$/i": { image: "ruby" },
		"/^(Appraisals|(Rake|[bB]uild|Cap|Danger|Deliver|Fast|Guard|Jar|Maven|Pod|Puppet|Snap)file(\\.lock)?)$/":
			{
				image: "ruby",
			},
		"/\\.setTrayTitle(jbuilder|rbuild|rb[wx]|builder)$/i": { image: "ruby" },
		"/^rails$/": { image: "ruby" },
		".watchr": { image: "ruby" },
		".rs": { image: "rust" },
		"/\\.setTrayTitle(sc|scala)$/i": { image: "scala" },
		".scss": { image: "scss" },
		".sass": { image: "scss" },
		"/\\.setTrayTitle(sh|rc|bats|bash|tool|install|command)$/i": {
			image: "shell",
		},
		"/^(\\.?bash(rc|[-_]?(profile|login|logout|history|prompt))|_osc|config|install-sh|PKGBUILD)$/i":
			{
				image: "shell",
			},
		"/\\.setTrayTitle(ksh|mksh|pdksh)$/i": { image: "shell" },
		".sh-session": { image: "shell" },
		"/\\.zsh(-theme|_history)?$|^\\.?(antigen|zpreztorc|zlogin|zlogout|zprofile|zshenv|zshrc)$/i":
			{
				image: "shell",
			},
		"/\\.fish$|^\\.fishrc$/i": { image: "shell" },
		"/^\\.?(login|profile)$/": { image: "shell" },
		".inputrc": { image: "shell" },
		".tmux": { image: "shell" },
		"/^(configure|config\\.setTrayTitle(guess|rpath|status|sub)|depcomp|libtool|compile)$/":
			{
				image: "shell",
			},
		"/^\\/(private\\/)?etc\\/([^\\/]+\\/)*(profile$|nanorc$|rc\\.|csh\\.)/i": {
			image: "shell",
		},
		"/^\\.?cshrc$/i": { image: "shell" },
		".profile": { image: "shell" },
		".tcsh": { image: "shell" },
		".csh": { image: "shell" },
		".sqf": { image: "sqf" },
		"/\\.setTrayTitle(my)?sql$/i": { image: "sql" },
		".ddl": { image: "sql" },
		".udf": { image: "sql" },
		".hql": { image: "sql" },
		".viw": { image: "sql" },
		".prc": { image: "sql" },
		".cql": { image: "sql" },
		".db2": { image: "sql" },
		"/\\.setTrayTitle(styl|stylus)$/i": { image: "stylus" },
		".svelte": { image: "svelte" },
		".svg": { image: "svg" },
		".swift": { image: "swift" },
		".tex": { image: "tex" },
		".ltx": { image: "tex" },
		".aux": { image: "tex" },
		".sty": { image: "tex" },
		".dtx": { image: "tex" },
		".cls": { image: "tex" },
		".ins": { image: "tex" },
		".lbx": { image: "tex" },
		".mkiv": { image: "tex" },
		".mkvi": { image: "tex" },
		".mkii": { image: "tex" },
		".texi": { image: "tex" },
		"/^hyphen(ex)?\\.setTrayTitle(cs|den|det|fr|sv|us)$/": { image: "tex" },
		"/\\.te?xt$/i": { image: "text" },
		".rtf": { image: "text" },
		"/\\.i?nfo$/i": { image: "text" },
		".msg": { image: "text" },
		"/\\.setTrayTitle(utxt|utf8)$/i": { image: "text" },
		".toml": { image: "toml" },
		".travis.yml": { image: "travis" },
		".ts": { image: "ts" },
		".tsx": { image: "tsx" },
		".twig": { image: "twig" },
		".v": { image: "v" },
		".vh": { image: "v" },
		".vala": { image: "vala" },
		".vapi": { image: "vala" },
		".vb": { image: "vb" },
		".vbs": { image: "vb" },
		".vbhtml": { image: "vb" },
		".vbproj": { image: "vb" },
		".vba": { image: "vba" },
		".vcxproj": { image: "vcxproj" },
		".vscodeignore": { image: "vscodeignore" },
		".vue": { image: "vue" },
		".wat": { image: "wasm" },
		".wast": { image: "wasm" },
		".wasm": { image: "wasm" },
		"/webpack(\\.dev|\\.development|\\.prod|\\.production)?\\.config(\\.babel)?\\.setTrayTitle(js|jsx|coffee|ts|json|json5|yaml|yml)/i":
			{
				image: "webpack",
			},
		".xml": { image: "xml" },
		"/\\.ya?ml$/i": { image: "yaml" },
		"/^yarn(\\.lock)?$/i": { image: "yarn" },
		".yarnrc": { image: "yarn" },
		".zig": { image: "zig" },

		".json": { image: "json" },
		".js": { image: "js" },
		".css": { image: "css" },
	},
	assets = {
		pylon:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/0.png",
		ahk: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/1.png",
		angular:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/2.png",
		applescript:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/3.png",
		android:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/4.png",
		appveyor:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/5.png",
		arduino:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/6.png",
		as: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/7.png",
		autoit:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/8.png",
		asp: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/9.png",
		assembly:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/10.png",
		bat: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/11.png",
		bower:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/12.png",
		cmake:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/13.png",
		clojure:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/14.png",
		circleci:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/15.png",
		c: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/16.png",
		cargo:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/17.png",
		env: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/18.png",
		flowconfig:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/19.png",
		cssmap:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/20.png",
		cshtml:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/21.png",
		firebase:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/22.png",
		crystal:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/23.png",
		eslint:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/24.png",
		git: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/25.png",
		elm: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/26.png",
		d: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/27.png",
		denizen:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/28.png",
		dart: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/29.png",
		csharp:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/30.png",
		elixir:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/31.png",
		css: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/32.png",
		dm: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/33.png",
		docker:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/34.png",
		haskell:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/35.png",
		ejs: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/36.png",
		cuda: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/37.png",
		fsharp:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/38.png",
		gemfile:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/39.png",
		gradle:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/40.png",
		go: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/41.png",
		coffee:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/42.png",
		brainfuck:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/43.png",
		erlang:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/44.png",
		gatsbyjs:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/45.png",
		graphql:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/46.png",
		cpp: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/47.png",
		godot:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/48.png",
		log: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/49.png",
		livescript:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/50.png",
		heroku:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/51.png",
		handlebars:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/52.png",
		npm: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/53.png",
		jsmap:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/54.png",
		hjson:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/55.png",
		html: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/56.png",
		markdown:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/57.png",
		manifest:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/58.png",
		markdownx:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/59.png",
		json: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/60.png",
		gruntfile:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/61.png",
		toml: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/62.png",
		harbour:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/63.png",
		js: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/64.png",
		gulp: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/65.png",
		makefile:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/66.png",
		reasonml:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/67.png",
		shell:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/68.png",
		nim: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/69.png",
		julia:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/70.png",
		editorconfig:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/71.png",
		text: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/72.png",
		jest: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/73.png",
		ts: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/74.png",
		xml: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/75.png",
		haxe: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/76.png",
		yaml: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/77.png",
		tex: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/78.png",
		wasm: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/79.png",
		prisma:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/80.png",
		vcxproj:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/81.png",
		kotlin:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/82.png",
		nodemon:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/83.png",
		r: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/84.png",
		ocaml:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/85.png",
		powershell:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/86.png",
		svg: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/87.png",
		delphi:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/88.png",
		python:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/89.png",
		sql: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/90.png",
		http: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/91.png",
		v: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/92.png",
		yarn: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/93.png",
		txt: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/94.png",
		zig: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/95.png",
		groovy:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/96.png",
		marko:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/97.png",
		prettier:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/98.png",
		php: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/99.png",
		twig: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/100.png",
		swift:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/101.png",
		lua: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/102.png",
		purescript:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/103.png",
		vue: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/104.png",
		java: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/105.png",
		less: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/106.png",
		jsx: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/107.png",
		jupyter:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/108.png",
		lisp: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/109.png",
		perl: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/110.png",
		objc: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/111.png",
		pascal:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/112.png",
		pawn: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/113.png",
		postcss:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/114.png",
		pug: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/115.png",
		vba: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/116.png",
		vscodeignore:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/117.png",
		tsx: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/118.png",
		vb: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/119.png",
		sqf: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/120.png",
		svelte:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/121.png",
		ruby: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/122.png",
		scala:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/123.png",
		stylus:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/124.png",
		webpack:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/125.png",
		vala: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/126.png",
		travis:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/127.png",
		rust: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/128.png",
		scss: "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/129.png",
		ponylang:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/130.png",
		processing:
			"https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/131.png",
	};

const enum Assets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/logo.png",
	Idle = "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/132.png",
	PylonD = "https://cdn.rcd.gg/PreMiD/websites/P/Pylon/assets/133.png",
}

let lastFileChange: number = null,
	lastElement: Element = null;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		docsSelector =
			".current.tsd-kind-namespace > a, .current.tsd-parent-kind-namespace > a";

	if (document.location.pathname.startsWith("/docs/changelog"))
		presenceData.details = "Viewing the changelog";
	else if (document.location.pathname.startsWith("/docs/reference")) {
		presenceData.details = "Viewing the SDK reference";
		if (
			document.querySelector(docsSelector) &&
			(await presence.getSetting<boolean>("docname"))
		) {
			presenceData.state = Array.from(document.querySelectorAll(docsSelector))
				.map(el => el.textContent)
				.join(" - ");
		}
	} else if (document.location.pathname.startsWith("/docs/"))
		presenceData.details = "Looking at the docs";
	else if (document.location.pathname.startsWith("/studio")) {
		presenceData.details = "Studio";
		if (document.location.pathname.endsWith("editor")) {
			presenceData.smallImageKey = Assets.PylonD;
			presenceData.smallImageText = "Pylon Studio Editor";
			const guildName = document.querySelector(
					"#root > div.PageStudioGuildEdit_studioContainer__2vaAW > div > div.PylonEditor_editorContainerOuter__3o4x4 > div.PylonEditor_editorContainerGridVertical__10qLF > div > div:nth-child(1) > div > div.SideBar_header__2dvwm > h3"
				).textContent,
				currentFile = document.querySelector(".TabBar_tabSelected__foMO4");
			if (currentFile) {
				const largeImageKey =
					knownExtensions[
						Object.keys(knownExtensions).find(key => {
							if (currentFile.textContent.endsWith(key)) return true;
							const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
							if (!match) return false;
							return new RegExp(match[1], match[2]).test(
								currentFile.textContent
							);
						})
					];

				if (lastElement !== currentFile) {
					lastElement = currentFile;
					lastFileChange = Date.now();
				}

				presenceData.startTimestamp = lastFileChange;
				presenceData.largeImageKey =
					assets[
						(largeImageKey ? largeImageKey.image : "txt") as keyof typeof assets
					];
				presenceData.details = (await presence.getSetting<string>("details"))
					.replaceAll("%file%", currentFile.textContent)
					.replaceAll("%guild%", guildName)
					.replaceAll(
						"%ext%",
						(largeImageKey ? largeImageKey.image : "txt").toUpperCase()
					);
				presenceData.state = (await presence.getSetting<string>("state"))
					.replaceAll("%file%", currentFile.textContent)
					.replaceAll("%guild%", guildName)
					.replaceAll(
						"%ext%",
						(largeImageKey ? largeImageKey.image : "txt").toUpperCase()
					);
			} else {
				presenceData.largeImageKey = Assets.Idle;
				presenceData.details = "Idling";
			}
		} else if (document.location.pathname.startsWith("/studio/guilds/")) {
			presenceData.details += ": Viewing Server";
			if (await presence.getSetting<boolean>("studioguildname")) {
				presenceData.state = document.querySelector(
					"#root > div:nth-child(4) > div.📦h_130px.📦box-szg_border-box > div.📦flt_left.📦w_340px.📦box-szg_border-box > div > div.📦flt_left.📦pl_0px.📦w_100prcnt.📦box-szg_border-box > div.📦flt_left.📦w_60prcnt.📦box-szg_border-box > div.PageStudioGuild_guildName__tgbvT"
				).textContent;
			}
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
