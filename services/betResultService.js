function getBetStatus(betName, resultValue, wheelValues, wheelColors) {
    switch (betName) {
        case "colorGreen":
            if (wheelColors[resultValue] == 'žalias') {
                return 3;
            }
            return 0;
        case "colorRed":
            if (wheelColors[resultValue] == 'raudonas') {
                return 3;
            }
            return 0;
        case "colorBlue":
            if (wheelColors[resultValue] == 'mėlynas') {
                return 3;
            }
            return 0;
        case "oneToSix":
            if (parseInt(wheelValues[resultValue]) <= 6 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 3;
            }
            return 0;
        case "sevenToTwelve":
            if (parseInt(wheelValues[resultValue]) > 6 && parseInt(wheelValues[resultValue]) <= 12 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 3;
            }
            return 0;
        case "thirtheenToEighteen":
            if (parseInt(wheelValues[resultValue]) > 12 && parseInt(wheelValues[resultValue]) <= 18 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 3;
            }
            return 0;
        case "lowerThanNine":
            if (parseInt(wheelValues[resultValue]) < 9 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 2;
            }
            return 0;
        case "moreThanNine":
            if (parseInt(wheelValues[resultValue]) > 9 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 2;
            }
            return 0;
        case "even":
            if (parseInt(wheelValues[resultValue]) % 2 == 0) {
                return 2;
            }
            return 0;
        case "odd":
            if (parseInt(wheelValues[resultValue]) % 2 != 0) {
                return 2;
            }
            return 0;
        case "one":
            if (parseInt(wheelValues[resultValue]) == 1) {
                return 18;
            }
            return 0;
        case "two":
            if (parseInt(wheelValues[resultValue]) == 2) {
                return 18;
            }
            return 0;
        case "three":
            if (parseInt(wheelValues[resultValue]) == 3) {
                return 18;
            }
            return 0;
        case "four":
            if (parseInt(wheelValues[resultValue]) == 4) {
                return 18;
            }
            return 0;
        case "five":
            if (parseInt(wheelValues[resultValue]) == 5) {
                return 18;
            }
            return 0;
        case "six":
            if (parseInt(wheelValues[resultValue]) == 6) {
                return 18;
            }
            return 0;
        case "seven":
            if (parseInt(wheelValues[resultValue]) == 7) {
                return 18;
            }
            return 0;
        case "eight":
            if (parseInt(wheelValues[resultValue]) == 8) {
                return 18;
            }
            return 0;
        case "nine":
            if (parseInt(wheelValues[resultValue]) == 9) {
                return 18;
            }
            return 0;
        case "ten":
            if (parseInt(wheelValues[resultValue]) == 10) {
                return 18;
            }
            return 0;
        case "eleven":
            if (parseInt(wheelValues[resultValue]) == 11) {
                return 18;
            }
            return 0;
        case "twelve":
            if (parseInt(wheelValues[resultValue]) == 12) {
                return 18;
            }
            return 0;
        case "thirtheen":
            if (parseInt(wheelValues[resultValue]) == 13) {
                return 18;
            }
            return 0;
        case "fourtheen":
            if (parseInt(wheelValues[resultValue]) == 14) {
                return 18;
            }
            return 0;
        case "fiftheen":
            if (parseInt(wheelValues[resultValue]) == 15) {
                return 18;
            }
            return 0;
        case "sixteen":
            if (parseInt(wheelValues[resultValue]) == 16) {
                return 18;
            }
            return 0;
        case "seventeen":
            if (parseInt(wheelValues[resultValue]) == 17) {
                return 18;
            }
            return 0;
        case "eighteen":
            if (parseInt(wheelValues[resultValue]) == 18) {
                return 18;
            }
            return 0;
        case "X":
            if (wheelValues[resultValue] == 'X') {
                return 18;
            }
            return 0;
        case "W":
            if (wheelValues[resultValue] == 'W') {
                return 18;
            }
            return 0;
        case "evenGreen":
            if (parseInt(wheelValues[resultValue]) % 2 == 0 && wheelColors[resultValue] == 'žalias') {
                return 6;
            }
            return 0;
        case "evenRed":
            if (parseInt(wheelValues[resultValue]) % 2 == 0 && wheelColors[resultValue] == 'raudonas') {
                return 6;
            }
            return 0;
        case "evenBlue":
            if (parseInt(wheelValues[resultValue]) % 2 == 0 && wheelColors[resultValue] == 'mėlynas') {
                return 6;
            }
            return 0;
        case "oddGreen":
            if (parseInt(wheelValues[resultValue]) % 2 != 0 && wheelColors[resultValue] == 'žalias') {
                return 6;
            }
            return 0;
        case "oddRed":
            if (parseInt(wheelValues[resultValue]) % 2 != 0 && wheelColors[resultValue] == 'raudonas') {
                return 6;
            }
            return 0;
        case "oddBlue":
            if (parseInt(wheelValues[resultValue]) % 2 != 0 && wheelColors[resultValue] == 'mėlynas') {
                return 6;
            }
            return 0;
        default:
            return 0;
    }
}

module.exports = { getBetStatus }