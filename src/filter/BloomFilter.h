#pragma once

#include "IFilter.h"
#include <fstream>
#include <string>

using namespace std;
class BloomFilter: public IFilter {
public:
  bool add(const string &item);
  bool isBlacklisted(const string& item) const;
  bool queryUrl(const string &url);
  bool loadFromFile();
  bool saveToFile();
private:
  string file_name;
  ifstream file;
};

