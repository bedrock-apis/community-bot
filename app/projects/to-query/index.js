const { warn } = require("console");


function l(o, num = 3) {
    if (typeof num == 'number') { o = JSON.stringify(o, null, num); return console.log(o); } console.log(o);
};


const {
    round, floor, ceil, log,
    max, min, random, abs, PI,
    hypot, sqrt, sin, cos, tan
} = Math

const JST = o => JSON.stringify(o, null, 2);
const JSP = JSON.parse.bind(JSON);





const selectorRegex = /@(?:[spear]|initiator)/
const equalSign = /(?:\s+|)=(?:\s+|)(?!{|\[)/g
const commaSign = /(?:,|)(?:\s+|)(?:\w+)(?:\s+|):/g
const comIndent = /(?:,|)(?:\s+|)([a-z])(?:\s+|):/
const scoresSplitter = /(?:\s+|),(?:\s+|)/


function toQuery(text) {
    const args = 0
};
class QueryOptions {
    constructor(source, args) {
        this.query = {};
    }


}

/**@type {{[T in string]:{method:'getPlayers'|'getEntities',query:{},index:number}}}*/
const methodType = {
    get s() {
        return {
            method: 'getPlayers',
            query: { closest: 1, name: ({ name }) => name },
            index: 0
        }
    },
    get p() {
        return {
            method: 'getPlayers',
            query: { closest: 1 },
            index: 0
        }
    },
    get a() {
        return {
            method: 'getPlayers',
            query: {},
            index: null
        }
    },
    get r() {
        return {
            method: 'getPlayers',
            query: {},
            index: (n) => Math.floor(Math.random() * n)
        }
    },
    get e() {
        return {
            method: 'getEntities',
            query: {},
            index: null
        }
    },
    get initiator() {
        return {
            method: 'getPlayers',
            query: { closest: 1 },
            index: 0
        }
    }
};

const QueryKeys = {
    c(value, query = {}) {
        if (!value.startsWith("!")) query.closest = +value;
        else query.farthest = +value.substring(1);
        return query;
    },
    dx(value, query = {}, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        query.volume ??= { x: 0, y: 0, z: 0 };
        query.volume.x = (value.startsWith("~") ? source.location.x + +value.substring(1) : +value) || 0;
        return query;
    },
    dy(value, query = {}, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        (query.volume ??= { x: 0, y: 0, z: 0 }).y = (value.startsWith("~") ? source.location.y + +value.substring(1) : +value) || 0;
        return query;
    },
    dz(value, query = {}, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        (query.volume ??= { x: 0, y: 0, z: 0 }).z = (value.startsWith("~") ? source.location.z + +value.substring(1) : +value) || 0;
        return query;
    },
    family(value, query = {}) {
        let famType = value.split('"').map(e => e.trim());
        if (value.startsWith("!")) {
            (query.excludeFamilies ??= []).push(famType[1] ?? famType[0].substring(1));
        } else (query.families ??= []).push(value);
        return query;
    },


    has_property(value, query = {}) {
        query.propertyOptions ??= [];
        const vals = {
            propertyOptions: [{
                exclude: false,
                propertyId: "prop:type",
                value: 0 || false || {
                    equals: "" || 0 || true,
                    greaterThanOrEquals: 0,
                    lessThanOrEquals: 0,
                    notEquals: "" || 0 || true,
                    lessThan: 0,
                    lowerBound: 0,
                    upperBound: 0,
                    greaterThan: 0
                }
            }]
        }
        return query
    },
    hasitem(value, query = {}, source) {
        console.warn(value);
        const filters = query.filters ??= [];
        let item, data, location, slot;
        filters.push()
        return query
    },
    haspermission(value, query = {}) {
        console.warn(value);
        return query
    },


    l(value, query = {}) {
        query.maxLevel = +value || 0;
        return query;
    },
    lm(value, query = {}) {
        query.minLevel = +value || 0;
        return query;
    },
    m(value, query = {}) {
        const modeType = {
            survival: "survival", s: "survival", 0: "survival",
            creative: "creative", c: "creative", 1: "creative",
            adventure: "adventure", a: "adventure", 2: "adventure",
            spectator: "spectator"
        }[value.replace("!", "").trim()]
        if (value.startsWith("!")) {
            (query.excludeGameModes ??= []).push(modeType)
        } else query.gameMode = modeType;
        return query;
    },
    name(value, query = {}) {
        if (value.startsWith("!")) {
            (query.excludeNames ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else query.name = value.split('"').reduce((a, t) => a || t.trim() || a, "") || "";
        return query;
    },
    scores(value, query = {}) {
        const rawOpts = value.substring(1, value.length - 1).trim().split(/=|,/);
        const opts = query.scoreOptions ??= [];
        for (let i = 0; i < rawOpts.length; i += 2) {
            let objective = rawOpts[i].trim();
            let rawScore = rawOpts[i + 1].trim();
            objective[0] === '"' && (objective = objective.substring(1, objective.length - 1));
            const objScore = { objective };
            const score = +rawScore?.match(/(-|)\d+/)[0] || 0;
            if (rawScore.startsWith("!")) {
                objScore.exclude = true;
                rawScore = rawScore.substring(1).trim();
            }
            if (rawScore.startsWith("..")) {
                objScore.maxScore = score;
            } else if (rawScore.endsWith("..")) {
                objScore.minScore = score;
            } else if (!rawScore.includes("..")) {
                objScore.maxScore = score;
                objScore.minScore = score;
            }
            opts.push(objScore);
        }
        return query
    },
    tag(value, query = {}) {
        if (value.startsWith("!")) {
            (query.excludeTags ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else (query.tags ??= []).push(value.split('"').reduce((a, t) => a || t.trim() || a, ""));
        return query;
    },
    type(value, query = {}) {
        if (value.startsWith("!")) {
            (query.excludeTypes ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else (query.types ??= []).push(value.split('"').reduce((a, t) => a || t.trim() || a, ""));
        return query;
    },
    r(value, query = {}) {
        query.maxDistance = +value || 0;
        return query;
    },
    rm(value, query = {}) {
        query.minDistance = +value || 0;
        return query;
    },
    rx(value, query = {}) {
        query.horizontalRotaion = +value || 0;
        return query;
    },
    rxm(value, query = {}) {
        query.minHorizontalRotaion = +value || 0;
        return query;
    },
    ry(value, query = {}) {
        query.verticalRotation = +value || 0;
        return query;
    },
    rym(value, query = {}) {
        query.minVerticalRotation = +value || 0;
        return query;
    },
    x(value, query = {}, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.x ?? 0) || 0;
            loc.x = +value || 0;
        } else loc.x = +value || 0;
        return query;
    },
    y(value, query = {}, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.y ?? 0) || 0;
            loc.y = +value || 0;
        } else loc.y = +value || 0;
        return query;
    },
    z(value, query = {}, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.z ?? 0) || 0;
            loc.z = +value || 0;
        } else loc.z = +value || 0;
        return query;
    },
}


const selectorKeyRegex = /(?:\s+|)[\[\{,](?:\s+|)(c|d[xyz]|family|has(?:_property|item|permission)|l|lm|m|name|scores|t(?:ag|ype)|r(?:x|y|)(?:|m)|x|y|z)(?:\s+|)=(?:\s+|)/;

const text1 = '@a[haspermission={camera=disabled,movement=disabled},name=!"m 9oie",hasitem=[{item= acacia_chest_boat},{item=amethyst_block}], x=-12,y=0,z=9000,tag=mom,tag=  "rem m9"   , r=87, rx=88, rym=89,rm=999,scores= {"i h"= !.. -90   , bot=!-90,  pop =90},m=0] @initiator[m=c, scores={"k o "=9..},x=23,dx=200,x=123] @s[family=zombie,name=!"", tag="m 9 0"]';

const querys = {};
let q = 0;
for (let v of text1.split(selectorRegex)) {
    const texts = v.trim().split(selectorKeyRegex).splice(1);
    const query = querys[texts] = {};
    for (let i = 0; i < texts.length; i += 2) {
        console.warn(i, texts[i]);
        // console.warn(texts[i]);
        QueryKeys[texts[i]]?.(texts[i + 1].trim(), query);
        // console.warn(query);
    }
}
console.warn(JST(querys));



