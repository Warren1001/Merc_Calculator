window.addEventListener("load", load, false);

function load() {

	const SELECT_TYPE = setupInputElement(document.getElementById("typeSelect"), display)
	const SELECT_DIFFICULTY = setupInputElement(document.getElementById("difficultySelect"), display)

	const NUMBER_LEVEL = setupInputElement(document.getElementById("level"), display)

	const TEXT_STRENGTH = document.getElementById("strength")
	const TEXT_DEXTERITY = document.getElementById("dexterity")
	const TEXT_SKILLS = document.getElementById("skills")
	const TEXT_LIFE = document.getElementById("life")
	const TEXT_AR = document.getElementById("ar")
	const TEXT_DEF = document.getElementById("def")
	const TEXT_DAMAGE = document.getElementById("damage")
	const TEXT_RES = document.getElementById("res")

	let type = DESERT_MERCENARY_HOLY_FREEZE
	let difficulty = HELL
	let level = 1

	display()

	function display() {

		type = SELECT_TYPE.value
		difficulty = getDifficultyFromInput()
		level = getLevelFromInput()

		let data = getMercenaryData()
		let str = data.getStrength(level)
		TEXT_STRENGTH.value = str
		let dex = data.getDexterity(level)
		TEXT_DEXTERITY.value = dex

		let skillsString = data.getSkillData(level)
		let rows = skillsString.split('\n').length
		TEXT_SKILLS.rows = rows
		TEXT_SKILLS.value = skillsString

		TEXT_LIFE.value = data.getLife(level)
		let ar = data.getAttackRating(level)
		TEXT_AR.value = ar + "  |  "  + (ar + 5 * dex)
		let def = data.getDefense(level)
		TEXT_DEF.value = def + "  |  "  + (def + Math.floor(dex / 4))
		let min = data.getMinimumDamage(level)
		let max = data.getMaximumDamage(level)
		let dmgFactor = 1 + (type == ROGUE_SCOUT_FIRE || type == ROGUE_SCOUT_COLD ? dex : str) / 100
		TEXT_DAMAGE.value = min + "-" + max + "  |  "  + Math.floor(min * dmgFactor) + "-" + Math.floor(max * dmgFactor)

		// all res are always the same
		let res = data.getFireResistance(level)
		TEXT_RES.value = res + "  |  "  + (res - 40) + "  |  "  + (res - 100)

		/*let cr = data.getColdResistance(level)
		TEXT_CR.value = cr + "  |  "  + (cr - 40) + "  |  "  + (cr - 100)
		let lr = data.getLightResistance(level)
		TEXT_LR.value = lr + "  |  "  + (lr - 40) + "  |  "  + (lr - 100)
		let pr = data.getPoisonResistance(level)
		TEXT_PR.value = pr + "  |  "  + (pr - 40) + "  |  "  + (pr - 100)*/

	}

	function getMercenaryData() {
		let typeData = MERCENARY_DATA[type]
		for (let i = 0; i < typeData.length; i++) {
			let data = typeData[i]
			if (level >= data.baseLevel || i == difficulty) return data
		}
		return typeData[typeData.length - 1]
	}

	function getDifficultyFromInput() {
		let difficulty = SELECT_DIFFICULTY.value
		if (type >= DESERT_MERCENARY_THORNS && type <= DESERT_MERCENARY_MIGHT && difficulty == NORMAL) { // these mercenaries cant be hired in normal, set the difficulty to nightmare
			difficulty = NIGHTMARE
			SELECT_DIFFICULTY.value = difficulty
		}
		return difficulty
	}

	function getLevelFromInput() {
		let value = NUMBER_LEVEL.value
		value = Math.max(1, Math.min(98, value))
		if (value != NUMBER_LEVEL.value) NUMBER_LEVEL.value = value
		return value
	}

}

function calculate(level, baseLevel, base, perLevel, divisor) {
	if (perLevel == 0) return base
	/*if (divisor == 32) {
		let a = (level - baseLevel)
		if (a < 0) {
			return base + trun((perLevel * a) / divisor) - 1
		} else {
			return base + trun(perLevel * a / divisor)
		}
		
	}*/
	return base + Math.floor(perLevel * (level - baseLevel) / divisor)
}

class SkillData {

