#include "CliPrinter.h"
#include <iostream>

using namespace std;

bool CLIPrinter::putLine(const string& line) {
    cout << line << endl;
    return true;
}
