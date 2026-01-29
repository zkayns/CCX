Game.LoadMod("https://klattmose.github.io/CookieClicker/CCSE.js");
var CCX={
    name: "CCX",
    version: "1.004",
    isLoaded: false,
    toggleButtons: [],
    config: {
        doAutoClick: false,
        autoClickTime: 30,
        freeStuff: false,
        nameLimit: false,
        xray: false,
        forceLumps: false,
        achievementIds: false,
        upgradeIds: false,
        milkIcons: false,
        upgradeIcons: false,
        achievementIcons: false,
        party: false
    },
    savedInputs: {},
    savedSelection: "none",
    lastConfig: {},
    dirtyInputs: [],
    keys: {},
    numbersAndShifts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
    menuBreak(first) {
        return `${first?"":"</div>"}<div class="CCXmenuItem">`;
    },
    onToggle(option) {
        let optionName=option.split(".").at(-1);
        CCX.config[optionName]=!CCX.config[optionName];
        document.getElementById(option).classList.remove("off");
        document.getElementById(option).innerHTML=`${CCX.toggleButtons.filter(i=>i.option==optionName)[0].text} ${CCX.config[optionName]?"ON":"OFF"}`;
        CCX.toggleButtons.filter(i=>i.option==optionName)[0].onToggle(CCX.config[optionName]);
        if (CCX.config[optionName]==false) {
            document.getElementById(option).classList.add("off");
            return false;
        };
        return true;
    },
    toggleButton(option, text, action=(state)=>{}) {
        CCX.toggleButtons.push({
            option: option,
            text: text,
            onToggle: action
        });
        return CCSE.MenuHelper.ActionButton(CCX.toggleAction(`CCX.config.${option}`), text);
    },
    toggleAction(option, state) {
        return `CCX.onToggle('${option}');" id="${option}"`;
    },
    exportConfig() {
        saveAs(new Blob([JSON.stringify(CCX.config)]), "CCXConfig.json");
    },
    importConfig() {
        let e=document.createElement("input");
        e.setAttribute("type", "file");
        e.id="CCXfileUpload";
        document.body.appendChild(e);
        AddEvent(e, "change", (e)=>{
            let file=e.target.files[0];
            let reader=new FileReader();
            AddEvent(reader, "load", (e)=>{
                let j=JSON.parse(e.target.result);
                Object.keys(j).forEach(key=>CCX.config[key]=j[key]);
                l("CCXfileUpload").remove();
            });
            reader.readAsText(file);
        });
        e.click();
    },
    getMenuString() {
        let str="";
        str+="<div class='listing' id='CCXlisting'>";
        str+=CCSE.MenuHelper.SearchBox("CCX.menu.search", 256, "", "CCX.updateSearch()");
        str+=CCX.menuBreak(true);
        str+=CCSE.MenuHelper.ActionButton("CCX.exportConfig();", "Export CCX config");
        str+=CCSE.MenuHelper.ActionButton("CCX.importConfig();", "Import CCX config");
        str+="<label>Import/export data saved by CCX</label>";
        str+=CCX.menuBreak();
        str+=CCSE.MenuHelper.ActionButton("Game.OpenSesame();", "Open sesame");
        str+="<label>Hax!</label>";
        str+=CCX.menuBreak();
        str+=CCSE.MenuHelper.InputBox("CCX.config.autoClickTime", 32, CCX.config.autoClickTime, "CCX.config.autoClickTime=parseFloat(document.getElementById('CCX.config.autoClickTime').value);");
        str+=CCX.toggleButton("doAutoClick", "Autoclicker");
        str+="<label>Automatically clicks for you</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("freeStuff", "Free stuff", Game.RefreshStore);
        str+="<label>Makes upgrades, buildings, & levelups free</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("nameLimit", "Unlimited name length");
        str+="<label>Removes the bakery name character limit</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("xray", "X-ray", Game.RefreshStore);
        str+="<label>Reveals hidden crates and buildings</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("forceLumps", "Force lumps", (state)=>{Game.addClass(`lumps${state?"On":"Off"}`)});
        str+="<label>Force enables sugar lumps</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("achievementIds", "Show achievement IDs");
        str+="<label>Shows achievement IDs as crate tags</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("achievementIcons", "Show achievement icon indexes");
        str+="<label>Shows achievement icon indexes as crate tags</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("upgradeIds", "Show upgrade IDs");
        str+="<label>Shows upgrade IDs as crate tags</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("upgradeIcons", "Show upgrade icon indexes");
        str+="<label>Shows upgrade icon indexes as crate tags</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("milkIcons", "Show milk icon indexes");
        str+="<label>Shows icon indexes in milk tooltips</label>";
        str+=CCX.menuBreak();
        str+=CCSE.MenuHelper.InputBox("CCX.stats.cookies", 64, Math.floor(Game.cookies), "");
        str+=CCSE.MenuHelper.ActionButton("CCX.menuStatChange('cookies');", "Set cookies", "CCX.statButtons.cookies");
        str+="<label>Sets your cookie count</label>";
        str+=CCX.menuBreak();
        str+=CCSE.MenuHelper.InputBox("CCX.stats.lumps", 32, Game.lumps, "");
        str+=CCSE.MenuHelper.ActionButton("CCX.menuStatChange('lumps');", "Set lumps", "CCX.statButtons.lumps");
        str+="<label>Sets your lump count</label>";
        str+=CCX.menuBreak();
        str+=CCX.toggleButton("party", "Party mode");
        str+="<label>Toggles party mode</label>";
        str+="</div></div>";
        return str;
    },
    setLumps(lumps) {
        Game.lumpsTotal+=lumps-Game.lumps;
        Game.lumps=lumps;
    },
    formatDate(date, format) {
        return format.split("").map(i=>{
            let f={
                h() {return String(date.getHours()%12||12).padStart(2, "0");},
                m() {return String(date.getMinutes()).padStart(2, "0");},
                s() {return String(date.getSeconds()).padStart(2, "0");},
                i() {return (date.getHours()>=12?"PM":"AM");},
                M() {return date.getMonth()+1;},
                D() {return date.getDate();},
                Y() {return date.getFullYear();}
            };
            if (f[i]) return f[i]();
            return i;
        }).join("");
    },
    bulletItem(text) {
        return `<div class='listing'>&bull; ${text}</div>`;
    },
    addLocString(text) {
        locStrings[text]=text;
    },
    loadLoc() {
        CCX.addLocString("You can also press %1 to bulk-buy or sell %2 of a building at a time, %5 for %6, or %3 for %4.");
    },
    getInfoString() {
        let str="";
        str+="<div class='listing'>Features";
        str+=CCX.bulletItem("Accurate upgrade & achievement unlock percentages")
        str+=CCX.bulletItem("Stat editors");
        str+=CCX.bulletItem("X-ray");
        str+=CCX.bulletItem("Free upgrades & buildings cheat");
        str+=CCX.bulletItem("Autoclicker cheat");
        str+=CCX.bulletItem("Name length bypass");
        str+=CCX.bulletItem("Show upgrade & achievement IDs");
        str+=CCX.bulletItem("Show upgrade, achievement, and milk icon indexes");
        str+=CCX.bulletItem("50 bulk button");
        str+=CCX.bulletItem("Start date in stats menu");
        str+=CCX.bulletItem("Binds to buy & sell buildings");
        str+="<br>";
        str+="</div>";
        return str;
    },
    launch() {
        CCX.modifyCCSE();
        CCX.configDefaults=structuredClone(CCX.config);
        if (localStorageGet("CCX")) CCX.config=JSON.parse(localStorageGet("CCX"));
        CCSE.customSave.push(()=>{localStorageSet("CCX", JSON.stringify(CCX.config));});
        CCX.loadLoc();
        Game.customOptionsMenu.push(()=>{
            CCSE.AppendCollapsibleOptionsMenu(CCX.name, CCX.getMenuString());
            CCX.toggleButtons.forEach(tb=>{
                if (!CCX.config[tb.option]) l(`CCX.config.${tb.option}`).classList.add("off");
                l(`CCX.config.${tb.option}`).innerHTML=`${tb.text} <strong>${CCX.config[tb.option]?"ON":"OFF"}</strong>`;
                l(`CCX.config.${tb.option}`).classList.add("prefButton");
            });
        });
        Game.customInfoMenu.push(()=>{
            CCSE.AppendCollapsibleOptionsMenu(CCX.name, CCX.getInfoString());
        });
        Game.customOptionsMenu.push(()=>{
            Object.keys(CCX.savedInputs).filter(k=>l(k)&&l(k).id).forEach(k=>l(k).value=CCX.savedInputs[k]);
            if (CCX.savedSelection!="none"&&l(CCX.savedSelection.id)) {
                l(CCX.savedSelection.id).focus();
                l(CCX.savedSelection.id).setSelectionRange(CCX.savedSelection.start, CCX.savedSelection.end);
            };
            CCX.addMenuListeners();
            CCX.updateSearch();
        });
        Game.customOpenSesame.push(()=>{
            let str="";
            str+=CCSE.MenuHelper.Line();
            str+=CCSE.MenuHelper.NeatoButton("Game.cookies+=parseFloat(prompt());", "Add cookies");
            str+=CCSE.MenuHelper.NeatoButton("Game.cookies-=parseFloat(prompt());", "Subtract cookies");
            str+=CCSE.MenuHelper.NeatoButton("Game.cookies*=parseFloat(prompt());", "Multiply cookies");
            str+=CCSE.MenuHelper.NeatoButton("Game.cookies/=parseFloat(prompt());", "Divide cookies");
            return str;
        });
        Game.customReset.push((hard)=>{
            localStorage.removeItem("CCX");
            CCX.config=CCX.configDefaults;
        });
        document.querySelectorAll(".ad, .supportComment, .ifNoAds").forEach(i=>i.remove());
        Object.keys(Game.Upgrades).forEach(key=>{
            Game.customUpgrades[Game.Upgrades[key].name].getPrice.push(()=>{
                if (CCX.config.freeStuff) return 0;
                return 1;
            });
        });
        Game.customModifyBuildingPrice.push(()=>{
            if (CCX.config.freeStuff) return 0;
            return 1;
        });
        Game.customBuildStore.push(()=>{
            let e=document.createElement("div");
            e.id="storeBulk50";
            e.setAttribute("class", "storePreButton storeBulkAmount");
            e.setAttribute(Game.clickStr, "Game.storeBulkButton(6);");
            e.innerHTML="50";
            l("storeBulk10").after(e);
        });
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", 'loc("%1 ago",startDate)', '`${loc("%1 ago",startDate)} <small>(${CCX.formatDate(new Date(Game.startDate), "M/D/Y h:m:s i")})</small>`', 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "l('menu').innerHTML=str;", 'if (Game.onMenu=="prefs") {[...(l("menu").querySelectorAll("input"))].filter(i=>i?.id).forEach(i=>CCX.savedInputs[i.id]=i?.value);};', -1);
        CCSE.SpliceCodeIntoFunction("Game.UpdateMenu", 2, 'if (Game.onMenu=="prefs") {if (getSelection().rangeCount) {CCX.savedSelection=structuredClone({start: document.activeElement.selectionStart, end: document.activeElement.selectionEnd, id: document.activeElement?.id});} else {CCX.savedSelection="none";};};');
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "Math.floor((achievementsOwned/achievementsTotal)*100)", "(Math.trunc((achievementsOwned/achievementsTotal)*10000)/100)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "Math.floor((upgradesOwned/upgradesTotal)*100)", "(Math.trunc((upgradesOwned/upgradesTotal)*10000)/100)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "' - '+milk.name", "' - '+milk.name+(CCX.config.milkIcons?` ${JSON.stringify(milk.icon)}`:'')", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crate", "mysterious=1", "mysterious=(CCX.config.xray?0:1)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", "mysterious=1", "mysterious=(CCX.config.xray?0:1)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", `("Click to lose!"),'#00c462');`, `if (CCX.config.achievementIds) tags.push(loc(\`id \${me.id} \`),'#9700cf'); if (CCX.config.achievementIcons) tags.push(loc(\`icon \${JSON.stringify(me.icon)} \`),'#9700cf');`, 1);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", `"Vaulted"),'#4e7566');`, `if (CCX.config.upgradeIds) tags.push(loc(\`id \${me.id} \`),'#9700cf'); if (CCX.config.upgradeIcons) tags.push(loc(\`icon \${JSON.stringify(me.icon)} \`),'#9700cf');`, 1);
        CCSE.ReplaceCodeIntoFunction("Game.bakeryNameSet", "28", "(CCX.config.nameLimit?Infinity:28)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.canLumps", "Game.canLumps injection point 0", "if (CCX.config.forceLumps) return true;", 1);
        CCSE.ReplaceCodeIntoFunction("Game.storeBulkButton", "else if (id==4) Game.buyBulk=100;", "else if (id==6) Game.buyBulk=50;", 1);
        CCSE.ReplaceCodeIntoFunction("Game.Logic", "(Game.keys[16] || Game.keys[17]) && !Game.buyBulkShortcut", "(Game.keys[16] || Game.keys[17] || Game.keys[18]) && !Game.buyBulkShortcut", 0);
        CCSE.ReplaceCodeIntoFunction("Game.Logic", "(!Game.keys[16] && !Game.keys[17]) && Game.buyBulkShortcut", "(!Game.keys[16] && !Game.keys[17] && !Game.keys[18]) && Game.buyBulkShortcut", 0);
        CCSE.ReplaceCodeIntoFunction("Game.Logic", "if (Game.keys[17]) Game.buyBulk=10;", "if (Game.keys[18]) Game.buyBulk=50;", 1);
        CCSE.ReplaceCodeIntoFunction("Game.BuildStore", "or %3 for %4", "%5 for %6, or %3 for %4", 0);
        CCSE.ReplaceCodeIntoFunction("Game.BuildStore", `'<b>'+loc("Shift")+'</b>','<b>100</b>'`, `,\`<b>\${loc("Alt")}</b>\`,'<b>50</b>'`, 1);
        CCSE.ReplaceCodeIntoFunction("Game.showLangSelection", '+loc("note: this will save and reload your game")+', "')('+loc('another note: translations of certain strings modified by CCX may break')+", 1);
        CCSE.ReplaceCodeIntoFunction("Game.spendLump", "ask if we want to spend N lumps (unless free)", "if (CCX.config.freeStuff) free=true;", 1);
        CCX.hookObjects();
        AddEvent(l("CCSEversionNumber"), "mousedown", (e)=>{window.open("https://klattmose.github.io/CookieClicker/CCSE-POCs/", "_blank");});
        e=l("CCSEversionNumber").cloneNode();
        e.innerHTML=`CCX v. ${CCX.version}`;
        e.id="CCXversionNumber";
        l("CCSEversionNumber").after(e);
        AddEvent(e, "mousedown", (e)=>{window.open("https://github.com/zkayns/CCX", "_blank");});
        e=document.createElement("style");
        e.id="CCXstyles";
        e.innerHTML=`
            #CCSEversionNumber, #CCXversionNumber {
                cursor: pointer; !important
            }
            #CCXlisting input {
                appearance: none;
                color: #fff; 
	            background: url(img/darkNoise.jpg);
                border-color: #ece2b6 #875526 #733726 #dfbc9a; 
	            border-radius:4px;
            }
            .lockedTitle.CCXxray {
                display: none !important;
            }
            .title.CCXxray {
                display: block !important;
            }       
            .product.CCXxray {
                opacity: 1 !important;
                display: block !important;
            }
            .CCXmenuItem label {
	            font-size: 11px;
	            color: rgba(255, 255, 255, 0.5);
	            border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
	            padding: 2px 8px;
            }
            .CCXmenuItem b {
	            font-weight: bold;
	            opacity: 0.6;
            }
            .CCXmenuItem small {
	            font-size: 11px;
	            opacity: 0.9;
            }
            .CCXmenuItem {
	            padding: 0px 0px;
	            font-size: 13px;
            }
        `;
        document.body.appendChild(e);
        Game.modHooks["draw"].push(CCX.draw);
        AddEvent(window, "keydown", CCX.keyDown);
        AddEvent(window, "keyup", CCX.keyUp);
        Game.BuildStore();
        CCX.isLoaded=true;
    },
    keyUp(e) {
        if (document.activeElement?.tagName=="INPUT") return;
        delete CCX.keys[e.key];
        if (e.key=="s"||e.key=="S") Game.storeBulkButton(0);
    },
    keyDown(e) {
        if (document.activeElement?.tagName=="INPUT") return;
        CCX.keys[e.key]=1;
        if (CCX.numbersAndShifts.includes(e.key)&&(CCX.keys["b"]||CCX.keys["B"])) Game.ObjectsById[CCX.numbersAndShifts.indexOf(e.key)].buy(1);
    },
    updateSearch() {
        let query=l("CCX.menu.search").value;
        [...document.querySelectorAll(".CCXmenuItem")].forEach(i=>{
            let hit=0;
            if (query=="") hit=true;
            [...i.children].forEach(c=>{if (c.innerHTML.toLowerCase().includes(query.toLowerCase())) hit=true;});
            if (hit) {
                i.style["display"]="block";
                return;
            };
            i.style["display"]="none";
        });
    },
    hookObjects() {
        for (let i in Game.Objects) {
            if (Game.Objects[i].hookedByCCX) continue;
            CCSE.ReplaceCodeIntoFunction(`Game.Objects["${i}"].tooltip`, "if (me.locked)", "if (me.locked&&!CCX.config.xray)", 0);
            CCSE.ReplaceCodeIntoFunction(`Game.Objects["${i}"].rebuild`, "var iconOff=[1,me.icon];", "if (CCX.config.xray) iconOff=[0,me.icon];", 1);
            CCX.nextLineHook(`Game.Objects["${i}"].rebuild`, "iconOff=", "AddEvent(l(`product${me.id}`), 'contextmenu', (e)=>{e.preventDefault()});");
            Game.Objects[i].hookedByCCX=true;
        };
        return true;
    },
    addMenuListeners() {
        [...l("menu").querySelectorAll("input")].forEach(i=>{AddEvent(i, "focus", (e)=>CCX.dirtyInputs.push(e.target.id));});
        AddEvent(l("CCX.menu.search"), "keydown", CCX.updateSearch);
        AddEvent(l("CCX.menu.search"), "keyup", CCX.updateSearch);
    },
    draw() {
        CCX.hookObjects(); // in case any new objects have been added that we need to hook
        if (CCX.keys["b"]||CCX.keys["B"]) Game.buyBulk=1;
        if (CCX.keys["s"]||CCX.keys["S"]) Game.storeBulkButton(1);
        if (CCX.config.doAutoClick&&Game.drawT%CCX.config.autoClickTime==0) Game.ClickCookie();
        [...document.querySelectorAll(".storeBulkAmount")].forEach(i=>i.classList.remove("selected"));
        if (Game.buyBulk!=-1&&l(`storeBulk${Game.buyBulk}`)) l(`storeBulk${Game.buyBulk}`).classList.add("selected");
        else if (Game.buyBulk==-1) l("storeBulkMax").classList.add("selected");
        Game.PARTY=CCX.config.party;
        if (!Game.PARTY) {
			Game.l.style.filter="";
			Game.l.style.webkitFilter="";
			Game.l.style.transform="";
        };
        if (CCX.config.xray) {
            [
                ".lockedTitle",
                ".product.locked .title",
                ".product"
            ].forEach(i=>[...document.querySelectorAll(i)].forEach(o=>o.classList.add("CCXxray")));
        } else [...document.querySelectorAll(".CCXxray")].forEach(i=>i.classList.remove("CCXxray"));
        if (Game.onMenu=="prefs") {
            CCX.inputSetStat(l("CCX.stats.cookies"), Math.round(Game.cookies));
            CCX.inputSetStat(l("CCX.stats.lumps"), Math.round(Game.lumps));
        };
        Object.keys(CCX.keys).forEach(k=>{if (CCX.keys[k]) CCX.keys[k]++;});
        CCX.lastConfig=structuredClone(CCX.config);
    },
    inputSetStat(e, stat) {
        if (!CCX.dirtyInputs.includes(e.id)&&document.activeElement!=e) e.value=stat;
    },
    menuStatChange(stat) {
        Game[stat]=(()=>{switch (typeof Game[stat]) {
            case "string":
                return String(l(`CCX.stats.${stat}`).value);
            case "number":
            default:
                return parseFloat(l(`CCX.stats.${stat}`).value);
        }})();
        CCX.dirtyInputs=CCX.dirtyInputs.filter(i=>i!=`CCX.stats.${stat}`);
    },
    nextLineHook(func, find, add) {
        let lines=String(eval(func)).split("\n");
        CCSE.SpliceCodeIntoFunction(func, lines.indexOf(lines.filter(i=>i.includes(find))[0])+1, add);
    },
    modifyCCSE() {
        if (!CCSE.MenuHelper.NeatoButton) CCSE.MenuHelper.NeatoButton=(action, text)=>{
            return `<a class="option neato" ${Game.clickStr}="${action}">${text}</a>`;
        };
        if (!CCSE.MenuHelper.Line) CCSE.MenuHelper.Line=()=>{
            return `<div class="line"></div>`;
        };
        CCSE.ReplaceCodeIntoFunction("CCSE.MenuHelper.ActionButton", "(action, text)", "(action, text, id='')", 0);
        CCX.nextLineHook("CCSE.MenuHelper.ActionButton", "<a class=", "(id?` id='${id}'`:'')+");
    }
};
if (!CCX.isLoaded) {
    if (CCSE?.isLoaded) CCX.launch();
    else {
        if (!CCSE) var CCSE={};
        if (!CCSE.postLoadHooks) CCSE.postLoadHooks=new Array();
        CCSE.postLoadHooks.push(CCX.launch);
    };
};