	constructor(name, baseLevel, chance, chanceL, skillLevel, skillLevelL) {
		this.name = name
		this.baseLevel = baseLevel
		this.chance = chance
		this.chanceL = chanceL
		this.skillLevel = skillLevel
		this.skillLevelL = skillLevelL
	}

	getChance(level) {
		return calculate(level, this.baseLevel, this.chance, this.chanceL, 4)
	}

	getSkillLevel(level) {
		return calculate(level, this.baseLevel, this.skillLevel, this.skillLevelL, 32) // need to figure this out still
	}

}

class MercenaryData {

	constructor(baseLevel, hp, hpL, def, defL, str, strL, dex, dexL, ar, arL, min, max, dmgL, fr, frL, cr, crL, lr, lrL, pr, prL, defaultChance, skillDatas) {
		this.baseLevel = baseLevel
		this.hp = hp
		this.hpL = hpL
		this.def = def
		this.defL = defL
		this.str = str
		this.strL = strL
		this.dex = dex
		this.dexL = dexL
		this.ar = ar
		this.arL = arL
		this.min = min
		this.max = max
		this.dmgL = dmgL
		this.fr = fr
		this.frL = frL
		this.cr = cr
		this.crL = crL
		this.lr = lr
		this.lrL = lrL
		this.pr = pr
		this.prL = prL
		this.defaultChance = defaultChance
		this.skillDatas = skillDatas
	}

	getLife(level) {
		return Math.max(40, calculate(level, this.baseLevel, this.hp, this.hpL, 1))
	}

	getDefense(level) {
		return Math.max(0, calculate(level, this.baseLevel, this.def, this.defL, 1))
	}

	getStrength(level) {
		return calculate(level, this.baseLevel, this.str, this.strL, 8)
	}

	getDexterity(level) {
		return calculate(level, this.baseLevel, this.dex, this.dexL, 8)
	}

	getAttackRating(level) {
		return Math.max(0, calculate(level, this.baseLevel, this.ar, this.arL, 1))
	}

	getMinimumDamage(level) {
		return Math.max(0, calculate(level, this.baseLevel, this.min, this.dmgL, 8))
	}

	getMaximumDamage(level) {
		return Math.max(1, calculate(level, this.baseLevel, this.max, this.dmgL, 8))
	}

	getFireResistance(level) {
		return calculate(level, this.baseLevel, this.fr, this.frL, 4)
	}

	getColdResistance(level) {
		return calculate(level, this.baseLevel, this.cr, this.crL, 4)
	}

	getLightResistance(level) {
		return calculate(level, this.baseLevel, this.lr, this.lrL, 4)
	}

	getPoisonResistance(level) {
		return calculate(level, this.baseLevel, this.pr, this.prL, 4)
	}

	getSkillData(level) {
		let totalChance = this.defaultChance != 10 ? this.defaultChance : 0 // Normal Attack for A3 Mercs, exclude because they use it only in rare conditions
		for (const skillData of this.skillDatas) {
			if (isBuffOrAura(skillData.name) || skillData.getSkillLevel(level) < 0) continue // dont want to show odds for chilling armor, they only cast it when its off (~95% chance to cast on each cast)
			totalChance += skillData.getChance(level)
		}
		let skillDataStrings = []
		let skillString = "Normal Attack"
		if (this.defaultChance != 10) { // Normal Attack for A3 Mercs, exclude because they use it only in rare conditions
			skillString += " (" + (Math.round(this.defaultChance * 100 / totalChance * 10) / 10) + "%)"
		}
		skillDataStrings.push(skillString)
		for (const skillData of this.skillDatas) {
			let name = skillData.name
			let chance = skillData.getChance(level)
			if (isBuffOrAura(skillData.name)) chance = 0 // just to ignore it a couple lines later
			let skillLevel = Math.max(0, skillData.getSkillLevel(level))
			if (skillLevel == 0) chance = 0 // just to ignore it a couple lines later
			skillString = "Level " + skillLevel + " " + name
			if (chance > 0) skillString += " (" + (Math.round(chance * 100 / totalChance * 10) / 10) + "%)"
			skillDataStrings.push(skillString)
		}
		return skillDataStrings.join('\n')
	}

}

const HELL = 0
const NIGHTMARE = 1
const NORMAL = 2

