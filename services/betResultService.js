function getWheelBetStatus(betName, resultValue, wheelValues, wheelColors) {
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
            if (parseInt(wheelValues[resultValue]) % 2 == 0 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
                return 2;
            }
            return 0;
        case "odd":
            if (parseInt(wheelValues[resultValue]) % 2 != 0 && wheelValues[resultValue] != 'W' && wheelValues[resultValue] != 'X') {
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

function getWheelBetCoefficients(betName) {
    switch (betName) {
        case "colorGreen":
            return 3;
        case "colorRed":
            return 3;
        case "colorBlue":
            return 3;
        case "oneToSix":
            return 3;
        case "sevenToTwelve":
            return 3;
        case "thirtheenToEighteen":
            return 3;
        case "lowerThanNine":
            return 2;
        case "moreThanNine":
            return 2;
        case "even":
            return 2;
        case "odd":
            return 2;
        case "one":
            return 18;
        case "two":
            return 18;
        case "three":
            return 18;
        case "four":
            return 18;
        case "five":
            return 18;
        case "six":
            return 18;
        case "seven":
            return 18;
        case "eight":
            return 18;
        case "nine":
            return 18;
        case "ten":
            return 18;
        case "eleven":
            return 18;
        case "twelve":
            return 18;
        case "thirtheen":
            return 18;
        case "fourtheen":
            return 18;
        case "fiftheen":
            return 18;
        case "sixteen":
            return 18;
        case "seventeen":
            return 18;
        case "eighteen":
            return 18;
        case "X":
            return 18;
        case "W":
            return 18;
        case "evenGreen":
            return 6;
        case "evenRed":
            return 6;
        case "evenBlue":
            return 6;
        case "oddGreen":
            return 6;
        case "oddRed":
            return 6;
        case "oddBlue":
            return 6;
        default:
            return 0;
    }
}

function wheelBetToNiceName(betName) {
    switch (betName) {
        case "colorGreen":
            return "žalias";
        case "colorRed":
            return "raudonas";
        case "colorBlue":
            return "mėlynas";
        case "oneToSix":
            return "nuo vieno iki šešių";
        case "sevenToTwelve":
            return "nuo septynių iki dvylikos";
        case "thirtheenToEighteen":
            return "nuo trylikos iki aštuoniolikos";
        case "lowerThanNine":
            return "mažiau už devynis";
        case "moreThanNine":
            return "daugiau už devynis";
        case "even":
            return "lyginis";
        case "odd":
            return "nelyginis";
        case "one":
            return "vienas";
        case "two":
            return "du";
        case "three":
            return "trys";
        case "four":
            return "keturi";
        case "five":
            return "penki";
        case "six":
            return "šeši";
        case "seven":
            return "septyni";
        case "eight":
            return "aštuoni";
        case "nine":
            return "devyni";
        case "ten":
            return "dešimt";
        case "eleven":
            return "venuolika";
        case "twelve":
            return "dvylika";
        case "thirtheen":
            return "trylika";
        case "fourtheen":
            return "keturiolika";
        case "fiftheen":
            return "penkiolika";
        case "sixteen":
            return "šešiolika";
        case "seventeen":
            return "septiniolika";
        case "eighteen":
            return "aštuoniolika";
        case "X":
            return "X";
        case "W":
            return "W";
        case "evenGreen":
            return "lyginis žalias";
        case "evenRed":
            return "lyginis raudonas";
        case "evenBlue":
            return "lyginis mėlynas";
        case "oddGreen":
            return "nelyginis žalias";
        case "oddRed":
            return "nelyginis raudonas";
        case "oddBlue":
            return "nelyginis mėlynas";
        default:
            return 0;
    }
}

module.exports = { getWheelBetStatus, getWheelBetCoefficients, wheelBetToNiceName }