export default function compare(
        operand1: string, operator: string, operand2: string, caseInsensitive = false): boolean {
    if (caseInsensitive) {
        operand1 = operand1?.toLowerCase();
        operand2 = operand2?.toLowerCase();
    }

    switch (operator) {
    case '==':
        return (operand1 == operand2);

    case '!=':
        return (operand1 != operand2);

    case '===':
        return (operand1 === operand2);

    case '<':
        return (operand1 < operand2);

    case '<=':
        return (operand1 <= operand2);

    case '>':
        return (operand1 > operand2);

    case '>=':
        return (operand1 >= operand2);

    case '&&':
        return !!(operand1 && operand2);

    case '||':
        return !!(operand1 || operand2);

    default:
        return false;
    }
}