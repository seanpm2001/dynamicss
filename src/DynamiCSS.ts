import { DynamicSheet, DynamicSheetRule } from "./DynamicStyle/DynamicStyle";

export namespace DynamiCSS {

    export function insertStyleSheet(dynamicSheet: DynamicSheet): string {
        let result_id = "";
        if (typeof window === "undefined") {
            return "";
        }
        if (!dynamicSheet) {
            return "";
        }
        //if already exists
        if (document.getElementById(dynamicSheet.id)) {
            return dynamicSheet.id;
        }
        result_id = dynamicSheet.id;
        var styleSheet: HTMLStyleElement = document.createElement("style");
        styleSheet.id = result_id;
        styleSheet.setAttribute("type", "text/css");
        const contetRaw: string = toRawStyleSheet(dynamicSheet.sheetRules || []);
        styleSheet.textContent = contetRaw;
        const appendResult:HTMLStyleElement = document.head.appendChild(styleSheet);
        if(!appendResult){
            return "";
        }
       
        return result_id;
    }
    export function editStyleSheet(id: string, sheetRules: DynamicSheetRule[]): string {
        let result_id = "";
        if (typeof window === "undefined") {
            return "";
        }
        if (!id || !sheetRules) {
            return "";
        }
        //if dont exists yet
        if (!document.getElementById(id)) {
            return "";
        }
        result_id = id;
        var styleSheet: HTMLStyleElement = document.createElement("style");
        styleSheet.id = result_id;
        styleSheet.setAttribute("type", "text/css");
        styleSheet.textContent = toRawStyleSheet(sheetRules);
        try {
            document.head.appendChild(styleSheet);
        } catch (error: any) {
            return "";
        }
        return result_id;
    }
    export function removeStyleSheet(id: string): string {
        let result_id = "";
        if(!id){
            return "";
        }
        const htmlObject = document.getElementById(id);
        if (htmlObject) {
            document.head.removeChild(htmlObject);
            result_id=id;
        }

        return result_id;
    }
}

/**
 * Determines whether a character is upperCase or not
 * @param str a character
 * @returns true if str contains a string character
 */
function isUpper(character: string): boolean {
    if (!character) return false;
    return !/[a-z]/.test(character) && /[A-Z]/.test(character);
}
/**
 * Converts a rule with uppercase to a hyphen-lowercase version
 * @param rule the rule
 * @returns 
 */
function fromUpperCaseToHyphen(ruleLabel: string): string {
    let result = "";
    let charUpper = ' ';
    let isupper: boolean = false;
    for (let i = 0; i < ruleLabel.length; i++) {
        const currentChar = ruleLabel[i];
        if (isUpper(currentChar)) {
            charUpper = currentChar;
            isupper = true;
            break;
        }
    }
    //add hyphen
    if (isupper) {
        const parts: string[] = ruleLabel.split(charUpper);
        result = `${parts[0]}-${charUpper.toLowerCase()}${parts[1]}`;
    } else {
        result = ruleLabel;
    }
    return result;
}
/**
 * 
 * @param ruleLabel the rule
 * @returns true if the rule label corresponds to a pseudo class
 */
function isPseudo(ruleLabel: string): boolean {
    if (!ruleLabel) return false;
    return ruleLabel.includes(":");
}

export function toRawStyleSheet(sheetRules: DynamicSheetRule[]): string {
    if (!sheetRules) {
        return "";
    }
    let rawStyleSheet: string = "";
    let nestedPseudos: DynamicSheetRule[] = [];

    for (let j = 0; j < sheetRules.length; j++) {

        const currentRule: DynamicSheetRule = sheetRules[j];

        let currnetRawRule: string = "";
        currnetRawRule += `.${currentRule.className}{\n`;
        //list of labels for rules
        const ruleskeys: string[] = Object.keys(currentRule.rules);

        for (let i = 0; i < ruleskeys.length; i++) {
            const currentKey = ruleskeys[i];

            const styleLabel: string = fromUpperCaseToHyphen(currentKey);
            //if a pseudo class found, separate it
            if (isPseudo(styleLabel)) {

                const pseudoClassName: string = currentRule.className + styleLabel;
                nestedPseudos.push({ className: pseudoClassName, rules: (currentRule as any).rules[styleLabel] });
            } else {
                const styleRule: string = (currentRule.rules as any)[currentKey];
                currnetRawRule += `\t${styleLabel} : ${styleRule};\n`;
            }

        }
        currnetRawRule += `}\n`;

        rawStyleSheet += currnetRawRule;
    }
    //nested pseudos


    for (let p = 0; p < nestedPseudos.length; p++) {
        let currnetRawRule: string = "";
        const currentRule: DynamicSheetRule = nestedPseudos[p];
        const ruleskeys: string[] = Object.keys(currentRule.rules);
        currnetRawRule += `.${currentRule.className}{\n`;
        for (let i = 0; i < ruleskeys.length; i++) {
            const currentKey = ruleskeys[i];
            const styleLabel: string = fromUpperCaseToHyphen(currentKey);
            const styleRule: string = (currentRule.rules as any)[currentKey];
            currnetRawRule += `\t${styleLabel} : ${styleRule};\n`;
        }
        currnetRawRule += `}\n`;
        rawStyleSheet += currnetRawRule;
    }
    return rawStyleSheet;
}