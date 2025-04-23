#include "HashFactory.h"
#include "StdHash.h"
// #include "MurmurHash.h"  // if/when needed

#include <stdexcept>
#include <sstream>

using namespace std;

shared_ptr<IHashFunction> HashFactory::fromSignature(const string& signature) {
    auto sep = signature.find(':');
    if (sep == string::npos) {
        throw invalid_argument("HashFactory: Invalid signature format (expected type:param): " + signature);
    }

    string type = signature.substr(0, sep);
    int param = stoi(signature.substr(sep + 1));

    if (type == "std") {
        return make_shared<StdHash>(param);
    }
    // else if (type == "murmur") return make_shared<MurmurHash>(param);
    // else if (type == "fnv") return make_shared<FnvHash>(param);

    throw runtime_error("HashFactory: Unknown hash type: " + type);
}
