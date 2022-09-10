import { getId } from './Main';
import { global, player, playerStart } from './Player';
import { buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateResearchCost } from './Stage';

export const switchTab = (tab = 'none') => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('stageTabBtn').style.borderColor = '';
        getId('researchTab').style.display = 'none';
        getId('researchTabBtn').style.borderColor = '';
        getId('settingsTab').style.display = 'none';
        getId('settingsTabBtn').style.borderColor = '';
        const color = ['#e3e3e3', '#a10000'][global.theme.stage - 1];
        const invText = getId('invisibleTab'); //For screen readers, always turned on, to let screen reader user get to settings tab easier
        getId('specialTab').style.display = 'none';

        if (tab !== 'none') {
            global.tab = tab;
        } else {
            global.tab = 'stage';
        }

        getId(`${global.tab}Tab`).style.display = '';
        getId(`${global.tab}TabBtn`).style.borderColor = color;
        invText.textContent = `Current tab: ${global.tab} tab`;
        visualUpdate();
        numbersUpdate();
    }
};

export const invisibleUpdate = () => { //This is only for important or time based info
    const { stage, discharge, time, upgrades, researches, researchesAuto, buildings, toggles } = player;
    const { buildingsInfo, upgradesInfo } = global;

    const passedTime = Date.now() - time.updated;
    let passedSeconds = passedTime / 1000;
    time.updated = Date.now();
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    global.lastSave += passedTime;
    if (passedSeconds > 3600) {
        passedSeconds = 3600;
        console.log('Max offline progress is 1 hour.');
    }

    switch (stage) {
        case 1:
            upgradesInfo.effect[5] = Math.trunc((1.02 + 0.01 * researches[1]) * 100) / 100;
            upgradesInfo.effect[3] = 4 + 1 * researches[3];
            if (upgrades[6] === 1) { calculateGainedBuildings(3, passedSeconds); }

            if (toggles[6] && researchesAuto[1] >= 3) { buyBuilding(buildings, 3, true); }
            buildingsInfo.producing[3] = 0.3 * buildings[3].current * upgradesInfo.effect[3] ** discharge.current;
            if (upgrades[5] === 1) { buildingsInfo.producing[3] *= upgradesInfo.effect[5] ** buildings[3].true; }
            calculateGainedBuildings(2, passedSeconds);

            if (toggles[5] && researchesAuto[1] >= 2) { buyBuilding(buildings, 2, true); }
            buildingsInfo.producing[2] = 0.4 * buildings[2].current * upgradesInfo.effect[3] ** discharge.current;
            if (upgrades[2] === 1) { buildingsInfo.producing[2] *= 5; }
            if (upgrades[5] === 1) { buildingsInfo.producing[2] *= upgradesInfo.effect[5] ** buildings[2].true; }
            calculateGainedBuildings(1, passedSeconds);

            if (toggles[4] && researchesAuto[1] >= 1) { buyBuilding(buildings, 1, true); }
            buildingsInfo.producing[1] = 0.5 * buildings[1].current * upgradesInfo.effect[3] ** discharge.current;
            if (upgrades[1] === 1) { buildingsInfo.producing[1] *= 10; }
            if (upgrades[5] === 1) { buildingsInfo.producing[1] *= upgradesInfo.effect[5] ** buildings[1].true; }
            calculateGainedBuildings(0, passedSeconds);
            break;
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, energy, buildings, upgrades } = player;
    const { tab, lastSave, dischargeInfo, buildingsInfo, upgradesInfo } = global;

    if (global.footer) {
        if (stage === 1) {
            getId('quarks').textContent = `Quarks: ${format(buildings[0].current)}`;
        }
        if (energy.total >= 9 && stage !== 2) {
            getId('energy').textContent = `Energy: ${format(energy.current, 0)}`;
        }
    }
    if (tab === 'stage') {
        if (stage === 1) {
            getId('building1Cur').textContent = format(buildings[1].current);
            getId('building1Prod').textContent = format(buildingsInfo.producing[1]);
            if (buildingsInfo.cost[1] <= buildings[0].current) {
                getId('building1Btn').classList.add('availableBuilding');
                getId('building1Btn').textContent = `Buy for: ${format(buildingsInfo.cost[1])} Quarks`;
            } else {
                getId('building1Btn').classList.remove('availableBuilding');
                getId('building1Btn').textContent = `Need: ${format(buildingsInfo.cost[1])} Quarks`;
            }
            if (buildings[1].total >= 11) {
                getId('building2Cur').textContent = format(buildings[2].current);
                getId('building2Prod').textContent = format(buildingsInfo.producing[2]);
                if (buildingsInfo.cost[2] <= buildings[1].current) {
                    getId('building2Btn').classList.add('availableBuilding');
                    getId('building2Btn').textContent = `Buy for: ${format(buildingsInfo.cost[2])} Particles`;
                } else {
                    getId('building2Btn').classList.remove('availableBuilding');
                    getId('building2Btn').textContent = `Need: ${format(buildingsInfo.cost[2])} Particles`;
                }
            }
            if (buildings[2].total >= 2) {
                getId('building3Cur').textContent = format(buildings[3].current);
                getId('building3Prod').textContent = format(buildingsInfo.producing[3]);
                if (buildingsInfo.cost[3] <= buildings[2].current) {
                    getId('building3Btn').classList.add('availableBuilding');
                    getId('building3Btn').textContent = `Buy for: ${format(buildingsInfo.cost[3])} Atoms`;
                } else {
                    getId('building3Btn').classList.remove('availableBuilding');
                    getId('building3Btn').textContent = `Need: ${format(buildingsInfo.cost[3])} Atoms`;
                }
            }
            if (upgrades[3] === 1) {
                getId('dischargeReset').textContent = `Next goal is ${format(dischargeInfo.next, 0)} energy`;
                getId('dischargeEffect').textContent = String(upgradesInfo.effect[3]);
            }
        }
    }
    if (tab === 'settings') {
        getId('isSaved').textContent = `${format(lastSave, 0, 'time')} ago`;
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, energy, discharge, buildings, upgrades, researchesAuto } = player;

    /* They are going to be hidden with stageCheck(); */
    if (stage === 1) {
        getId('energyStat').style.display = energy.total >= 9 ? '' : 'none';
        getId('atomsMain').style.display = buildings[1].total >= 11 ? '' : 'none';
        getId('moleculesMain').style.display = buildings[2].total >= 2 ? '' : 'none';
        getId('discharge').style.display = upgrades[3] > 0 ? '' : 'none';
        for (let i = 5; i <= 8; i++) {
            if (discharge.current >= 3) {
                getId(`upgrade${i}`).style.display = '';
            } else {
                getId(`upgrade${i}`).style.display = 'none';
            }
        }
        if (buildings[3].current >= 1e21) { getId('stageReset').textContent = 'Enter next stage'; }
        if (global.screenReader) {
            getId('invisibleGetBuilding2').style.display = buildings[2].total > 0 ? '' : 'none';
            getId('invisibleGetBuilding3').style.display = buildings[3].total > 0 ? '' : 'none';
        }
    }

    getId('upgrades').style.display = energy.total >= 9 || stage > 1 ? '' : 'none';
    getId('resetToggles').style.display = discharge.current >= 1 || stage > 1 ? '' : 'none';
    getId('researchTabBtn').style.display = discharge.current >= 4 || stage !== 1 ? '' : 'none';
    getId('toggleBuy').style.display = researchesAuto[0] > 0 ? '' : 'none';
    for (let i = 1; i <= 3; i++) {
        if (researchesAuto[1] >= i) {
            getId(`toggle${i + 3}`).style.display = '';
        } else {
            getId(`toggle${i + 3}`).style.display = 'none';
        }
    }
    getId('stage').style.display = upgrades[7] === 1 || stage > 1 ? '' : 'none';
    getId('stageToggleReset').style.display = stage > 1 ? '' : 'none';
    getId('themeArea').style.display = stage > 1 ? '' : 'none';
};

