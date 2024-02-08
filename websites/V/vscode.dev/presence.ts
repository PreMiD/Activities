const presence = new Presence({
		clientId: "996589941926670366",
	}),
	startTimestamp = Math.floor(Date.now() / 1000);

interface Stauts {
	file: string;
	workspace: string;
	editor: {
		lang: string;
	};
}

const enum Assets {
	Logo =
	"https://cdn.rcd.gg/PreMiD/websites/V/vscode.dev/assets/logo.png",
  Ahk = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563108020334.png?size=512",
  Android = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563124809799.png?size=512",
  Astro = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563221266462.png?size=512",
  Arduino = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563233853562.png?size=512",
  Autoit = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563246428210.png?size=512",
  Brainfuck = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563284181022.png?size=512",
  Applescript = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563300958220.png?size=512",
  Appveyor = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563313532928.png?size=512",
  Asp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563330318408.png?size=512",
  Assembly = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563338702900.png?size=512",
  Angular = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563347087411.png?size=512",
  Ansible = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563560996874.png?size=512",
  Babel = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563573583932.png?size=512",
  Bower = "https://cdn.discordapp.com/app-assets/996589941926670366/999546563732979753.png?size=512",
  Bat = "https://cdn.discordapp.com/app-assets/996589941926670366/999546564404064338.png?size=512",
  Coffee = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590572331028.png?size=512",
  Crystal = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590635237386.png?size=512",
  Cpp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590681378918.png?size=512",
  Css = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590685569074.png?size=512",
  D = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590689767516.png?size=512",
  Codeclimate = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590706532393.png?size=512",
  Clojure = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590710743050.png?size=512",
  Cmake = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590714941522.png?size=512",
  Csharp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590769463348.png?size=512",
  Circleci = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590840762398.png?size=512",
  Cssmap = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590849155123.png?size=512",
  Dart = "https://cdn.discordapp.com/app-assets/996589941926670366/999546590891102238.png?size=512",
  C = "https://cdn.discordapp.com/app-assets/996589941926670366/999546591063060491.png?size=512",
  Cargo = "https://cdn.discordapp.com/app-assets/996589941926670366/999546591482494996.png?size=512",
  Cuda = "https://cdn.discordapp.com/app-assets/996589941926670366/999546591532818542.png?size=512",
  Editorconfig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611564814336.png?size=512",
  Erlang = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611640320092.png?size=512",
  Elixir = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611678060565.png?size=512",
  Firebase = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611682259054.png?size=512",
  Elm = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611686457394.png?size=512",
  Denizen = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611694837760.png?size=512",
  Debugging = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611715817482.png?size=512",
  Flowconfig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611740987403.png?size=512",
  Docker = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611795509339.png?size=512",
  Fsharp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611891982406.png?size=512",
  Eslint = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611900350635.png?size=512",
  Env = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611904565388.png?size=512",
  Ejs = "https://cdn.discordapp.com/app-assets/996589941926670366/999546611917131806.png?size=512",
  Gatsbyjs = "https://cdn.discordapp.com/app-assets/996589941926670366/999546612059754576.png?size=512",
  Delphi = "https://cdn.discordapp.com/app-assets/996589941926670366/999546612068139009.png?size=512",
  Hjson = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633069023293.png?size=512",
  Groovy = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633308086282.png?size=512",
  Gemfile = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633320677496.png?size=512",
  Haxe = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633329049681.png?size=512",
  Handlebars = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633350021181.png?size=512",
  Gulp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633383583744.png?size=512",
  Graphql = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633412939847.png?size=512",
  Godot = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633446506496.png?size=512",
  Go = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633517805648.png?size=512",
  Html = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633517813790.png?size=512",
  Gradle = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633547173918.png?size=512",
  Haskell = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633639448656.png?size=512",
  Git = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633735897158.png?size=512",
  Heroku = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633773658223.png?size=512",
  Harbour = "https://cdn.discordapp.com/app-assets/996589941926670366/999546633874329600.png?size=512",
  Jupyter = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652572520469.png?size=512",
  Idle = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652710936630.png?size=512",
  Json = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652736106517.png?size=512",
  Julia = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652807417857.png?size=512",
  IdleVscodeInsiders = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652857737246.png?size=512",
  Js = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652874522716.png?size=512",
  Jest = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652945817650.png?size=512",
  Jsx = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652975173693.png?size=512",
  Laravel = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652991955046.png?size=512",
  Java = "https://cdn.discordapp.com/app-assets/996589941926670366/999546652996141076.png?size=512",
  Jsmap = "https://cdn.discordapp.com/app-assets/996589941926670366/999546653092626462.png?size=512",
  IdleVscode = "https://cdn.discordapp.com/app-assets/996589941926670366/999546653096816660.png?size=512",
  Kotlin = "https://cdn.discordapp.com/app-assets/996589941926670366/999546653201670144.png?size=512",
  Http = "https://cdn.discordapp.com/app-assets/996589941926670366/999546653331701850.png?size=512",
  Jar = "https://cdn.discordapp.com/app-assets/996589941926670366/999546653478494278.png?size=512",
  Log = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673103646740.png?size=512",
  Livescript = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673124626432.png?size=512",
  Lisp = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673132994670.png?size=512",
  Lua = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673137205280.png?size=512",
  Npm = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673250455672.png?size=512",
  Manifest = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673258827796.png?size=512",
  Metal = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673296584745.png?size=512",
  Nim = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673309167638.png?size=512",
  Marko = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673351106590.png?size=512",
  Makefile = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673372074004.png?size=512",
  Nix = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673447575552.png?size=512",
  Objc = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673510502440.png?size=512",
  Nodemon = "https://cdn.discordapp.com/app-assets/996589941926670366/999546673766338641.png?size=512",
  Markdown = "https://cdn.discordapp.com/app-assets/996589941926670366/999546674462593054.png?size=512",
  Markdownx = "https://cdn.discordapp.com/app-assets/996589941926670366/999546674550681670.png?size=512",
  Postcss = "https://cdn.discordapp.com/app-assets/996589941926670366/999546803915595847.png?size=512",
  Pascal = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804100141167.png?size=512",
  Pawn = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804158857226.png?size=512",
  Powershell = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804167245934.png?size=512",
  Python = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804179849316.png?size=512",
  Purescript = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804272111637.png?size=512",
  Processing = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804335034368.png?size=512",
  Php = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804339228702.png?size=512",
  Odin = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804368584734.png?size=512",
  Perl = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804385366046.png?size=512",
  Prettier = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804406341652.png?size=512",
  Prisma = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804456665168.png?size=512",
  Ocaml = "https://cdn.discordapp.com/app-assets/996589941926670366/999546804536356914.png?size=512",
  Ponylang = "https://cdn.discordapp.com/app-assets/996589941926670366/999546805060649031.png?size=512",
  Pug = "https://cdn.discordapp.com/app-assets/996589941926670366/999546805761101865.png?size=512",
  Ruby = "https://cdn.discordapp.com/app-assets/996589941926670366/999546838954807368.png?size=512",
  Sql = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839156142090.png?size=512",
  Sqf = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839177101352.png?size=512",
  R = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839185510411.png?size=512",
  Svelte = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839223242812.png?size=512",
  Scss = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839244226580.png?size=512",
  Terraform = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839256801330.png?size=512",
  Scala = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839260999740.png?size=512",
  Sourcepawn = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839294558258.png?size=512",
  Tex = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839328096347.png?size=512",
  Shell = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839365845022.png?size=512",
  Stylus = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839420370974.png?size=512",
  Swift = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839424585748.png?size=512",
  Rust = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839567175761.png?size=512",
  Svg = "https://cdn.discordapp.com/app-assets/996589941926670366/999546839848189972.png?size=512",
  Tsmap = "https://cdn.discordapp.com/app-assets/996589941926670366/999546867614494722.png?size=512",
  Vala = "https://cdn.discordapp.com/app-assets/996589941926670366/999546867740332084.png?size=512",
  Vscode = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868021346304.png?size=512",
  V = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868067467284.png?size=512",
  Ts = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868109422723.png?size=512",
  Toml = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868113625168.png?size=512",
  Text = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868172337243.png?size=512",
  TypescriptDef = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868172345386.png?size=512",
  Vitestconfig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868184920094.png?size=512",
  Twig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868210077736.png?size=512",
  Viteconfig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868235251744.png?size=512",
  Vb = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868256211044.png?size=512",
  Tsx = "https://cdn.discordapp.com/app-assets/996589941926670366/999546868591771658.png?size=512",
  Turbo = "https://cdn.discordapp.com/app-assets/996589941926670366/999546869531279453.png?size=512",
  Travis = "https://cdn.discordapp.com/app-assets/996589941926670366/999546869610971136.png?size=512",
  VscodeInsiders = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886367232002.png?size=512",
  Yaml = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886434324480.png?size=512",
  Xml = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886488862740.png?size=512",
  Wasm = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886522413176.png?size=512",
  Vueconfig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886551773214.png?size=512",
  Vue = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886572752968.png?size=512",
  Yarn = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886623076382.png?size=512",
  Webpack = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886685986897.png?size=512",
  Vscodeignore = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886765682708.png?size=512",
  Zig = "https://cdn.discordapp.com/app-assets/996589941926670366/999546886778269796.png?size=512",
}