const ROGUE_SCOUT_FIRE = 0
const ROGUE_SCOUT_COLD = 1
const DESERT_MERCENARY_PRAYER = 2
const DESERT_MERCENARY_DEFIANCE = 3
const DESERT_MERCENARY_BLESSED_AIM = 4
const DESERT_MERCENARY_THORNS = 5
const DESERT_MERCENARY_HOLY_FREEZE = 6
const DESERT_MERCENARY_MIGHT = 7
const IRON_WOLF_FIRE = 8
const IRON_WOLF_COLD = 9
const IRON_WOLF_LIGHTNING = 10
const BARBARIAN_BASH = 11
const BARBARIAN_FRENZY = 12

const BUFFS_AURAS_NAMES = ["Chilling Armor", "Prayer", "Defiance", "Blessed Aim", "Thorns", "Holy Freeze", "Might", "Enchant", "Iron Skin"]

const MERCENARY_DATA = [
	[	// Rogue Scout (Fire)
		new MercenaryData(67, 900, 30, 744, 23, 116, 10, 173, 16, 1150, 36, 25, 27, 6, 121, 5, 121, 5, 121, 5, 121, 5, 75, [new SkillData("Inner Sight", 67, 10, 0, 22, 10), new SkillData("Fire Arrow", 67, 67, 0, 22, 10), new SkillData("Exploding Arrow", 67, 111, 0, 12, 5)]),
		new MercenaryData(36, 342, 18, 279, 15, 77, 10, 111, 16, 406, 24, 9, 11, 4, 66, 7, 66, 7, 66, 7, 66, 7, 75, [new SkillData("Inner Sight", 36, 10, 0, 12, 10), new SkillData("Fire Arrow", 36, 67, 0, 12, 10), new SkillData("Exploding Arrow", 36, 33, 10, 7, 5)]),
		new MercenaryData(3, 45, 9, 15, 8, 35, 10, 45, 16, 10, 12, 1, 3, 2, 0, 8, 0, 8, 0, 8, 0, 8, 75, [new SkillData("Inner Sight", 3, 10, 0, 1, 10), new SkillData("Fire Arrow", 3, 25, 5, 1, 10), new SkillData("Exploding Arrow", 3, 0, 4, 1, 5)])
	],
	[	// Rogue Scout (Cold)
		new MercenaryData(67, 900, 30, 744, 23, 116, 10, 173, 16, 1150, 36, 25, 27, 6, 121, 5, 121, 5, 121, 5, 121, 5, 75, [new SkillData("Inner Sight", 67, 10, 0, 22, 10), new SkillData("Cold Arrow", 67, 67, 0, 22, 10), new SkillData("Freezing Arrow", 67, 111, 0, 7, 3)]),
		new MercenaryData(36, 342, 18, 279, 15, 77, 10, 111, 16, 406, 24, 9, 11, 4, 66, 7, 66, 7, 66, 7, 66, 7, 75, [new SkillData("Inner Sight", 36, 10, 0, 12, 10), new SkillData("Cold Arrow", 36, 67, 0, 12, 10), new SkillData("Freezing Arrow", 36, 33, 10, 4, 3)]),
		new MercenaryData(3, 45, 9, 15, 8, 35, 10, 45, 16, 10, 12, 1, 3, 2, 0, 8, 0, 8, 0, 8, 0, 8, 75, [new SkillData("Inner Sight", 3, 10, 0, 1, 10), new SkillData("Cold Arrow", 3, 25, 5, 1, 10), new SkillData("Freezing Arrow", 3, 0, 4, 1, 3)])
	],
	[	// Desert Mercenary (Prayer)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 24, 10), new SkillData("Prayer", 75, 10, 0, 18, 0)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 14, 10), new SkillData("Prayer", 43, 10, 0, 11, 7)]),
		new MercenaryData(9, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 7, 14, 4, 18, 8, 18, 8, 18, 8, 18, 8, 30, [new SkillData("Jab", 9, 70, 4, 3, 10), new SkillData("Prayer", 9, 10, 0, 3, 7)])
	],
	[	// Desert Mercenary (Defiance)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 24, 0), new SkillData("Defiance", 75, 10, 0, 18, 0)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 14, 10), new SkillData("Defiance", 43, 10, 0, 11, 7)]),
		new MercenaryData(9, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 7, 14, 4, 18, 8, 18, 8, 18, 8, 18, 8, 30, [new SkillData("Jab", 9, 70, 4, 3, 10), new SkillData("Defiance", 9, 10, 0, 3, 7)])
	],
	[	// Desert Mercenary (Blessed Aim)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 24, 0), new SkillData("Blessed Aim", 75, 10, 0, 18, 0)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 14, 10), new SkillData("Blessed Aim", 43, 10, 0, 11, 7)]),
		new MercenaryData(9, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 7, 14, 4, 18, 8, 18, 8, 18, 8, 18, 8, 30, [new SkillData("Jab", 9, 70, 4, 3, 10), new SkillData("Blessed Aim", 9, 10, 0, 3, 7)])
	],
	[	// Desert Mercenary (Thorns)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 23, 10), new SkillData("Thorns", 75, 10, 0, 21, 10)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 13, 10), new SkillData("Thorns", 43, 10, 0, 11, 10)])
	],
	[	// Desert Mercenary (Holy Freeze)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 23, 0), new SkillData("Holy Freeze", 75, 10, 0, 16, 0)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 13, 10), new SkillData("Holy Freeze", 43, 10, 0, 6, 10)])
	],
	[	// Desert Mercenary (Might)
		new MercenaryData(75, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 48, 55, 8, 142, 4, 142, 4, 142, 4, 142, 4, 30, [new SkillData("Jab", 75, 136, 4, 23, 0), new SkillData("Might", 75, 10, 0, 15, 8)]),
		new MercenaryData(43, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 24, 31, 6, 86, 7, 86, 7, 86, 7, 86, 7, 30, [new SkillData("Jab", 43, 104, 4, 13, 10), new SkillData("Might", 43, 10, 0, 7, 8)])
	],
	[	// Iron Wolf (Fire)
		new MercenaryData(79, 1224, 34, 907, 25, 130, 10, 104, 8, 1143, 36, 33, 39, 4, 155, 5, 155, 5, 155, 5, 155, 5, 10, [new SkillData("Fire Bolt", 79, 30, 0, 27, 10), new SkillData("Fire Ball", 79, 60, 0, 25, 10), new SkillData("Enchant", 79, 30, 0, 26, 20)]),
		new MercenaryData(49, 534, 23, 419, 16, 92, 10, 74, 8, 423, 24, 18, 24, 4, 103, 7, 103, 7, 103, 7, 103, 7, 10, [new SkillData("Fire Bolt", 49, 30, 0, 17, 10), new SkillData("Fire Ball", 49, 60, 0, 15, 10), new SkillData("Enchant", 49, 30, 0, 12, 15)]),
		new MercenaryData(15, 160, 11, 95, 9, 49, 10, 40, 8, 15, 12, 1, 7, 4, 35, 8, 35, 8, 35, 8, 35, 8, 10, [new SkillData("Fire Bolt", 15, 30, 0, 6, 10), new SkillData("Fire Ball", 15, 60, 0, 4, 10), new SkillData("Enchant", 15, 30, 0, 1, 10)])
	],
	[	// Iron Wolf (Cold)
		new MercenaryData(79, 1224, 34, 907, 25, 130, 10, 104, 8, 1143, 36, 33, 39, 4, 155, 5, 155, 5, 155, 5, 155, 5, 10, [new SkillData("Glacial Spike", 79, 60, 0, 22, 10), new SkillData("Chilling Armor", 79, 1000, 0, 27, 15), new SkillData("Ice Blast", 79, 120, 0, 27, 10)]),
		new MercenaryData(49, 534, 23, 419, 16, 92, 10, 74, 8, 423, 24, 18, 24, 4, 103, 7, 103, 7, 103, 7, 103, 7, 10, [new SkillData("Glacial Spike", 49, 60, 0, 7, 10), new SkillData("Chilling Armor", 49, 1000, 0, 13, 15), new SkillData("Ice Blast", 49, 120, 0, 17, 10)]),
		new MercenaryData(15, 160, 11, 95, 9, 49, 10, 40, 8, 15, 12, 1, 7, 4, 35, 8, 35, 8, 35, 8, 35, 8, 10, [new SkillData("Glacial Spike", 15, 60, 0, 1, 5), new SkillData("Chilling Armor", 15, 1000, 0, 2, 10), new SkillData("Ice Blast", 15, 120, 0, 6, 10)])
	],
	[	// Iron Wolf (Lightning)
		new MercenaryData(79, 1224, 34, 907, 25, 130, 10, 104, 8, 1143, 36, 33, 39, 4, 155, 5, 155, 5, 155, 5, 155, 5, 10, [new SkillData("Charged Bolt", 79, 60, 0, 25, 10), new SkillData("Lightning", 79, 90, 0, 24, 10), new SkillData("Static Field", 79, 35, 0, 18, 8)]),
		new MercenaryData(49, 534, 23, 419, 16, 92, 10, 74, 8, 423, 24, 18, 24, 4, 103, 7, 103, 7, 103, 7, 103, 7, 10, [new SkillData("Charged Bolt", 49, 60, 0, 15, 10), new SkillData("Lightning", 49, 60, 4, 14, 10), new SkillData("Static Field", 49, 20, 2, 10, 8)]),
		new MercenaryData(15, 160, 11, 95, 9, 49, 10, 40, 8, 15, 12, 1, 7, 4, 35, 8, 35, 8, 35, 8, 35, 8, 10, [new SkillData("Charged Bolt", 15, 60, 0, 4, 10), new SkillData("Lightning", 15, 60, 0, 3, 10), new SkillData("Static Field", 15, 20, 0, 1, 8)])
	],
	[	// Barbarian (Bash)
		new MercenaryData(80, 1680, 45, 1332, 35, 200, 15, 129, 10, 1520, 45, 61, 65, 8, 148, 4, 148, 4, 148, 4, 148, 4, 50, [new SkillData("Bash", 80, 75, 0, 25, 10), new SkillData("Stun", 80, 75, 0, 20, 8), new SkillData("Battle Cry", 80, 15, 0, 19, 8)]),
		new MercenaryData(58, 1020, 30, 775, 25, 158, 15, 101, 10, 750, 35, 39, 43, 8, 109, 7, 109, 7, 109, 7, 109, 7, 50, [new SkillData("Bash", 58, 50, 0, 18, 10), new SkillData("Stun", 58, 50, 0, 14, 8), new SkillData("Battle Cry", 58, 15, 0, 13, 8)]),
		new MercenaryData(28, 450, 19, 300, 15, 101, 15, 63, 10, 150, 20, 16, 20, 6, 56, 7, 56, 7, 56, 7, 56, 7, 50, [new SkillData("Bash", 15, 0, 8, 10), new SkillData("Stun", 15, 0, 6, 8), new SkillData("Battle Cry", 15, 0, 5, 8)])
	],
	[	// Barbarian (Frenzy)
		new MercenaryData(80, 1680, 45, 1332, 35, 200, 15, 129, 10, 1520, 45, 61, 65, 8, 148, 4, 148, 4, 148, 4, 148, 4, 50, [new SkillData("Frenzy", 80, 35, 1, 13, 7), new SkillData("Iron Skin", 80, 0, 0, 15, 8), new SkillData("Taunt", 80, 33, 1, 17, 6)]),
		new MercenaryData(58, 1020, 30, 775, 25, 158, 15, 101, 10, 750, 35, 39, 43, 8, 109, 7, 109, 7, 109, 7, 109, 7, 50, [new SkillData("Frenzy", 58, 29, 1, 9, 7), new SkillData("Iron Skin", 58, 0, 0, 11, 7), new SkillData("Taunt", 58, 27, 1, 13, 6)]),
		new MercenaryData(28, 450, 19, 300, 15, 101, 15, 63, 10, 150, 20, 16, 20, 6, 56, 7, 56, 7, 56, 7, 56, 7, 50, [new SkillData("Frenzy", 28, 22, 1, 2, 7), new SkillData("Iron Skin", 28, 0, 0, 4, 7), new SkillData("Taunt", 28, 20, 1, 7, 6)])
	],
]

function trun(number) {
	if (number == -0) number = 0
	return number >= 0 ? Math.floor(number) : Math.ceil(number)
}

function setupInputElement(element, eventListener) {
	element.addEventListener("change", eventListener, false)
	if (element.type == "number") {
		element.onkeydown = function (e) { // only allows the input of numbers, no negative signs
			if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)) {
				return false
			}
		}
	}
	return element
}

function isBuffOrAura(skillName) {
	return BUFFS_AURAS_NAMES.includes(skillName)
}