export const getUpgradeDescription = (index: number, type = 'normal') => {
    const { upgrades, researches, researchesAuto } = player;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesAutoInfo } = global;

    switch (type) {
        case 'normal':
            getId('upgradeText').textContent = upgradesInfo.description[index];
            getId('upgradeEffect').textContent = `${upgradesInfo.effectText[index][0]}${upgradesInfo.effect[index]}${upgradesInfo.effectText[index][1]}`;
            getId('upgradeCost').textContent = `${upgrades[index] === 1 ? 0 : upgradesInfo.cost[index]} Energy.`;
            break;
        case 'researches':
            getId('researchText').textContent = researchesInfo.description[index];
            getId('researchEffect').textContent = `${researchesInfo.effectText[index][0]}${researchesInfo.effect[index]}${researchesInfo.effectText[index][1]}`;
            getId('researchCost').textContent = `${researches[index] === researchesInfo.max[index] ? 0 : researchesInfo.cost[index]} Energy.`;
            break;
        case 'researchesAuto':
            getId('researchText').textContent = researchesAutoInfo.description[index];
            if (index === 1) {
                researchesAutoInfo.effect[1] = buildingsInfo.name[Math.min(researchesAuto[1] + 1, buildingsInfo.name.length - 1)];
            }
            getId('researchEffect').textContent = `${researchesAutoInfo.effectText[index][0]}${researchesAutoInfo.effect[index]}${researchesAutoInfo.effectText[index][1]}`;
            getId('researchCost').textContent = `${researchesAuto[index] === researchesAutoInfo.max[index] ? 0 : researchesAutoInfo.cost[index]} Energy.`;
            break;
    }
};