// https://github.com/iCrawl/discord-vscode/blob/master/src/data/languages.json @iCrawl
// https://github.com/leonardssh/vscord/tree/main/assets/icons @leonardssh
const KNOWN_LANGUAGES: { language: string; image: string }[] = [
		{ language: "abap", image: Assets.Text },
		{ language: "ansible", image: Assets.Ansible },
		{ language: "bat", image: Assets.Bat },
		{ language: "bibtex", image: Assets.Text },
		{ language: "clojure", image: Assets.Clojure },
		{ language: "coffeescript", image: Assets.Coffee },
		{ language: "c", image: Assets.C },
		{ language: "cpp", image: Assets.Cpp },
		{ language: "csharp", image: Assets.Csharp },
		{ language: "css", image: Assets.Css },
		{ language: "diff", image: Assets.Manifest },
		{ language: "dockerfile", image: Assets.Docker },
		{ language: "fsharp", image: Assets.Fsharp },
		{ language: "git-commit", image: Assets.Manifest },
		{ language: "git-rebase", image: Assets.Manifest },
		{ language: "go", image: Assets.Go },
		{ language: "groovy", image: Assets.Groovy },
		{ language: "handlebars", image: Assets.Handlebars },
		{ language: "haml", image: Assets.Text },
		{ language: "html", image: Assets.Html },
		{ language: "ini", image: Assets.Manifest },
		{ language: "java", image: Assets.Java },
		{ language: "javascript", image: Assets.Js },
		{ language: "javascriptreact", image: Assets.Jsx },
		{ language: "jsx", image: Assets.Jsx },
		{ language: "json", image: Assets.Json },
		{ language: "jsonc", image: Assets.Json },
		{ language: "jupyter", image: Assets.Jupyter },
		{ language: "latex", image: Assets.Text },
		{ language: "less", image: Assets.Text },
		{ language: "lua", image: Assets.Lua },
		{ language: "makefile", image: Assets.Makefile },
		{ language: "markdown", image: Assets.Markdown },
		{ language: "objective-c", image: Assets.Objc },
		{ language: "objective-cpp", image: Assets.Objc },
		{ language: "odin", image: Assets.Odin },
		{ language: "perl", image: Assets.Perl },
		{ language: "perl6", image: Assets.Perl },
		{ language: "php", image: Assets.Php },
		{ language: "plaintext", image: Assets.Text },
		{ language: "powershell", image: Assets.Powershell },
		{ language: "jade", image: Assets.Pug },
		{ language: "pug", image: Assets.Pug },
		{ language: "prisma", image: Assets.Prisma },
		{ language: "python", image: Assets.Python },
		{ language: "r", image: Assets.R },
		{ language: "razor", image: Assets.Html },
		{ language: "ruby", image: Assets.Ruby },
		{ language: "rust", image: Assets.Rust },
		{ language: "scss", image: Assets.Scss },
		{ language: "sass", image: Assets.Scss },
		{ language: "shaderlab", image: Assets.Manifest },
		{ language: "shellscript", image: Assets.Shell },
		{ language: "slim", image: Assets.Text },
		{ language: "sql", image: Assets.Sql },
		{ language: "stylus", image: Assets.Stylus },
		{ language: "swift", image: Assets.Swift },
		{ language: "typescript", image: Assets.Ts },
		{ language: "typescriptreact", image: Assets.Tsx },
		{ language: "tex", image: Assets.Tex },
		{ language: "vb", image: Assets.Vb },
		{ language: "vue", image: Assets.Vue },
		{ language: "vue-html", image: Assets.Vue },
		{ language: "xml", image: Assets.Xml },
		{ language: "xsl", image: Assets.Xml },
		{ language: "yaml", image: Assets.Yaml },
	],
	KNOWN_EXTENSIONS: { [key: string]: { image: string } } = {
		"nodemon.json": { image: Assets.Nodemon },
		"package.json": { image: Assets.Npm },
		"turbo.json": { image: Assets.Turbo },
		"/\\.prettier((rc)|(\\.(toml|yml|yaml|json|js))?$){2}/i": {
			image: Assets.Prettier,
		},
		"/\\.eslint((rc|ignore)|(\\.(json|js))?$){2}/i": { image: Assets.Eslint },
		"/\\prettier.config.js/i": { image: Assets.Prettier },
		"/vue.config\\.(js|ts)/i": { image: Assets.Vueconfig },
		"/vite.config\\.(js|ts)/i": { image: Assets.Viteconfig },
		"/vitest.config\\.(js|ts|mjs)/i": { image: Assets.Vitestconfig },
		"/jest.config\\.(js|ts)/i": { image: Assets.Jest },
		"/gatsby-(browser|node|ssr|config)\\.js/i": { image: Assets.Gatsbyjs },
		"/webpack(\\.dev|\\.development|\\.prod|\\.production)?\\.config(\\.babel)?\\.(js|jsx|coffee|ts|json|json5|yaml|yml)/i":
			{
				image: Assets.Webpack,
			},
		"babel.config.js": { image: Assets.Babel },
		".ahk": { image: Assets.Ahk },
		".ahkl": { image: Assets.Ahk },
		".astro": { image: Assets.Astro },
		"androidmanifest.xml": { image: Assets.Android },
		"/^angular[^.]*\\.js$/i": { image: Assets.Angular },
		".applescript": { image: Assets.Applescript },
		"/(\\.)?appveyor\\.yml/i": { image: Assets.Appveyor },
		".ino": { image: Assets.Arduino },
		".swf": { image: Assets.Text },
		".as": { image: Assets.Text },
		".jsfl": { image: Assets.Text },
		".swc": { image: Assets.Text },
		".asp": { image: Assets.Asp },
		".asax": { image: Assets.Asp },
		".ascx": { image: Assets.Asp },
		".ashx": { image: Assets.Asp },
		".asmx": { image: Assets.Asp },
		".aspx": { image: Assets.Asp },
		".axd": { image: Assets.Asp },
		"/\\.(l?a|[ls]?o|out|s|a51|asm|axf|elf|prx|puff|z80)$/i": {
			image: Assets.Assembly,
		},
		".agc": { image: Assets.Assembly },
		".ko": { image: Assets.Assembly },
		".lst": { image: Assets.Assembly },
		"/\\.((c([+px]{2}?)?-?)?objdump|bsdiff|bin|dat|pak|pdb)$/i": {
			image: Assets.Assembly,
		},
		".d-objdump": { image: Assets.Assembly },
		"/\\.gcode|\\.gco/i": { image: Assets.Assembly },
		"/\\.rpy[bc]$/i": { image: Assets.Assembly },
		"/\\.py[co]$/i": { image: Assets.Assembly },
		".swp": { image: Assets.Assembly },
		".DS_Store": { image: Assets.Assembly },
		".au3": { image: Assets.Autoit },
		"/\\.babelrc/i": { image: Assets.Babel },
		".bat": { image: Assets.Bat },
		".batch": { image: Assets.Bat },
		".cmd": { image: Assets.Bat },
		"/\\.(exe|com|msi)$/i": { image: Assets.Bat },
		".reg": { image: Assets.Bat },
		"/^(\\.bowerrc|bower\\.json|Bowerfile)$/i": { image: Assets.Bower },
		"/\\.bf?$/i": { image: Assets.Brainfuck },
		"/\\.c$/i": { image: Assets.C },
		"/(cargo.toml|cargo.lock)/i": { image: Assets.Cargo },
		".casc": { image: Assets.Text },
		".cas": { image: Assets.Text },
		".cfc": { image: Assets.Text },
		".cfm": { image: Assets.Text },
		"circle.yml": { image: Assets.Circleci },
		".clj": { image: Assets.Clojure },
		".cl2": { image: Assets.Clojure },
		".cljc": { image: Assets.Clojure },
		".cljx": { image: Assets.Clojure },
		".hic": { image: Assets.Clojure },
		"/\\.cljs(cm)?$/i": { image: Assets.Clojure },
		".cmake": { image: Assets.Cmake },
		"/^CMakeLists\\.txt$/": { image: Assets.Cmake },
		"/\\.codeclimate\\.(yml|json)/i": { image: Assets.Codeclimate },
		".coffee": { image: Assets.Coffee },
		".cjsx": { image: Assets.Coffee },
		".coffee.ecr": { image: Assets.Coffee },
		".coffee.erb": { image: Assets.Coffee },
		".litcoffee": { image: Assets.Coffee },
		".iced": { image: Assets.Coffee },
		"/\\.c[+px]{2}$|\\.cc$/i": { image: Assets.Cpp },
		"/\\.h[+px]{2}$/i": { image: Assets.Cpp },
		"/\\.[it]pp$/i": { image: Assets.Cpp },
		"/\\.(tcc|inl)$/i": { image: Assets.Cpp },
		".cats": { image: Assets.Cpp },
		".idc": { image: Assets.Cpp },
		".w": { image: Assets.Cpp },
		".nc": { image: Assets.Cpp },
		".upc": { image: Assets.Cpp },
		".xpm": { image: Assets.Cpp },
		"/\\.e?cr$/i": { image: Assets.Crystal },
		".cs": { image: Assets.Csharp },
		".csx": { image: Assets.Csharp },
		".cshtml": { image: Assets.Html },
		".css": { image: Assets.Css },
		".css.map": { image: Assets.Cssmap },
		".cu": { image: Assets.Cuda },
		"/\\.di?$/i": { image: Assets.D },
		".dart": { image: Assets.Dart },
		".dfm": { image: Assets.Delphi },
		".dpr": { image: Assets.Delphi },
		".dsc": { image: Assets.Denizen },
		".dm": { image: Assets.Text },
		".dme": { image: Assets.Text },
		".dmm": { image: Assets.Text },
		"/^(Dockerfile|docker-compose)|\\.docker(file|ignore)$/i": {
			image: Assets.Docker,
		},
		"/^docker-sync\\.yml$/i": { image: Assets.Docker },
		".editorconfig": { image: Assets.Editorconfig },
		".ejs": { image: Assets.Ejs },
		".ex": { image: Assets.Elixir },
		"/\\.(exs|l?eex)$/i": { image: Assets.Elixir },
		"/^mix\\.(exs?|lock)$/i": { image: Assets.Elixir },
		".elm": { image: Assets.Elm },
		".env": { image: Assets.Env },
		".erl": { image: Assets.Erlang },
		".beam": { image: Assets.Erlang },
		".hrl": { image: Assets.Erlang },
		".xrl": { image: Assets.Erlang },
		".yrl": { image: Assets.Erlang },
		".app.src": { image: Assets.Erlang },
		"/^Emakefile$/": { image: Assets.Erlang },
		"/^rebar(\\.config)?\\.lock$/i": { image: Assets.Erlang },
		"/(\\.firebaserc|firebase\\.json)/i": { image: Assets.Firebase },
		".flowconfig": { image: Assets.Flowconfig },
		".fs": { image: Assets.Fsharp },
		".fsi": { image: Assets.Fsharp },
		".fsscript": { image: Assets.Fsharp },
		".fsx": { image: Assets.Fsharp },
		"/^Gemfile(\\.lock)?$/i": { image: Assets.Gemfile },
		"/^\\.git|^\\.keep$|\\.mailmap$/i": { image: Assets.Git },
		".go": { image: Assets.Go },
		".gd": { image: Assets.Godot },
		".gradle": { image: Assets.Gradle },
		gradlew: { image: Assets.Gradle },
		".gql": { image: Assets.Graphql },
		".graphql": { image: Assets.Graphql },
		".groovy": { image: Assets.Groovy },
		".gvy": { image: Assets.Groovy },
		".gy": { image: Assets.Groovy },
		".gsh": { image: Assets.Groovy },
		"/gruntfile\\.(js|coffee)/i": { image: Assets.Text },
		"gulpfile.js": { image: Assets.Gulp },
		"/\\.(hbs|handlebars|(mu)?stache)$/i": { image: Assets.Handlebars },
		".prg": { image: Assets.Harbour },
		".hbp": { image: Assets.Harbour },
		".hbc": { image: Assets.Harbour },
		".rc": { image: Assets.Harbour },
		".fmg": { image: Assets.Harbour },
		".hs": { image: Assets.Haskell },
		".hsc": { image: Assets.Haskell },
		".c2hs": { image: Assets.Haskell },
		".lhs": { image: Assets.Haskell },
		".hx": { image: Assets.Haxe },
		".hxml": { image: Assets.Haxe },
		"/^procfile/i": { image: Assets.Heroku },
		"heroku.yml": { image: Assets.Heroku },
		".hjson": { image: Assets.Hjson },
		"/\\.x?html?$/i": { image: Assets.Html },
		".http": { image: Assets.Http },
		".rest": { image: Assets.Http },
		".jar": { image: Assets.Jar },
		".java": { image: Assets.Java },
		".j2": { image: Assets.Text },
		".jinja": { image: Assets.Text },
		".js": { image: Assets.Js },
		".es6": { image: Assets.Js },
		".es": { image: Assets.Js },
		".mjs": { image: Assets.Js },
		".js.map": { image: Assets.Jsmap },
		".json": { image: Assets.Json },
		".jsonc": { image: Assets.Json },
		".jsx": { image: Assets.Jsx },
		"/\\.(jil|jl)/i": { image: Assets.Julia },
		".ipynb": { image: Assets.Jupyter },
		".kt": { image: Assets.Kotlin },
		".ktm": { image: Assets.Kotlin },
		".kts": { image: Assets.Kotlin },
		".less": { image: Assets.Text },
		".lsp": { image: Assets.Lisp },
		".lisp": { image: Assets.Lisp },
		".l": { image: Assets.Lisp },
		".nl": { image: Assets.Lisp },
		".ny": { image: Assets.Lisp },
		".podsl": { image: Assets.Lisp },
		".sexp": { image: Assets.Lisp },
		".ss": { image: Assets.Lisp },
		".scm": { image: Assets.Lisp },
		".ls": { image: Assets.Livescript },
		".log": { image: Assets.Log },
		".lua": { image: Assets.Lua },
		".pd_lua": { image: Assets.Lua },
		".rbxs": { image: Assets.Lua },
		".wlua": { image: Assets.Lua },
		"/^Makefile/": { image: Assets.Makefile },
		"/^mk\\.config$/": { image: Assets.Makefile },
		"/\\.(mk|mak|make)$/i": { image: Assets.Makefile },
		"/^BSDmakefile$/i": { image: Assets.Makefile },
		"/^GNUmakefile$/i": { image: Assets.Makefile },
		"/^makefile\\.sco$/i": { image: Assets.Makefile },
		"/^Kbuild$/": { image: Assets.Makefile },
		"/^makefile$/": { image: Assets.Makefile },
		"/^mkfile$/i": { image: Assets.Makefile },
		"/^\\.?qmake$/i": { image: Assets.Makefile },
		"/\\.(h|geo|topo)$/i": { image: Assets.Manifest },
		".cson": { image: Assets.Manifest },
		".json5": { image: Assets.Manifest },
		".ndjson": { image: Assets.Manifest },
		".fea": { image: Assets.Manifest },
		".json.eex": { image: Assets.Manifest },
		".proto": { image: Assets.Manifest },
		".pytb": { image: Assets.Manifest },
		".pydeps": { image: Assets.Manifest },
		"/\\.pot?$/i": { image: Assets.Manifest },
		".ejson": { image: Assets.Manifest },
		".edn": { image: Assets.Manifest },
		".eam.fs": { image: Assets.Manifest },
		".qml": { image: Assets.Manifest },
		".qbs": { image: Assets.Manifest },
		".ston": { image: Assets.Manifest },
		".ttl": { image: Assets.Manifest },
		".rviz": { image: Assets.Manifest },
		".syntax": { image: Assets.Manifest },
		".webmanifest": { image: Assets.Manifest },
		"/^pkginfo$/": { image: Assets.Manifest },
		"/^mime\\.types$/i": { image: Assets.Manifest },
		"/^METADATA\\.pb$/": { image: Assets.Manifest },
		"/[\\/\\\\](?:magic[\\/\\\\]Magdir|file[\\/\\\\]magic)[\\/\\\\][-.\\w]+$/i":
			{
				image: Assets.Manifest,
			},
		"/(\\\\|\\/)dev[-\\w]+\\1(?:[^\\\\\\/]+\\1)*(?!DESC|NOTES)(?:[A-Z][-A-Z]*)(?:\\.in)?$/":
			{
				image: Assets.Manifest,
			},
		"lib/icons/.icondb.js": { image: Assets.Manifest },
		"/\\.git[\\/\\\\](.*[\\/\\\\])?(HEAD|ORIG_HEAD|packed-refs|logs[\\/\\\\](.+[\\/\\\\])?[^\\/\\\\]+)$/":
			{
				image: Assets.Manifest,
			},
		"/\\.(md|mdown|markdown|mkd|mkdown|mdwn|mkdn|rmd|ron|pmd)$/i": {
			image: Assets.Markdown,
		},
		".mdx": { image: Assets.Markdownx },
		".marko": { image: Assets.Marko },
		".nim": { image: Assets.Nim },
		".nims": { image: Assets.Nim },
		".nimble": { image: Assets.Nim },
		".nix": { image: Assets.Nix },
		".npmrc": { image: Assets.Npm },
		".npmignore": { image: Assets.Npm },
		"/\\.mm?$/i": { image: Assets.Objc },
		".pch": { image: Assets.Objc },
		".x": { image: Assets.Objc },
		".ml": { image: Assets.Ocaml },
		".mli": { image: Assets.Ocaml },
		".eliom": { image: Assets.Ocaml },
		".eliomi": { image: Assets.Ocaml },
		".ml4": { image: Assets.Ocaml },
		".mll": { image: Assets.Ocaml },
		".mly": { image: Assets.Ocaml },
		".mt": { image: Assets.Metal },
		".odin": { image: Assets.Odin },
		"/\\.pas(cal)?$/i": { image: Assets.Pascal },
		".lpr": { image: Assets.Pascal },
		".p": { image: Assets.Pawn },
		".inc": { image: Assets.Pawn },
		".sma": { image: Assets.Pawn },
		".pwn": { image: Assets.Pawn },
		".sp": { image: Assets.Sourcepawn },
		"/\\.p(er)?l$/i": { image: Assets.Perl },
		".al": { image: Assets.Perl },
		".ph": { image: Assets.Perl },
		".plx": { image: Assets.Perl },
		".pm": { image: Assets.Perl },
		"/\\.(psgi|xs)$/i": { image: Assets.Perl },
		".pl6": { image: Assets.Perl },
		"/\\.[tp]6$|\\.6pl$/i": { image: Assets.Perl },
		"/\\.(pm6|p6m)$/i": { image: Assets.Perl },
		".6pm": { image: Assets.Perl },
		".nqp": { image: Assets.Perl },
		".p6l": { image: Assets.Perl },
		".pod6": { image: Assets.Perl },
		"/^Rexfile$/": { image: Assets.Perl },
		"/\\.php([st\\d]|_cs)?$/i": { image: Assets.Php },
		"/^Phakefile/": { image: Assets.Php },
		".pony": { image: Assets.Ponylang },
		".pcss": { image: Assets.Postcss },
		".ps1": { image: Assets.Powershell },
		".psd1": { image: Assets.Powershell },
		".psm1": { image: Assets.Powershell },
		".ps1xml": { image: Assets.Powershell },
		".prettierignore": { image: Assets.Prettier },
		"prisma.yml": { image: Assets.Prisma },
		".pde": { image: Assets.Processing },
		".jade": { image: Assets.Pug },
		".pug": { image: Assets.Pug },
		".purs": { image: Assets.Purescript },
		".py": { image: Assets.Python },
		".ipy": { image: Assets.Python },
		".isolate": { image: Assets.Python },
		".pep": { image: Assets.Python },
		".gyp": { image: Assets.Python },
		".gypi": { image: Assets.Python },
		".pyde": { image: Assets.Python },
		".pyp": { image: Assets.Python },
		".pyt": { image: Assets.Python },
		".py3": { image: Assets.Python },
		".pyi": { image: Assets.Python },
		".pyw": { image: Assets.Python },
		".tac": { image: Assets.Python },
		".wsgi": { image: Assets.Python },
		".xpy": { image: Assets.Python },
		".rpy": { image: Assets.Python },
		"/\\.?(pypirc|pythonrc|python-venv)$/i": { image: Assets.Python },
		"/^(SConstruct|SConscript)$/": { image: Assets.Python },
		"/^(Snakefile|WATCHLISTS)$/": { image: Assets.Python },
		"/^wscript$/": { image: Assets.Python },
		"/\\.(r|Rprofile|rsx|rd)$/i": { image: Assets.R },
		"/\\.res?i?$/i": { image: Assets.Text },
		"/\\.(rb|ru|ruby|erb|gemspec|god|mspec|pluginspec|podspec|rabl|rake|opal)$/i":
			{
				image: Assets.Ruby,
			},
		"/^\\.?(irbrc|gemrc|pryrc|ruby-(gemset|version))$/i": { image: Assets.Ruby },
		"/^(Appraisals|(Rake|[bB]uild|Cap|Danger|Deliver|Fast|Guard|Jar|Maven|Pod|Puppet|Snap)file(\\.lock)?)$/":
			{
				image: Assets.Ruby,
			},
		"/\\.(jbuilder|rbuild|rb[wx]|builder)$/i": { image: Assets.Ruby },
		"/^rails$/": { image: Assets.Ruby },
		".watchr": { image: Assets.Ruby },
		".rs": { image: Assets.Rust },
		"/\\.(sc|scala)$/i": { image: Assets.Scala },
		".scss": { image: Assets.Scss },
		".sass": { image: Assets.Scss },
		"/\\.(sh|rc|bats|bash|tool|install|command)$/i": { image: Assets.Shell },
		"/^(\\.?bash(rc|[-_]?(profile|login|logout|history|prompt))|_osc|config|install-sh|PKGBUILD)$/i":
			{
				image: Assets.Shell,
			},
		"/\\.(ksh|mksh|pdksh)$/i": { image: Assets.Shell },
		".sh-session": { image: Assets.Shell },
		"/\\.zsh(-theme|_history)?$|^\\.?(antigen|zpreztorc|zlogin|zlogout|zprofile|zshenv|zshrc)$/i":
			{
				image: Assets.Shell,
			},
		"/\\.fish$|^\\.fishrc$/i": { image: Assets.Shell },
		"/^\\.?(login|profile)$/": { image: Assets.Shell },
		".inputrc": { image: Assets.Shell },
		".tmux": { image: Assets.Shell },
		"/^(configure|config\\.(guess|rpath|status|sub)|depcomp|libtool|compile)$/":
			{
				image: Assets.Shell,
			},
		"/^\\/(private\\/)?etc\\/([^\\/]+\\/)*(profile$|nanorc$|rc\\.|csh\\.)/i": {
			image: Assets.Shell,
		},
		"/^\\.?cshrc$/i": { image: Assets.Shell },
		".profile": { image: Assets.Shell },
		".tcsh": { image: Assets.Shell },
		".csh": { image: Assets.Shell },
		".sk": { image: Assets.Text },
		".sqf": { image: Assets.Sqf },
		"/\\.(my)?sql$/i": { image: Assets.Sql },
		".ddl": { image: Assets.Sql },
		".udf": { image: Assets.Sql },
		".hql": { image: Assets.Sql },
		".viw": { image: Assets.Sql },
		".prc": { image: Assets.Sql },
		".cql": { image: Assets.Sql },
		".db2": { image: Assets.Sql },
		"/\\.(styl|stylus)$/i": { image: Assets.Stylus },
		".svelte": { image: Assets.Svelte },
		".svg": { image: Assets.Svg },
		".swift": { image: Assets.Swift },
		".tex": { image: Assets.Tex },
		".ltx": { image: Assets.Tex },
		".aux": { image: Assets.Tex },
		".sty": { image: Assets.Tex },
		".dtx": { image: Assets.Tex },
		".cls": { image: Assets.Tex },
		".ins": { image: Assets.Tex },
		".lbx": { image: Assets.Tex },
		".mkiv": { image: Assets.Tex },
		".mkvi": { image: Assets.Tex },
		".mkii": { image: Assets.Tex },
		".texi": { image: Assets.Tex },
		"/^hyphen(ex)?\\.(cs|den|det|fr|sv|us)$/": { image: Assets.Tex },
		"/\\.te?xt$/i": { image: Assets.Text },
		".rtf": { image: Assets.Text },
		"/\\.i?nfo$/i": { image: Assets.Text },
		".msg": { image: Assets.Text },
		"/\\.(utxt|utf8)$/i": { image: Assets.Text },
		".toml": { image: Assets.Toml },
		".travis.yml": { image: Assets.Travis },
		".ts.map": { image: Assets.Tsmap },
		"/.*\\.d\\.ts/i": { image: Assets.TypescriptDef },
		".ts": { image: Assets.Ts },
		".tsx": { image: Assets.Tsx },
		".twig": { image: Assets.Twig },
		".v": { image: Assets.V },
		".vh": { image: Assets.V },
		".vala": { image: Assets.Vala },
		".vapi": { image: Assets.Vala },
		".vb": { image: Assets.Vb },
		".vbs": { image: Assets.Vb },
		".vbhtml": { image: Assets.Vb },
		".vbproj": { image: Assets.Vb },
		".vba": { image: Assets.Text },
		".vcxproj": { image: Assets.Text },
		".vscodeignore": { image: Assets.Vscodeignore },
		".vue": { image: Assets.Vue },
		".wat": { image: Assets.Wasm },
		".wast": { image: Assets.Wasm },
		".wasm": { image: Assets.Wasm },
		".xml": { image: Assets.Xml },
		"/\\.ya?ml$/i": { image: Assets.Yaml },
		"/^yarn(\\.lock)?$/i": { image: Assets.Yarn },
		".yarnrc": { image: Assets.Yarn },
		".zig": { image: Assets.Zig },
		"/\\.(tfvars|tf)$/i": { image: Assets.Terraform },
	};

