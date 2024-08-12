//@ts-nocheck
import type { DefaultSubCommandExport } from "..";
import { COLORS } from "../../../features";

const NAME = "selector";
const SELECTOR_REGEX = /@(?:[spear]|initiator)/
const SELECTOR_KEY_REGEX = /(?:\s+|)[\[\{,](?:\s+|)(c|d[xyz]|family|has(?:_property|item|permission)|l|lm|m|name|scores|t(?:ag|ype)|r(?:x|y|)(?:|m)|x|y|z)(?:\s+|)=(?:\s+|)/;

const filters = Symbol("filters");
export default {
    name: NAME,
    builder: (e)=>e.setName(NAME).setDescription("Converts selector to EntityQuery Object").addStringOption(e=>e.setName("target-selector").setDescription("Selector expression")),
    handler: async (c, n, i)=>{
        const source = i.options.getString("target-selector");
        if(!source?.startsWith("@") || !source.endsWith("]")) {
            await i.reply({
                embeds:[
                    {
                        title: "FORMAT ERROR",
                        color: COLORS.EMBED_ERROR,
                        description: `Selector target argument have to start's with '@' and end's with ']'.\n\`\`\`properties\n${source}\n\`\`\``,
                        timestamp: new Date().toISOString(),
                        footer:{text:"by M9", icon_url: "https://cdn.discordapp.com/avatars/558197847108091914/bab24265e8b9d9fef356f85a7550961b.webp"}
                    }
                ]
            })
            return;
        }
        const querys = {};
        let q;

        for (let v of source.slice(0,source.length - 1).split(SELECTOR_REGEX)) {
            const texts = v.trim().split(SELECTOR_KEY_REGEX).splice(1);
            const query = querys[texts] = {};
            for (let i = 0; i < texts.length; i += 2) {
                // console.warn(i, texts[i]);
                Query[texts[i]]?.(texts[i + 1].trim(), query);
                // console.warn(query);
            }
            q = query;
        }
        await i.reply({
            embeds:[
                {
                    title: "Results",
                    color: COLORS.EMBED_DEFAULT,
                    description: `Selector target expresion\n\`\`\`properties\n${source}\n\`\`\`\n\`\`\`js\nconst eQuery = ${JSON.stringify(q, null, 3)}\n\`\`\`\n`,
                    timestamp: new Date().toISOString(),
                    footer:{text:"by M9", icon_url: "https://cdn.discordapp.com/avatars/558197847108091914/bab24265e8b9d9fef356f85a7550961b.webp"}
                }
            ]
        })
    }
} as DefaultSubCommandExport;



class Query {
    static c(value, query) {
        if (!value.startsWith("!")) query.closest = +value;
        else query.farthest = +value.substring(1);
        return query;
    }
    static dx(value, query, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        query.volume ??= { x: 0, y: 0, z: 0 };
        query.volume.x = (value.startsWith("~") ? source.location.x + +value.substring(1) : +value) || 0;
        return query;
    }
    static dy(value, query, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        (query.volume ??= { x: 0, y: 0, z: 0 }).y = (value.startsWith("~") ? source.location.y + +value.substring(1) : +value) || 0;
        return query;
    }
    static dz(value, query, source = {}) {
        source.location ??= { x: 0, y: 0, z: 0 };
        (query.volume ??= { x: 0, y: 0, z: 0 }).z = (value.startsWith("~") ? source.location.z + +value.substring(1) : +value) || 0;
        return query;
    }
    static family(value, query) {
        let famType = value.split('"').map(e => e.trim());
        if (value.startsWith("!")) {
            (query.excludeFamilies ??= []).push(famType[1] ?? famType[0].substring(1));
        } else (query.families ??= []).push(value);
        return query;
    }
    static has_property(value, query) {
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
    }
    static hasitem(value, query, source) {
        // console.warn(value);
        const filters = query.filters ??= [];
        let item, data, location, slot;
        filters.push()
        return query
    }
    static haspermission(value, query) {
        // console.warn(value);
        return query
    }


    static l(value, query) {
        query.maxLevel = +value || 0;
        return query;
    }
    static lm(value, query) {
        query.minLevel = +value || 0;
        return query;
    }
    static m(value, query) {
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
    }
    static name(value, query) {
        if (value.startsWith("!")) {
            (query.excludeNames ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else query.name = value.split('"').reduce((a, t) => a || t.trim() || a, "") || "";
        return query;
    }
    static scores(value, query) {
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
    }
    static tag(value, query) {
        if (value.startsWith("!")) {
            (query.excludeTags ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else (query.tags ??= []).push(value.split('"').reduce((a, t) => a || t.trim() || a, ""));
        return query;
    }
    static type(value, query) {
        if (value.startsWith("!")) {
            (query.excludeTypes ??= []).push(value.split(/"|!/).reduce((a, t) => a || t.trim() || a, ""))
        } else (query.types ??= []).push(value.split('"').reduce((a, t) => a || t.trim() || a, ""));
        return query;
    }
    static r(value, query) {
        query.maxDistance = +value || 0;
        return query;
    }
    static rm(value, query) {
        query.minDistance = +value || 0;
        return query;
    }
    static rx(value, query) {
        query.horizontalRotaion = +value || 0;
        return query;
    }
    static rxm(value, query) {
        query.minHorizontalRotaion = +value || 0;
        return query;
    }
    static ry(value, query) {
        query.verticalRotation = +value || 0;
        return query;
    }
    static rym(value, query) {
        query.minVerticalRotation = +value || 0;
        return query;
    }
    static x(value, query, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.x ?? 0) || 0;
            loc.x = +value || 0;
        } else loc.x = +value || 0;
        return query;
    }
    static y(value, query, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.y ?? 0) || 0;
            loc.y = +value || 0;
        } else loc.y = +value || 0;
        return query;
    }
    static z(value, query, source = {}) {
        const loc = query.location ??= { x: 0, y: 0, z: 0 };
        if (value.startsWith("~")) {
            value = +value.substring(1) + (source.location?.z ?? 0) || 0;
            loc.z = +value || 0;
        } else loc.z = +value || 0;
        return query;
    }

    constructor(selector, source = {}) {
        const pairs = selector.trim().split(SELECTOR_KEY_REGEX).splice(1);
        for (let i = 0; i < pairs.length; i += 2) {
            Query[pairs[i]]?.(pairs[i + 1].trim(), this, source);
        }
    }
    [filters] = []
}