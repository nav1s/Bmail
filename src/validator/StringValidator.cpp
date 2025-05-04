#include "StringValidator.h"

using namespace std;

bool StringValidator::validatePositiveIntegers(const vector<int>& args) {
    for (int val : args) {
        if (val <= 0) {
            return false;
        }
    }
    return true;
}