presence.on("UpdateData", async () => {
	const [
			detailIdling,
			customDetail,
			customState,
			customSmallText,
			customEmpty,
			timestamps,
			buttons,
		] = await Promise.all([
			presence.getSetting<string>("customIdling"),
			presence.getSetting<string>("customDetail"),
			presence.getSetting<string>("customState"),
			presence.getSetting<string>("customImageText"),
			presence.getSetting<string>("customEmpty"),
			presence.getSetting<boolean>("timeStamps"),
			presence.getSetting<boolean>("buttons"),
		]),
		presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			smallImageKey: Assets.Vscode,
			startTimestamp,
		},
		status: Stauts = {
			file: document.querySelector(".tab.active a")?.textContent,
			workspace: document
				.querySelector("div.pane-header[aria-label='Folders Section'] h3")
				?.getAttribute("title"),
			editor: {
				lang: document.querySelector("#status\\.editor\\.mode")?.textContent,
			},
		},
		{ file, workspace, editor } = status,
		findExtension = Object.keys(KNOWN_EXTENSIONS).find(key => {
			if (file?.endsWith(key)) return true;
			const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
			if (!match) return false;
			return new RegExp(match[1], match[2]).test(file);
		});

	if (!file || !workspace) {
		presenceData.details = detailIdling;
		presenceData.largeImageKey = Assets.IdleVscode
		if (presenceData.buttons) delete presenceData.buttons;
	} else {
		presenceData.state = Replace(customState, customEmpty);
		presenceData.details = Replace(customDetail, customEmpty);
		presenceData.smallImageText = Replace(customSmallText, customEmpty);
		presenceData.largeImageKey =
			KNOWN_EXTENSIONS[findExtension]?.image ||
			KNOWN_LANGUAGES.find(key =>
				key.language.includes(editor.lang?.toLowerCase())
			)?.image ||
			Assets.Logo;
	}

	if (buttons && document.location.pathname?.split("/")[1] === "github") {
		presenceData.buttons = [
			{
				label: "View Repository",
				url: document.location.href.replace("vscode.dev/github", "github.com"),
			},
		];
	}

	if (!timestamps) delete presenceData.startTimestamp;
	if (!buttons) delete presenceData.buttons;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

function Replace(value: string, empty: string) {
	for (const [string, selector] of Object.entries({
		"%file%": [".tab.active a"],
		"%branch%": ["#status\\.scm\\.0"],
		"%error%": ["#status\\.problems > a > span.codiconcodicon-error"],
		"%problems%": ["#status\\.problems > a > span.codicon.codicon-warning"],
		"%workspace%": [
			"div.pane-header[aria-label='Folders Section'] h3",
			"title",
		],
		"%lang%": ["#status\\.editor\\.mode"],
		"%encoding%": ["#status\\.editor\\.encoding"],
		"%selection%": ["#status\\.editor\\.selection"],
	})) {
		value = value.replace(
			string,
			selector[1]
				? document
						.querySelector(selector[0])
						?.getAttribute(selector[1])
						?.trim() || empty
				: document.querySelector(selector[0])?.textContent?.trim() || empty
		);
	}
	return value;
}