export const format = (input: number, precision = input < 1e3 ? 2 : 0, type = 'number' as 'number' | 'time') => {
    switch (type) {
        case 'number':
            if (precision > 0 && input < 1e6) {
                return String(Math.trunc(input * (10 ** precision)) / (10 ** precision)); //For fake numbers
            } else if (precision <= 0 && input < 1e6) {
                return String(Math.trunc(input));
            } else { //Format instead if number is bigger than 1e6
                const digits = Math.trunc(Math.log10(input));
                return `${Math.trunc((input / 10 ** (digits)) * 100) / 100}e${digits}`;
            }
        case 'time': //I don't fully know how to make hours:minutes:seconds, or if even needed
            if (input >= 172800000) {
                return `${Math.trunc(input / 86400000)} days`;
            } else if (input >= 7200000) {
                return `${Math.trunc(input / 3600000)} hours`;
            } else if (input >= 600000) {
                return `${Math.trunc(input / 60000)} minutes`;
            } else {
                return `${Math.trunc(input / 1000)} seconds`;
            }
    }
};

export const stageCheck = () => {
    const { stage, discharge, upgrades, researches, researchesAuto } = player;
    const { stageInfo, dischargeInfo, buildingsInfo, researchesInfo, researchesAutoInfo } = global;
    const body = document.body.style;

    /* Stage specific information */
    if (stage === 1) {
        //buildingsInfo.name = ['quarks', 'particles', 'atoms', 'molecules'];
        //globalStart.buildingsInfo.cost = [0, 3, 24, 3];
        dischargeInfo.next = 10 ** discharge.current;
        for (let i = 0; i < playerStart.upgrades.length; i++) {
            if (upgrades[i] === 1) {
                getId(`upgrade${[i + 1]}`).style.backgroundColor = 'green';
            } else {
                getId(`upgrade${[i + 1]}`).style.backgroundColor = '';
            }
        }
        for (let i = 0; i < playerStart.researches.length; i++) {
            getId(`research${i + 1}Stage1Level`).textContent = String(researches[i]);
            getId(`research${i + 1}Stage1Level`).classList.remove('redText', 'orchidText', 'greenText');
            calculateResearchCost(i, 'researches');
            if (researches[i] === researchesInfo.max[i]) {
                getId(`research${i + 1}Stage1Level`).classList.add('greenText');
            } else if (researches[i] === 0) {
                getId(`research${i + 1}Stage1Level`).classList.add('redText');
            } else {
                getId(`research${i + 1}Stage1Level`).classList.add('orchidText');
            }
        }
        getId('quarkStat').style.display = '';
        getId('particlesMain').style.display = '';
        getId('dischargeToggleReset').style.display = '';
        for (let i = 1; i <= 4; i++) {
            getId(`upgrade${i}`).style.display = '';
        }
    }
    for (let i = 1; i < buildingsInfo.name.length; i++) {
        calculateBuildingsCost(i);
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        getId(`researchAuto${i + 1}Level`).textContent = String(researchesAuto[i]);
        getId(`researchAuto${i + 1}Level`).classList.remove('redText', 'orchidText', 'greenText');
        calculateResearchCost(i, 'researchesAuto');
        if (researchesAuto[i] === researchesAutoInfo.max[i]) {
            getId(`researchAuto${i + 1}Level`).classList.add('greenText');
        } else if (researchesAuto[i] === 0) {
            getId(`researchAuto${i + 1}Level`).classList.add('redText');
        } else {
            getId(`researchAuto${i + 1}Level`).classList.add('orchidText');
        }
    }
    /* Hide stage specific part's, that were shown in visualUpdate(); */
    if (stage !== 1) {
        getId('quarkStat').style.display = 'none';
        getId('energyStat').style.display = 'none';
        getId('particlesMain').style.display = 'none';
        getId('atomsMain').style.display = 'none';
        getId('moleculesMain').style.display = 'none';
        getId('discharge').style.display = 'none';
        getId('dischargeToggleReset').style.display = 'none';
        for (let i = 1; i <= playerStart.upgrades.length; i++) {
            getId(`upgrade${i}`).style.display = 'none';
        }
    }
    /* Visual */
    getId('stageReset').textContent = 'You are not ready';
    getId('stageWord').textContent = stageInfo.word[stage - 1];
    getId('stageWord').style.color = stageInfo.wordColor[stage - 1];
    if (stage === 1) {
        body.removeProperty('--border-image');
        body.removeProperty('--border-stage');
    } else {
        body.setProperty('--border-image', `url(Used_art/Stage${stage}%20border.png)`);
        if (stage === 2) {
            body.setProperty('--border-stage', '#1460a8');
        } else if (stage === 3) {
            body.setProperty('--border-stage', '#5b5b75');
        } else {
            body.setProperty('--border-stage', '#f28100');
        }
    }
    if (global.screenReader) {
        getId('invisibleBought').textContent = `Current stage is '${stageInfo.word[stage - 1]}'`;
        /*for (let i = 0; i < buildingsInfo.name.length; i++) {
            getId(`invisibleGetBuilding${i}`).textContent = `Get information for ${buildingsInfo.name[i]}`;
        }*/
    }
};
