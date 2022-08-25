import { getId, reLoad } from './Main(OnLoad)';
import { global, player } from './Player';
import { earlyRound, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (spend: Record<string, number>, buy: Record<string, number>) => {
    const { energy, particles, atoms } = player;
    const { stage } = global;

    if (stage !== 1 && (buy === particles || buy === atoms)) {
        return;
    }
    if (spend.current >= buy.cost) {
        spend.current -= buy.cost;
        buy.current++;
        buy.total++;
        buy.cost = earlyRound(buy.cost * 1.4); //Turn this into proper formula for testing
        const type = buy === particles ? 1 : buy === atoms ? 5 : 20; //If too many type's will be added, might need to have better way to do it
        energy.current += type;
        energy.total += type;
        invisibleUpdate();
        numbersUpdate();
    }
};

export const buyUpgrades = (upgrade: number) => {
    const { energy, particles, upgrades } = player;
    const { upgradesInfo } = global;

    if (upgrades[upgrade - 1] === 0 && energy.current >= upgradesInfo.cost[upgrade - 1]) {
        upgrades[upgrade - 1] = 1;
        energy.current -= upgradesInfo.cost[upgrade - 1];
        getId(`upgrade${upgrade}`).style.backgroundColor = 'forestgreen';
        if (upgrade - 1 === 0) {
            particles.cost /= 10;
        }
    }
    getUpgradeDescription(upgrade);
};

export const calculateGainedBuildings = (type: Record<string, number>, higherType: Record<string, number>, time = 0) => {
    const before = type.current; //I think its fastest way (?)
    type.current = earlyRound(type.current + (higherType.producing * time));
    type.total = earlyRound(type.total + type.current - before);
    /* More can be added */
    //No idea if to add higherType.producing into here though
    //Same for type.cost
};

export const stageResetCheck = () => {
    const { energy } = player;
    const { stage } = global;

    if (energy.current >= 250 && stage === 1) {
        energy.current -= 250;
        global.stage = 2;
        reLoad();
    }
};
