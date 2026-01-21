Game.LoadMod("https://klattmose.github.io/CookieClicker/CCSE.js");
var CCX={
    name: "CCX",
    version: "1.0.0",
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
        achievementIcons: false
    },
    onToggle(option) {
        let optionName=option.split(".").at(-1);
        CCX.config[optionName]=!CCX.config[optionName];
        document.getElementById(option).classList.remove("off");
        document.getElementById(option).innerHTML=`${CCX.toggleButtons.filter(i=>i.option==optionName)[0].text} ${CCX.config[optionName]?"ON":"OFF"}`;
        if (CCX.config[optionName]==false) {
            document.getElementById(option).classList.add("off");
            return false;
        };
        return true;
    },
    toggleButton(option, text) {
        CCX.toggleButtons.push({
            option: option,
            text: text
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
        e.addEventListener("change", (e)=>{
            let file=e.target.files[0];
            let reader=new FileReader();
            reader.addEventListener("load", (e)=>{
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
        str+="<div class='listing'>";
        str+=CCSE.MenuHelper.ActionButton("CCX.exportConfig();", "Export CCX config");
        str+=CCSE.MenuHelper.ActionButton("CCX.importConfig();", "Import CCX config");
        str+="<label>Import/export data saved by CCX</label>";
        str+="<br>";
        str+=CCSE.MenuHelper.ActionButton("Game.OpenSesame();", "Open sesame");
        str+="<label>Hax!</label>";
        str+="<br>";
        str+=CCSE.MenuHelper.InputBox("CCX.config.autoClickTime", 32, CCX.config.autoClickTime, "CCX.config.autoClickTime=parseFloat(document.getElementById('CCX.config.autoClickTime').value);");
        str+=CCX.toggleButton("doAutoClick", "Autoclicker");
        str+="<label>Automatically clicks for you</label>";
        str+="<br>";
        str+=CCX.toggleButton("freeStuff", "Free stuff");
        str+="<label>Makes upgrades & buildings free</label>";
        str+="<br>";
        str+=CCX.toggleButton("nameLimit", "Unlimited name length");
        str+="<label>Removes the bakery name character limit</label>";
        str+="<br>";
        str+=CCX.toggleButton("xray", "X-ray");
        str+="<label>Reveals hidden crates</label>";
        str+="<br>";
        str+=CCX.toggleButton("forceLumps", "Force lumps");
        str+="<label>Forces lump visibility (requires refresh to update)</label>";
        str+="<br>";
        str+=CCX.toggleButton("achievementIds", "Show achievement IDs");
        str+="<label>Shows achievement IDs as crate tags</label>";
        str+="<br>";
        str+=CCX.toggleButton("achievementIcons", "Show achievement icon indexes");
        str+="<label>Shows achievement icon indexes as crate tags</label>";
        str+="<br>";
        str+=CCX.toggleButton("upgradeIds", "Show upgrade IDs");
        str+="<label>Shows upgrade IDs as crate tags</label>";
        str+="<br>";
        str+=CCX.toggleButton("upgradeIcons", "Show upgrade icon indexes");
        str+="<label>Shows upgrade icon indexes as crate tags</label>";
        str+="<br>";
        str+=CCX.toggleButton("milkIcons", "Show milk icon indexes");
        str+="<label>Shows icon indexes in milk tooltips</label>";
        str+="<br>";
        str+=CCSE.MenuHelper.InputBox("CCX.stats.cookies", 64, Math.floor(Game.cookies), "");
        str+=CCSE.MenuHelper.ActionButton("Game.cookies=Math.floor(parseFloat(l('CCX.stats.cookies').value));", "Set cookies");
        str+="<label>Sets your cookie count</label>";
        str+="<br>";
        str+=CCSE.MenuHelper.InputBox("CCX.stats.lumps", 32, Game.lumps, "");
        str+=CCSE.MenuHelper.ActionButton("CCX.setLumps(parseFloat(l('CCX.stats.lumps').value));", "Set lumps");
        str+="<label>Sets your lump count</label>";
        str+="</div>";
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
                i() {return (date.getHours()>=12?"PM":"AM")},
                M() {return date.getMonth()+1},
                D() {return date.getDate()},
                Y() {return date.getFullYear()}
            };
            if (f[i]) return f[i]();
            return i;
        }).join("");
    },
    bulletItem(text) {
        return `<div class='listing'>&bull; ${text}</div>`;
    },
    getInfo() {
        let str="";
        str+="<div class='listing'>";
        str+=CCX.bulletItem("Features");
        str+=CCX.bulletItem("Accurate upgrade & achievement unlock percentages")
        str+=CCX.bulletItem("Stat editors");
        str+=CCX.bulletItem("X-ray");
        str+=CCX.bulletItem("Free upgrades & buildings cheat");
        str+=CCX.bulletItem("Autoclicker cheat");
        str+=CCX.bulletItem("Name length bypass");
        str+=CCX.bulletItem("Show upgrade & achievement IDs");
        str+=CCX.bulletItem("Show upgrade, achievement, and milk icon indexes");
        str+="<br>";
        str+="</div>";
        return str;
    },
    launch() {
        CCX.modifyCCSE();
        CCX.configDefaults=structuredClone(CCX.config);
        if (localStorageGet("CCX")) CCX.config=JSON.parse(localStorageGet("CCX"));
        CCSE.customSave.push(()=>{
            localStorageSet("CCX", JSON.stringify(CCX.config));
        });
        Game.customOptionsMenu.push(()=>{
            CCSE.AppendCollapsibleOptionsMenu(CCX.name, CCX.getMenuString());
            CCX.toggleButtons.forEach(tb=>{
                if (!CCX.config[tb.option]) document.getElementById(`CCX.config.${tb.option}`).classList.add("off");
                document.getElementById(`CCX.config.${tb.option}`).innerHTML=`${tb.text} <strong>${CCX.config[tb.option]?"ON":"OFF"}</strong>`;
                document.getElementById(`CCX.config.${tb.option}`).classList.add("prefButton");
            });
        });
        Game.customInfoMenu.push(()=>{
            CCSE.AppendCollapsibleOptionsMenu(CCX.name, CCX.getInfo());
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
        Game.modHooks["draw"].push(()=>{
            if (CCX.config.doAutoClick&&Game.drawT%CCX.config.autoClickTime==0) Game.ClickCookie();
            if (Game.buyBulk==50) l('storeBulk50').className='storePreButton storeBulkAmount selected'; 
            else l('storeBulk50').className='storePreButton storeBulkAmount';
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
        Game.BuildStore();
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", 'loc("%1 ago",startDate)', '`${loc("%1 ago",startDate)} <small>(${CCX.formatDate(new Date(Game.startDate), "M/D/Y h:m:s i")})</small>`', 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "Math.floor((achievementsOwned/achievementsTotal)*100)", "(Math.trunc((achievementsOwned/achievementsTotal)*10000)/100)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "Math.floor((upgradesOwned/upgradesTotal)*100)", "(Math.trunc((upgradesOwned/upgradesTotal)*10000)/100)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpdateMenu", "' - '+milk.name", "' - '+milk.name+(CCX.config.milkIcons?` ${JSON.stringify(milk.icon)}`:'')", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crate", "mysterious=1", "mysterious=(CCX.config.xray?0:1)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", "mysterious=1", "mysterious=(CCX.config.xray?0:1)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", `("Click to lose!"),'#00c462');`, `if (CCX.config.achievementIds) tags.push(loc(\`id \${me.id} \`),'#9700cf'); if (CCX.config.achievementIcons) tags.push(loc(\`icon \${JSON.stringify(me.icon)} \`),'#9700cf');`, 1);
        CCSE.ReplaceCodeIntoFunction("Game.crateTooltip", `"Vaulted"),'#4e7566');`, `if (CCX.config.upgradeIds) tags.push(loc(\`id \${me.id} \`),'#9700cf'); if (CCX.config.upgradeIcons) tags.push(loc(\`icon \${JSON.stringify(me.icon)} \`),'#9700cf');`, 1);
        CCSE.ReplaceCodeIntoFunction("Game.bakeryNameSet", "28", "(CCX.config.nameLimit?Infinity:28)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.canLumps", "return false", "return (CCX.config.forceLumps?true:false)", 0);
        CCSE.ReplaceCodeIntoFunction("Game.storeBulkButton", "else if (id==4) Game.buyBulk=100;", "else if (id==6) Game.buyBulk=50;", 1);
        l("CCSEversionNumber").addEventListener("mousedown", (e)=>{
            window.open("https://klattmose.github.io/CookieClicker/CCSE-POCs/", "_blank");
        });
        let e=document.createElement("style");
        e.id="CCXstyles";
        e.innerHTML=`
            #CCSEversionNumber {
                cursor: pointer;
            }
        `;
        document.body.appendChild(e);
        CCX.isLoaded=true;
    },
    modifyCCSE() {
        if (!CCSE.MenuHelper.NeatoButton) CCSE.MenuHelper.NeatoButton=(action, text)=>{
            return `<a class="option neato" ${Game.clickStr}="${action}">${text}</a>`
        };
        if (!CCSE.MenuHelper.Line) CCSE.MenuHelper.Line=()=>{
            return `<div class="line"></div>`;
        };
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
