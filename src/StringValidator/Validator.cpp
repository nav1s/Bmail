#include "Validator.h"

using namespace std;

bool Validator::validatePositiveIntegers(const vector<int>& args) {
    for (int val : args) {
        if (val <= 0) {
            return false;
        }
    }
    return true;
}
